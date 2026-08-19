"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
