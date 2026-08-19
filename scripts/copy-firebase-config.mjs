import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname } from "node:path";

const platform = process.argv[2];

const targets = {
  android: {
    src: "firebase/google-services.json",
    dest: "android/app/google-services.json",
  },
  ios: {
    src: "firebase/GoogleService-Info.plist",
    dest: "ios/App/App/GoogleService-Info.plist",
  },
};

const target = targets[platform];

if (!target) {
  console.error("Uso: node scripts/copy-firebase-config.mjs <android|ios>");
  process.exit(1);
}

if (!existsSync(target.src)) {
  console.warn(
    `[firebase] No se encontro ${target.src}. Descargalo desde Firebase Console ` +
      `y volve a correr "npm run cap:firebase:${platform}" cuando lo tengas.`
  );
  process.exit(0);
}

if (!existsSync(dirname(target.dest))) {
  console.warn(
    `[firebase] No existe ${dirname(target.dest)} todavia. Corre "npm run cap:add:${platform}" primero.`
  );
  process.exit(0);
}

mkdirSync(dirname(target.dest), { recursive: true });
copyFileSync(target.src, target.dest);
console.log(`[firebase] Copiado ${target.src} -> ${target.dest}`);
