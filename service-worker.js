const CACHE_NAME = 'v1';

async function cacheFilesFromManifest(manifestUrl) {
    const response = await fetch(manifestUrl);
    const manifest = await response.json();

    const cache = await caches.open(CACHE_NAME);

    // Cache each file listed in the manifest
    for (const file of manifest.files) {
        await cache.add(file);
    }
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            cacheFilesFromManifest('/file-manifest.json'),
            cacheFilesFromManifest('/file-manifest2.json')
        ])
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
