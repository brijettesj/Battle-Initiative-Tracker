/* The whole app is one file, so the "build" is mostly a copy into the folder
   Capacitor packages. The web/ folder rides along: its manifest and service
   worker are what let a browser offer to install the app, and they only work
   when served as real files next to index.html.

   Keeping it a script rather than a shell one-liner means `npm run build`
   behaves the same on Windows and macOS. */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const web = path.join(root, "web");
const out = path.join(root, "www");

fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(path.join(root, "index.html"), path.join(out, "index.html"));

const copied = ["index.html"];
if (fs.existsSync(web)) {
  for (const f of fs.readdirSync(web)) {
    fs.copyFileSync(path.join(web, f), path.join(out, f));
    copied.push(f);
  }
}

const kb = f => (fs.statSync(path.join(out, f)).size / 1024).toFixed(0);
console.log("www/ written:");
for (const f of copied) console.log(`  ${f} (${kb(f)} KB)`);
