import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../../utils/supabase/client";
import styles from "./AdminPanel.module.css";
import { DoorOpen, BarChart, ClipboardList, CheckCircle, AlertTriangle, XCircle, Camera, Plus, Edit2, Trash2, Search, Loader2, X, Gift, PartyPopper, Clock, Cake, Zap } from "lucide-react";
import { Scanner } from '@yudiel/react-qr-scanner';

export function AdminPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'portaria' | 'enquete' | 'lista'>('portaria');
  const [auth, setAuth] = useState(() => sessionStorage.getItem("adminAuth") === "true");
  const [pass, setPass] = useState("");
  
  // Portaria state
  const [code, setCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  
  // Enquete state
  const [poll, setPoll] = useState({ hulk: 0, smash: 0 });
  
  // Lista state
  const [guests, setGuests] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // CRUD state
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', max_entries: '1' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pass === "hulk2025") {
      sessionStorage.setItem("adminAuth", "true");
      setAuth(true);
    } else {
      alert("Senha incorreta");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("adminAuth");
    setAuth(false);
    navigate("/");
  }

  useEffect(() => {
    if (!auth) return;
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [auth]);

  async function fetchData() {
    const { data: pData } = await supabase.from('poll_results').select('*').eq('id', 1).single();
    if (pData) setPoll(pData);
    
    const { data: gData } = await supabase.from('guests').select('*').order('name');
    if (gData) setGuests(gData);
  }

  async function submitCode(targetCode: string) {
    if (!targetCode) return;
    const { data, error } = await supabase.rpc('verify_and_checkin', { invite: targetCode.toUpperCase() });
    if (error) {
      setVerifyResult({ valid: false, error: error.message });
    } else {
      setVerifyResult(data);
      fetchData(); // update list
    }
    setCode("");
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    submitCode(code);
  }

  function formatPhone(val: string) {
    let v = val.replace(/\D/g, '');
    if (v.length <= 10) {
      v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
      v = v.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
      v = v.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return v.substring(0, 15);
  }

  // CRUD Functions
  function openCreateModal() {
    setEditingGuest(null);
    setFormData({ name: '', phone: '', max_entries: '1' });
    setFormError('');
    setShowModal(true);
  }

  function openEditModal(guest: any) {
    setEditingGuest(guest);
    setFormData({
      name: guest.name || '',
      phone: guest.phone || '',
      max_entries: String(guest.max_entries || 1)
    });
    setFormError('');
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormError('Nome e telefone são obrigatórios.');
      return;
    }
    const entries = parseInt(formData.max_entries) || 0;
    if (entries < 1) {
      setFormError('O número mínimo de entradas é 1.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        max_entries: entries,
      };

      if (editingGuest) {
        const { error } = await supabase.from('guests').update(payload).eq('id', editingGuest.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('guests').insert([payload]);
        if (error) throw error;
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      console.error("SUPABASE ERROR:", err);
      if (err.code === '23505') { // Unique violation
        setFormError('Já existe um convidado cadastrado com este telefone.');
      } else {
        setFormError(`Erro ao salvar: ${err.message || JSON.stringify(err)}`);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('guests').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      alert('Erro ao excluir convidado.');
    } finally {
      setDeleting(false);
    }
  }

  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.phone.includes(search)
  );

  if (!auth) {
    return (
      <div className={styles.loginContainer}>
        <form onSubmit={handleLogin} className={styles.loginCard}>
          <h2 className={styles.loginTitle}>Painel de Controle</h2>
          <p style={{color: '#7C3AED', marginBottom: '1.5rem', fontSize: '0.9rem'}}>Aniversário Victor Gabriel - Tema Hulk</p>
          <input 
            type="password" 
            value={pass} 
            onChange={e => setPass(e.target.value)} 
            placeholder="Senha de acesso" 
            className={styles.input} 
          />
          <button type="submit" className={styles.buttonPrimary}>Entrar</button>
          <button type="button" onClick={() => navigate("/")} className={styles.buttonText}>
            ← Voltar para a Home
          </button>
        </form>
      </div>
    );
  }

  const presentsCount = guests.filter(g => g.checked_in).length;

  return (
    <div className={styles.container}>
      <div className={styles.dashboard}>
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>Painel Admin</h1>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Sair do Painel
          </button>
        </header>

        <nav className={styles.nav}>
          {(['portaria', 'enquete', 'lista'] as const).map(t => (
            <button 
              key={t} 
              onClick={() => { setTab(t); setVerifyResult(null); }} 
              className={`${styles.navBtn} ${tab === t ? styles.navBtnActive : ''}`}
            >
              {t === 'portaria' ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><DoorOpen size={18} /> Portaria</span> : t === 'enquete' ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><BarChart size={18} /> Votação</span> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><ClipboardList size={18} /> Convidados</span>}
            </button>
          ))}
        </nav>

        {tab === 'portaria' && (
          <div className={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className={styles.cardTitle} style={{ margin: 0 }}>Liberação de Acesso</h2>
              <button 
                type="button" 
                onClick={() => setShowScanner(!showScanner)}
                style={{ 
                  display: "flex", alignItems: "center", gap: "8px", 
                  padding: "0.5rem 1rem", borderRadius: "12px", 
                  border: "none", cursor: "pointer", 
                  background: showScanner ? "#F3E8FF" : "#F3E8FF", 
                  color: showScanner ? "#8B5CF6" : "#5B21B6",
                  fontWeight: 600, transition: "all 0.2s"
                }}
              >
                <Camera size={18} />
                {showScanner ? 'Fechar Câmera' : 'Ler QR Code'}
              </button>
            </div>

            {showScanner && (
              <div style={{ maxWidth: "350px", margin: "0 auto 2rem auto", borderRadius: "16px", overflow: "hidden", border: "2px solid #8B5CF6" }}>
                <Scanner 
                  onScan={(result) => {
                    if (result && result.length > 0) {
                      const scannedCode = result[0].rawValue;
                      setCode(scannedCode);
                      setShowScanner(false);
                      submitCode(scannedCode);
                    }
                  }}
                  formats={['qr_code']}
                />
              </div>
            )}

            <form onSubmit={handleVerify} className={styles.portariaForm}>
              <input 
                value={code} 
                onChange={e => setCode(e.target.value.toUpperCase())} 
                placeholder="Código (Ex: 6GK-99A)" 
                className={styles.portariaInput} 
              />
              <button type="submit" className={styles.verifyBtn}>Validar</button>
            </form>

            {verifyResult && (
              <div className={`${styles.resultBox} ${verifyResult.valid && !verifyResult.already_checked_in ? styles.success : verifyResult.already_checked_in ? styles.warning : styles.error}`}>
                {verifyResult.valid && !verifyResult.already_checked_in ? (
                  <>
                    <div className={styles.resultIcon}><CheckCircle size={48} color="#166534" /></div>
                    <h3 className={styles.successTitle}>Acesso Liberado</h3>
                    <p className={styles.resultName}>{verifyResult.guest.name}</p>
                    <p className={styles.resultEntries}>Permite entrada de <strong>{verifyResult.guest.max_entries}</strong> pessoa(s)</p>
                  </>
                ) : verifyResult.already_checked_in ? (
                  <>
                    <div className={styles.resultIcon}><AlertTriangle size={48} color="#CA8A04" /></div>
                    <h3 className={styles.warningTitle}>Convidado Já Registrado</h3>
                    <p className={styles.resultName}>{verifyResult.guest.name}</p>
                    <p className={styles.resultEntries}>A entrada já havia sido liberada anteriormente.</p>
                  </>
                ) : (
                  <>
                    <div className={styles.resultIcon}><XCircle size={48} color="#DC2626" /></div>
                    <h3 className={styles.errorTitle}>Acesso Negado</h3>
                    <p className={styles.resultErrorText}>{verifyResult.error || "Código inválido."}</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'enquete' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Placar Ao Vivo - Time Hulk vs Time Smash</h2>
            
            <div className={styles.pollGrid}>
              <div className={`${styles.pollCard} ${styles.pollHulk}`}>
                <div className={styles.pollIcon}><Zap size={48} color="#8B5CF6" /></div>
                <h3 className={styles.pollTitle}>Time Hulk</h3>
                <p className={styles.pollCount}>{poll.hulk}</p>
              </div>
              
              <div className={`${styles.pollCard} ${styles.pollSmash}`}>
                <div className={styles.pollIcon}><PartyPopper size={48} color="#22C55E" /></div>
                <h3 className={styles.pollTitle}>Time Smash</h3>
                <p className={styles.pollCount}>{poll.smash}</p>
              </div>
            </div>

            <p className={styles.pollTotal}>Total de votos: {poll.hulk + poll.smash}</p>
          </div>
        )}

        {tab === 'lista' && (
          <div className={styles.card}>
            <div className={styles.listHeader}>
              <h2 className={styles.cardTitle} style={{ margin: 0 }}>Lista Oficial</h2>
              <span className={styles.statsBadge}>
                Presentes: {presentsCount} / {guests.length}
              </span>
            </div>

            <div className={styles.listActions}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} color="#5B21B6" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Buscar por nome ou telefone..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className={styles.searchInput}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              <button onClick={openCreateModal} className={styles.newGuestBtn}>
                <Plus size={18} /> Novo Convidado
              </button>
            </div>
            
            <div className={styles.tableWrap} style={{ marginTop: '1.5rem' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Convidado</th>
                    <th>Telefone</th>
                    <th>Senhas</th>
                    <th>Código</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map(g => (
                    <tr key={g.id}>
                      <td>
                        <span className={g.checked_in ? styles.statusIn : styles.statusOut} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {g.checked_in ? <><CheckCircle size={14} /> Entrou</> : <><Clock size={14} /> Aguardando</>}
                        </span>
                      </td>
                      <td className={styles.tdName}>{g.name}</td>
                      <td>{g.phone}</td>
                      <td>{g.max_entries}</td>
                      <td className={styles.tdCode}>{g.invite_code || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => openEditModal(g)} className={`${styles.actionBtn} ${styles.editBtn}`} title="Editar">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => setDeleteTarget(g)} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Excluir">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredGuests.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#7C3AED' }}>
                        Nenhum convidado encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* MODAL CRIAR/EDITAR */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{editingGuest ? 'Editar Convidado' : 'Novo Convidado'}</h3>
              <button onClick={() => setShowModal(false)} className={styles.closeBtn}>
                <X size={24} />
              </button>
            </div>

            {formError && <div className={styles.errorMessage}>{formError}</div>}

            <form onSubmit={handleSave}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nome Completo *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className={styles.formInput} 
                  required 
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Telefone *</label>
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})} 
                    className={styles.formInput} 
                    placeholder="(88) 99999-9999"
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nº Entradas</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.max_entries} 
                    onChange={e => setFormData({...formData, max_entries: e.target.value.replace(/\D/g, '')})} 
                    className={styles.formInput} 
                    placeholder="1"
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className={styles.saveBtn}>
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? 'Salvando...' : 'Salvar Convidado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR EXCLUSÃO */}
      {deleteTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <AlertTriangle size={48} color="#DC2626" />
            </div>
            <h3 className={styles.modalTitle} style={{ color: '#DC2626', marginBottom: '1rem' }}>Excluir Convidado?</h3>
            <p style={{ color: '#5B21B6', lineHeight: '1.5', marginBottom: '2rem' }}>
              Tem certeza que deseja excluir <strong>{deleteTarget.name}</strong>?
              <br />Esta ação não pode ser desfeita.
            </p>
            
            <div className={styles.modalActions} style={{ justifyContent: 'center' }}>
              <button type="button" onClick={() => setDeleteTarget(null)} className={styles.cancelBtn}>
                Cancelar
              </button>
              <button type="button" onClick={handleDelete} disabled={deleting} className={styles.confirmDeleteBtn}>
                {deleting ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}