// netlify/functions/send-booking.js
const axios = require('axios');
const nodemailer = require('nodemailer');
const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async (event, context) => {
  // Hanya izinkan permintaan POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse data yang dikirim dari form
    const data = JSON.parse(event.body);
    const { name, email, phone, service, date, message } = data;

    // 1. Simpan ke Google Sheets (opsional)
    await saveToGoogleSheets(data);

    // 2. Kirim email
    await sendEmail(data);

    // 3. Kirim WhatsApp (menggunakan Twilio atau API lain)
    await sendWhatsApp(data);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Booking berhasil dikirim!' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Terjadi kesalahan saat memproses booking' }),
    };
  }
};

// Fungsi untuk menyimpan ke Google Sheets
async function saveToGoogleSheets(data) {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  });

  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  await sheet.addRow({
    'Tanggal': new Date().toLocaleString(),
    'Nama': data.name,
    'Email': data.email,
    'Telepon': data.phone,
    'Layanan': data.service,
    'Tanggal Booking': data.date,
    'Pesan': data.message
  });
}

// Fungsi untuk mengirim email
async function sendEmail(data) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECIPIENT_EMAIL,
    subject: `Booking Baru: ${data.service}`,
    html: `
      <h2>Detail Booking</h2>
      <p><strong>Nama:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Telepon:</strong> ${data.phone}</p>
      <p><strong>Layanan:</strong> ${data.service}</p>
      <p><strong>Tanggal:</strong> ${data.date}</p>
      <p><strong>Pesan:</strong> ${data.message}</p>
    `
  };

  return transporter.sendMail(mailOptions);
}

// Fungsi untuk mengirim WhatsApp
async function sendWhatsApp(data) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);

  return client.messages.create({
    body: `Booking baru dari ${data.name} untuk ${data.service} pada ${data.date}. Telepon: ${data.phone}`,
    from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER,
    to: 'whatsapp:' + process.env.RECIPIENT_PHONE_NUMBER
  });
}
