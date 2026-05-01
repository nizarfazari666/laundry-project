import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function ManagePaket() {
  const [pakets, setPakets] = useState([])
  const [formData, setFormData] = useState({ 
    nama_paket: '', 
    jenis: 'Kiloan', 
    harga: '', 
    estimasi: '' 
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchPaket()
  }, [])

  const fetchPaket = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/paket')
      setPakets(res.data)
    } catch (err) {
      console.error("Gagal mengambil data paket:", err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("Mencoba mengirim data:", formData)
    
    try {
      const res = await axios.post('http://localhost:5000/api/paket', formData)
      if (res.data.success) {
        alert("Paket Berhasil Ditambah!")
        setFormData({ nama_paket: '', jenis: 'Kiloan', harga: '', estimasi: '' })
        fetchPaket()
      }
    } catch (err) {
      console.error("Gagal simpan paket:", err)
      alert("Gagal menyimpan data! Cek terminal server.")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Hapus paket ini?")) {
      try {
        await axios.delete(`http://localhost:5000/api/paket/${id}`)
        fetchPaket()
      } catch (err) {
        console.error("Gagal hapus paket:", err)
      }
    }
  }

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/dashboard')} style={styles.btnBack}>
        ← Kembali ke Dashboard
      </button>
      
      <h2 style={{ color: '#2c5282', marginBottom: '20px' }}>Kelola Paket Laundry</h2>

      <div style={styles.card}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input 
            type="text" 
            placeholder="Nama Paket (cth: Cuci Kering)" 
            value={formData.nama_paket} 
            style={styles.input}
            onChange={(e) => setFormData({...formData, nama_paket: e.target.value})} 
            required 
          />
          <select 
            style={styles.input}
            value={formData.jenis}
            onChange={(e) => setFormData({...formData, jenis: e.target.value})}
          >
            <option value="Kiloan">Kiloan</option>
            <option value="Satuan">Satuan</option>
          </select>
          <input 
            type="number" 
            placeholder="Harga (Rp)" 
            value={formData.harga} 
            style={styles.input}
            onChange={(e) => setFormData({...formData, harga: e.target.value})} 
            required 
          />
          <input 
            type="text" 
            placeholder="Estimasi (cth: 2 Hari)" 
            value={formData.estimasi} 
            style={styles.input}
            onChange={(e) => setFormData({...formData, estimasi: e.target.value})} 
            required 
          />
          <button type="submit" style={styles.btnSimpan}>Simpan Paket</button>
        </form>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr style={{ backgroundColor: '#2c5282', color: 'white' }}>
              <th style={styles.th}>Nama</th>
              <th style={styles.th}>Jenis</th>
              <th style={styles.th}>Harga</th>
              <th style={styles.th}>Estimasi</th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pakets.length > 0 ? pakets.map((p) => (
              <tr key={p.id_paket} style={styles.tr}>
                <td style={styles.td}>{p.nama_paket}</td>
                <td style={styles.td}>{p.jenis}</td>
                <td style={styles.td}>Rp {Number(p.harga).toLocaleString()}</td>
                <td style={styles.td}>{p.estimasi}</td>
                <td style={styles.td}>
                  <button onClick={() => handleDelete(p.id_paket)} style={styles.btnDelete}>Hapus</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Belum ada data paket.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '40px', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f4f7f6', minHeight: '100vh' },
  btnBack: { marginBottom: '20px', padding: '10px 15px', cursor: 'pointer', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '5px' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px' },
  form: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', outline: 'none', flex: 1, minWidth: '150px' },
  btnSimpan: { backgroundColor: '#2c5282', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' },
  th: { padding: '15px', textAlign: 'left' },
  td: { padding: '15px', borderBottom: '1px solid #eee' },
  tr: { transition: '0.3s' },
  btnDelete: { color: '#e53e3e', background: 'none', border: '1px solid #e53e3e', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }
}

export default ManagePaket