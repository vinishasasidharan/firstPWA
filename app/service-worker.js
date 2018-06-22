(function() {
    'use strict';

    var filesToCache = [
        '.',
        'styles/main.css',
        'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
        'images/PWA-logo.png',
        'index.html',
        'pages/offline.html',
        'pages/404.html'
    ];

    var staticCacheName = 'cache-v1';

    self.addEventListener('install', function(event) {
        console.log('Installed');
        event.waitUntil(
            caches.open(staticCacheName)
                .then(function(cache) {
                    return cache.addAll(filesToCache);
                })
        );

        self.skipWaiting();
    });

    self.addEventListener('activate', function(event) {
        console.log('Activated');

        var cacheWhitelist = [staticCacheName];

        event.waitUntil(
            caches.keys().then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (cacheWhitelist.indexOf(cacheName) === -1) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        );
    });

    self.addEventListener('fetch', function(event) {
        console.log('Fetching ', event.request.url);

        event.respondWith(
            caches.match(event.request).then(function(response) {
                if (response) {
                    console.log('Found ', event.request.url, ' in cache');
                    return response;
                }
                console.log('Network request for ', event.request.url);
                return fetch(event.request).then(function(response) {
                    if (response.status === 404) {
                        return caches.match('pages/404.html');
                    }

                    return caches.open(staticCacheName).then(function(cache) {
                        cache.put(event.request.url, response.clone());
                        return response;
                    });
                });

            }).catch(function(error) {
                console.log('Error, ', error);
                return caches.match('pages/offline.html');

            })
        );
    });

})();
