// Memastikan bahwa kode dijalankan setelah seluruh konten HTML dimuat
document.addEventListener('DOMContentLoaded', () => {
    console.log('Website Bali Tour & Travel telah dimuat sepenuhnya!');

    // Anda bisa menambahkan fitur interaktif di sini di masa mendatang.
    // Contoh ide fitur:
    // 1. Validasi formulir kontak yang lebih canggih sebelum dikirim.
    // 2. Efek animasi saat scroll (misal: elemen muncul perlahan).
    // 3. Carousel atau slideshow gambar untuk galeri atau di hero section.
    // 4. Integrasi dengan API pihak ketiga (misal: cuaca Bali, kurs mata uang).
    // 5. Lightbox untuk melihat gambar tur lebih besar.
    // 6. Tombol "Kembali ke Atas" (Scroll-to-top button).

    // --- Contoh Implementasi Sederhana (Opsional) ---
    // Misal: Menambahkan efek ke header saat discroll
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { // Jika sudah scroll lebih dari 50px
            header.classList.add('scrolled'); // Tambahkan kelas 'scrolled'
        } else {
            header.classList.remove('scrolled'); // Hapus kelas 'scrolled'
        }
    });

    // Anda juga perlu menambahkan CSS untuk kelas 'scrolled' di style.css
    // Contoh di style.css:
    /*
    header.scrolled {
        background-color: rgba(0, 123, 255, 0.95); // Sedikit transparan saat discroll
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    */
});