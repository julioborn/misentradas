"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const fecha = String(formData.get("fecha") ?? "");
  const lugar = String(formData.get("lugar") ?? "").trim();
  const precio = Number(formData.get("precio"));
  const stockTotal = Number(formData.get("stock_total"));
  const imagenUrl = String(formData.get("imagen_url") ?? "").trim();

  if (
    !nombre ||
    !fecha ||
    !Number.isFinite(precio) ||
    precio < 0 ||
    !Number.isInteger(stockTotal) ||
    stockTotal < 1
  ) {
    redirect("/organizer/events/new?error=datos_invalidos");
  }

  const { error } = await supabase.from("events").insert({
    organizer_id: user.id,
    nombre,
    descripcion: descripcion || null,
    fecha: new Date(fecha).toISOString(),
    lugar: lugar || null,
    precio,
    stock_total: stockTotal,
    stock_disponible: stockTotal,
    imagen_url: imagenUrl || null,
  });

  if (error) {
    redirect("/organizer/events/new?error=no_se_pudo_crear");
  }

  revalidatePath("/organizer/dashboard");
  redirect("/organizer/dashboard");
}
