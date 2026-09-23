import { existsSync, readFileSync, writeFileSync } from "node:fs";

// android/ is regenerated from scratch by `cap add android`, so the
// manual manifest additions @capacitor-mlkit/barcode-scanning requires
// (camera permission + the ML Kit barcode_ui dependency hint) need to
// be reapplied every time, same pattern as signing/sdk/version.
const MANIFEST_PATH = "android/app/src/main/AndroidManifest.xml";
const CAMERA_PERMISSION = '<uses-permission android:name="android.permission.CAMERA" />';
const MLKIT_META_DATA =
  '<meta-data android:name="com.google.mlkit.vision.DEPENDENCIES" android:value="barcode_ui"/>';

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

if (!content.includes(MLKIT_META_DATA)) {
  content = content.replace(
    "</application>",
    `        ${MLKIT_META_DATA}\n    </application>`
  );
  changed = true;
}

if (!changed) {
  console.log("[manifest] AndroidManifest.xml ya tiene los cambios de barcode-scanning.");
  process.exit(0);
}

writeFileSync(MANIFEST_PATH, content);
console.log("[manifest] AndroidManifest.xml actualizado (permiso de camara + ML Kit).");
