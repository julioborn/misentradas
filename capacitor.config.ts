import type { CapacitorConfig } from "@capacitor/cli";

// This app is fully dynamic (Server Actions, Supabase auth, MercadoPago
// webhooks) and can't be statically exported, so the native shells load
// the live site instead of a bundled copy. `capacitor-www/` is only the
// placeholder Capacitor needs on disk before it hands off to `server.url`.
const config: CapacitorConfig = {
  appId: "ar.com.misentradas.app",
  appName: "Mis Entradas",
  webDir: "capacitor-www",
  server: {
    url: "https://www.misentradas.com.ar",
    androidScheme: "https",
  },
};

export default config;
