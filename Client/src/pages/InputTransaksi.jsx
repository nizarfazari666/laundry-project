import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function InputTransaksi() {
  const [pelanggans, setPelanggans] = useState([])
  const [pakets, setPakets] = useState([])
  const [formData, setFormData] = useState({ id_pelanggan: '', id_paket: '', berat: 0, total_harga: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const resP = await axios.get('http://localhost:5000/api/pelanggan')
      const resPk = await axios.get('http://localhost:5000/api/paket')
      setPelanggans(resP.data)
      setPakets(resPk.data)
    }
    fetchData()
  }, [])

  useEffect(() => {
    const paketTerpilih = pakets.find(p => p.id_paket === parseInt(formData.id_paket))
    if (paketTerpilih && formData.berat > 0) {
      setFormData(prev => ({ ...prev, total_harga: paketTerpilih.harga * formData.berat }))
    }
  }, [formData.id_paket, formData.berat, pakets])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5000/api/transaksi', formData)
      alert("Transaksi Berhasil!")
      navigate('/dashboard')
    } catch (err) { alert("Gagal transaksi") }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h2>Input Transaksi Baru</h2>
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Pilih Pelanggan:</label><br/>
            <select style={styles.input} onChange={(e) => setFormData({...formData, id_pelanggan: e.target.value})} required>
              <option value="">-- Pilih Pelanggan --</option>
              {pelanggans.map(p => <option key={p.id_pelanggan} value={p.id_pelanggan}>{p.nama_pelanggan}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Pilih Paket:</label><br/>
            <select style={styles.input} onChange={(e) => setFormData({...formData, id_paket: e.target.value})} required>
              <option value="">-- Pilih Paket --</option>
              {pakets.map(p => <option key={p.id_paket} value={p.id_paket}>{p.nama_paket} (Rp {p.harga})</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Berat (Kg):</label><br/>
            <input type="number" step="0.1" style={styles.input} onChange={(e) => setFormData({...formData, berat: e.target.value})} required />
          </div>

          <div style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold', color: '#2c5282' }}>
            Total Harga: Rp {formData.total_harga.toLocaleString()}
          </div>

          <button type="submit" style={styles.btnSimpan}>Simpan Transaksi</button>
          <button type="button" onClick={() => navigate('/dashboard')} style={{ marginLeft: '10px' }}>Batal</button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  input: { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd' },
  btnSimpan: { backgroundColor: '#2c5282', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
}

export default InputTransaksi