const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/paket', (req, res) => {
    const { nama_paket, jenis, harga, estimasi } = req.body;
    
    console.log("Data diterima di server:", req.body);

    const sql = "INSERT INTO paket (nama_paket, jenis, harga, estimasi) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [nama_paket, jenis, harga, estimasi], (err, result) => {
        if (err) {
            console.error("ADA ERROR DATABASE:", err.message); 
            return res.status(500).json({ success: false, message: err.message });
        }
        console.log("Berhasil simpan ke database!");
        res.json({ success: true, message: "Paket berhasil ditambahkan!" });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Error server" });
        
        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.status(401).json({ success: false, message: "Username atau Password salah!" });
        }
    });
});

app.post('/api/register', (req, res) => {
    const { username, password, nama } = req.body;
    const role = 'pelanggan'; // Default role
    
    const sql = "INSERT INTO users (username, password, nama, role) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [username, password, nama, role], (err, result) => {
        if (err) {
            console.error("Error Register:", err);
            return res.status(500).json({ success: false, message: "Username sudah ada atau error database" });
        }
        // Bagian ini penting supaya React tidak mendapat 'undefined'
        res.json({ success: true, message: "Registrasi Berhasil!" });
    });
});

const PORT = 5000;

app.get('/api/paket', (req, res) => {
    const sql = "SELECT * FROM paket";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.post('/api/paket', (req, res) => {
    const { nama_paket, jenis, harga, estimasi } = req.body;
    const sql = "INSERT INTO paket (nama_paket, jenis, harga, estimasi) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [nama_paket, jenis, harga, estimasi], (err, result) => {
        if (err) {
            console.error("DATABASE ERROR:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Paket berhasil ditambahkan!" });
    });
});

app.delete('/api/paket/:id', (req, res) => {
    const sql = "DELETE FROM paket WHERE id_paket = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, message: "Paket dihapus!" });
    });
});

app.get('/api/pelanggan', (req, res) => {
    db.query("SELECT * FROM pelanggan", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
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

app.post('/api/transaksi', (req, res) => {
    const { id_pelanggan, id_paket, berat, total_harga } = req.body;
    const sql = "INSERT INTO transaksi (id_pelanggan, id_paket, berat, total_harga) VALUES (?, ?, ?, ?)";
    db.query(sql, [id_pelanggan, id_paket, berat, total_harga], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Transaksi berhasil disimpan!" });
    });
});

app.get('/api/transaksi', (req, res) => {
    const sql = `
        SELECT t.*, p.nama_pelanggan, pk.nama_paket 
        FROM transaksi t
        JOIN pelanggan p ON t.id_pelanggan = p.id_pelanggan
        JOIN paket pk ON t.id_paket = pk.id_paket
        ORDER BY t.tgl_masuk DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});