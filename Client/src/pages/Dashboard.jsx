import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const Modal = ({ title, children, onClose }) => (
  <div style={styles.modalOverlay} onClick={onClose}>
    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <div style={styles.modalHeader}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>{title}</h2>
        <button onClick={onClose} style={styles.closeBtn}>&times;</button>
      </div>
      <div style={styles.modalBody}>{children}</div>
    </div>
  </div>
);

function Dashboard() {
  const navigate = useNavigate();
  const [riwayat, setRiwayat] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  
  // STATE KHUSUS INVOICE & PEMBAYARAN
  const [invoiceData, setInvoiceData] = useState(null); 
  const [isPaying, setIsPaying] = useState(false); 
  const [metodeBayar, setMetodeBayar] = useState(''); 

  // STATE KHUSUS CHAT
  const [chatData, setChatData] = useState([]);
  const [chatListAdmin, setChatListAdmin] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [pesanInput, setPesanInput] = useState('');
  const chatScrollRef = useRef(null);

  // LOGIKA AKSES ROLE
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const isAdmin = user?.role === 'admin' || user?.role === 'kasir';
  const isKurir = user?.role === 'kurir'; // Role Baru: Kurir
  const isStaff = isAdmin || isKurir; // Gabungan Admin & Kurir untuk akses tabel transaksi penuh

  const [formData, setFormData] = useState({
    nama_pelanggan: user?.nama || '', 
    no_hp: '', alamat: '', layanan: '', berat: '', total_harga: 0, keterangan: ''
  });

  const listLayanan = [
    { nama: 'Cuci Lipat', harga: 5000 },
    { nama: 'Cuci Lipat Setrika', harga: 7000 },
    { nama: 'Cuci Express 2 Jam', harga: 15000 },
    { nama: 'Cuci Express 3 Jam', harga: 12000 },
    { nama: 'Cuci Express 5 Jam', harga: 10000 },
    { nama: 'Cuci Barang Lain', harga: 25000 },
  ];

  useEffect(() => {
    if (!user) navigate('/login');
    else fetchData();
  }, [user]);

  useEffect(() => {
    let interval;
    if (activeModal === 'chat-pelanggan' || activeChatUser) {
      const targetName = isAdmin ? activeChatUser : user.nama;
      fetchDetailChat(targetName);
      interval = setInterval(() => fetchDetailChat(targetName), 3000);
    }
    return () => clearInterval(interval);
  }, [activeModal, activeChatUser]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatData]);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/transaksi');
      // Admin & Kurir bisa lihat semua, Pelanggan hanya milik sendiri
      const data = isStaff ? res.data : res.data.filter(t => 
          t.nama_pelanggan?.toLowerCase() === user?.nama?.toLowerCase()
      );
      setRiwayat(data);
    } catch (err) { console.error(err); }
  }

  const fetchListChatAdmin = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/chat-list');
      setChatListAdmin(res.data);
      setActiveModal('chat-list-admin');
    } catch (err) { console.error(err); }
  };

  const fetchDetailChat = async (nama) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/${nama}`);
      setChatData(res.data);
    } catch (err) { console.error(err); }
  };

  const kirimPesan = async () => {
    if (!pesanInput.trim()) return;
    const targetName = isAdmin ? activeChatUser : user.nama;
    const role = isAdmin ? 'admin' : 'pelanggan';
    
    try {
      await axios.post('http://localhost:5000/api/chat', {
        nama_pelanggan: targetName,
        sender_role: role,
        pesan: pesanInput
      });
      setPesanInput('');
      fetchDetailChat(targetName);
    } catch (err) { 
      const pesanError = err.response?.data?.message || err.message;
      alert("Gagal kirim pesan: " + pesanError); 
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'layanan' || name === 'berat') {
        const selected = listLayanan.find(l => l.nama === newData.layanan);
        newData.total_harga = (selected ? selected.harga : 0) * (parseFloat(newData.berat) || 0);
      }
      return newData;
    });
  };

  const handleSimpanPesanan = async () => {
    if(!formData.nama_pelanggan || !formData.layanan || !formData.berat) {
      alert("Mohon lengkapi data pesanan!"); return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/transaksi-baru', formData);
      if (res.data.success) {
        alert("Pesanan Berhasil Dibuat!");
        setActiveModal(null);
        setFormData({ ...formData, layanan: '', berat: '', total_harga: 0, keterangan: '' });
        fetchData();
      }
    } catch (err) { alert("Gagal membuat pesanan."); }
  };

  const ubahStatus = async (id_transaksi, statusBaru) => {
    try {
      await axios.put(`http://localhost:5000/api/transaksi/${id_transaksi}/status`, { status: statusBaru });
      fetchData(); 
    } catch (error) { alert("Gagal mengubah status!"); }
  };

  const handleBayar = async (id_transaksi, total, metode) => {
    try {
      await axios.post(`http://localhost:5000/api/bayar/${id_transaksi}`, { 
        jumlah_bayar: total, 
        metode_pembayaran: metode 
      });
      alert(`Pembayaran Berhasil via ${metode}! Status menjadi Lunas.`);
      setInvoiceData(null); 
      setIsPaying(false);
      setMetodeBayar('');
      fetchData(); 
    } catch (error) { alert("Gagal melakukan pembayaran."); }
  };

  const tutupInvoice = () => {
    setInvoiceData(null);
    setIsPaying(false);
    setMetodeBayar('');
  };

  const getStatusColor = (status) => {
    if (status === 'Selesai') return '#48bb78'; 
    if (status === 'Proses Pengantaran') return '#3182ce'; 
    if (status === 'Proses Cuci') return '#d69e2e'; 
    return '#ed8936'; 
  };

  if (!user) return null;

  const dataPelangganUnik = [...new Map(riwayat.map(item => [item.nama_pelanggan, item])).values()];
  const laporanPendapatan = riwayat.reduce((acc, curr) => {
    if (curr.status_bayar === 'Lunas') {
      const tgl = new Date(curr.tgl_masuk).toLocaleDateString('id-ID');
      acc[tgl] = (acc[tgl] || 0) + curr.total_harga;
    }
    return acc;
  }, {});
  const dataLaporan = Object.keys(laporanPendapatan).map(tgl => ({ tanggal: tgl, total: laporanPendapatan[tgl] }));
  const totalSemuaPendapatan = dataLaporan.reduce((sum, item) => sum + item.total, 0);

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <h2 style={{ color: '#fff', marginBottom: '30px' }}>Laundry Wangi</h2>
        
        {/* PENGATURAN MENU SIDEBAR BERDASARKAN ROLE */}
        <nav style={styles.nav}>
          <div style={activeModal === null && !activeChatUser ? styles.navItemActive : styles.navItem} onClick={() => {setActiveModal(null); setActiveChatUser(null)}}>
            Dashboard
          </div>
          
          {/* Menu Input Transaksi (Tidak untuk Kurir) */}
          {!isKurir && (
            <div style={activeModal === 'input' ? styles.navItemActive : styles.navItem} onClick={() => setActiveModal('input')}>
              {isAdmin ? "Input Transaksi Baru" : "Buat Pesanan Baru"}
            </div>
          )}
          
          {/* Menu Data Pelanggan (Hanya Admin & Kurir) */}
          {isStaff && (
            <div style={activeModal === 'data-pelanggan' ? styles.navItemActive : styles.navItem} onClick={() => setActiveModal('data-pelanggan')}>
              Data Pelanggan
            </div>
          )}

          {/* Menu Ekstra (Hanya Admin) */}
          {isAdmin && (
            <>
              <div style={activeModal === 'laporan' ? styles.navItemActive : styles.navItem} onClick={() => setActiveModal('laporan')}>Laporan Pendapatan</div>
              <div style={activeModal === 'chat-list-admin' || activeChatUser ? styles.navItemActive : styles.navItem} onClick={fetchListChatAdmin}>
                Pesan Masuk (Chat)
              </div>
            </>
          )}

          {/* Menu Chat (Hanya Pelanggan) */}
          {!isStaff && (
            <div style={activeModal === 'chat-pelanggan' ? styles.navItemActive : styles.navItem} onClick={() => setActiveModal('chat-pelanggan')}>
                Hubungi Admin (Chat)
            </div>
          )}
        </nav>
        
        <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} style={styles.logoutBtn}>Logout</button>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h1>Selamat Datang, {user.nama}!</h1>
          <span style={styles.badge}>{user.role.toUpperCase()}</span>
        </header>

        <section style={{ marginTop: '30px' }}>
          <h2 style={{ marginBottom: '15px', color: '#2c5282' }}>{isStaff ? "Semua Pesanan Masuk" : "Riwayat Pesanan Saya"}</h2>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>No/Tgl</th>
                  <th style={styles.th}>Pelanggan</th>
                  <th style={styles.th}>Detail Cucian</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.map((t, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={styles.td}>#{t.id_transaksi} <br/><small>{new Date(t.tgl_masuk).toLocaleDateString()}</small></td>
                    <td style={styles.td}><b>{t.nama_pelanggan}</b></td>
                    <td style={styles.td}>
                      {t.layanan} <br/><small>({t.berat} Kg)</small>
                      <br/><small style={{ color: '#718096' }}>Ket: {t.keterangan || '-'}</small>
                    </td>
                    <td style={styles.td}>Rp {t.total_harga?.toLocaleString()}</td>
                    
                    <td style={styles.td}>
                       <span style={{ color: getStatusColor(t.status), fontWeight: 'bold' }}>{t.status}</span><br/>
                       <span style={{ fontSize: '12px', color: t.status_bayar === 'Lunas' ? '#48bb78' : '#e53e3e', fontWeight: 'bold' }}>
                         {t.status_bayar}
                         {t.status_bayar === 'Lunas' && t.metode_pembayaran ? ` via ${t.metode_pembayaran}` : ''}
                       </span>
                    </td>

                    <td style={styles.td}>
                      {/* DROPDOWN STATUS BISA DIAKSES OLEH ADMIN & KURIR */}
                      {isStaff ? (
                        <select 
                          value={t.status} 
                          onChange={(e) => ubahStatus(t.id_transaksi, e.target.value)}
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e0', fontSize: '12px', cursor: 'pointer', backgroundColor: '#fff', outline: 'none', color: '#2c5282', fontWeight: 'bold' }}
                        >
                          <option value="Proses">⏳ Proses / Antri</option>
                          <option value="Proses Cuci">👕 Proses Cuci</option>
                          <option value="Proses Pengantaran">🛵 Proses Pengantaran</option>
                          <option value="Proses Penjemputan">🚴 Proses Penjemputan</option>
                          <option value="Selesai">✅ Selesai</option>
                        </select>
                      ) : (
                        <button style={styles.btnActionPelanggan} onClick={() => setInvoiceData(t)}>
                          Lihat Invoice
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ================= AREA MODAL BAWAAN ================= */}
        {activeModal === 'input' && (
          <Modal title={isAdmin ? "Input Transaksi (Admin)" : "Form Pemesanan Layanan"} onClose={() => setActiveModal(null)}>
            <div style={styles.formScroll}>
              <h4 style={styles.sectionTitle}>Data Diri</h4>
              <input name="nama_pelanggan" value={formData.nama_pelanggan} placeholder="Nama Lengkap" style={styles.input} onChange={handleInputChange} disabled={!isAdmin} />
              <input name="no_hp" value={formData.no_hp} placeholder="Nomor HP/WA" style={styles.input} onChange={handleInputChange} />
              <textarea name="alamat" value={formData.alamat} placeholder="Alamat Jemput/Antar" style={{...styles.input, height: '60px'}} onChange={handleInputChange} />
              <h4 style={styles.sectionTitle}>Detail Layanan</h4>
              <select name="layanan" value={formData.layanan} style={styles.input} onChange={handleInputChange}>
                <option value="">-- Pilih Layanan --</option>
                {listLayanan.map((l, i) => <option key={i} value={l.nama}>{l.nama} (Rp {l.harga}/kg)</option>)}
              </select>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Berat (Kg) / Lembar</label>
                  <input name="berat" type="number" value={formData.berat} placeholder="0" style={styles.input} onChange={handleInputChange} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Estimasi Harga</label>
                  <div style={styles.totalBox}>Rp {formData.total_harga.toLocaleString()}</div>
                </div>
              </div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '10px', display: 'block' }}>Keterangan Barang (Opsional)</label>
              <textarea name="keterangan" value={formData.keterangan} placeholder="Contoh: 2 Kemeja putih, 1 Celana jeans hitam" style={{...styles.input, height: '60px'}} onChange={handleInputChange} />
              <button style={styles.btnPrimary} onClick={handleSimpanPesanan}>Buat Pesanan Sekarang</button>
            </div>
          </Modal>
        )}

        {activeModal === 'data-pelanggan' && (
          <Modal title="Data Pelanggan Terdaftar" onClose={() => setActiveModal(null)}>
            <div style={{ overflowX: 'auto', maxHeight: '60vh', overflowY: 'auto' }}>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>Nama</th><th style={styles.th}>No. HP</th><th style={styles.th}>Alamat</th></tr></thead>
                <tbody>
                  {dataPelangganUnik.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={styles.td}><b>{p.nama_pelanggan}</b></td><td style={styles.td}>{p.no_hp || '-'}</td><td style={styles.td}>{p.alamat || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Modal>
        )}

        {activeModal === 'laporan' && (
          <Modal title="Rekap Pendapatan Harian" onClose={() => setActiveModal(null)}>
            <div style={{ overflowX: 'auto', maxHeight: '60vh', overflowY: 'auto' }}>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>Tanggal</th><th style={{ ...styles.th, textAlign: 'right' }}>Total Pemasukan</th></tr></thead>
                <tbody>
                  {dataLaporan.map((l, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}><td style={styles.td}><b>{l.tanggal}</b></td><td style={{ ...styles.td, textAlign: 'right', color: '#48bb78', fontWeight: 'bold' }}>Rp {l.total.toLocaleString()}</td></tr>
                  ))}
                </tbody>
                {dataLaporan.length > 0 && <tfoot><tr><td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Total Keseluruhan:</td><td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', fontSize: '16px', color: '#2c5282' }}>Rp {totalSemuaPendapatan.toLocaleString()}</td></tr></tfoot>}
              </table>
            </div>
          </Modal>
        )}

        {activeModal === 'chat-list-admin' && (
          <Modal title="Daftar Pesan Masuk" onClose={() => setActiveModal(null)}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {chatListAdmin.length > 0 ? chatListAdmin.map((c, i) => (
                  <div key={i} style={styles.chatListItem} onClick={() => { setActiveChatUser(c.nama_pelanggan); setActiveModal(null); }}>
                      <div style={{ fontWeight: 'bold', color: '#2c5282' }}>👤 {c.nama_pelanggan}</div>
                      <span style={{ fontSize: '12px', color: '#48bb78' }}>Buka percakapan &rarr;</span>
                  </div>
                )) : <p style={{ textAlign: 'center', color: '#718096' }}>Belum ada pesan masuk.</p>}
             </div>
          </Modal>
        )}

        {(activeModal === 'chat-pelanggan' || activeChatUser) && (
          <Modal title={`Chat Room - ${isAdmin ? activeChatUser : 'Admin Laundry'}`} onClose={() => { setActiveModal(null); setActiveChatUser(null); }}>
             <div style={styles.chatContainer} ref={chatScrollRef}>
                {chatData.length > 0 ? chatData.map((c, i) => {
                  const isMyMessage = isAdmin ? c.sender_role === 'admin' : c.sender_role === 'pelanggan';
                  return (
                    <div key={i} style={isMyMessage ? styles.chatBubbleRight : styles.chatBubbleLeft}>
                        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>
                            {c.sender_role === 'admin' ? 'Admin' : c.nama_pelanggan} - {new Date(c.waktu).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div>{c.pesan}</div>
                    </div>
                  )
                }) : <div style={{ textAlign: 'center', color: '#a0aec0', marginTop: 'auto', marginBottom: 'auto' }}>Mulai percakapan baru...</div>}
             </div>
             <div style={styles.chatInputBox}>
                <input type="text" value={pesanInput} onChange={(e) => setPesanInput(e.target.value)} placeholder="Ketik pesan..." style={{ ...styles.input, marginBottom: 0, flex: 1 }} onKeyDown={(e) => e.key === 'Enter' && kirimPesan()} />
                <button style={{ ...styles.btnPrimary, marginTop: 0, width: '80px', backgroundColor: '#48bb78' }} onClick={kirimPesan}>Kirim</button>
             </div>
          </Modal>
        )}

        {invoiceData && (
          <Modal title="Invoice Pembayaran" onClose={tutupInvoice}>
            <div style={{ padding: '10px', fontFamily: 'monospace', fontSize: '14px', border: '1px dashed #ccc', marginBottom: '20px' }}>
              <h3 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>LAUNDRY APP</h3>
              <p><b>No Pesanan:</b> #{invoiceData.id_transaksi}</p>
              <p><b>Tanggal:</b> {new Date(invoiceData.tgl_masuk).toLocaleString()}</p>
              <p><b>Nama:</b> {invoiceData.nama_pelanggan}</p>
              <hr style={{ border: '1px dashed #ccc' }}/>
              <p><b>Layanan:</b> {invoiceData.layanan}</p>
              <p><b>Jumlah/Berat:</b> {invoiceData.berat} Kg</p>
              <p><b>Keterangan:</b> {invoiceData.keterangan || '-'}</p>
              <hr style={{ border: '1px dashed #ccc' }}/>
              <h3 style={{ textAlign: 'right', margin: 0 }}>Total: Rp {invoiceData.total_harga.toLocaleString()}</h3>
              <div style={{ textAlign: 'right', marginTop: '10px' }}>
                <span style={{ color: invoiceData.status_bayar === 'Lunas' ? 'green' : 'red', fontWeight: 'bold' }}>
                  STATUS: {invoiceData.status_bayar.toUpperCase()}
                </span>
                {invoiceData.status_bayar === 'Lunas' && invoiceData.metode_pembayaran && (
                   <div style={{ marginTop: '5px', color: '#48bb78', fontSize: '12px' }}>
                     Telah dibayar menggunakan <b>{invoiceData.metode_pembayaran}</b>
                   </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              {!isPaying ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{ ...styles.btnPrimary, backgroundColor: '#48bb78', flex: 1, marginTop: 0 }} onClick={() => window.print()}>
                    🖨️ Cetak / Simpan PDF
                  </button>
                  {invoiceData.status_bayar !== 'Lunas' && (
                    <button style={{ ...styles.btnPrimary, flex: 1, marginTop: 0 }} onClick={() => setIsPaying(true)}>
                      💳 Bayar Sekarang
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ backgroundColor: '#edf2f7', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#2c5282' }}>Pilih Metode Pembayaran:</label>
                  <select value={metodeBayar} onChange={(e) => setMetodeBayar(e.target.value)} style={styles.input}>
                    <option value="">-- Pilih Metode --</option>
                    <option value="Cash (Offline)">💵 Cash (Offline)</option>
                    <option value="DANA">🔵 DANA</option>
                    <option value="QRIS">🔳 QRIS</option>
                    <option value="GOPAY">🟢 GOPAY</option>
                    <option value="BNI">🟠 BNI</option>
                    <option value="BCA">🔵 BCA</option>
                    <option value="DEBIT">💳 Kartu Debit</option>
                  </select>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button style={{ ...styles.btnPrimary, backgroundColor: '#a0aec0', flex: 1, marginTop: 0 }} onClick={() => setIsPaying(false)}>Batal</button>
                    <button style={{ ...styles.btnPrimary, backgroundColor: '#48bb78', flex: 1, marginTop: 0 }} onClick={() => { if (!metodeBayar) { alert("Pilih metode pembayaran!"); return; } handleBayar(invoiceData.id_transaksi, invoiceData.total_harga, metodeBayar); }}>✅ Konfirmasi</button>
                  </div>
                </div>
              )}
            </div>
          </Modal>
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
  statsContainer: { display: 'flex', gap: '20px' },
  card: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', flex: 1 },
  statNumber: { fontSize: '32px', fontWeight: 'bold', color: '#2c5282', margin: 0 },
  logoutBtn: { padding: '10px', backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: 'auto' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalContent: { backgroundColor: '#fff', width: '500px', borderRadius: '12px', overflow: 'hidden' },
  modalHeader: { padding: '15px 20px', backgroundColor: '#2c5282', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalBody: { padding: '20px' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer' },
  sectionTitle: { borderBottom: '2px solid #edf2f7', paddingBottom: '5px', marginBottom: '10px', color: '#2c5282', fontSize: '14px' },
  input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', marginBottom: '10px', boxSizing: 'border-box' },
  totalBox: { padding: '10px', backgroundColor: '#edf2f7', borderRadius: '5px', fontWeight: 'bold', textAlign: 'center', color: '#2c5282' },
  btnPrimary: { width: '100%', marginTop: '10px', padding: '12px', backgroundColor: '#2c5282', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  formScroll: { display: 'flex', flexDirection: 'column', maxHeight: '70vh', overflowY: 'auto' },
  tableContainer: { backgroundColor: '#fff', borderRadius: '12px', padding: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxHeight: '55vh', overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', textAlign: 'left', color: '#4a5568', fontSize: '14px', borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, backgroundColor: '#edf2f7', zIndex: 1 },
  td: { padding: '12px', color: '#2d3748', fontSize: '14px' },
  btnActionAdmin: { padding: '6px 12px', backgroundColor: '#2c5282', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  btnActionPelanggan: { padding: '6px 12px', backgroundColor: '#ed8936', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  chatListItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#edf2f7', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e2e8f0' },
  chatContainer: { height: '350px', overflowY: 'auto', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid #e2e8f0' },
  chatBubbleLeft: { alignSelf: 'flex-start', backgroundColor: '#e2e8f0', color: '#2d3748', padding: '10px 15px', borderRadius: '15px 15px 15px 0', maxWidth: '75%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  chatBubbleRight: { alignSelf: 'flex-end', backgroundColor: '#48bb78', color: '#fff', padding: '10px 15px', borderRadius: '15px 15px 0 15px', maxWidth: '75%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  chatInputBox: { display: 'flex', gap: '10px', marginTop: '15px' },
};

export default Dashboard;