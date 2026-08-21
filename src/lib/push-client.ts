"use client";

import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { createClient } from "@/lib/supabase/client";

let currentToken: string | null = null;
let initialized = false;

async function registerTokenWithServer(token: string) {
  try {
    await fetch("/api/push/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, platform: Capacitor.getPlatform() }),
    });
  } catch {
    // Best-effort: retried on the next app open / auth state change.
  }
}

// Runs once per app session, only inside the native shell (no-op in the
// browser PWA). Registers FCM/APNS listeners, requests permission, and
// links the resulting token to whichever user ends up signed in.
export async function initPushNotifications() {
  if (!Capacitor.isNativePlatform() || initialized) return;
  initialized = true;

  const supabase = createClient();
  const platform = Capacitor.getPlatform();

  if (platform === "android") {
    // On Android, @capacitor/push-notifications delivers the FCM token directly.
    PushNotifications.addListener("registration", (token) => {
      currentToken = token.value;
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) registerTokenWithServer(token.value);
      });
    });
  } else if (platform === "ios") {
    // On iOS, Firebase delivers the FCM token via AppDelegate.messaging(_:didReceiveRegistrationToken:),
    // which injects it into the WebView as a custom DOM event. The Capacitor registration
    // event only carries the raw APNs token, which firebase-admin can't target directly.
    const handleToken = (token: string) => {
      currentToken = token;
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) registerTokenWithServer(token);
      });
    };
    // Token may have arrived before JS hydration completed.
    const w = window as Window & { __iosFCMToken?: string };
    if (w.__iosFCMToken) handleToken(w.__iosFCMToken);
    window.addEventListener("iosFCMToken", (e) => {
      handleToken((e as CustomEvent<string>).detail);
    });
  }

  PushNotifications.addListener("registrationError", (err) => {
    console.error("Push registration error", err);
  });

  PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    const url = action.notification.data?.url;
    if (typeof url === "string") {
      window.location.href = url;
    }
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session && currentToken) {
      registerTokenWithServer(currentToken);
    }
  });

  const permission = await PushNotifications.checkPermissions();
  let status = permission.receive;

  if (status === "prompt" || status === "prompt-with-rationale") {
    status = (await PushNotifications.requestPermissions()).receive;
  }

  if (status === "granted") {
    await PushNotifications.register();
  }
}

// Called on logout so a new user on the same device doesn't inherit the
// previous account's notifications.
export async function unregisterPush() {
  if (!Capacitor.isNativePlatform()) return;

  const token = currentToken;
  currentToken = null;

  try {
    await PushNotifications.unregister();
  } catch {
    // ignore: nothing to unregister
  }

  if (token) {
    try {
      await fetch("/api/push/register", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } catch {
      // best-effort cleanup
    }
  }
}
