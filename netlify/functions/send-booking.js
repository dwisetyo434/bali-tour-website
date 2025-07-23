// netlify/functions/send-booking.js

// Impor library yang dibutuhkan
const axios = require('axios'); // axios belum digunakan di sini, bisa dihapus jika tidak dipakai
const nodemailer = require('nodemailer');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const twilio = require('twilio'); // Pastikan Anda mengimpor twilio dengan benar

// --- Fungsi untuk menyimpan ke Google Sheets ---
async function saveToGoogleSheets(data) {
    try {
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });

        await doc.loadInfo();
        // Asumsi sheet pertama adalah tempat data akan disimpan
        const sheet = doc.sheetsByIndex[0];

        // Pastikan nama kolom di Google Sheet sama persis dengan yang ada di sini
        await sheet.addRow({
            'Tanggal': new Date().toLocaleString(),
            'Nama': data.name,
            'Email': data.email,
            'Telepon': data.phone,
            'Layanan': data.service,
            'Tanggal Booking': data.date,
            'Pesan': data.message
        });
        console.log('Data berhasil disimpan ke Google Sheets.');
    } catch (error) {
        console.error('Gagal menyimpan ke Google Sheets:', error);
        throw new Error('Gagal menyimpan ke Google Sheets'); // Lempar error agar ditangkap di handler utama
    }
}

// --- Fungsi untuk mengirim email ---
async function sendEmail(data) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Pertimbangkan layanan email profesional seperti SendGrid/Mailgun untuk produksi
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECIPIENT_EMAIL, // Email penerima notifikasi (admin)
            subject: `Booking Baru: ${data.service} dari ${data.name}`,
            html: `
                <h2>Detail Booking Baru</h2>
                <p><strong>Nama:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Telepon:</strong> ${data.phone}</p>
                <p><strong>Layanan:</strong> ${data.service}</p>
                <p><strong>Tanggal Booking:</strong> ${data.date}</p>
                <p><strong>Pesan:</strong> ${data.message || '-'}</p>
                <br>
                <p>Mohon segera tindak lanjuti booking ini.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Email notifikasi berhasil dikirim.');
    } catch (error) {
        console.error('Gagal mengirim email:', error);
        throw new Error('Gagal mengirim email');
    }
}

// --- Fungsi untuk mengirim WhatsApp ---
async function sendWhatsApp(data) {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const client = twilio(accountSid, authToken); // Inisialisasi client Twilio

        await client.messages.create({
            body: `Booking baru dari ${data.name} untuk layanan ${data.service} pada ${data.date}. Telepon: ${data.phone}.`,
            from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER, // Nomor WhatsApp Twilio Anda
            to: 'whatsapp:' + process.env.RECIPIENT_PHONE_NUMBER // Nomor WhatsApp penerima (admin)
        });
        console.log('Pesan WhatsApp berhasil dikirim.');
    } catch (error) {
        console.error('Gagal mengirim WhatsApp:', error);
        throw new Error('Gagal mengirim WhatsApp');
    }
}


// --- Handler Utama Netlify Function ---
// Fungsi ini akan dipanggil oleh Netlify saat endpoint diakses
exports.handler = async (event, context) => {
    // Pastikan permintaan adalah POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
            headers: { "Allow": "POST" }
        };
    }

    try {
        // Parsing body JSON dari permintaan
        const data = JSON.parse(event.body);

        // Validasi data input (disarankan untuk lebih ketat)
        if (!data.name || !data.email || !data.phone || !data.service || !data.date) {
            return {
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: 'Data yang dibutuhkan tidak lengkap.' })
            };
        }

        // Panggil fungsi-fungsi yang telah didefinisikan
        await saveToGoogleSheets(data);
        await sendEmail(data);
        await sendWhatsApp(data);

        // Kirim respons sukses ke frontend
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // WAJIB untuk CORS
                "Access-Control-Allow-Methods": "POST, OPTIONS", // Tambahkan OPTIONS untuk preflight request
                "Access-Control-Allow-Headers": "Content-Type" // Izinkan header Content-Type
            },
            body: JSON.stringify({ message: 'Pemesanan berhasil diterima dan notifikasi dikirim!' })
        };

    } catch (error) {
        console.error('Error in handler:', error); // Log error yang lebih umum
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // WAJIB untuk CORS
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ message: 'Terjadi kesalahan pada server.', error: error.message })
        };
    }
};
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
        pemesananForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // Mencegah form submit default

            const form = event.target;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            pesanStatusDiv.textContent = 'Mengirim pesanan...';
            pesanStatusDiv.style.color = 'blue';

            try {
                // URL endpoint Netlify Function Anda
                // Perbaiki URL ini!
                // Jika website Anda di-deploy di Netlify dan fungsi ada di sub-domain yang sama:
                const backendUrl = 'https://strong-llama-e01e44.netlify.app/';

                // ATAU Jika website Anda di-deploy di tempat lain (misal GitHub Pages)
                // dan Anda memanggil Netlify Function di domain terpisah:
                // const backendUrl = 'https://strong-llama-e01e44.netlify.app/.netlify/functions/send-booking'; 
                // CATATAN: Pilihan kedua ini sering butuh penanganan CORS lebih cermat di fungsi backend.
                // Untuk kasus Anda, karena web dan fungsi ada di Netlify, gunakan yang pertama.
                const response = await fetch(backendUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) { // Status 200-299
                    const result = await response.json();
                    pesanStatusDiv.textContent = 'Pemesanan berhasil dikirim! ' + (result.message || '');
                    pesanStatusDiv.style.color = 'green';
                    form.reset(); // Mengosongkan formulir setelah sukses
                } else {
                    const errorText = await response.text();
                    pesanStatusDiv.textContent = 'Gagal mengirim pesanan: ' + errorText;
                    pesanStatusDiv.style.color = 'red';
                    console.error('Backend Error (Status ' + response.status + '):', errorText);
                }
            } catch (error) {
                console.error('Error Jaringan atau JavaScript:', error);
                pesanStatusDiv.textContent = 'Terjadi kesalahan jaringan atau server.';
                pesanStatusDiv.style.color = 'red';
            }
        });
    } else {
        console.error("Formulir pemesanan atau div status tidak ditemukan. Pastikan ID 'pemesananForm' dan 'pesanStatus' ada di HTML Anda.");
    }
    // BAGIAN INI DIHAPUS KARENA DUPLIKASI:
    /*
    document.getElementById('pemesananForm').addEventListener('submit', async function(event) {
        event.preventDefault(); // PASTIKAN INI ADA DAN BEKERJA!

        // ... ambil data formulir ...

        try {
            const backendUrl = '/.netlify/functions/send-booking'; // Atau URL absolut jika diperlukan

            const response = await fetch(backendUrl, {
                method: 'POST', // <--- INI HARUS 'POST'
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            // ... sisa logika penanganan respons ...
        } catch (error) {
            // ... penanganan error ...
        }
    });
    */
});
