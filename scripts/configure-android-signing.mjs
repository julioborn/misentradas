import { existsSync, readFileSync, writeFileSync } from "node:fs";

// android/ is regenerated from scratch by `cap add android`, wiping any
// manual edits. This re-applies the release signing config (reading
// from the gitignored /android-signing/keystore.properties) every time,
// wired into the postcap:add:android hook alongside the Firebase config.
const GRADLE_PATH = "android/app/build.gradle";
const MARKER = "// --- release signing (configure-android-signing.mjs) ---";

if (!existsSync(GRADLE_PATH)) {
  console.warn(
    `[signing] No existe ${GRADLE_PATH} todavia. Corre "npm run cap:add:android" primero.`
  );
  process.exit(0);
}

let content = readFileSync(GRADLE_PATH, "utf8");

if (content.includes(MARKER)) {
  console.log("[signing] build.gradle ya tiene la configuracion de firma.");
  process.exit(0);
}

const propertiesLoader = `${MARKER}
def keystorePropertiesFile = rootProject.file("../android-signing/keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

`;

const signingConfigsBlock = `    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile rootProject.file("../android-signing/" + keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }
`;

content = content.replace(
  "apply plugin: 'com.android.application'\n",
  `apply plugin: 'com.android.application'\n\n${propertiesLoader}`
);

content = content.replace("android {\n", `android {\n${signingConfigsBlock}`);

content = content.replace(
  /release\s*{\n(\s*minifyEnabled)/,
  `release {\n            if (keystorePropertiesFile.exists()) {\n                signingConfig signingConfigs.release\n            }\n$1`
);

writeFileSync(GRADLE_PATH, content);
console.log("[signing] build.gradle actualizado con la configuracion de firma.");
