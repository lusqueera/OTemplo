import React, { useState, useEffect } from 'react';
import { useHabitStore } from 'src/store/stores';
import { Repeat, Plus, X, Flame, Edit2, Trash2, CheckCircle2, Circle, Minus, TrendingUp } from 'lucide-react';

function HabitDrawer({ open, onClose, editHabit }) {
  const { addHabit, updateHabit } = useHabitStore();
  const [form, setForm] = useState(editHabit || { name: '', description: '', frequency: 'daily', time: '', duration: 15, energyLevel: 'medium', category: 'saude', difficulty: 'medium' });

  useEffect(() => {
    if (open) {
      setForm(editHabit || { name: '', description: '', frequency: 'daily', time: '', duration: 15, energyLevel: 'medium', category: 'saude', difficulty: 'medium' });
    }
  }, [editHabit, open]);

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editHabit?.id) { updateHabit(editHabit.id, form); } else { addHabit(form); }
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer animate-slide">
        <div className="drawer-title"><span>{editHabit?.id ? 'Editar' : 'Novo'} Hábito</span><button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group"><label className="input-label">Nome</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Meditação" /></div>
          <div className="input-group"><label className="input-label">Descrição</label><textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group"><label className="input-label">Frequência</label>
              <select className="select-input" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
                <option value="daily">Diário</option><option value="weekdays">Dias úteis</option><option value="3x">3x/semana</option><option value="weekly">Semanal</option>
              </select>
            </div>
            <div className="input-group"><label className="input-label">Horário Específico</label>
              <input className="input" type="time" value={form.time || ''} onChange={e => setForm({ ...form, time: e.target.value })} title="Opcional. Se preenchido, aparecerá na Timeline." />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group"><label className="input-label">Duração (min)</label><input className="input" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 0 })} /></div>
            <div className="input-group"><label className="input-label">Energia</label>
              <select className="select-input" value={form.energyLevel} onChange={e => setForm({ ...form, energyLevel: e.target.value })}>
                <option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option>
              </select>
            </div>
          </div>
          <div className="input-group"><label className="input-label">Categoria</label>
            <select className="select-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="saude">Saúde</option><option value="estudo">Estudo</option><option value="trabalho">Trabalho</option>
              <option value="mindset">Mindset</option><option value="social">Social</option><option value="outro">Outro</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>{editHabit?.id ? 'Salvar' : 'Criar Hábito'}</button>
        </div>
      </div>
    </>
  );
}

function Heatmap({ logs }) {
  const days = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLogs = logs.filter(l => l.date === dateStr);
    const done = dayLogs.filter(l => l.status === 'done').length;
    const level = done === 0 ? 0 : done <= 1 ? 1 : done <= 2 ? 2 : done <= 4 ? 3 : 4;
    days.push({ date: dateStr, level });
  }
  return (
    <div className="heatmap-grid">
      {days.map((d, i) => <div key={i} className={`heatmap-cell level-${d.level}`} title={d.date} />)}
    </div>
  );
}

export default function HabitOS() {
  const { habits, logs, logHabit, deleteHabit } = useHabitStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const today = new Date().toISOString().split('T')[0];
  const active = habits.filter(h => h.status === 'active');
  const todayLogs = logs.filter(l => l.date === today);
  const doneCount = todayLogs.filter(l => l.status === 'done').length;
  const rate = active.length > 0 ? Math.round((doneCount / active.length) * 100) : 0;

  // Calculate streaks
  const getStreak = (habitId) => {
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const log = logs.find(l => l.habitId === habitId && l.date === ds);
      if (log?.status === 'done') streak++;
      else break;
    }
    return streak;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Repeat size={20} style={{ display: 'inline', marginRight: 8 }} />HABIT_OS</h1>
          <p className="page-subtitle">Sistema de consistência adaptativa</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditHabit(null); setDrawerOpen(true); }}><Plus size={14} /> Novo Hábito</button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card"><div className="card-title">Hábitos ativos</div><div className="card-value" style={{ marginTop: 8 }}>{active.length}</div></div>
        <div className="card"><div className="card-title">Concluídos hoje</div><div className="card-value" style={{ marginTop: 8, color: 'var(--green)' }}>{doneCount}</div></div>
        <div className="card"><div className="card-title">Taxa de hoje</div><div className="card-value" style={{ marginTop: 8, color: 'var(--coral)' }}>{rate}%</div></div>
        <div className="card"><div className="card-title">Maior streak</div><div className="card-value" style={{ marginTop: 8, color: 'var(--amber)' }}>{active.length > 0 ? Math.max(...active.map(h => getStreak(h.id)), 0) : 0}</div></div>
      </div>

      {/* Heatmap */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><span className="card-title">Consistência (90 dias)</span></div>
        <Heatmap logs={logs} />
      </div>

      {/* Habit List */}
      <div className="section-title">Hábitos de Hoje</div>
      {active.length === 0 && (
        <div className="empty-state"><Repeat size={48} /><p>Nenhum hábito cadastrado</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setDrawerOpen(true)}>Criar primeiro hábito</button>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {active.map(h => {
          const log = todayLogs.find(l => l.habitId === h.id);
          const status = log?.status || 'none';
          const streak = getStreak(h.id);
          return (
            <div key={h.id} className="card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{h.name}</span>
                  {streak > 0 && <span className="badge badge-amber"><Flame size={10} /> {streak}d</span>}
                  <span className="badge badge-muted">{h.frequency}</span>
                </div>
                {h.description && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{h.description}</p>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className={`btn btn-sm ${status === 'done' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => logHabit(h.id, 'done')} title="Concluído"><CheckCircle2 size={14} /></button>
                <button className={`btn btn-sm ${status === 'partial' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => logHabit(h.id, 'partial')} style={status === 'partial' ? { background: 'var(--amber)', borderColor: 'var(--amber)' } : {}} title="Parcial"><Minus size={14} /></button>
                <button className={`btn btn-sm ${status === 'skipped' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => logHabit(h.id, 'skipped')} style={status === 'skipped' ? { background: 'var(--text-muted)', borderColor: 'var(--text-muted)' } : {}} title="Ignorado"><X size={14} /></button>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditHabit(h); setDrawerOpen(true); }}><Edit2 size={12} /></button>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteHabit(h.id)}><Trash2 size={12} /></button>
              </div>
            </div>
          );
        })}
      </div>

      <HabitDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditHabit(null); }} editHabit={editHabit} />
    </div>
  );
}
