import { Link } from 'react-router-dom';
// PASTIKAN: Kalau file Home.jsx ini ada langsung di dalam folder 'src', ubah titiknya jadi satu: './assets/bg-laundry.mp4'
import bgVideo from '../assets/bg-laundry.mp4';

function Home() {
  return (
    <div style={styles.wrapper}>
      
      {/* KODE YANG DIPERBAIKI: Langsung taruh src di dalam tag video, hapus tag source */}
      <video src={bgVideo} autoPlay loop muted playsInline style={styles.videoBg} />

      {/* BUNGKUS KONTEN DENGAN DIV BARU AGAR ADA DI DEPAN VIDEO */}
      <div style={styles.contentWrapper}>
        <nav style={styles.navbar}>
          <div style={styles.logo}>Laundry Wangi</div>
          <div style={styles.navLinks}>
            <span style={styles.navItem}>About</span>
            <span style={styles.navItem}>Contact</span>
          </div>
        </nav>

        <div style={styles.container}>
          <div style={styles.textContent}>
            <h1 style={styles.title}>Selamat Datang</h1>
            <p style={styles.description}>
              Dengan tenaga profesional dan teknologi modern, kami memastikan setiap pakaian Anda dicuci, dikeringkan, dan dirapikan dengan standar terbaik.
              Hemat waktu Anda, biarkan kami yang mengurus sisanya.
            </p>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={styles.btnReadMore}>LOG IN OR SIGN IN</button>
            </Link>
          </div>
        </div>
      </div>
      
    </div>
  );
}

const styles = {
  wrapper: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000', // Warna hitam dasar 
  },
  videoBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0 // UBAH KE 0 AGAR TIDAK TENGGELAM
  },
  contentWrapper: {
    position: 'relative',
    zIndex: 10, // KONTEN HARUS LEBIH BESAR DARI 0 AGAR DI DEPAN VIDEO
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '30px 8%',
  },
  logo: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#fff', 
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
  },
  navLinks: {
    display: 'flex',
    gap: '40px',
  },
  navItem: {
    color: '#fff', 
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
  },
  container: {
    display: 'flex',
    flex: 1,
    padding: '0 8%',
    alignItems: 'center',
  },
  textContent: {
    flex: '1',
    maxWidth: '650px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)', 
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  title: {
    fontSize: '70px', 
    margin: '0',
    color: '#2c5282',
    fontWeight: 'bold',
    letterSpacing: '-2px'
  },
  description: {
    fontSize: '18px',
    color: '#4a5568',
    margin: '20px 0 40px 0',
    lineHeight: '1.6'
  },
  btnReadMore: {
    backgroundColor: '#2c5282',
    color: '#fff',
    border: 'none',
    padding: '15px 45px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: '0.3s',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
  },
};

export default Home;