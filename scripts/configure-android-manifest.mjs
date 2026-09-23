import { existsSync, readFileSync, writeFileSync } from "node:fs";

// android/ is regenerated from scratch by `cap add android`, so the
// camera permission the QR scanner (getUserMedia) needs has to be
// reapplied every time, same pattern as signing/sdk/version.
const MANIFEST_PATH = "android/app/src/main/AndroidManifest.xml";
const CAMERA_PERMISSION = '<uses-permission android:name="android.permission.CAMERA" />';

if (!existsSync(MANIFEST_PATH)) {
  console.warn(
    `[manifest] No existe ${MANIFEST_PATH} todavia. Corre "npm run cap:add:android" primero.`
  );
  process.exit(0);
}

let content = readFileSync(MANIFEST_PATH, "utf8");

if (content.includes(CAMERA_PERMISSION)) {
  console.log("[manifest] AndroidManifest.xml ya tiene el permiso de camara.");
  process.exit(0);
}

content = content.replace(
  "<!-- Permissions -->",
  `<!-- Permissions -->\n\n    ${CAMERA_PERMISSION}`
);

writeFileSync(MANIFEST_PATH, content);
console.log("[manifest] AndroidManifest.xml actualizado (permiso de camara).");
