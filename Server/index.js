const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

const app = express();  
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// ================= ROUTE TRANSAKSI & FOTO ==================

app.post('/api/transaksi/:id/bukti', upload.single('bukti_foto'), (req, res) => {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ success: false, message: "Tidak ada file" });

    const namaFile = req.file.filename;
    const sql = "UPDATE transaksi SET bukti_foto = ?, status = 'Selesai' WHERE id_transaksi = ?";
    db.query(sql, [namaFile, id], (err, result) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: "Bukti foto berhasil diunggah!", filename: namaFile });
    });
});

// ================= ROUTE USER / PELANGGAN ==================

app.post('/api/register', (req, res) => {
    const { email, password, nama } = req.body;
    const sql = "INSERT INTO users (email, password, nama, role) VALUES (?, ?, ?, 'pelanggan')";
    db.query(sql, [email, password, nama], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Email sudah terdaftar!" });
        res.json({ success: true, message: "Registrasi Berhasil!" });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json({ success: false });
        if (results.length > 0) res.json({ success: true, user: results[0] });
        else res.status(401).json({ success: false, message: "Email atau Password salah!" });
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
            from: 'Laundry App', to: email, subject: 'Kode OTP Reset Password Laundry App',
            text: `Kode OTP Anda adalah: ${otp}. Kode ini berlaku selama 5 menit.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return res.status(500).json({ message: "Gagal kirim email" });
            res.json({ success: true, message: "OTP terkirim ke email!" });
        });
    });
});

app.post('/api/reset-password-otp', (req, res) => {
    const { email, otp, newPassword } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND otp_code = ? AND otp_expiry > NOW()";
    db.query(sql, [email, otp], (err, results) => {
        if (results.length > 0) {
            db.query("UPDATE users SET password = ?, otp_code = NULL, otp_expiry = NULL WHERE email = ?", [newPassword, email], () => {
                res.json({ success: true, message: "Password berhasil diperbarui!" });
            });
        } else res.status(400).json({ success: false, message: "OTP salah atau kadaluarsa" });
    });
});

// ================= ROUTE TRANSAKSI UTAMA ==================

app.post('/api/transaksi-baru', (req, res) => {
    const { nama_pelanggan, no_hp, alamat, berat, total_harga, keterangan } = req.body;

    db.query("SELECT id_pelanggan FROM pelanggan WHERE nama_pelanggan = ?", [nama_pelanggan], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Error Cek Pelanggan: " + err.message });

        const simpanTransaksi = (id_pelanggan) => {
            // FIX: Data no_hp dan alamat LANGSUNG masuk ke tabel transaksi!
            const sqlTransaksi = `INSERT INTO transaksi 
                (id_pelanggan, id_paket, berat, total_harga, tgl_masuk, status, status_bayar, jumlah_bayar, keterangan, no_hp, alamat) 
                VALUES (?, 101, ?, ?, NOW(), 'Proses', 'Belum Lunas', 0, ?, ?, ?)`; 
            
            db.query(sqlTransaksi, [id_pelanggan, berat, total_harga, keterangan || "", no_hp, alamat], (err2) => {
                if (err2) return res.status(500).json({ success: false, message: "Error SQL: " + err2.message });
                res.json({ success: true, message: "Berhasil disimpan!" });
            });
        };

        if (results.length > 0) {
            // JIKA PELANGGAN SUDAH ADA: Langsung simpan transaksi. 
            // TIDAK ADA LAGI KODE 'UPDATE pelanggan' DI SINI! (Agar pesanan lama tidak ikut berubah)
            simpanTransaksi(results[0].id_pelanggan);
        } else {
            // Jika pelanggan sama sekali belum ada di database, buat profil awal
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
    db.query("UPDATE transaksi SET status = ? WHERE id_transaksi = ?", [status, id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Status berhasil diubah!" });
    });
});

app.get('/api/transaksi', (req, res) => {
    // FIX: Menggunakan COALESCE. Jika transaksi.no_hp kosong, ambil dari pelanggan.no_hp. Jika ada, pakai yang baru!
    const sql = `SELECT t.*, p.nama_pelanggan, 
                 COALESCE(NULLIF(t.no_hp, ''), p.no_hp) AS no_hp, 
                 COALESCE(NULLIF(t.alamat, ''), p.alamat) AS alamat 
                 FROM transaksi t
                 JOIN pelanggan p ON t.id_pelanggan = p.id_pelanggan 
                 ORDER BY t.tgl_masuk DESC`;
                 
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/api/bayar/:id', (req, res) => {
    const { id } = req.params;
    const { jumlah_bayar, metode_pembayaran } = req.body; 
    db.query("UPDATE transaksi SET status_bayar = 'Lunas', jumlah_bayar = ?, metode_pembayaran = ? WHERE id_transaksi = ?", [jumlah_bayar, metode_pembayaran, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

// ================= FITUR CHAT ==================

app.post('/api/chat', (req, res) => {
    const { nama_pelanggan, sender_role, pesan } = req.body;
    db.query("INSERT INTO chat (nama_pelanggan, sender_role, pesan, waktu) VALUES (?, ?, ?, NOW())", [nama_pelanggan, sender_role, pesan], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.get('/api/chat/:nama', (req, res) => {
    db.query("SELECT * FROM chat WHERE nama_pelanggan = ? ORDER BY waktu ASC", [req.params.nama], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get('/api/chat-list', (req, res) => {
    db.query("SELECT DISTINCT nama_pelanggan FROM chat ORDER BY waktu DESC", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.listen(5000, () => console.log(`Server running on port 5000`));