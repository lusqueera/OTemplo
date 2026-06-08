import React, { useState, useEffect, useRef } from 'react';
import { useFocusStore } from 'src/store/stores';
import { Timer, Play, Pause, Square, Plus, X, Clock, Zap, TrendingUp } from 'lucide-react';

function SessionDrawer({ open, onClose }) {
  const { startSession } = useFocusStore();
  const [form, setForm] = useState({ task: '', duration: 25, type: 'deep_work', objective: '' });

  const handleStart = () => {
    if (!form.task.trim()) return;
    startSession({ ...form, plannedDuration: form.duration });
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer animate-slide">
        <div className="drawer-title"><span>Nova Sessão</span><button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group"><label className="input-label">Tarefa</label><input className="input" value={form.task} onChange={e => setForm({ ...form, task: e.target.value })} placeholder="No que vai focar?" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group"><label className="input-label">Duração (min)</label><input className="input" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 25 })} /></div>
            <div className="input-group"><label className="input-label">Tipo</label>
              <select className="select-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="deep_work">Deep Work</option><option value="study">Estudo</option><option value="creative">Criativo</option><option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="input-group"><label className="input-label">Objetivo</label><input className="input" value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })} placeholder="O que quer alcançar?" /></div>
          <button className="btn btn-primary" onClick={handleStart}><Play size={14} /> Iniciar Sessão</button>
        </div>
      </div>
    </>
  );
}

function EndSessionModal({ open, onEnd }) {
  const [form, setForm] = useState({ interruptions: 0, perception: 'good', quality: 4 });

  if (!open) return null;
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-title">Encerrar Sessão</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group"><label className="input-label">Interrupções</label><input className="input" type="number" min="0" value={form.interruptions} onChange={e => setForm({ ...form, interruptions: parseInt(e.target.value) || 0 })} /></div>
          <div className="input-group"><label className="input-label">Percepção</label>
            <select className="select-input" value={form.perception} onChange={e => setForm({ ...form, perception: e.target.value })}>
              <option value="excellent">Excelente</option><option value="good">Boa</option><option value="ok">OK</option><option value="bad">Ruim</option>
            </select>
          </div>
          <div className="input-group"><label className="input-label">Qualidade (1-5)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(q => (
                <button key={q} className={`btn ${form.quality === q ? 'btn-primary' : 'btn-secondary'} btn-icon`} onClick={() => setForm({ ...form, quality: q })}>{q}</button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => onEnd(form)}>Finalizar</button>
        </div>
      </div>
    </div>
  );
}

function ActiveTimer({ session }) {
  const { endSession, cancelSession } = useFocusStore();
  const [elapsed, setElapsed] = useState(0);
  const [showEnd, setShowEnd] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!session) return;
    const start = new Date(session.startTime).getTime();
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [session]);

  if (!session) return null;

  const planned = (session.plannedDuration || 25) * 60;
  const progress = Math.min((elapsed / planned) * 100, 100);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const r = 80; const c = 2 * Math.PI * r;
  const offset = c - (progress / 100) * c;

  return (
    <>
      <div className="card" style={{ textAlign: 'center', padding: 32, border: '1px solid var(--border-glow)' }}>
        <div className="card-title" style={{ color: 'var(--coral)', marginBottom: 16 }}>▸ SESSÃO ATIVA</div>
        <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{session.task}</p>
        <span className="badge badge-muted" style={{ marginBottom: 24, display: 'inline-flex' }}>{session.type}</span>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
          <svg width={180} height={180} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={90} cy={90} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="6" />
            <circle cx={90} cy={90} r={r} fill="none" stroke="var(--coral)" strokeWidth="6" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div style={{ position: 'absolute', marginTop: 60 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 700 }}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>/ {session.plannedDuration || 25}min</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => setShowEnd(true)}><Square size={14} /> Encerrar</button>
          <button className="btn btn-secondary" onClick={cancelSession}>Cancelar</button>
        </div>
      </div>
      <EndSessionModal open={showEnd} onEnd={(result) => { endSession(result); setShowEnd(false); }} />
    </>
  );
}

export default function FocusOS() {
  const { sessions, activeSession } = useFocusStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalMinutes = sessions.reduce((acc, s) => {
    if (!s.startTime || !s.endTime) return acc;
    return acc + (new Date(s.endTime) - new Date(s.startTime)) / 60000;
  }, 0);
  const avgQuality = sessions.length > 0 ? (sessions.reduce((a, s) => a + (s.quality || 0), 0) / sessions.length).toFixed(1) : '—';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Timer size={20} style={{ display: 'inline', marginRight: 8 }} />FOCUS_OS</h1>
          <p className="page-subtitle">Execução profunda</p>
        </div>
        {!activeSession && <button className="btn btn-primary" onClick={() => setDrawerOpen(true)}><Play size={14} /> Nova Sessão</button>}
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card"><div className="card-title">Tempo total</div><div className="card-value" style={{ marginTop: 8 }}>{Math.round(totalMinutes)}min</div></div>
        <div className="card"><div className="card-title">Sessões</div><div className="card-value" style={{ marginTop: 8 }}>{sessions.length}</div></div>
        <div className="card"><div className="card-title">Qualidade média</div><div className="card-value" style={{ marginTop: 8, color: 'var(--green)' }}>{avgQuality}</div></div>
      </div>

      {activeSession && <ActiveTimer session={activeSession} />}

      {!activeSession && (
        <>
          <div className="section-title">Histórico</div>
          {sessions.length === 0 && (
            <div className="empty-state"><Zap size={48} /><p>Nenhuma sessão registrada</p></div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...sessions].reverse().slice(0, 20).map(s => (
              <div key={s.id} className="card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <Clock size={16} color="var(--text-muted)" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{s.task}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(s.startTime).toLocaleDateString('pt-BR')} · {s.type}</p>
                </div>
                <span className="badge badge-muted">{s.plannedDuration || '?'}min</span>
                {s.quality && <span className="badge badge-green">Q{s.quality}</span>}
              </div>
            ))}
          </div>
        </>
      )}

      <SessionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
