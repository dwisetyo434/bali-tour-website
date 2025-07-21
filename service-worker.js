const CACHE_NAME = 'bali-tour-cache-v1'; // Ubah versi cache setiap kali ada perubahan aset
const urlsToCache = [
  '/', // Ini penting untuk meng-cache root domain
  '/index.html',
  '/packages.html',
  '/car_rental.html',
  '/contact.html',
  '/css/style.css',
  '/js/script.js',
  // Gambar-gambar utama di setiap halaman
  '/images/bali1.jpeg',
  '/images/bali2.jpeg',
  '/images/bali3.jpeg',
  '/images/uluwatu_temple.jpeg',
  '/images/bali_beach.jpeg',
  '/images/bali_road.jpeg',
  // Gambar-gambar mobil
  '/images/toyota_avanza.jpeg',
  '/images/innova_reborn.jpeg',
  '/images/hiace.jpeg',
  '/images/bus.jpeg',
  // Ikon aplikasi
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png'
  // Tambahkan semua aset penting lainnya yang ingin dicache di sini
  // Contoh: '/fonts/yourfont.woff2', dll.
];

// Event 'install': Saat Service Worker pertama kali diinstal
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache); // Cache semua URL yang ditentukan
      })
  );
  self.skipWaiting(); // Memaksa Service Worker baru untuk langsung aktif
});

// Event 'fetch': Saat browser meminta resource (misalnya HTML, CSS, gambar)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request) // Coba cari di cache dulu
      .then(response => {
        // Jika ada di cache, kembalikan dari cache
        if (response) {
          return response;
        }
        // Jika tidak ada di cache, ambil dari jaringan
        return fetch(event.request).catch(() => {
            // Opsional: berikan halaman offline jika request jaringan gagal
            // return caches.match('/offline.html');
        });
      })
  );
});

// Event 'activate': Saat Service Worker diaktifkan atau diperbarui
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Hapus cache lama yang tidak ada dalam whitelist
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Mengambil kendali semua klien segera setelah aktivasi
});