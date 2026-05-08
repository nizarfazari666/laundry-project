import { Link } from 'react-router-dom';
// PASTIKAN: Kalau file Home.jsx ini ada langsung di dalam folder 'src', ubah titiknya jadi satu: './assets/bg-laundry.mp4'
import bgVideo from '../assets/bg-laundry.mp4';
import bgvidio from '../assets/bg-video.mp4';

function Home() {
  return (
    <div style={styles.wrapper}>
      
      {/* KODE YANG DIPERBAIKI: Langsung taruh src di dalam tag video, hapus tag source */}
      <video src={bgVideo} autoPlay loop muted playsInline style={styles.videoBg} />

    
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
            <div style={styles.videoSection}>
          <video 
            autoPlay muted loop playsInline style={styles.videoElement}>
                <source src={bgvidio} type="video/mp4" />vidio</video>
              </div>
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
    backgroundColor: '#000',
  },
  videoBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
  },
  contentWrapper: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 8%', // Diperkecil dari 30px
    position: 'absolute',
    width: '100%',
    boxSizing: 'border-box',
    zIndex: 20,
  },
  logo: {
    fontSize: '24px', // Diperkecil dari 28px
    fontWeight: 'bold',
    color: '#fff',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  },
  navLinks: {
    display: 'flex',
    gap: '30px', // Diperkecil dari 40px
  },
  navItem: {
    color: '#fff',
    fontSize: '14px', // Diperkecil dari 16px
    fontWeight: 'bold',
    cursor: 'pointer',
    textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
  },
  container: {
    display: 'flex',
    width: '100%',
    height: '100vh',
    padding: '0 10%', // Padding samping diperbesar agar konten tengah lebih ramping
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    boxSizing: 'border-box',
  },
  videoSection: {
    flex: '1',
    display: 'flex',
    justifyContent: 'center',
  },
  videoElement: {
    width: '100%',
    borderRadius: '20px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
    display: 'block',
    objectFit: 'cover',
  },
  textContent: {
    flex: '1',
    maxWidth: '650px', // SANGAT PENTING: Diperkecil dari 1000px agar kotak tidak melebar
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: '40px 40px', // Diperkecil dari 60px 50px
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    backdropFilter: 'blur(8px)',
  },
  title: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '48px', // Diperkecil dari 70px agar tidak makan tempat
    margin: '0',
    color: '#76a5df',
    fontWeight: '800',
    letterSpacing: '-1.5px',
    lineHeight: '1.2',
  },
  description: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '16px', // Diperkecil dari 20px
    color: '#2B547E',
    margin: '15px 0 25px', // Margin dipersempit
    lineHeight: '1.5',
    fontWeight: '500',
  },
  btnReadMore: {
    backgroundColor: '#76a5df',
    marginTop: '10px',
    color: '#fff',
    border: 'none',
    padding: '14px 35px', // Diperkecil ukurannya
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: '0.3s',
    boxShadow: '0 5px 12px rgba(118,165,223,0.3)',
    alignSelf: 'flex-start',
  },
};

export default Home;