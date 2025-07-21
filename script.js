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

// --- Bagian Utama JavaScript: Dijalankan Setelah HTML Dimuat Penuh ---
// Memastikan bahwa kode dijalankan setelah seluruh konten HTML (DOM) dimuat.
document.addEventListener('DOMContentLoaded', () => {
    console.log('Website Bali Tour & Travel telah dimuat sepenuhnya!');

    // --- Implementasi Efek Header Saat Discroll ---
    // Mengambil elemen header dari DOM.
    const header = document.querySelector('header');

    // Memastikan elemen header ditemukan sebelum menambahkan event listener.
    // Ini penting untuk mencegah error jika header tidak ada di suatu halaman.
    if (header) {
        // Menambahkan event listener untuk mendeteksi scroll pada jendela browser.
        window.addEventListener('scroll', () => {
            // Jika posisi scroll vertikal (scrollY) lebih dari 50 piksel,
            // tambahkan kelas 'scrolled' ke header.
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                // Jika posisi scroll kurang dari atau sama dengan 50 piksel,
                // hapus kelas 'scrolled' dari header.
                header.classList.remove('scrolled');
            }
        });
    }

    // --- Anda bisa menambahkan fitur interaktif lainnya di sini di masa mendatang. ---
    // Ini adalah tempat yang tepat untuk menambahkan JavaScript untuk:
    // 1. Validasi formulir kontak yang lebih canggih sebelum dikirim.
    // 2. Efek animasi saat scroll (misal: elemen muncul perlahan - "reveal on scroll").
    // 3. Carousel atau slideshow gambar untuk galeri atau di hero section.
    // 4. Integrasi dengan API pihak ketiga (misal: menampilkan cuaca Bali, kurs mata uang).
    // 5. Lightbox atau modal untuk melihat gambar tur lebih besar saat diklik.
    // 6. Tombol "Kembali ke Atas" (Scroll-to-top button) yang muncul saat discroll.
    // 7. Fungsionalitas untuk mengisi otomatis formulir kontak berdasarkan parameter URL (seperti "?package=south-bali").
});