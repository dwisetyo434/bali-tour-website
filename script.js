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

    // --- Implementasi Pengiriman Formulir Pemesanan ---
    // Mengambil elemen formulir pemesanan.
    const pemesananForm = document.getElementById('pemesananForm');
    const pesanStatusDiv = document.getElementById('pesanStatus');

    // Memastikan formulir ditemukan sebelum menambahkan event listener.
    if (pemesananForm && pesanStatusDiv) {
        pemesananForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Mencegah form submit default

            const form = event.target;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            pesanStatusDiv.textContent = 'Mengirim pesanan...';
            pesanStatusDiv.style.color = 'blue';

            try {
                // URL endpoint Netlify Function Anda
                // GANTI DENGAN URL API BACKEND ANDA YANG SEBENARNYA!
                // Contoh: 'https://namasitusanda.netlify.app/.netlify/functions/send-booking'
                const backendUrl = '/.https://strong-llama-e01e44.netlify.app/'; // Path relatif jika di-deploy di Netlify

                const response = await fetch(backendUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const result = await response.json();
                    pesanStatusDiv.textContent = 'Pemesanan berhasil dikirim! ' + (result.message || '');
                    pesanStatusDiv.style.color = 'green';
                    form.reset(); // Mengosongkan formulir setelah sukses
                } else {
                    const errorText = await response.text();
                    pesanStatusDiv.textContent = 'Gagal mengirim pesanan: ' + errorText;
                    pesanStatusDiv.style.color = 'red';
                    console.error('Backend Error:', errorText);
                }
            } catch (error) {
                console.error('Error Jaringan:', error);
                pesanStatusDiv.textContent = 'Terjadi kesalahan jaringan atau server.';
                pesanStatusDiv.style.color = 'red';
            }
        });
    } else {
        console.error("Formulir pemesanan atau div status tidak ditemukan. Pastikan ID 'pemesananForm' dan 'pesanStatus' ada di HTML Anda.");
    }
});