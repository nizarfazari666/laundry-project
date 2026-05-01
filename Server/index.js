const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const nodemailer = require('nodemailer');

const app = express();  
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "db_laundry"
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'EMAIL_KAMU@gmail.com', 
        pass: 'KODE_APP_PASSWORD_16_DIGIT' 
    }
});

app.post('/api/register', (req, res) => {
    const { email, password, nama } = req.body;
    const role = 'pelanggan';
    const sql = "INSERT INTO users (email, password, nama, role) VALUES (?, ?, ?, ?)";
    db.query(sql, [email, password, nama, role], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Email sudah terdaftar!" });
        res.json({ success: true, message: "Registrasi Berhasil!" });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json({ success: false });
        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.status(401).json({ success: false, message: "Email atau Password salah!" });
        }
    });
});

app.post('/api/forgot-password-request', (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 Digit
    const expiry = new Date(Date.now() + 5 * 60000); // 5 Menit

    const sql = "UPDATE users SET otp_code = ?, otp_expiry = ? WHERE email = ?";
    db.query(sql, [otp, expiry, email], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Email tidak ditemukan" });

        // Kirim Email
        const mailOptions = {
            from: 'Laundry App',
            to: email,
            subject: 'Kode OTP Reset Password Laundry App',
            text: `Kode OTP Anda adalah: ${otp}. Kode ini berlaku selama 5 menit.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return res.status(500).json({ message: "Gagal kirim email" });
            res.json({ success: true, message: "OTP terkirim ke email!" });
        });
    });
});

app.post('/api/pelanggan', (req, res) => {
    const { nama_pelanggan, alamat, no_hp } = req.body;
    
    console.log("Data Pelanggan Diterima:", req.body);

    const sql = "INSERT INTO pelanggan (nama_pelanggan, alamat, no_hp) VALUES (?, ?, ?)";
    db.query(sql, [nama_pelanggan, alamat, no_hp], (err, result) => {
        if (err) {
            console.error("EROR TAMBAH PELANGGAN:", err.sqlMessage || err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Pelanggan berhasil didaftarkan!" });
    });
});

app.post('/api/reset-password-otp', (req, res) => {
    const { email, otp, newPassword } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND otp_code = ? AND otp_expiry > NOW()";
    
    db.query(sql, [email, otp], (err, results) => {
        if (results.length > 0) {
            const updateSql = "UPDATE users SET password = ?, otp_code = NULL, otp_expiry = NULL WHERE email = ?";
            db.query(updateSql, [newPassword, email], (err, result) => {
                res.json({ success: true, message: "Password berhasil diperbarui!" });
            });
        } else {
            res.status(400).json({ success: false, message: "OTP salah atau kadaluarsa" });
        }
    });
});

app.listen(5000, () => console.log(`Server running on port 5000`));