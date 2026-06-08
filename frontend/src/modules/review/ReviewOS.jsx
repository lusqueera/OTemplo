import React, { useState } from 'react';
import { useReviewStore } from 'src/store/stores';
import { BookOpen, Plus, X, Edit2, Trash2, Calendar, TrendingUp, Award, AlertTriangle } from 'lucide-react';

function ReviewDrawer({ open, onClose, editReview }) {
  const { addReview, updateReview } = useReviewStore();
  const [form, setForm] = useState(editReview || { type: 'daily', date: new Date().toISOString().split('T')[0], achievements: '', failures: '', learnings: '', energy: 3, notes: '' });

  const handleSave = () => {
    if (editReview?.id) { updateReview(editReview.id, form); } else { addReview(form); }
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer animate-slide">
        <div className="drawer-title"><span>{editReview?.id ? 'Editar' : 'Nova'} Revisão</span><button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group"><label className="input-label">Tipo</label>
              <select className="select-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="daily">Diária</option><option value="weekly">Semanal</option><option value="monthly">Mensal</option>
              </select>
            </div>
            <div className="input-group"><label className="input-label">Data</label><input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <div className="input-group"><label className="input-label">Conquistas</label><textarea className="input" value={form.achievements} onChange={e => setForm({ ...form, achievements: e.target.value })} placeholder="O que conquistei..." /></div>
          <div className="input-group"><label className="input-label">Falhas / Dificuldades</label><textarea className="input" value={form.failures} onChange={e => setForm({ ...form, failures: e.target.value })} placeholder="O que não funcionou..." /></div>
          <div className="input-group"><label className="input-label">Aprendizados</label><textarea className="input" value={form.learnings} onChange={e => setForm({ ...form, learnings: e.target.value })} placeholder="O que aprendi..." /></div>
          <div className="input-group"><label className="input-label">Nível de Energia (1-5)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(e => (
                <button key={e} className={`btn ${form.energy === e ? 'btn-primary' : 'btn-secondary'} btn-icon`} onClick={() => setForm({ ...form, energy: e })}>{e}</button>
              ))}
            </div>
          </div>
          <div className="input-group"><label className="input-label">Observações</label><textarea className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <button className="btn btn-primary" onClick={handleSave}>{editReview?.id ? 'Salvar' : 'Registrar Revisão'}</button>
        </div>
      </div>
    </>
  );
}

const typeBadge = { daily: 'badge-coral', weekly: 'badge-blue', monthly: 'badge-purple' };
const typeLabel = { daily: 'Diária', weekly: 'Semanal', monthly: 'Mensal' };

export default function ReviewOS() {
  const { reviews, deleteReview } = useReviewStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [tab, setTab] = useState('all');

  const filtered = tab === 'all' ? reviews : reviews.filter(r => r.type === tab);
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const dailyCount = reviews.filter(r => r.type === 'daily').length;
  const weeklyCount = reviews.filter(r => r.type === 'weekly').length;
  const monthlyCount = reviews.filter(r => r.type === 'monthly').length;
  const avgEnergy = reviews.length > 0 ? (reviews.reduce((a, r) => a + (r.energy || 0), 0) / reviews.length).toFixed(1) : '—';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title"><BookOpen size={20} style={{ display: 'inline', marginRight: 8 }} />REVIEW_OS</h1>
          <p className="page-subtitle">Reflexão estruturada</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditReview(null); setDrawerOpen(true); }}><Plus size={14} /> Nova Revisão</button>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card"><div className="card-title">Diárias</div><div className="card-value" style={{ marginTop: 8 }}>{dailyCount}</div></div>
        <div className="card"><div className="card-title">Semanais</div><div className="card-value" style={{ marginTop: 8, color: 'var(--blue)' }}>{weeklyCount}</div></div>
        <div className="card"><div className="card-title">Mensais</div><div className="card-value" style={{ marginTop: 8, color: 'var(--purple)' }}>{monthlyCount}</div></div>
        <div className="card"><div className="card-title">Energia média</div><div className="card-value" style={{ marginTop: 8, color: 'var(--amber)' }}>{avgEnergy}</div></div>
      </div>

      <div className="tabs">
        {['all', 'daily', 'weekly', 'monthly'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'all' ? 'Todas' : typeLabel[t]}
          </button>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="empty-state"><BookOpen size={48} /><p>Nenhuma revisão registrada</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setDrawerOpen(true)}>Criar revisão</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sorted.map(r => (
          <div key={r.id} className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge ${typeBadge[r.type]}`}>{typeLabel[r.type]}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{r.date}</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditReview(r); setDrawerOpen(true); }}><Edit2 size={12} /></button>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteReview(r.id)}><Trash2 size={12} /></button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 8 }}>
              {r.achievements && <div><div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}><Award size={12} color="var(--green)" /><span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Conquistas</span></div><p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.achievements}</p></div>}
              {r.failures && <div><div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}><AlertTriangle size={12} color="var(--coral)" /><span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Falhas</span></div><p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.failures}</p></div>}
              {r.learnings && <div><div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}><TrendingUp size={12} color="var(--blue)" /><span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Aprendizados</span></div><p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.learnings}</p></div>}
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Energia:</span>
              {[1, 2, 3, 4, 5].map(e => <span key={e} style={{ width: 8, height: 8, borderRadius: 2, background: e <= (r.energy || 0) ? 'var(--amber)' : 'var(--bg-elevated)', display: 'inline-block' }} />)}
            </div>
          </div>
        ))}
      </div>

      <ReviewDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditReview(null); }} editReview={editReview} />
    </div>
  );
}
