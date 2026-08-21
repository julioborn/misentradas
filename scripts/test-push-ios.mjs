import { readFileSync } from "node:fs";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

// Parse .env.local handling multiline quoted values
const raw = readFileSync(".env.local", "utf8");
const env = {};
let i = 0;
while (i < raw.length) {
  const nlIdx = raw.indexOf("\n", i);
  const line = nlIdx === -1 ? raw.slice(i) : raw.slice(i, nlIdx);
  i = nlIdx === -1 ? raw.length : nlIdx + 1;
  if (!line.trim() || line.trim().startsWith("#")) continue;
  const eqIdx = line.indexOf("=");
  if (eqIdx === -1) continue;
  const key = line.slice(0, eqIdx).trim();
  let val = line.slice(eqIdx + 1).trim();
  if (val.startsWith('"')) {
    // multiline quoted value: collect until closing quote on its own line
    val = val.slice(1);
    if (!val.endsWith('"')) {
      while (i < raw.length) {
        const nextNl = raw.indexOf("\n", i);
        const nextLine = nextNl === -1 ? raw.slice(i) : raw.slice(i, nextNl);
        i = nextNl === -1 ? raw.length : nextNl + 1;
        if (nextLine.trim() === '"') break;
        val += "\n" + nextLine;
      }
    } else {
      val = val.slice(0, -1);
    }
  }
  env[key] = val;
}

const app =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY,
    }),
  });

const messaging = getMessaging(app);

const token = "dzt51MdH40IUh5jgl4jo2a:APA91bGM1MhAKqN93u-ChY6j8iKB8hXLcHJ9nnssmQLwuUA09BIRUn3y1gWHK_6-sIe9LV9guU5QByAE4aq1yayjTMVHiJQr7EtN-0V9oWGZQNajADrfBFI";

console.log("Enviando notificacion de prueba al dispositivo iOS...");

const result = await messaging.send({
  token,
  notification: {
    title: "🎉 Mis Entradas iOS",
    body: "Las notificaciones push funcionan correctamente.",
  },
  data: { url: "/" },
});

console.log("Enviado! Message ID:", result);
