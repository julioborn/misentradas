import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { OAuth } from "mercadopago";
import { getPlatformMpConfig } from "@/lib/mercadopago";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const state = randomUUID();
  const oauth = new OAuth(getPlatformMpConfig());
  const authorizationUrl = oauth.getAuthorizationURL({
    options: {
      client_id: process.env.MP_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/organizer/connect-mp/callback`,
      state,
    },
  });

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set("mp_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
