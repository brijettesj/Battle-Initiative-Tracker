/* Runs Gradle for this project, on any platform, from any shell.

   It calls the wrapper's Java entry point directly rather than going through
   gradlew / gradlew.bat. Those scripts are awkward to invoke from Node on
   Windows: a .bat cannot be spawned without a shell, and going through cmd
   fails once the project path contains spaces. The batch file only ever sets
   up a classpath and calls this same class, so nothing is lost.

   It also pins the JDK. Android Studio bundles Java 25, which Gradle 8.14 and
   Android Gradle Plugin 8.13 cannot run on: the build dies with "Unsupported
   class file major version 69". tools/jdk-21 is used when present.

   Usage: node gradle.js assembleDebug */
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const root = __dirname;
const androidDir = path.join(root, "android");
const isWin = process.platform === "win32";
const exe = isWin ? "java.exe" : "java";

if (!fs.existsSync(androidDir)) {
  console.error("No android/ project yet. Run `npm run add:android` first.");
  process.exit(1);
}

const jar = path.join(androidDir, "gradle", "wrapper", "gradle-wrapper.jar");
if (!fs.existsSync(jar)) {
  console.error("Missing " + jar);
  process.exit(1);
}

// Pick a JDK: the pinned 21, else JAVA_HOME, else whatever is on PATH.
const env = { ...process.env };
const pinned = path.join(root, "tools", "jdk-21");
let java;
if (fs.existsSync(path.join(pinned, "bin", exe))) {
  env.JAVA_HOME = pinned;
  java = path.join(pinned, "bin", exe);
} else if (env.JAVA_HOME && fs.existsSync(path.join(env.JAVA_HOME, "bin", exe))) {
  java = path.join(env.JAVA_HOME, "bin", exe);
} else {
  java = "java";
  console.warn("No tools/jdk-21 and no usable JAVA_HOME, falling back to java on PATH.");
  console.warn('If the build fails with "Unsupported class file major version 69",');
  console.warn("that is Java 25: put a JDK 21 in tools/jdk-21 and try again.");
}
console.log("java:", java);

const r = spawnSync(
  java,
  ["-Xmx64m", "-Dorg.gradle.appname=gradlew", "-classpath", jar,
   "org.gradle.wrapper.GradleWrapperMain", ...process.argv.slice(2)],
  { cwd: androidDir, stdio: "inherit", env }
);

if (r.error) {
  console.error("Could not start Gradle:", r.error.message);
  process.exit(1);
}
process.exit(r.status === null ? 1 : r.status);
