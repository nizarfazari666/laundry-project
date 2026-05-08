import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import bgImage from '../assets/bg-laundry.jpg';

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

  // STATE BUKTI FOTO
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [fileFoto, setFileFoto] = useState(null);

  // STATE KHUSUS CHAT
  const [chatData, setChatData] = useState([]);
  const [chatListAdmin, setChatListAdmin] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [pesanInput, setPesanInput] = useState('');
  
  const chatScrollRef = useRef(null);
  const isUserScrollingRef = useRef(false);

  // LOGIKA AKSES ROLE DENGAN TOLERANSI HURUF BESAR/KECIL
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const userRole = (user?.role || '').toLowerCase(); // FIX: Jadikan huruf kecil semua
  const isAdmin = userRole === 'admin' || userRole === 'kasir';
  const isKurir = userRole === 'kurir'; 
  const isStaff = isAdmin || isKurir; 

  const [formData, setFormData] = useState({
    nama_pelanggan: isAdmin ? '' : (user?.nama || ''), 
    no_hp: '', alamat: '', layanan: '', berat: '', total_harga: 0, keterangan: ''
  });

  const listLayanan = [
    { nama: 'Cuci Lipat', harga: 5000 },
    { nama: 'Cuci Lipat Setrika', harga: 7000 },
    { nama: 'Cuci Express 2 Jam', harga: 15000 },
    { nama: 'Cuci Express 3 Jam', harga: 12000 },
    { nama: 'Cuci Express 5 Jam', harga: 10000 },
    { nama: 'Pakaian/Celana (Per Lembar)', harga: 3000 },
    { nama: 'Cuci Barang Lain', harga: 25000 },
  ];

  useEffect(() => {
    if (!user) navigate('/login');
    else fetchData();
  }, [user]);

  useEffect(() => {
    let interval;
    if (activeModal === 'chat-pelanggan' || activeModal === 'chat-kurir' || activeModal === 'chat-internal' || activeChatUser) {
      let targetName = activeChatUser || user.nama;
      
      if (activeModal === 'chat-internal') {
        targetName = 'ROOM_INTERNAL';
      } else if (activeModal === 'chat-kurir') {
        targetName = `${user.nama}_KURIR`; 
      }

      fetchDetailChat(targetName);
      interval = setInterval(() => fetchDetailChat(targetName), 3000);
    } else {
      isUserScrollingRef.current = false;
    }
    return () => clearInterval(interval);
  }, [activeModal, activeChatUser, user]);

  useEffect(() => {
    if (chatScrollRef.current && !isUserScrollingRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatData]);

  const handleChatScroll = () => {
    if (chatScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      isUserScrollingRef.current = !isAtBottom;
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/transaksi');
      let data = res.data;

      if (isAdmin) {
        setRiwayat(data); 
      } else if (isKurir) {
        const dataOnline = data.filter(t => t.alamat && t.alamat.trim() !== '' && t.alamat !== '-');
        setRiwayat(dataOnline);
      } else {
        const dataPelanggan = data.filter(t => t.nama_pelanggan?.toLowerCase() === user?.nama?.toLowerCase());
        setRiwayat(dataPelanggan);
      }
    } catch (err) { console.error(err); }
  }

  const fetchListChatAdmin = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/chat-list');
      let filteredList = [];
      
      if (isAdmin) {
        filteredList = res.data.filter(c => c.nama_pelanggan !== 'ROOM_INTERNAL' && !c.nama_pelanggan.endsWith('_KURIR'));
        setActiveModal('chat-list-admin');
      } else if (isKurir) {
        filteredList = res.data.filter(c => c.nama_pelanggan.endsWith('_KURIR'));
        setActiveModal('chat-list-kurir');
      }
      
      setChatListAdmin(filteredList);
      setActiveChatUser(null);
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
    
    let targetName = activeChatUser || user.nama;
    if (activeModal === 'chat-internal') {
      targetName = 'ROOM_INTERNAL';
    } else if (activeModal === 'chat-kurir') {
      targetName = `${user.nama}_KURIR`; 
    }

    let dbRole = isStaff ? 'admin' : 'pelanggan';
    let finalPesan = pesanInput;
    if (isKurir) {
      finalPesan = `[K]${pesanInput}`;
    }

    try {
      isUserScrollingRef.current = false; 
      
      await axios.post('http://localhost:5000/api/chat', {
        nama_pelanggan: targetName,
        sender_role: dbRole,
        pesan: finalPesan
      });
      setPesanInput('');
      fetchDetailChat(targetName);
    } catch (err) { alert("Gagal kirim pesan!"); }
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
      alert("Mohon lengkapi data!"); return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/transaksi-baru', formData);
      if (res.data.success) {
        alert("Pesanan Berhasil!");
        setFormData({ 
          nama_pelanggan: isAdmin ? '' : (user?.nama || ''), 
          no_hp: '', alamat: '', layanan: '', berat: '', total_harga: 0, keterangan: '' 
        });
        setActiveModal(null); fetchData();
      }
    } catch (err) { alert("Gagal membuat pesanan."); }
  };

  const ubahStatus = async (id_transaksi, statusBaru) => {
    try {
      await axios.put(`http://localhost:5000/api/transaksi/${id_transaksi}/status`, { status: statusBaru });
      fetchData(); 
    } catch (error) { alert("Gagal mengubah status!"); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileFoto(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const simpanBuktiAntar = async () => {
    if (!fileFoto) return alert("Pilih foto bukti terlebih dahulu!");
    const formDataFoto = new FormData();
    formDataFoto.append('bukti_foto', fileFoto);
    formDataFoto.append('status', 'Selesai');

    try {
      await axios.post(`http://localhost:5000/api/transaksi/${selectedTransaksi.id_transaksi}/bukti`, formDataFoto);
      alert("Bukti pengantaran berhasil diunggah!");
      setActiveModal(null); setFileFoto(null); setPreviewFoto(null); fetchData();
    } catch (err) { alert("Gagal mengunggah bukti."); }
  };

  const handleBayar = async (id_transaksi, total, metode) => {
    if(!metode) return alert("Pilih metode pembayaran!");
    try {
      await axios.post(`http://localhost:5000/api/bayar/${id_transaksi}`, { 
        jumlah_bayar: total, 
        metode_pembayaran: metode 
      });
      alert(`Pembayaran Berhasil via ${metode}!`);
      setInvoiceData(null); setIsPaying(false); setMetodeBayar(''); fetchData(); 
    } catch (error) { alert("Gagal melakukan pembayaran."); }
  };

  const handleCetakInvoice = () => {
    window.print();
  };

  const tutupInvoice = () => { setInvoiceData(null); setIsPaying(false); setMetodeBayar(''); };

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

  // FIX: Terapkan Toleransi Huruf Kecil Saat Memeriksa Posisi Chat
  const renderChatBubble = (c, index) => {
    let actualRole = (c.sender_role || '').toLowerCase(); // Paksa jadi huruf kecil
    let text = c.pesan || '';

    if (actualRole === 'admin' && text.startsWith('[K]')) {
        actualRole = 'kurir';
        text = text.replace('[K]', ''); 
    }
    
    const myRole = isAdmin ? 'admin' : (isKurir ? 'kurir' : 'pelanggan');
    const isMe = actualRole === myRole; // Pengecekan sekarang akurat

    let bubbleStyle = isMe ? styles.chatBubbleRight : styles.chatBubbleLeft;
    
    if (actualRole === 'kurir') {
      bubbleStyle = isMe ? styles.chatBubbleKurirRight : styles.chatBubbleKurirLeft;
    } else if (actualRole === 'admin') {
      bubbleStyle = isMe ? styles.chatBubbleRight : styles.chatBubbleAdminLeft;
    } else {
      bubbleStyle = isMe ? styles.chatBubbleRight : styles.chatBubbleLeft;
    }

    return (
      <div key={index} style={bubbleStyle}>
        <div style={{fontSize: '10px', opacity: 0.8, fontWeight: 'bold', marginBottom: '2px'}}>
          {actualRole.toUpperCase()}
        </div>
        <div>{text}</div>
      </div>
    );
  };

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar} className="no-print">
        <h2 style={{ color: '#fff', marginBottom: '30px' }}>Laundry Wangi</h2>
        <nav style={styles.nav}>
          <div style={activeModal === null && !activeChatUser ? styles.navItemActive : styles.navItem} onClick={() => {setActiveModal(null); setActiveChatUser(null)}}>Dashboard</div>
          
          {!isKurir && <div style={activeModal === 'input' ? styles.navItemActive : styles.navItem} onClick={() => setActiveModal('input')}>{isAdmin ? "Input Transaksi Baru" : "Buat Pesanan Baru"}</div>}
          
          {isStaff && <div style={activeModal === 'data-pelanggan' ? styles.navItemActive : styles.navItem} onClick={() => setActiveModal('data-pelanggan')}>Data Pelanggan</div>}
          
          {isAdmin && <div style={activeModal === 'laporan' ? styles.navItemActive : styles.navItem} onClick={() => setActiveModal('laporan')}>Laporan Pendapatan</div>}
          
          {isStaff && <div style={activeModal === 'chat-list-admin' || activeModal === 'chat-list-kurir' || (activeChatUser && activeModal !== 'chat-internal') ? styles.navItemActive : styles.navItem} onClick={fetchListChatAdmin}>Pesan Pelanggan</div>}
          
          {isAdmin && <div style={activeModal === 'chat-internal' ? styles.navItemActive : styles.navItem} onClick={() => { setActiveModal('chat-internal'); setActiveChatUser(null); }}>Chat Kurir</div>}
          {isKurir && <div style={activeModal === 'chat-internal' ? styles.navItemActive : styles.navItem} onClick={() => { setActiveModal('chat-internal'); setActiveChatUser(null); }}>Chat Admin</div>}
          
          {!isStaff && <div style={activeModal === 'chat-pelanggan' ? styles.navItemActive : styles.navItem} onClick={() => setActiveModal('chat-pelanggan')}>Hubungi Admin (Chat)</div>}
          {!isStaff && <div style={activeModal === 'chat-kurir' ? styles.navItemActive : styles.navItem} onClick={() => setActiveModal('chat-kurir')}>Hubungi Kurir (Chat)</div>}
        </nav>
        <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} style={styles.logoutBtn}>Logout</button>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.header} className="no-print">
          <h1 style={{color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>Selamat Datang, {user.nama}!</h1>
          <span style={styles.badge}>{user.role.toUpperCase()}</span>
        </header>

        <section style={{ marginTop: '30px' }} className="no-print">
          <h2 style={{ marginBottom: '15px', color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
            {isKurir ? "Daftar Antar-Jemput (Online)" : "Daftar Pesanan"}
          </h2>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID/Tgl</th>
                  <th style={styles.th}>Pelanggan</th>
                  <th style={styles.th}>Detail Cucian & Alamat</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.map((t, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={styles.td}>#{t.id_transaksi} <br/><small>{new Date(t.tgl_masuk).toLocaleDateString()}</small></td>
                    <td style={styles.td}><b>{t.nama_pelanggan}</b><br/><small>{t.no_hp || '-'}</small></td>
                    <td style={styles.td}>
                      <b>{t.layanan}</b> ({t.berat} Kg/Lbr)<br/>
                      <span style={{color: '#822c2c', fontSize: '12px'}}>📍 {t.alamat || "Bawa Sendiri (Offline)"}</span><br/>
                      <small style={{ color: '#718096' }}>Ket: {t.keterangan || '-'}</small>
                    </td>
                    <td style={styles.td}>Rp {t.total_harga?.toLocaleString()}</td>
                    <td style={styles.td}>
                       <span style={{ color: getStatusColor(t.status), fontWeight: 'bold' }}>{t.status}</span><br/>
                       <span style={{ fontSize: '11px', color: t.status_bayar === 'Lunas' ? '#48bb78' : '#e53e3e', fontWeight: 'bold' }}>{t.status_bayar}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                        {isAdmin ? (
                          <>
                            <select value={t.status} onChange={(e) => ubahStatus(t.id_transaksi, e.target.value)} style={styles.selectSmall}>
                              <option value="Proses">⏳ Antri</option>
                              <option value="Proses Cuci">👕 Cuci</option>
                              <option value="Proses Pengantaran">🛵 Antar</option>
                              <option value="Selesai">✅ Selesai</option>
                            </select>
                            <button style={{color: '#48bb78', border:'none', background:'none', cursor:'pointer', fontSize:'11px'}} onClick={() => {setActiveChatUser(t.nama_pelanggan);}}>Chat</button>
                            {t.bukti_foto && <a href={`http://localhost:5000/uploads/${t.bukti_foto}`} target="_blank" rel="noreferrer" style={styles.btnProof}>Lihat Foto</a>}
                          </>
                        ) : isKurir ? (
                          <>
                            <select value={t.status} onChange={(e) => ubahStatus(t.id_transaksi, e.target.value)} style={styles.selectSmall}>
                              <option value="Proses Pengantaran">🛵 Antar</option>
                              <option value="Proses Penjemputan">🚴 Jemput</option>
                            </select>
                            <button onClick={() => { setSelectedTransaksi(t); setActiveModal('upload-bukti'); }} style={styles.btnUpload}>Upload</button>
                            <button style={{color: '#3182ce', border:'none', background:'none', cursor:'pointer', fontSize:'11px', fontWeight: 'bold'}} onClick={() => {setActiveChatUser(t.nama_pelanggan + '_KURIR');}}>Chat Pelanggan</button>
                            {t.bukti_foto && <a href={`http://localhost:5000/uploads/${t.bukti_foto}`} target="_blank" rel="noreferrer" style={styles.btnProof}>Lihat Foto</a>}
                          </>
                        ) : (
                          <>
                            <button style={styles.btnActionPelanggan} onClick={() => setInvoiceData(t)}>Invoice</button>
                            <button style={{color: '#48bb78', border:'none', background:'none', cursor:'pointer', fontSize:'11px', fontWeight: 'bold'}} onClick={() => setActiveModal('chat-pelanggan')}>Chat Admin</button>
                            <button style={{color: '#3182ce', border:'none', background:'none', cursor:'pointer', fontSize:'11px', fontWeight: 'bold'}} onClick={() => setActiveModal('chat-kurir')}>Chat Kurir</button>
                            {t.bukti_foto && <a href={`http://localhost:5000/uploads/${t.bukti_foto}`} target="_blank" rel="noreferrer" style={styles.btnProof}>Lihat Foto</a>}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* MODAL INVOICE LENGKAP */}
        {invoiceData && (
          <Modal title="Detail Invoice & Pembayaran" onClose={tutupInvoice}>
            <div id="invoice-print" style={styles.invoiceBox}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#822c2c' }}>LAUNDRY WANGI</h2>
                <p style={{ fontSize: '12px', margin: '5px 0' }}>Solusi Bersih & Cepat | Makassar</p>
                <hr style={{ border: '1px dashed #ccc' }} />
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>No. Transaksi:</span> <b>#{invoiceData.id_transaksi}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pelanggan:</span> <b>{invoiceData.nama_pelanggan}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tanggal:</span> <b>{new Date(invoiceData.tgl_masuk).toLocaleDateString()}</b>
                </div>
                <hr style={{ border: '0.5px solid #eee' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Layanan:</span> <span>{invoiceData.layanan}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Jumlah:</span> <span>{invoiceData.berat} Kg/Lbr</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '18px', fontWeight: 'bold', color: '#822c2c' }}>
                  <span>TOTAL:</span> <span>Rp {invoiceData.total_harga.toLocaleString()}</span>
                </div>
                <div style={{ textAlign: 'center', marginTop: '15px', padding: '5px', backgroundColor: invoiceData.status_bayar === 'Lunas' ? '#c6f6d5' : '#fed7d7', borderRadius: '5px' }}>
                   <b style={{ color: invoiceData.status_bayar === 'Lunas' ? '#2f855a' : '#c53030' }}>{invoiceData.status_bayar.toUpperCase()}</b>
                </div>
              </div>
            </div>

            <div className="no-print" style={{ marginTop: '20px' }}>
              {!isPaying && invoiceData.status_bayar !== 'Lunas' ? (
                <button style={styles.btnPrimary} onClick={() => setIsPaying(true)}>Pilih Pembayaran</button>
              ) : isPaying ? (
                <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Pilih Metode Payment:</label>
                  <select value={metodeBayar} onChange={(e) => setMetodeBayar(e.target.value)} style={styles.input}>
                    <option value="">-- Pilih Metode --</option>
                    <option value="CASH">💵 CASH (Tunai)</option>
                    <option value="QRIS">📱 QRIS (Gopay/OVO/Shopee)</option>
                    <option value="DANA">🔵 DANA</option>
                    <option value="DEBIT">💳 DEBIT CARD</option>
                    <option value="BNI">🏦 TRANSFER BNI</option>
                    <option value="BCA">🏦 TRANSFER BCA</option>
                  </select>
                  <button style={{ ...styles.btnPrimary, backgroundColor: '#48bb78' }} onClick={() => handleBayar(invoiceData.id_transaksi, invoiceData.total_harga, metodeBayar)}>Konfirmasi Bayar</button>
                </div>
              ) : null}
              
              <button style={{ ...styles.btnPrimary, backgroundColor: '#3182ce', marginTop: '10px' }} onClick={handleCetakInvoice}>Cetak Invoice (PDF/Print)</button>
            </div>
          </Modal>
        )}

        {/* MODAL INPUT TRANSAKSI */}
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
                {listLayanan.map((l, i) => <option key={i} value={l.nama}>{l.nama} (Rp {l.harga}/kg-lbr)</option>)}
              </select>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{fontSize:12, fontWeight:'bold'}}>Jumlah</label>
                  <input name="berat" type="number" value={formData.berat} placeholder="0" style={styles.input} onChange={handleInputChange} />
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{fontSize:12, fontWeight:'bold'}}>Total</label>
                  <div style={styles.totalBox}>Rp {formData.total_harga.toLocaleString()}</div>
                </div>
              </div>
              <h4 style={styles.sectionTitle}>Catatan Tambahan</h4>
              <textarea name="keterangan" value={formData.keterangan} placeholder="Contoh: Baju putih dipisah..." style={{...styles.input, height: '80px'}} onChange={handleInputChange} />
              <button style={styles.btnPrimary} onClick={handleSimpanPesanan}>Simpan Transaksi</button>
            </div>
          </Modal>
        )}

        {/* MODAL UPLOAD FOTO */}
        {activeModal === 'upload-bukti' && (
          <Modal title="Upload Bukti Foto" onClose={() => {setActiveModal(null); setPreviewFoto(null);}}>
            <div style={{textAlign: 'center'}}>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{marginBottom: '10px'}} />
              {previewFoto && <img src={previewFoto} alt="Preview" style={{width: '100%', maxHeight: '200px', objectFit: 'contain', marginBottom: '15px'}} />}
              <button style={styles.btnPrimary} onClick={simpanBuktiAntar}>Kirim Foto</button>
            </div>
          </Modal>
        )}

        {/* MODAL DATA PELANGGAN */}
        {activeModal === 'data-pelanggan' && (
          <Modal title="Data Pelanggan" onClose={() => setActiveModal(null)}>
            <div style={{maxHeight:'60vh', overflowY:'auto'}}>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>Nama</th><th style={styles.th}>HP</th><th style={styles.th}>Alamat</th></tr></thead>
                <tbody>{dataPelangganUnik.map((p, i) => (<tr key={i}><td style={styles.td}>{p.nama_pelanggan}</td><td style={styles.td}>{p.no_hp}</td><td style={styles.td}>{p.alamat}</td></tr>))}</tbody>
              </table>
            </div>
          </Modal>
        )}

        {/* MODAL LAPORAN */}
        {activeModal === 'laporan' && (
          <Modal title="Laporan Pendapatan" onClose={() => setActiveModal(null)}>
            <div style={{maxHeight: '60vh', overflowY: 'auto'}}>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>Tanggal</th><th style={styles.th}>Total</th></tr></thead>
                <tbody>{dataLaporan.map((l, i) => (<tr key={i}><td style={styles.td}>{l.tanggal}</td><td style={{...styles.td, color:'green'}}>Rp {l.total.toLocaleString()}</td></tr>))}</tbody>
              </table>
              <div style={{textAlign:'right', padding:10, fontWeight:'bold'}}>Total: Rp {totalSemuaPendapatan.toLocaleString()}</div>
            </div>
          </Modal>
        )}

        {/* MODAL CHAT LIST ADMIN SAJA */}
        {activeModal === 'chat-list-admin' && (
          <Modal title="Pesan Pelanggan Masuk" onClose={() => setActiveModal(null)}>
            {chatListAdmin.length > 0 ? chatListAdmin.map((c, i) => (
              <div key={i} style={styles.chatListItem} onClick={() => { setActiveChatUser(c.nama_pelanggan); setActiveModal(null); }}>
                👤 {c.nama_pelanggan} &rarr;
              </div>
            )) : <p style={{textAlign:'center'}}>Tidak ada pesan pelanggan masuk.</p>}
          </Modal>
        )}

        {/* MODAL CHAT LIST KHUSUS KURIR */}
        {activeModal === 'chat-list-kurir' && (
          <Modal title="Pesan Pelanggan Masuk (Kurir)" onClose={() => setActiveModal(null)}>
            {chatListAdmin.length > 0 ? chatListAdmin.map((c, i) => {
              const displayName = c.nama_pelanggan.replace('_KURIR', '');
              return (
                <div key={i} style={styles.chatListItem} onClick={() => { setActiveChatUser(c.nama_pelanggan); setActiveModal(null); }}>
                  👤 {displayName} &rarr;
                </div>
              );
            }) : <p style={{textAlign:'center'}}>Tidak ada pesan pelanggan masuk.</p>}
          </Modal>
        )}

        {/* MODAL CHAT INTERNAL KHUSUS ADMIN <-> KURIR */}
        {activeModal === 'chat-internal' && (
          <Modal title={isAdmin ? "Ruang Komunikasi Kurir" : "Ruang Komunikasi Admin"} onClose={() => { setActiveModal(null); }}>
            <div style={styles.chatContainer} ref={chatScrollRef} onScroll={handleChatScroll}>
              {chatData.map((c, i) => renderChatBubble(c, i))}
            </div>
            <div style={styles.chatInputBox}>
              <input value={pesanInput} onChange={(e) => setPesanInput(e.target.value)} style={{flex:1, padding:8}} onKeyDown={(e)=>e.key==='Enter'&&kirimPesan()} placeholder="Ketik ke rekan kerja..." />
              <button style={{backgroundColor:'#48bb78', color:'#fff', border:'none', padding:'0 15px', borderRadius:'5px', cursor:'pointer'}} onClick={kirimPesan}>Kirim</button>
            </div>
          </Modal>
        )}

        {/* MODAL CHAT ROOM REGULER (ADMIN/KURIR DENGAN PELANGGAN) */}
        {(activeModal === 'chat-pelanggan' || activeModal === 'chat-kurir' || (activeChatUser && activeModal !== 'chat-internal')) && (() => {
          let chatTitle = 'Admin';
          if (activeModal === 'chat-kurir') chatTitle = 'Kurir';
          if (activeChatUser) chatTitle = activeChatUser.replace('_KURIR', '');

          return (
            <Modal title={`Chat dengan ${chatTitle}`} onClose={() => { setActiveModal(null); setActiveChatUser(null); }}>
              <div style={styles.chatContainer} ref={chatScrollRef} onScroll={handleChatScroll}>
                {chatData.map((c, i) => renderChatBubble(c, i))}
              </div>
              <div style={styles.chatInputBox}>
                <input value={pesanInput} onChange={(e) => setPesanInput(e.target.value)} style={{flex:1, padding:8}} onKeyDown={(e)=>e.key==='Enter'&&kirimPesan()} placeholder="Tulis pesan..." />
                <button style={{backgroundColor:'#48bb78', color:'#fff', border:'none', padding:'0 15px', borderRadius:'5px', cursor:'pointer'}} onClick={kirimPesan}>Kirim</button>
              </div>
            </Modal>
          );
        })()}
      </main>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          #invoice-print { border: none !important; width: 100% !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif" },
  sidebar: { width: '250px', backgroundColor: '#6b2020', padding: '30px 20px', display: 'flex', flexDirection: 'column' },
  nav: { flex: 1 },
  navItem: { color: '#cbd5e0', padding: '12px 0', cursor: 'pointer', borderBottom: '1px solid #4a5568' },
  navItemActive: { color: '#fff', padding: '12px 0', fontWeight: 'bold', borderBottom: '1px solid #fff' },
  mainContent: { flex: 1, padding: '40px', overflowY: 'auto', backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' },
  header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' },
  badge: { backgroundColor: '#000', color: '#fff', padding: '10px 22px', borderRadius: '20px', fontSize: '17px', fontWeight: 'bold' },
  logoutBtn: { padding: '10px', backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: 'auto' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalContent: { backgroundColor: '#fff', width: '500px', borderRadius: '12px', overflow: 'hidden' },
  modalHeader: { padding: '15px 20px', backgroundColor: '#822c2c', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalBody: { padding: '20px' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer' },
  sectionTitle: { borderBottom: '2px solid #edf2f7', paddingBottom: '5px', marginBottom: '10px', color: '#822c2c', fontSize: '14px', fontWeight:'bold' },
  input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', marginBottom: '10px', boxSizing: 'border-box' },
  totalBox: { padding: '10px', backgroundColor: '#edf2f7', borderRadius: '5px', fontWeight: 'bold', textAlign: 'center', color: '#822c2c' },
  btnPrimary: { width: '100%', padding: '12px', backgroundColor: '#822c2c', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  formScroll: { display: 'flex', flexDirection: 'column', maxHeight: '70vh', overflowY: 'auto' },
  tableContainer: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', padding: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxHeight: '60vh', overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', textAlign: 'left', color: '#4a5568', fontSize: '14px', borderBottom: '2px solid #e2e8f0', position:'sticky', top:0, backgroundColor:'#f9fafb', zIndex:1 },
  td: { padding: '12px', color: '#2d3748', fontSize: '14px' },
  btnActionPelanggan: { padding: '6px 12px', backgroundColor: '#ed8936', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  selectSmall: { padding: '5px', borderRadius: '4px', fontSize: '11px', border: '1px solid #ccc' },
  btnProof: { fontSize: '11px', color: '#3182ce', fontWeight: 'bold', textDecoration: 'none' },
  btnUpload: { fontSize: '11px', backgroundColor: '#48bb78', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  invoiceBox: { padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff' },
  chatListItem: { padding: '15px', backgroundColor: '#edf2f7', borderRadius: '8px', cursor: 'pointer', marginBottom: '10px' },
  chatContainer: { height: '350px', overflowY: 'auto', padding: '15px', backgroundColor: '#f7fafc', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' },
  
  // STYLE BUBBLE CHAT
  chatBubbleLeft: { alignSelf: 'flex-start', backgroundColor: '#e2e8f0', color: '#1a202c', padding: '10px 15px', borderRadius: '15px' },
  chatBubbleRight: { alignSelf: 'flex-end', backgroundColor: '#48bb78', color: '#fff', padding: '10px 15px', borderRadius: '15px' },
  
  // KHUSUS KURIR (WARNA BIRU)
  chatBubbleKurirRight: { alignSelf: 'flex-end', backgroundColor: '#3182ce', color: '#fff', padding: '10px 15px', borderRadius: '15px' },
  chatBubbleKurirLeft: { alignSelf: 'flex-start', backgroundColor: '#bee3f8', color: '#2a4365', padding: '10px 15px', borderRadius: '15px' },
  
  // KHUSUS ADMIN SAAT DILIHAT OLEH USER LAIN (Tetap Hijau Pekat, tapi di Kiri)
  chatBubbleAdminLeft: { alignSelf: 'flex-start', backgroundColor: '#48bb78', color: '#fff', padding: '10px 15px', borderRadius: '15px' },
  
  chatInputBox: { display: 'flex', gap: '10px', marginTop: '15px' },
};

export default Dashboard;