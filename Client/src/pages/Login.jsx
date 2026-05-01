import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [mode, setMode] = useState('login'); 
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      }
    } catch (err) { alert("Login Gagal!"); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/register', { nama, email, password });
      alert("Registrasi Berhasil!");
      setMode('login');
    } catch (err) { alert("Registrasi Gagal!"); }
  };

  // Kirim OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/forgot-password-request', { email });
      if (res.data.success) {
        alert("OTP terkirim!");
        setStep(2);
      }
    } catch (err) { alert("Email tidak ditemukan!"); }
  };

  // Verifikasi OTP & Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/reset-password-otp', { email, otp, newPassword });
      if (res.data.success) {
        alert("Password diperbarui!");
        setMode('login');
        setStep(1);
      }
    } catch (err) { alert("OTP Salah!"); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.formSection}>
          <button onClick={() => navigate('/')} style={styles.backHome}>← Back to Home</button>
          <h2 style={styles.title}>
            {mode === 'login' ? 'Login' : mode === 'register' ? 'Create Account' : 'Reset Password'}
          </h2>

          <form onSubmit={
            mode === 'login' ? handleLogin : 
            mode === 'register' ? handleRegister : 
            (step === 1 ? handleRequestOTP : handleResetPassword)
          }>
            
            {mode === 'register' && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nama Lengkap</label>
                <input type="text" style={styles.input} value={nama} onChange={(e) => setNama(e.target.value)} required />
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input type="email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} disabled={mode === 'forgot' && step === 2} required />
            </div>

            {mode !== 'forgot' && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input type="password" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            )}

            {mode === 'forgot' && step === 2 && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Kode OTP (Cek Email)</label>
                  <input type="text" style={styles.input} value={otp} onChange={(e) => setOtp(e.target.value)} required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Password Baru</label>
                  <input type="password" style={styles.input} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
              </>
            )}

            <button type="submit" style={styles.button}>
              {mode === 'login' ? 'Login' : mode === 'register' ? 'Daftar' : (step === 1 ? 'Kirim OTP' : 'Update Password')}
            </button>
          </form>

          <div style={styles.footerLinks}>
            {mode === 'login' ? (
              <>
                <p>Belum punya akun? <span onClick={() => setMode('register')} style={styles.link}>Daftar</span></p>
                <p><span onClick={() => {setMode('forgot'); setStep(1);}} style={styles.link}>Lupa Password?</span></p>
              </>
            ) : (
              <p>Kembali ke <span onClick={() => {setMode('login'); setStep(1);}} style={styles.link}>Login</span></p>
            )}
          </div>
        </div>
        <div style={styles.imageSection}>
          <img src="https://img.freepik.com/free-vector/isometric-laundry-room-composition-with-view-indoor-interior-with-washing-machines-characters-workers_1284-62923.jpg" alt="laundry" style={styles.image} />
        </div>
      </div>
    </div>
  );
}

// ... (Gunakan styles yang sama dengan kode kamu sebelumnya) ...
const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#e2e8f0', fontFamily: "'Segoe UI', sans-serif" },
    card: { display: 'flex', width: '900px', backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
    formSection: { flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    backHome: { background: 'none', border: 'none', color: '#2c5282', cursor: 'pointer', marginBottom: '20px', textAlign: 'left', padding: 0 },
    title: { color: '#1a365d', fontSize: '28px', marginBottom: '5px', fontWeight: 'bold' },
    subtitle: { color: '#718096', marginBottom: '25px', fontSize: '14px' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', color: '#4a5568', fontSize: '14px', fontWeight: '600', textAlign: 'left' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none', boxSizing: 'border-box' },
    button: { width: '100%', padding: '14px', backgroundColor: '#2c5282', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' },
    footerLinks: { marginTop: '20px', textAlign: 'center', fontSize: '14px' },
    link: { color: '#2c5282', cursor: 'pointer', fontWeight: 'bold' },
    imageSection: { flex: 1, backgroundColor: '#f0f4f8', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
    image: { width: '100%', borderRadius: '10px' }
};

export default Login;