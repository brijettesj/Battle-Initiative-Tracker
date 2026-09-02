/* The whole app is one file, so the "build" is a copy into the folder
   Capacitor packages. Keeping it a script rather than a shell one-liner
   means `npm run build` behaves the same on Windows and macOS. */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const out = path.join(root, "www");

fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(path.join(root, "index.html"), path.join(out, "index.html"));

const bytes = fs.statSync(path.join(out, "index.html")).size;
console.log(`www/index.html written (${(bytes / 1024).toFixed(0)} KB)`);
