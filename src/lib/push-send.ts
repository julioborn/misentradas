import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFirebaseMessaging } from "@/lib/firebase-admin";

type PushNotification = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

const UNREGISTERED_ERROR_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

// Best-effort: never throws, so a Firebase outage or missing credentials
// can't break the payment webhook or QR validation flows that call this.
export async function sendPushToUsers(
  userIds: string[],
  notification: PushNotification
) {
  const ids = [...new Set(userIds)].filter(Boolean);
  if (ids.length === 0) return;

  const admin = createAdminClient();
  const { data: tokens } = await admin
    .from("push_tokens")
    .select("id, token")
    .in("user_id", ids);

  if (!tokens || tokens.length === 0) return;

  try {
    const messaging = getFirebaseMessaging();
    const result = await messaging.sendEachForMulticast({
      tokens: tokens.map((t) => t.token),
      notification: { title: notification.title, body: notification.body },
      data: notification.data,
    });

    const invalidIds = result.responses
      .map((response, i) =>
        !response.success && UNREGISTERED_ERROR_CODES.has(response.error?.code ?? "")
          ? tokens[i].id
          : null
      )
      .filter((id): id is string => Boolean(id));

    if (invalidIds.length > 0) {
      await admin.from("push_tokens").delete().in("id", invalidIds);
    }
  } catch (err) {
    console.error("sendPushToUsers error", err);
  }
}
