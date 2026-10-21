// Pocket beta: cache only its own static files, never authentication links or API data.
const CACHE='pocket-static-v7';
const ASSETS=['./','./index.html','./manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('pocket-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url),base=new URL(self.registration.scope);
  if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))return;
  // Never cache a URL containing a confirmation or password-reset code.
  if(url.search||url.hash)return;
  const relative=url.pathname.slice(base.pathname.length);
  if(!['','index.html','manifest.webmanifest'].includes(relative))return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});}return response;
  }).catch(async()=>await caches.match(event.request)||await caches.match('./index.html')||Response.error()));
});
