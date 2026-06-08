import React, { useState } from 'react';
import { useConfigStore, useAuthStore } from 'src/store/stores';
import { useToastStore } from 'src/store/toastStore';
import { Settings, User, Palette, Bell, Save, Shield, Lock, Mail, Trash2, CheckCircle, AlertTriangle, Eye, EyeOff, KeyRound, Camera } from 'lucide-react';

export default function SystemConfig() {
  const { profile, preferences, updateProfile, updatePreferences, focusPhrase, setFocusPhrase, profileImage, setProfileImage } = useConfigStore();
  const { user, updateName, updateEmail, updatePassword, deleteAccount, logout } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [localProfile, setLocalProfile] = useState({ ...profile });
  const [localPrefs, setLocalPrefs] = useState({ ...preferences });
  const [localPhrase, setLocalPhrase] = useState(focusPhrase);
  const [saved, setSaved] = useState(false);

  // Security state
  const [secName, setSecName] = useState(user?.name || '');
  const [secEmail, setSecEmail] = useState(user?.email || '');
  const [secEmailPw, setSecEmailPw] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [deletePw, setDeletePw] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showPw, setShowPw] = useState({});
  const toast = useToastStore();

  const handleSave = () => {
    if (tab === 'profile') { updateProfile(localProfile); setFocusPhrase(localPhrase); }
    if (tab === 'preferences') { updatePreferences(localPrefs); }
    setSaved(true);
    toast.success('Configurações salvas');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUpdateName = () => {
    if (!secName.trim()) return;
    updateName(secName.trim());
    toast.success('Nome atualizado com sucesso');
  };

  const handleUpdateEmail = async () => {
    if (!secEmail.trim() || !secEmailPw) { toast.error('Preencha email e senha'); return; }
    const result = await updateEmail(secEmail.trim(), secEmailPw);
    if (result?.error) { toast.error(result.error); }
    else { toast.success('Email atualizado com sucesso'); setSecEmailPw(''); }
  };

  const handleUpdatePassword = async () => {
    if (!currentPw || !newPw) { toast.error('Preencha todos os campos'); return; }
    if (newPw.length < 6) { toast.error('Nova senha deve ter pelo menos 6 caracteres'); return; }
    if (newPw !== confirmPw) { toast.error('Senhas não coincidem'); return; }
    const result = await updatePassword(currentPw, newPw);
    if (result?.error) { toast.error(result.error); }
    else { toast.success('Senha alterada com sucesso'); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }
  };

  const handleDeleteAccount = async () => {
    if (!deletePw) { toast.error('Digite sua senha para confirmar'); return; }
    const result = await deleteAccount(deletePw);
    if (result?.error) { toast.error(result.error); }
  };

  const togglePw = (key) => setShowPw(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Settings size={20} style={{ display: 'inline', marginRight: 8 }} />SYSTEM_CONFIG</h1>
          <p className="page-subtitle">Configurações do sistema</p>
        </div>
        {tab !== 'security' && (
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={14} /> {saved ? 'Salvo!' : 'Salvar'}
          </button>
        )}
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}><User size={12} style={{ marginRight: 4 }} /> Perfil</button>
        <button className={`tab ${tab === 'preferences' ? 'active' : ''}`} onClick={() => setTab('preferences')}><Palette size={12} style={{ marginRight: 4 }} /> Preferências</button>
        <button className={`tab ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}><Shield size={12} style={{ marginRight: 4 }} /> Segurança</button>
      </div>

      {/* ===== PROFILE TAB ===== */}
      {tab === 'profile' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Profile Image Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-elevated)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file'; input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = e.target.files[0]; if (!file) return;
                    if (file.size > 2 * 1024 * 1024) { alert('Imagem deve ter no máximo 2MB'); return; }
                    const reader = new FileReader();
                    reader.onload = (ev) => setProfileImage(ev.target.result);
                    reader.readAsDataURL(file);
                  };
                  input.click();
                }}
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={32} color="var(--text-muted)" />
                )}
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: 'var(--coral)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Camera size={12} color="var(--text-inverse)" />
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Clique para alterar a foto</span>
              {profileImage && (
                <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--coral)' }} onClick={() => setProfileImage(null)}>Remover foto</button>
              )}
            </div>

            <div className="input-group"><label className="input-label">Nome</label><input className="input" value={localProfile.name} onChange={e => setLocalProfile({ ...localProfile, name: e.target.value })} /></div>
            <div className="input-group"><label className="input-label">Arquétipo</label>
              <select className="select-input" value={localProfile.archetype} onChange={e => setLocalProfile({ ...localProfile, archetype: e.target.value })}>
                <option value="Estrategista">Estrategista</option><option value="Executor">Executor</option><option value="Criativo">Criativo</option>
                <option value="Analista">Analista</option><option value="Líder">Líder</option>
              </select>
            </div>
            <div className="input-group"><label className="input-label">Intensidade</label>
              <select className="select-input" value={localProfile.intensity} onChange={e => setLocalProfile({ ...localProfile, intensity: e.target.value })}>
                <option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option><option value="extreme">Extrema</option>
              </select>
            </div>
            <div className="input-group"><label className="input-label">Frase de Foco</label><input className="input" value={localPhrase} onChange={e => setLocalPhrase(e.target.value)} placeholder="Sua frase motivacional..." /></div>

            {/* Display current profile */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16, marginTop: 8 }}>
              <div className="section-title">Perfil Atual</div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div><span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Nome</span><p style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{profile.name}</p></div>
                <div><span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Arquétipo</span><p style={{ fontSize: 14, fontWeight: 600, marginTop: 4, color: 'var(--coral)' }}>{profile.archetype}</p></div>
                <div><span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Intensidade</span><p style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{profile.intensity}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== PREFERENCES TAB ===== */}
      {tab === 'preferences' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="input-group"><label className="input-label">Duração Foco Padrão (min)</label><input className="input" type="number" value={localPrefs.focusDuration} onChange={e => setLocalPrefs({ ...localPrefs, focusDuration: parseInt(e.target.value) || 25 })} /></div>
            <div className="input-group">
              <label className="input-label">Notificações</label>
              <button className={`btn ${localPrefs.notifications ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setLocalPrefs({ ...localPrefs, notifications: !localPrefs.notifications })}>
                <Bell size={14} /> {localPrefs.notifications ? 'Ativadas' : 'Desativadas'}
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
              <div className="section-title">Dados</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={() => {
                  const data = {};
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key?.startsWith('coreos_')) data[key] = JSON.parse(localStorage.getItem(key));
                  }
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = `coreos_backup_${new Date().toISOString().split('T')[0]}.json`; a.click();
                }}>Exportar Dados</button>
                <button className="btn btn-secondary" onClick={() => {
                  const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
                  input.onchange = (e) => {
                    const file = e.target.files[0]; if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      try {
                        const data = JSON.parse(ev.target.result);
                        Object.entries(data).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
                        window.location.reload();
                      } catch { }
                    };
                    reader.readAsText(file);
                  };
                  input.click();
                }}>Importar Dados</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== SECURITY TAB ===== */}
      {tab === 'security' && (
        <div style={{ maxWidth: 600 }}>

          {/* Change Name */}
          <div className="security-section">
            <div className="security-title"><User size={14} color="var(--coral)" /> Alterar Nome</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="input-group">
                <label className="input-label">Nome</label>
                <input className="input" value={secName} onChange={e => setSecName(e.target.value)} placeholder="Seu nome" />
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleUpdateName} style={{ alignSelf: 'flex-start' }}>Salvar Nome</button>
            </div>
          </div>

          {/* Change Email */}
          <div className="security-section">
            <div className="security-title"><Mail size={14} color="var(--blue)" /> Alterar Email</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="input-group">
                <label className="input-label">Novo Email</label>
                <input className="input" type="email" value={secEmail} onChange={e => setSecEmail(e.target.value)} placeholder="novo@email.com" />
              </div>
              <div className="input-group">
                <label className="input-label">Confirme com Senha</label>
                <div className="auth-pw-wrapper">
                  <input className="input" style={{ width: '100%', paddingRight: 40 }} type={showPw.email ? 'text' : 'password'} value={secEmailPw} onChange={e => setSecEmailPw(e.target.value)} placeholder="Sua senha atual" />
                  <button type="button" className="auth-pw-toggle" onClick={() => togglePw('email')}>
                    {showPw.email ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleUpdateEmail} style={{ alignSelf: 'flex-start' }}>Atualizar Email</button>
            </div>
          </div>

          {/* Change Password */}
          <div className="security-section">
            <div className="security-title"><KeyRound size={14} color="var(--amber)" /> Alterar Senha</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="input-group">
                <label className="input-label">Senha Atual</label>
                <div className="auth-pw-wrapper">
                  <input className="input" style={{ width: '100%', paddingRight: 40 }} type={showPw.current ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Senha atual" />
                  <button type="button" className="auth-pw-toggle" onClick={() => togglePw('current')}>
                    {showPw.current ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Nova Senha</label>
                <div className="auth-pw-wrapper">
                  <input className="input" style={{ width: '100%', paddingRight: 40 }} type={showPw.new ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 6 caracteres" />
                  <button type="button" className="auth-pw-toggle" onClick={() => togglePw('new')}>
                    {showPw.new ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Confirmar Nova Senha</label>
                <input className="input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repita a nova senha" />
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleUpdatePassword} style={{ alignSelf: 'flex-start' }}>Alterar Senha</button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="security-section danger">
            <div className="security-title" style={{ color: 'var(--red)' }}><Trash2 size={14} /> Zona de Perigo</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
              Ao deletar sua conta, todos os dados serão permanentemente removidos. Esta ação não pode ser desfeita.
            </p>
            {!deleteConfirm ? (
              <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(true)}>
                <Trash2 size={12} /> Deletar Minha Conta
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="auth-error" style={{ background: 'rgba(248,113,113,0.08)' }}>
                  <AlertTriangle size={14} /> Tem certeza? Digite sua senha para confirmar a exclusão permanente.
                </div>
                <div className="input-group">
                  <label className="input-label">Senha</label>
                  <div className="auth-pw-wrapper">
                    <input className="input" style={{ width: '100%', paddingRight: 40 }} type={showPw.delete ? 'text' : 'password'} value={deletePw} onChange={e => setDeletePw(e.target.value)} placeholder="Sua senha" />
                    <button type="button" className="auth-pw-toggle" onClick={() => togglePw('delete')}>
                      {showPw.delete ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-danger btn-sm" onClick={handleDeleteAccount}>
                    <Trash2 size={12} /> Confirmar Exclusão
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setDeleteConfirm(false); setDeletePw(''); }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Account info */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-title" style={{ marginBottom: 12 }}>Informações da Conta</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Nome</span>
                <span>{user?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Email</span>
                <span>{user?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Conta criada</span>
                <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
