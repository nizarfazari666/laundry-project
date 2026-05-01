import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ManagePaket from './pages/ManagePaket';
import ManagePelanggan from './pages/ManagePelanggan';
import InputTransaksi from './pages/InputTransaksi';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manage-paket" element={<ManagePaket />} />
        <Route path="/manage-pelanggan" element={<ManagePelanggan />} />
        <Route path="/input-transaksi" element={<InputTransaksi />} />
      </Routes>
    </Router>
  );
}

export default App;