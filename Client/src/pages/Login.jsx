import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/register', {
        nama, username, password
      });
      if (res.data.success) {
        alert("Registrasi Berhasil! Silakan Login.");
        setIsRegister(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal daftar");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', {
        username, password
      });
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      alert("Login Gagal! Cek username/password.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.formSection}>
          <button onClick={() => navigate('/')} style={styles.backHome}>← Back to Home</button>
          
          <h2 style={styles.title}>{isRegister ? 'Create Account' : 'Login'}</h2>
          <p style={styles.subtitle}>
            {isRegister ? 'Daftar sekarang untuk mulai menggunakan layanan kami.' : 'Selamat datang kembali! Silakan masuk ke akun Anda.'}
          </p>

          <form onSubmit={isRegister ? handleRegister : handleLogin}>
            {isRegister && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nama Lengkap</label>
                <input type="text" style={styles.input} value={nama} onChange={(e) => setNama(e.target.value)} required />
              </div>
            )}
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <input type="text" style={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input type="password" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <button type="submit" style={styles.button}>
              {isRegister ? 'Create Account' : 'Login'}
            </button>
          </form>

          <p style={styles.switchText}>
            {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'} 
            <span onClick={() => setIsRegister(!isRegister)} style={styles.link}>
              {isRegister ? ' Login' : ' Daftar'}
            </span>
          </p>
        </div>
        <div style={styles.imageSection}>
           <img 
            src="https://img.freepik.com/free-vector/isometric-laundry-room-composition-with-view-indoor-interior-with-washing-machines-characters-workers_1284-62923.jpg" 
            alt="illustration" 
            style={styles.image} 
          />
          <div style={styles.imageOverlay}>
            <h3 style={{ margin: 0 }}>Join Us Today</h3>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>Dapatkan kemudahan memantau cucian Anda secara real-time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#e2e8f0', fontFamily: "'Segoe UI', sans-serif" },
  card: { display: 'flex', width: '900px', backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  formSection: { flex: 1, padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  backHome: { background: 'none', border: 'none', color: '#2c5282', cursor: 'pointer', marginBottom: '20px', textAlign: 'left', padding: 0 },
  title: { color: '#1a365d', fontSize: '28px', marginBottom: '10px', fontWeight: 'bold' },
  subtitle: { color: '#718096', marginBottom: '30px', fontSize: '14px' },
  inputGroup: { marginBottom: '20px', textAlign: 'left' },
  label: { display: 'block', marginBottom: '5px', color: '#4a5568', fontSize: '14px', fontWeight: '600' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none', transition: '0.3s', boxSizing: 'border-box' },
  button: { width: '100%', padding: '14px', backgroundColor: '#2c5282', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' },
  switchText: { marginTop: '20px', color: '#718096', fontSize: '14px' },
  link: { color: '#2c5282', cursor: 'pointer', fontWeight: 'bold' },
  imageSection: { flex: 1, backgroundColor: '#f0f4f8', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', position: 'relative' },
  image: { width: '100%', borderRadius: '10px' },
  imageOverlay: { marginTop: '20px', textAlign: 'center', color: '#1a365d' }
};

export default Login;