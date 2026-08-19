"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { datetimeLocalValueToIso } from "@/lib/date";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function uploadEventImage(
  supabase: SupabaseServerClient,
  userId: string,
  formData: FormData,
  fieldName = "imagen"
): Promise<string | null> {
  const file = formData.get(fieldName);

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("event-images")
    .upload(path, file, { contentType: file.type });

  if (error) {
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("event-images").getPublicUrl(path);

  return publicUrl;
}

function parseEventFields(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const fecha = String(formData.get("fecha") ?? "");
  const lugar = String(formData.get("lugar") ?? "").trim();
  const precio = Number(formData.get("precio"));
  const stockTotal = Number(formData.get("stock_total"));

  const valid =
    Boolean(nombre) &&
    Boolean(fecha) &&
    Number.isFinite(precio) &&
    precio >= 0 &&
    Number.isInteger(stockTotal) &&
    stockTotal >= 1;

  return {
    valid,
    nombre,
    descripcion: descripcion || null,
    fecha: fecha ? datetimeLocalValueToIso(fecha) : null,
    lugar: lugar || null,
    precio,
    stockTotal,
  };
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (!profile || profile.rol !== "organizer") {
    redirect("/");
  }

  const fields = parseEventFields(formData);

  if (!fields.valid) {
    redirect("/organizer/events/new?error=datos_invalidos");
  }

  const imagenUrl = await uploadEventImage(supabase, user.id, formData);

  const { error } = await supabase.from("events").insert({
    organizer_id: user.id,
    nombre: fields.nombre,
    descripcion: fields.descripcion,
    fecha: fields.fecha!,
    lugar: fields.lugar,
    precio: fields.precio,
    stock_total: fields.stockTotal,
    stock_disponible: fields.stockTotal,
    imagen_url: imagenUrl,
  });

  if (error) {
    redirect("/organizer/events/new?error=no_se_pudo_crear");
  }

  revalidatePath("/organizer/dashboard");
  redirect("/organizer/dashboard?success=evento_creado");
}

export async function updateOrganizerAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (!profile || profile.rol !== "organizer") {
    redirect("/");
  }

  const avatarUrl = await uploadEventImage(supabase, user.id, formData, "logo");

  if (!avatarUrl) {
    redirect("/organizer/profile?error=no_se_pudo_subir");
  }

  await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  revalidatePath("/organizer/profile");
  revalidatePath("/organizer/dashboard");
  redirect("/organizer/profile?success=1");
}

export async function disconnectMp() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  await supabase
    .from("profiles")
    .update({ mp_access_token: null, mp_user_id: null })
    .eq("id", user.id);

  revalidatePath("/organizer/connect-mp");
  revalidatePath("/organizer/dashboard");
  redirect("/organizer/connect-mp?disconnected=1");
}

export async function updateEvent(eventId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: event } = await supabase
    .from("events")
    .select("organizer_id, stock_total, stock_disponible, imagen_url")
    .eq("id", eventId)
    .single();

  if (!event || event.organizer_id !== user.id) {
    redirect("/organizer/dashboard");
  }

  const fields = parseEventFields(formData);

  if (!fields.valid) {
    redirect(`/organizer/events/${eventId}/edit?error=datos_invalidos`);
  }

  const sold = event.stock_total - event.stock_disponible;

  if (fields.stockTotal < sold) {
    redirect(`/organizer/events/${eventId}/edit?error=stock_menor_a_vendidas`);
  }

  const activo = formData.get("activo") === "on";
  const nuevaImagenUrl = await uploadEventImage(supabase, user.id, formData);

  const { error } = await supabase
    .from("events")
    .update({
      nombre: fields.nombre,
      descripcion: fields.descripcion,
      fecha: fields.fecha!,
      lugar: fields.lugar,
      precio: fields.precio,
      stock_total: fields.stockTotal,
      stock_disponible: fields.stockTotal - sold,
      imagen_url: nuevaImagenUrl ?? event.imagen_url,
      activo,
    })
    .eq("id", eventId);

  if (error) {
    redirect(`/organizer/events/${eventId}/edit?error=no_se_pudo_guardar`);
  }

  revalidatePath("/organizer/dashboard");
  redirect("/organizer/dashboard?success=evento_actualizado");
}

async function assertOwnsEvent(
  supabase: SupabaseServerClient,
  eventId: string,
  userId: string
) {
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("organizer_id", userId)
    .single();

  return Boolean(event);
}

export async function addEventStaff(eventId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (!(await assertOwnsEvent(supabase, eventId, user.id))) {
    redirect("/organizer/dashboard");
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    redirect(`/organizer/events/${eventId}/staff?error=email_requerido`);
  }

  const admin = createAdminClient();

  const { data: staffProfile } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .single();

  if (!staffProfile) {
    redirect(`/organizer/events/${eventId}/staff?error=usuario_no_encontrado`);
  }

  const { error } = await admin
    .from("event_staff")
    .insert({ event_id: eventId, user_id: staffProfile.id });

  if (error) {
    redirect(
      `/organizer/events/${eventId}/staff?error=${
        error.code === "23505" ? "ya_asignado" : "no_se_pudo_agregar"
      }`
    );
  }

  revalidatePath(`/organizer/events/${eventId}/staff`);
  redirect(`/organizer/events/${eventId}/staff?success=1`);
}

export async function removeEventStaff(eventId: string, staffId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (!(await assertOwnsEvent(supabase, eventId, user.id))) {
    redirect("/organizer/dashboard");
  }

  await supabase
    .from("event_staff")
    .delete()
    .eq("id", staffId)
    .eq("event_id", eventId);

  revalidatePath(`/organizer/events/${eventId}/staff`);
  redirect(`/organizer/events/${eventId}/staff?removed=1`);
}

export async function generateManualTicket(eventId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const admin = createAdminClient();

  const { data: event } = await admin
    .from("events")
    .select("id, precio, stock_disponible, organizer_id")
    .eq("id", eventId)
    .single();

  if (!event || event.organizer_id !== user.id) {
    redirect("/organizer/dashboard");
  }

  if (event.stock_disponible < 1) {
    redirect(`/organizer/events/${eventId}/manual?error=sin_stock`);
  }

  const nota = String(formData.get("nombre") ?? "").trim() || null;

  const { data: ticket, error } = await admin
    .from("tickets")
    .insert({
      event_id: eventId,
      buyer_id: null,
      estado: "confirmed",
      metodo_pago: "manual",
      nota,
    })
    .select("id")
    .single();

  if (error || !ticket) {
    redirect(`/organizer/events/${eventId}/manual?error=no_se_pudo_generar`);
  }

  await admin.from("payments").insert({
    ticket_id: ticket.id,
    amount: event.precio,
    platform_fee: 0,
    organizer_amount: event.precio,
    estado: "approved",
  });

  await admin
    .from("events")
    .update({ stock_disponible: event.stock_disponible - 1 })
    .eq("id", eventId);

  revalidatePath("/organizer/dashboard");
  revalidatePath(`/organizer/events/${eventId}/sales`);
  redirect(`/tickets/${ticket.id}`);
}
