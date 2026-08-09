let urlTable = {};

self.addEventListener("install", (e) => {
    self.skipWaiting()
})

self.addEventListener("activate", (e) => {
    e.waitUntil(self.clients.claim())
})

self.addEventListener("message", (e) => {
    if (e.data && e.data.type === "setUrls") {
        urlTable = e.data.table;
    }
});

self.addEventListener("fetch", (e) => {
    const url = new URL(e.request.url);
    
    const fromPreview = url.pathname.includes("/preview/") || (e.request.referrer && e.request.referrer.includes("/preview/"));

    if (!fromPreview) return;

    let filePath = url.pathname;

    if (filePath.includes("/preview/")) {
        filePath = filePath.substring(filePath.indexOf("/preview/") + 8);
    }

    if (!filePath.startsWith("/")) {
        filePath = "/" + filePath;
    }

    if (urlTable[filePath]) {
        e.respondWith(
            fetch(urlTable[filePath]).catch(() => {
                return new Response("500 Error fetching file resource", { status: 500 });
            })
        );

        return;
    }

    e.respondWith(
        new Response(`404 File Not Found in Project: ${filePath}`, {
            status: 404,
            headers: { "Content-Type": "text/plain" }
        })
    );
});