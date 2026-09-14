/* Local test server for rooms: `npm run rooms:dev`.

   Serves index.html and stands in for the two Firebase services rooms use, on one
   address, so rooms can be tested on a laptop and on phones on the same Wi-Fi
   without a Firebase project:
     - anonymous sign-in (the accounts:signUp and token refresh endpoints),
     - the Realtime Database REST API (GET/PUT/PATCH/POST/DELETE on *.json) and
       its Server-Sent Events stream.

   Open the address it prints with ?roomsdev once on each device, and the app
   points its rooms at this server from then on (?roomsdev=off undoes it).

   Only the parts the app uses are implemented. Everything lives in memory and is
   gone when the server stops. The permission checks below are a hand copy of
   firebase/database.rules.json, so change both together. This is not the real
   rules engine, so the real rules still want trying against Firebase itself. */
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");

const PORT = +process.env.PORT || 8787;
const ROOT = path.join(__dirname, "..");
const TTL = 24 * 3600 * 1000;

let db = {};
const listeners = new Set();
const tokens = new Map();     // idToken -> uid
let seq = 0;

const log = (...a) => console.log(new Date().toTimeString().slice(0, 8), ...a);
const parts = p => p.split("/").filter(Boolean);
const get = p => parts(p).reduce((o, k) => (o && typeof o === "object") ? o[k] : undefined, db);

function set(p, v){
  const ks = parts(p);
  if(!ks.length){ db = v || {}; return; }
  let o = db;
  for(const k of ks.slice(0, -1)){
    if(!o[k] || typeof o[k] !== "object") o[k] = {};
    o = o[k];
  }
  if(v === null || v === undefined) delete o[ks[ks.length - 1]]; else o[ks[ks.length - 1]] = v;
  prune(db);
}
// Firebase keeps no empty branches
function prune(o){
  for(const k of Object.keys(o)){
    if(o[k] && typeof o[k] === "object"){ prune(o[k]); if(!Object.keys(o[k]).length) delete o[k]; }
  }
}
// {".sv":"timestamp"} is Firebase's server-time placeholder
function serverValues(v){
  if(v && typeof v === "object"){
    if(v[".sv"] === "timestamp") return Date.now();
    for(const k of Object.keys(v)) v[k] = serverValues(v[k]);
  }
  return v;
}
const pushId = () => Date.now().toString(36).padStart(9, "0") + (seq++).toString(36).padStart(4, "0");

/* firebase/database.rules.json, by hand */
function allowed(method, p, body, uid){
  const ks = parts(p);
  if(!uid || ks[0] !== "rooms" || ks.length < 2) return false;
  const code = ks[1];
  if(!/^[A-HJ-NP-Z2-9]{5}$/.test(code)) return false;
  const room = get("rooms/" + code);
  const meta = room && room.meta;
  const ownerWrite = !room || (meta && (meta.owner === uid || meta.at < Date.now() - TTL));
  if(ownerWrite){
    if(ks.length === 2 && body && body.meta && body.meta.owner !== uid) return false;
    if(ks[2] === "meta" && body && method === "PUT" && body.owner !== uid) return false;
    return true;
  }
  if(!meta) return false;
  if(ks[2] === "claims" && ks.length === 4){
    const cur = room.claims && room.claims[ks[3]];
    return (!cur && body === uid) || (cur === uid && body === null);
  }
  if(ks[2] === "actions" && (ks.length === 4 || (ks.length === 3 && method === "POST"))){
    const cur = ks.length === 4 && room.actions && room.actions[ks[3]];
    return !cur && !!body && body.uid === uid && typeof body.t === "string";
  }
  return false;
}

/* A write at `w` reaches every stream at, under or over it, shaped the way Firebase sends it. */
function notify(w, kind, body){
  const W = parts(w);
  for(const l of listeners){
    const L = parts(l.path);
    if(W.length >= L.length && L.every((k, i) => W[i] === k)){
      send(l, kind, {path:"/" + W.slice(L.length).join("/"), data:body});
    } else if(W.length < L.length && W.every((k, i) => L[i] === k)){
      send(l, "put", {path:"/", data:get(l.path) ?? null});
    }
  }
}
const send = (l, ev, data) => l.res.write("event: " + ev + "\ndata: " + JSON.stringify(data) + "\n\n");

function json(res, status, v){
  res.writeHead(status, {"Content-Type":"application/json"});
  res.end(JSON.stringify(v));
}

function signIn(uid){
  const token = "dev-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  tokens.set(token, uid);
  return token;
}

http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if(req.method === "OPTIONS"){ res.writeHead(204); return res.end(); }

  const url = new URL(req.url, "http://local");
  let raw = "";
  req.on("data", d => { raw += d; });
  req.on("end", () => {
    // the app
    if(req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")){
      res.writeHead(200, {"Content-Type":"text/html; charset=utf-8", "Cache-Control":"no-store"});
      return res.end(fs.readFileSync(path.join(ROOT, "index.html")));
    }
    // anonymous sign-in
    if(url.pathname.endsWith("/v1/accounts:signUp")){
      const uid = "dev" + Math.random().toString(36).slice(2, 10);
      log("signed in", uid);
      return json(res, 200, {idToken:signIn(uid), refreshToken:"refresh-" + uid, expiresIn:"3600", localId:uid});
    }
    if(url.pathname.endsWith("/v1/token")){
      const uid = (new URLSearchParams(raw).get("refresh_token") || "").replace(/^refresh-/, "");
      if(!uid) return json(res, 400, {error:"bad refresh token"});
      return json(res, 200, {id_token:signIn(uid), refresh_token:"refresh-" + uid, expires_in:"3600", user_id:uid});
    }
    // a look at everything, for debugging
    if(url.pathname === "/__db"){
      return json(res, 200, db);
    }
    if(!url.pathname.endsWith(".json")){ res.writeHead(404); return res.end(); }

    const p = decodeURIComponent(url.pathname.slice(0, -5));
    const uid = tokens.get(url.searchParams.get("auth")) || null;

    if(req.method === "GET"){
      if(!uid || parts(p)[0] !== "rooms" || parts(p).length < 2) return json(res, 401, {error:"Permission denied"});
      if((req.headers.accept || "").includes("text/event-stream")){
        res.writeHead(200, {"Content-Type":"text/event-stream", "Cache-Control":"no-cache"});
        const l = {path:p, res};
        listeners.add(l);
        send(l, "put", {path:"/", data:get(p) ?? null});
        const alive = setInterval(() => res.write("event: keep-alive\ndata: null\n\n"), 25000);
        // res, not req: a request "closes" as soon as its (empty) body has been read
        res.on("close", () => { listeners.delete(l); clearInterval(alive); });
        return;
      }
      return json(res, 200, get(p) ?? null);
    }

    let body = null;
    try{ body = raw ? JSON.parse(raw) : null; }catch(e){ return json(res, 400, {error:"Invalid data"}); }
    body = req.method === "DELETE" ? null : serverValues(body);
    if(!allowed(req.method, p, body, uid)){
      log("refused", req.method, p);
      return json(res, 401, {error:"Permission denied"});
    }
    if(req.method === "PUT" || req.method === "DELETE"){
      set(p, body);
      notify(p, "put", body);
      if(parts(p).length === 2) log(body ? "room opened" : "room closed", parts(p)[1]);
      return json(res, 200, body);
    }
    if(req.method === "PATCH"){
      Object.keys(body || {}).forEach(k => set(p + "/" + k, body[k]));
      notify(p, "patch", body);
      return json(res, 200, body);
    }
    if(req.method === "POST"){
      const id = pushId();
      set(p + "/" + id, body);
      notify(p + "/" + id, "put", body);
      log("action", body.t, "from", body.by);
      return json(res, 200, {name:id});
    }
    json(res, 405, {error:"Method not allowed"});
  });
}).listen(PORT, "0.0.0.0", () => {
  const lan = Object.values(os.networkInterfaces()).flat()
    .filter(i => i && i.family === "IPv4" && !i.internal).map(i => i.address);
  console.log("\nRooms test server running.\n");
  console.log("  This computer:  http://localhost:" + PORT + "/?roomsdev");
  lan.forEach(ip => console.log("  Same Wi-Fi:     http://" + ip + ":" + PORT + "/?roomsdev"));
  console.log("\nOpen one of those on each device. Add &demo on the DM's to load the sample battle.");
  console.log("Two tabs on one computer share an identity: use localhost in one and 127.0.0.1 in the other.\n");
});
