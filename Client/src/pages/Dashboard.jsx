import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const [riwayat, setRiwayat] = useState([]);
  
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'pelanggan') {
      fetchRiwayatPelanggan();
    }
  }, [user, navigate]);

  const fetchRiwayatPelanggan = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/transaksi');
      const dataSaya = res.data.filter(t => t.nama_pelanggan === user.nama);
      setRiwayat(dataSaya);
    } catch (err) {
      console.error("Gagal ambil riwayat:", err);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <h2 style={{ color: '#fff', marginBottom: '30px' }}>Laundry App</h2>
        <nav style={styles.nav}>
          <div style={styles.navItemActive}>Dashboard</div>
          {(user.role === 'admin' || user.role === 'kasir') && (
            <>
              <div style={styles.navItem} onClick={() => navigate('/input-transaksi')}>Input Transaksi</div>
              <div style={styles.navItem} onClick={() => navigate('/manage-pelanggan')}>Data Pelanggan</div>
              <div style={styles.navItem} onClick={() => navigate('/manage-paket')}>Kelola Paket</div>
            </>
          )}
        </nav>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h1>Selamat Datang, {user.nama}!</h1>
          <span style={styles.badge}>{user.role.toUpperCase()}</span>
        </header>

        {user.role === 'pelanggan' ? (
          <section style={styles.gridContainer}>
            
            <div style={styles.gridCard}>
              <h3 style={styles.cardTitle}>🧺 Layanan Laundry</h3>
              <p style={styles.cardDesc}>Paket tersedia untuk Anda.</p>
              <div style={styles.list}>
                <div style={styles.listItem}>• Cuci Kering Setrika</div>
                <div style={styles.listItem}>• Cuci Kering</div>
                <div style={styles.listItem}>• Cuci Satuan</div>
              </div>
            </div>

            <div style={styles.gridCard}>
              <h3 style={styles.cardTitle}>📜 Riwayat Pemesanan</h3>
              <p style={styles.cardDesc}>Total pesanan sejauh ini.</p>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c5282' }}>
                {riwayat.length} <span style={{ fontSize: '16px', color: '#718096' }}>Transaksi</span>
              </div>
            </div>

            <div style={styles.gridCard}>
              <h3 style={styles.cardTitle}>🚚 Kapan Diantar</h3>
              <p style={styles.cardDesc}>Tanggal penyerahan terakhir.</p>
              {riwayat.length > 0 ? (
                <div style={styles.infoBox}>
                  <div style={{ fontWeight: 'bold' }}>{new Date(riwayat[0].tgl_masuk).toLocaleDateString('id-ID')}</div>
                </div>
              ) : (
                <p style={{ color: '#cbd5e0' }}>Belum ada data</p>
              )}
            </div>

            <div style={{ ...styles.gridCard, borderLeft: '5px solid #48bb78' }}>
              <h3 style={styles.cardTitle}>✅ Kapan Selesai</h3>
              <p style={styles.cardDesc}>Status pesanan terbaru.</p>
              {riwayat.length > 0 ? (
                <div style={styles.infoBox}>
                  <div style={{ fontWeight: 'bold', color: riwayat[0].status === 'Selesai' ? '#48bb78' : '#ed8936' }}>
                    {riwayat[0].status}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#cbd5e0' }}>Belum ada data</p>
              )}
            </div>

          </section>
        ) : (
          <section style={styles.statsContainer}>
            <div style={styles.card}>
              <h3>Total Transaksi</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>0</p>
            </div>
            <div style={styles.card}>
              <h3>Cucian Proses</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>0</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f4f7f6' },
  sidebar: { width: '250px', backgroundColor: '#2c5282', padding: '30px 20px', display: 'flex', flexDirection: 'column' },
  nav: { flex: 1 },
  navItem: { color: '#cbd5e0', padding: '12px 0', cursor: 'pointer', borderBottom: '1px solid #4a5568' },
  navItemActive: { color: '#fff', padding: '12px 0', fontWeight: 'bold', borderBottom: '1px solid #fff' },
  mainContent: { flex: 1, padding: '40px', overflowY: 'auto' },
  header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' },
  badge: { backgroundColor: '#90d5d5', color: '#2c5282', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '20px' },
  gridCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  cardTitle: { margin: '0 0 5px 0', color: '#1a365d', fontSize: '18px' },
  cardDesc: { margin: '0 0 15px 0', color: '#a0aec0', fontSize: '13px' },
  list: { marginTop: '10px' },
  listItem: { padding: '5px 0', color: '#4a5568', fontSize: '14px' },
  infoBox: { marginTop: '10px', padding: '10px', backgroundColor: '#f7fafc', borderRadius: '8px' },
  statsContainer: { display: 'flex', gap: '20px' },
  card: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', flex: 1 },
  logoutBtn: { padding: '10px', backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: 'auto' }
};

export default Dashboard;