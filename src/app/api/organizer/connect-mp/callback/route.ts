import { NextRequest, NextResponse } from "next/server";
import { OAuth } from "mercadopago";
import { getPlatformMpConfig } from "@/lib/mercadopago";
import { createClient } from "@/lib/supabase/server";

function redirectTo(path: string, origin: string) {
  const response = NextResponse.redirect(new URL(path, origin));
  response.cookies.delete("mp_oauth_state");
  return response;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = request.cookies.get("mp_oauth_state")?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return redirectTo("/organizer/connect-mp?error=invalid_state", url.origin);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectTo("/auth/login", url.origin);
  }

  try {
    const oauth = new OAuth(getPlatformMpConfig());
    const result = await oauth.create({
      body: {
        client_id: process.env.MP_CLIENT_ID!,
        client_secret: process.env.MP_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/organizer/connect-mp/callback`,
      },
    });

    await supabase
      .from("profiles")
      .update({
        mp_access_token: result.access_token,
        mp_user_id: result.user_id ? String(result.user_id) : null,
      })
      .eq("id", user.id);

    return redirectTo("/organizer/connect-mp?connected=1", url.origin);
  } catch (err) {
    console.error("MP OAuth callback error", err);
    return redirectTo("/organizer/connect-mp?error=oauth_failed", url.origin);
  }
}
