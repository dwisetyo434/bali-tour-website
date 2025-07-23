// --- Bagian Pendaftaran Service Worker ---
// Kode ini harus berada di luar 'DOMContentLoaded' listener
// karena Service Worker harus didaftarkan sesegera mungkin
// agar dapat mulai mengelola cache dan fitur offline.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

