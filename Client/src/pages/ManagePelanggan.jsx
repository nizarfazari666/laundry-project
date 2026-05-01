import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function ManagePelanggan() {
  const [pelanggans, setPelanggans] = useState([])
  const [formData, setFormData] = useState({ nama_pelanggan: '', alamat: '', no_hp: '' })
  const navigate = useNavigate()

  useEffect(() => { fetchPelanggan() }, [])

  const fetchPelanggan = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/pelanggan')
      setPelanggans(res.data)
    } catch (err) { console.error(err) }
  }

const handleTambah = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/pelanggan', {
      nama_pelanggan: nama, // Cek apakah variabel 'nama' ada isinya
      alamat: alamat,
      no_hp: noHp
    });
    // ... sisanya
  } catch (err) {
    alert("Gagal tambah pelanggan");
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5000/api/pelanggan', formData)
      alert("Pelanggan Berhasil Ditambah!")
      setFormData({ nama_pelanggan: '', alamat: '', no_hp: '' })
      fetchPelanggan()
    } catch (err) { alert("Gagal tambah pelanggan") }
  }

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/dashboard')} style={styles.btnBack}>← Kembali</button>
      <h2 style={{color: '#2c5282', marginBottom: '20px'}}>Data Pelanggan</h2>

      <div style={styles.card}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="text" placeholder="Nama Pelanggan" value={formData.nama_pelanggan} style={styles.input}
            onChange={(e) => setFormData({...formData, nama_pelanggan: e.target.value})} required />
          <input type="text" placeholder="No. HP" value={formData.no_hp} style={styles.input}
            onChange={(e) => setFormData({...formData, no_hp: e.target.value})} required />
          <input type="text" placeholder="Alamat" value={formData.alamat} style={styles.input}
            onChange={(e) => setFormData({...formData, alamat: e.target.value})} required />
          <button type="submit" style={styles.btnSimpan}>Daftarkan Pelanggan</button>
        </form>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr style={{backgroundColor: '#2c5282', color: 'white'}}>
              <th style={styles.th}>Nama</th>
              <th style={styles.th}>No. HP</th>
              <th style={styles.th}>Alamat</th>
            </tr>
          </thead>
          <tbody>
            {pelanggans.map((p) => (
              <tr key={p.id_pelanggan}>
                <td style={styles.td}>{p.nama_pelanggan}</td>
                <td style={styles.td}>{p.no_hp}</td>
                <td style={styles.td}>{p.alamat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' },
  btnBack: { marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  form: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', flex: 1 },
  btnSimpan: { backgroundColor: '#2c5282', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', textAlign: 'left' },
  td: { padding: '12px', borderBottom: '1px solid #eee' }
}

export default ManagePelanggan