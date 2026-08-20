"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const nombre = String(formData.get("nombre") ?? "").trim();

  if (!nombre) {
    redirect("/account?error=nombre_requerido");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ nombre })
    .eq("id", user.id);

  if (error) {
    redirect("/account?error=no_se_pudo_guardar");
  }

  revalidatePath("/account");
  redirect("/account?success=1");
}

// Anonymizes personal data and permanently bans the login instead of
// deleting the profiles row: events/tickets/payments CASCADE from
// profiles, so a hard delete would wipe an organizer's entire sales
// history (and other buyers' tickets) along with it.
export async function deleteAccount(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const confirmation = String(formData.get("confirmacion") ?? "");

  if (confirmation !== "ELIMINAR") {
    redirect("/account?error=confirmacion_invalida");
  }

  const admin = createAdminClient();
  const placeholderEmail = `eliminado-${user.id}@misentradas.local`;

  await admin.from("push_tokens").delete().eq("user_id", user.id);

  await admin
    .from("profiles")
    .update({
      nombre: "Cuenta eliminada",
      email: placeholderEmail,
      avatar_url: null,
      mp_access_token: null,
      mp_user_id: null,
    })
    .eq("id", user.id);

  await admin.auth.admin.updateUserById(user.id, {
    email: placeholderEmail,
    password: randomUUID() + randomUUID(),
    ban_duration: "876000h",
  });

  await supabase.auth.signOut();
  redirect("/cuenta-eliminada");
}
