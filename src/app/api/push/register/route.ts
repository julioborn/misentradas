import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const token = body?.token as string | undefined;
  const platform = body?.platform as string | undefined;

  if (!token || (platform !== "ios" && platform !== "android")) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("push_tokens")
    .upsert(
      { user_id: user.id, token, platform },
      { onConflict: "token" }
    );

  if (error) {
    return NextResponse.json(
      { error: "No pudimos registrar el token" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const token = body?.token as string | undefined;

  if (!token) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const admin = createAdminClient();
  await admin
    .from("push_tokens")
    .delete()
    .eq("token", token)
    .eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
