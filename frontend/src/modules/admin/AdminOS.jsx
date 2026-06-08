import React, { useState } from 'react';
import { Shield, ShieldAlert, Users, Search, Trash2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuthStore } from 'src/store/stores';

import { useToastStore } from 'src/store/toastStore';

export default function AdminOS() {
  const { user, _users, adminDeleteUser, adminUpdateRole, adminCreateUser } = useAuthStore();
  const toast = useToastStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'admin' });

  if (user?.role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
        <ShieldAlert size={64} color="var(--coral)" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 24, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>ACESSO NEGADO</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Esta área é restrita para administradores do sistema.</p>
      </div>
    );
  }

  const filteredUsers = _users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAdmins = _users.filter(u => u.role === 'admin').length;
  const totalUsers = _users.length;

  const handleDelete = () => {
    if (deleteId) {
      adminDeleteUser(deleteId);
      setDeleteId(null);
    }
  };

  const handleRoleToggle = (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    adminUpdateRole(targetUser.id, newRole);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Shield size={20} style={{ display: 'inline', marginRight: 8 }} />ADMIN_OS</h1>
          <p className="page-subtitle">Painel de Controle e Gestão de Usuários</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreating(true)}>Criar Administrador</button>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">Total de Usuários</div>
          <div className="card-value" style={{ marginTop: 8, color: 'var(--blue)' }}>{totalUsers}</div>
        </div>
        <div className="card">
          <div className="card-title">Administradores</div>
          <div className="card-value" style={{ marginTop: 8, color: 'var(--coral)' }}>{totalAdmins}</div>
        </div>
        <div className="card">
          <div className="card-title">Usuários Comuns</div>
          <div className="card-value" style={{ marginTop: 8, color: 'var(--green)' }}>{totalUsers - totalAdmins}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 16 }}>
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} /> Base de Usuários
          </span>
          <div className="input-group" style={{ margin: 0, width: 240, maxWidth: '100%' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="input"
                placeholder="Buscar usuário..."
                style={{ paddingLeft: 32 }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredUsers.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <p>Nenhum usuário encontrado</p>
            </div>
          ) : (
            filteredUsers.map(u => (
              <div key={u.id} className="card invest-list-item" style={{ padding: '12px 16px', background: 'var(--bg-deep)' }}>
                <div className="invest-list-icon" style={{ background: u.role === 'admin' ? 'var(--coral-dim)' : 'var(--bg-elevated)', borderRadius: '50%' }}>
                  {u.role === 'admin' ? <ShieldCheck size={18} color="var(--coral)" /> : <UserIcon size={18} color="var(--text-secondary)" />}
                </div>

                <div className="invest-list-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, wordBreak: 'break-word' }}>
                      {u.name} {u.id === user.id && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>(Você)</span>}
                    </p>
                    <span className={`badge ${u.role === 'admin' ? 'badge-coral' : 'badge-muted'}`} style={{ fontSize: 10 }}>
                      {u.role === 'admin' ? 'Admin' : 'Usuário'}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {u.email} · Registrado em {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="invest-list-actions" style={{ marginLeft: 'auto' }}>
                  {u.id !== user.id && (
                    <>
                      <button
                        className={`btn btn-sm ${u.role === 'admin' ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => handleRoleToggle(u)}
                        title={u.role === 'admin' ? 'Remover privilégios' : 'Promover a Admin'}
                      >
                        {u.role === 'admin' ? 'Rebaixar' : 'Promover'}
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                        onClick={() => setDeleteId(u.id)}
                        title="Deletar Usuário"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="overlay" style={{ zIndex: 400 }}>
          <div className="drawer-overlay" onClick={() => setDeleteId(null)} style={{ position: 'absolute', inset: 0 }} />
          <div className="modal animate-in" style={{ maxWidth: 400, zIndex: 401 }}>
            <div className="modal-title" style={{ color: 'var(--red)' }}>Confirmar Exclusão</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita e todos os dados associados à conta serão perdidos.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className="btn btn-primary" style={{ background: 'var(--red)', borderColor: 'var(--red)' }} onClick={handleDelete}>Deletar</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {isCreating && (
        <div className="overlay" style={{ zIndex: 400 }}>
          <div className="drawer-overlay" onClick={() => setIsCreating(false)} style={{ position: 'absolute', inset: 0 }} />
          <div className="modal animate-in" style={{ maxWidth: 400, zIndex: 401 }}>
            <div className="modal-title">Novo Usuário / Administrador</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Nome</label>
                <input className="input" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} placeholder="Nome completo" />
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Email</label>
                <input className="input" type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} placeholder="email@dominio.com" />
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Senha</label>
                <input className="input" type="password" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Cargo</label>
                <select className="input" value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value })}>
                  <option value="admin">Administrador (Total Acesso)</option>
                  <option value="user">Usuário Comum</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setIsCreating(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={async () => {
                if (!createForm.name || !createForm.email || !createForm.password) {
                  toast.error('Preencha todos os campos'); return;
                }
                const res = await adminCreateUser(createForm);
                if (res.error) { toast.error(res.error); }
                else { toast.success('Usuário criado!'); setIsCreating(false); setCreateForm({ name: '', email: '', password: '', role: 'admin' }); }
              }}>Criar Conta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
