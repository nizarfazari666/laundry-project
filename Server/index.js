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
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    const expiry = new Date(Date.now() + 5 * 60000); 

    const sql = "UPDATE users SET otp_code = ?, otp_expiry = ? WHERE email = ?";
    db.query(sql, [otp, expiry, email], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Email tidak ditemukan" });

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
    const sql = "INSERT INTO pelanggan (nama_pelanggan, alamat, no_hp) VALUES (?, ?, ?)";
    db.query(sql, [nama_pelanggan, alamat, no_hp], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
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

app.post('/api/transaksi-baru', (req, res) => {
    const { nama_pelanggan, no_hp, alamat, layanan, berat, total_harga, keterangan } = req.body;

    db.query("SELECT id_pelanggan FROM pelanggan WHERE nama_pelanggan = ?", [nama_pelanggan], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Error Cek Pelanggan: " + err.message });

        const simpanTransaksi = (id_pelanggan) => {
            const sqlTransaksi = `INSERT INTO transaksi 
                (id_pelanggan, id_paket, berat, total_harga, tgl_masuk, status, status_bayar, jumlah_bayar, keterangan) 
                VALUES (?, 101, ?, ?, NOW(), 'Proses', 'Belum Lunas', 0, ?)`; 
            
            db.query(sqlTransaksi, [id_pelanggan, berat, total_harga, keterangan || ""], (err2) => {
                if (err2) return res.status(500).json({ success: false, message: "Error SQL: " + err2.message });
                res.json({ success: true, message: "Berhasil disimpan!" });
            });
        };

        if (results.length > 0) {
            simpanTransaksi(results[0].id_pelanggan);
        } else {
            const sqlPelanggan = "INSERT INTO pelanggan (nama_pelanggan, no_hp, alamat) VALUES (?, ?, ?)";
            db.query(sqlPelanggan, [nama_pelanggan, no_hp, alamat], (err3, result3) => {
                if (err3) return res.status(500).json({ success: false, message: "Error Pelanggan: " + err3.message });
                simpanTransaksi(result3.insertId);
            });
        }
    });
});

app.put('/api/transaksi/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const sql = "UPDATE transaksi SET status = ? WHERE id_transaksi = ?";
    db.query(sql, [status, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Status berhasil diubah!" });
    });
});

app.get('/api/transaksi', (req, res) => {
    const sql = `SELECT transaksi.*, pelanggan.nama_pelanggan, pelanggan.no_hp, pelanggan.alamat 
                 FROM transaksi 
                 JOIN pelanggan ON transaksi.id_pelanggan = pelanggan.id_pelanggan 
                 ORDER BY transaksi.tgl_masuk DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// --- GANTI RUTE BAYAR INI DI INDEX.JS ---
app.post('/api/bayar/:id', (req, res) => {
    const { id } = req.params;
    const { jumlah_bayar, metode_pembayaran } = req.body; // Tambah metode_pembayaran
    
    // Simpan metode_pembayaran ke database
    const sql = "UPDATE transaksi SET status_bayar = 'Lunas', jumlah_bayar = ?, metode_pembayaran = ? WHERE id_transaksi = ?";
    
    db.query(sql, [jumlah_bayar, metode_pembayaran, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

// ================= FITUR CHAT BARU ==================

// 1. Kirim Pesan Chat
app.post('/api/chat', (req, res) => {
    const { nama_pelanggan, sender_role, pesan } = req.body;
    const sql = "INSERT INTO chat (nama_pelanggan, sender_role, pesan, waktu) VALUES (?, ?, ?, NOW())";
    db.query(sql, [nama_pelanggan, sender_role, pesan], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true });
    });
});

// 2. Ambil Riwayat Chat berdasarkan Nama Pelanggan
app.get('/api/chat/:nama', (req, res) => {
    const sql = "SELECT * FROM chat WHERE nama_pelanggan = ? ORDER BY waktu ASC";
    db.query(sql, [req.params.nama], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 3. Ambil Daftar Orang yang Punya Chat (Khusus Admin)
app.get('/api/chat-list', (req, res) => {
    const sql = "SELECT DISTINCT nama_pelanggan FROM chat ORDER BY waktu DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.listen(5000, () => console.log(`Server running on port 5000`));