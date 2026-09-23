import { existsSync, readFileSync, writeFileSync } from "node:fs";

// android/ is regenerated from scratch by `cap add android`, so the
// camera permission the QR scanner (getUserMedia) needs has to be
// reapplied every time, same pattern as signing/sdk/version.
const MANIFEST_PATH = "android/app/src/main/AndroidManifest.xml";
const CAMERA_PERMISSION = '<uses-permission android:name="android.permission.CAMERA" />';
// Declaring CAMERA makes Android assume the camera is required app-wide
// unless told otherwise, which hides the app from cameraless devices.
// Only the QR scanner needs it, buyers never touch the camera.
const CAMERA_FEATURES = [
  '<uses-feature android:name="android.hardware.camera" android:required="false" />',
  '<uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />',
];

if (!existsSync(MANIFEST_PATH)) {
  console.warn(
    `[manifest] No existe ${MANIFEST_PATH} todavia. Corre "npm run cap:add:android" primero.`
  );
  process.exit(0);
}

let content = readFileSync(MANIFEST_PATH, "utf8");
let changed = false;

if (!content.includes(CAMERA_PERMISSION)) {
  content = content.replace(
    "<!-- Permissions -->",
    `<!-- Permissions -->\n\n    ${CAMERA_PERMISSION}`
  );
  changed = true;
}

const missingFeatures = CAMERA_FEATURES.filter((f) => !content.includes(f));
if (missingFeatures.length > 0) {
  content = content.replace(
    "</manifest>",
    `    ${missingFeatures.join("\n    ")}\n</manifest>`
  );
  changed = true;
}

if (!changed) {
  console.log("[manifest] AndroidManifest.xml ya tiene los cambios de camara.");
  process.exit(0);
}

writeFileSync(MANIFEST_PATH, content);
console.log("[manifest] AndroidManifest.xml actualizado (permiso + features de camara opcionales).");
