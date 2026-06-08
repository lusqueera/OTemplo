import React, { useState } from 'react';
import { useBrainStore } from '../../store/stores';
import { Brain, Plus, X, Edit2, Trash2, Archive, Search, Lightbulb, BookOpen, AlertCircle, GraduationCap, MessageSquare } from 'lucide-react';

const typeConfig = {
  idea: { icon: Lightbulb, color: 'var(--amber)', badge: 'badge-amber' },
  insight: { icon: Lightbulb, color: 'var(--coral)', badge: 'badge-coral' },
  reflection: { icon: MessageSquare, color: 'var(--blue)', badge: 'badge-blue' },
  learning: { icon: GraduationCap, color: 'var(--green)', badge: 'badge-green' },
  problem: { icon: AlertCircle, color: 'var(--red)', badge: 'badge-coral' },
};

function NoteDrawer({ open, onClose, editNote }) {
  const { addNote, updateNote } = useBrainStore();
  const [form, setForm] = useState(editNote || { title:'', content:'', type:'idea', tags:'', context:'' });

  const handleSave = () => {
    if (!form.title.trim()) return;
    const data = { ...form, tags: typeof form.tags === 'string' ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : form.tags };
    if (editNote?.id) { updateNote(editNote.id, data); } else { addNote(data); }
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer animate-slide">
        <div className="drawer-title"><span>{editNote?.id ? 'Editar' : 'Nova'} Nota</span><button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button></div>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="input-group"><label className="input-label">Título</label><input className="input" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="Título da nota" /></div>
          <div className="input-group"><label className="input-label">Tipo</label>
            <select className="select-input" value={form.type} onChange={e => setForm({...form,type:e.target.value})}>
              <option value="idea">💡 Ideia</option><option value="insight">🔥 Insight</option><option value="reflection">💬 Reflexão</option>
              <option value="learning">📚 Aprendizado</option><option value="problem">⚠️ Problema</option>
            </select>
          </div>
          <div className="input-group"><label className="input-label">Conteúdo</label><textarea className="input" style={{ minHeight:120 }} value={form.content} onChange={e => setForm({...form,content:e.target.value})} placeholder="Escreva..." /></div>
          <div className="input-group"><label className="input-label">Tags</label><input className="input" value={typeof form.tags === 'string' ? form.tags : form.tags?.join(', ')} onChange={e => setForm({...form,tags:e.target.value})} placeholder="react, carreira, ..." /></div>
          <div className="input-group"><label className="input-label">Contexto</label><input className="input" value={form.context} onChange={e => setForm({...form,context:e.target.value})} placeholder="Em que contexto surgiu?" /></div>
          <button className="btn btn-primary" onClick={handleSave}>{editNote?.id ? 'Salvar' : 'Criar Nota'}</button>
        </div>
      </div>
    </>
  );
}

export default function BrainOS() {
  const { notes, deleteNote, archiveNote } = useBrainStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const active = notes.filter(n => n.status === 'active');
  const filtered = (filter === 'all' ? active : active.filter(n => n.type === filter))
    .filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Brain size={20} style={{ display:'inline', marginRight:8 }} />BRAIN_OS</h1>
          <p className="page-subtitle">Second brain — Capture, conecte, evolua</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditNote(null); setDrawerOpen(true); }}><Plus size={14} /> Nova Nota</button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        <div className="card"><div className="card-title">Total</div><div className="card-value" style={{ marginTop:8 }}>{active.length}</div></div>
        <div className="card"><div className="card-title">Ideias</div><div className="card-value" style={{ marginTop:8, color:'var(--amber)' }}>{active.filter(n=>n.type==='idea').length}</div></div>
        <div className="card"><div className="card-title">Insights</div><div className="card-value" style={{ marginTop:8, color:'var(--coral)' }}>{active.filter(n=>n.type==='insight').length}</div></div>
        <div className="card"><div className="card-title">Aprendizados</div><div className="card-value" style={{ marginTop:8, color:'var(--green)' }}>{active.filter(n=>n.type==='learning').length}</div></div>
      </div>

      {/* Search + Filters */}
      <div style={{ marginBottom:16 }}>
        <div style={{ position:'relative', width:'100%', marginBottom:12 }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft:34, width:'100%' }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar notas..." />
        </div>
      </div>
      <div className="tabs" style={{ flexWrap:'wrap' }}>
        {['all','idea','insight','reflection','learning','problem'].map(f => (
          <button key={f} className={`tab ${filter===f?'active':''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Todas' : f === 'idea' ? 'Ideias' : f === 'insight' ? 'Insights' : f === 'reflection' ? 'Reflexões' : f === 'learning' ? 'Aprendizados' : 'Problemas'}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state"><Brain size={48} /><p>Nenhuma nota encontrada</p>
          <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => setDrawerOpen(true)}>Capturar pensamento</button>
        </div>
      )}

      <div className="grid-auto">
        {filtered.map(n => {
          const cfg = typeConfig[n.type] || typeConfig.idea;
          const Icon = cfg.icon;
          return (
            <div key={n.id} className="card card-glow">
              <div className="card-header">
                <span className={`badge ${cfg.badge}`}><Icon size={10} /> {n.type}</span>
                <div style={{ display:'flex', gap:4 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditNote(n); setDrawerOpen(true); }}><Edit2 size={12} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={() => archiveNote(n.id)}><Archive size={12} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteNote(n.id)}><Trash2 size={12} /></button>
                </div>
              </div>
              <h3 style={{ fontSize:14, fontWeight:600, marginBottom:6 }}>{n.title}</h3>
              {n.content && <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.6, marginBottom:8 }}>{n.content.slice(0,120)}{n.content.length > 120 ? '...' : ''}</p>}
              {n.tags && Array.isArray(n.tags) && n.tags.length > 0 && (
                <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                  {n.tags.map(t => <span key={t} className="badge badge-muted" style={{ fontSize:10 }}>#{t}</span>)}
                </div>
              )}
              <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:8 }}>{new Date(n.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          );
        })}
      </div>

      <NoteDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditNote(null); }} editNote={editNote} />
    </div>
  );
}
