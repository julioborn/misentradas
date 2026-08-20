import { existsSync, readFileSync, writeFileSync } from "node:fs";

// android/ is regenerated from scratch by `cap add android`, resetting
// variables.gradle back to whatever @capacitor/android ships as its
// default (compileSdk/targetSdk 35 as of writing). Google Play requires
// targeting a version no more than ~1 year behind latest, so this keeps
// the project pinned to Android 16 (API 36) across regenerations.
const TARGET_SDK = 36;
const GRADLE_PATH = "android/variables.gradle";

if (!existsSync(GRADLE_PATH)) {
  console.warn(
    `[sdk] No existe ${GRADLE_PATH} todavia. Corre "npm run cap:add:android" primero.`
  );
  process.exit(0);
}

let content = readFileSync(GRADLE_PATH, "utf8");
const before = content;

content = content
  .replace(/compileSdkVersion = \d+/, `compileSdkVersion = ${TARGET_SDK}`)
  .replace(/targetSdkVersion = \d+/, `targetSdkVersion = ${TARGET_SDK}`);

if (content === before) {
  console.log(`[sdk] variables.gradle ya apunta a compileSdk/targetSdk ${TARGET_SDK}.`);
  process.exit(0);
}

writeFileSync(GRADLE_PATH, content);
console.log(`[sdk] variables.gradle actualizado a compileSdk/targetSdk ${TARGET_SDK}.`);
