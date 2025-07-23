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