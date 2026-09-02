import { existsSync, readFileSync, writeFileSync } from "node:fs";

// android/ is regenerated from scratch by `cap add android`, resetting
// versionCode/versionName back to the Capacitor template defaults (1 / "1.0").
// The real, incrementing values live in the tracked android-version.properties
// so every release keeps bumping from where the last one left off, even
// after a full regeneration.
const PROPS_PATH = "android-version.properties";
const GRADLE_PATH = "android/app/build.gradle";

if (!existsSync(PROPS_PATH)) {
  console.warn(`[version] No existe ${PROPS_PATH}.`);
  process.exit(0);
}

if (!existsSync(GRADLE_PATH)) {
  console.warn(
    `[version] No existe ${GRADLE_PATH} todavia. Corre "npm run cap:add:android" primero.`
  );
  process.exit(0);
}

const props = Object.fromEntries(
  readFileSync(PROPS_PATH, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("="))
);

const versionCode = props.versionCode;
const versionName = props.versionName;

if (!versionCode || !versionName) {
  console.warn(`[version] ${PROPS_PATH} no tiene versionCode/versionName validos.`);
  process.exit(0);
}

let content = readFileSync(GRADLE_PATH, "utf8");
content = content
  .replace(/versionCode \d+/, `versionCode ${versionCode}`)
  .replace(/versionName "[^"]*"/, `versionName "${versionName}"`);

writeFileSync(GRADLE_PATH, content);
console.log(`[version] build.gradle actualizado a versionCode=${versionCode} versionName=${versionName}`);
