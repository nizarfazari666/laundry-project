import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.logo}>Logo</div>
        <div style={styles.navLinks}>
          <span style={styles.navItem}>About</span>
          <span style={styles.navItem}>Contact</span>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.textContent}>
          <h1 style={styles.title}>Laundry Wangi</h1>
          <p style={styles.description}>
            Dengan tenaga profesional dan teknologi modern, kami memastikan setiap pakaian Anda dicuci, dikeringkan, dan dirapikan dengan standar terbaik.
           Hemat waktu Anda, biarkan kami yang mengurus sisanya.
          </p>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={styles.btnReadMore}>LOGIN / SIGN IN</button>
          </Link>
        </div>

        <div style={styles.imageContent}></div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    width: '100vw',
    height: '100vh',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
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
    color: '#90d5d5',
  },
  navLinks: {
    display: 'flex',
    gap: '40px',
  },
  navItem: {
    color: '#555',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'default'
  },
  container: {
    display: 'flex',
    flex: 1,
    padding: '0 8%',
    alignItems: 'center',
  },
  textContent: {
    flex: '1',
    paddingRight: '50px',
  },
  title: {
    fontSize: '100px',
    margin: '0',
    color: '#2c5282',
    fontWeight: 'bold',
    letterSpacing: '-2px'
  },
  description: {
    fontSize: '18px',
    color: '#666',
    margin: '20px 0 40px 0',
    maxWidth: '450px',
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
    transition: '0.3s'
  },
  imageContent: {
    flex: '1',
    height: '80%',
    backgroundImage: "url('https://img.freepik.com/free-vector/laundry-service-concept-illustration_114360-1594.jpg')",
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
};

export default Home;