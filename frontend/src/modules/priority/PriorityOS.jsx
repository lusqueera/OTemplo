import React, { useState } from 'react';
import { usePriorityStore } from 'src/store/stores';
import { Target, Plus, X, ChevronRight, Edit2, Trash2, CheckCircle2, Pause, Archive, TrendingUp } from 'lucide-react';

function ObjectiveDrawer({ open, onClose, editObj }) {
  const { addObjective, updateObjective } = usePriorityStore();
  const [form, setForm] = useState(editObj || { title: '', description: '', category: 'trabalho', deadline: '', priority: 'high', motivation: '', difficulty: 'medium', tags: '' });

  const handleSave = () => {
    if (!form.title.trim()) return;
    const data = { ...form, tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags };
    if (editObj?.id) { updateObjective(editObj.id, data); } else { addObjective(data); }
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer animate-slide">
        <div className="drawer-title">
          <span>{editObj?.id ? 'Editar' : 'Novo'} Objetivo</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group"><label className="input-label">Título</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Dominar React" /></div>
          <div className="input-group"><label className="input-label">Descrição</label><textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descreva o objetivo..." /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group"><label className="input-label">Categoria</label>
              <select className="select-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="trabalho">Trabalho</option><option value="saude">Saúde</option><option value="estudo">Estudo</option>
                <option value="financas">Finanças</option><option value="pessoal">Pessoal</option>
              </select>
            </div>
            <div className="input-group"><label className="input-label">Prazo</label><input className="input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group"><label className="input-label">Prioridade</label>
              <select className="select-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="critical">Crítica</option><option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa</option>
              </select>
            </div>
            <div className="input-group"><label className="input-label">Dificuldade</label>
              <select className="select-input" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                <option value="easy">Fácil</option><option value="medium">Média</option><option value="hard">Difícil</option><option value="extreme">Extrema</option>
              </select>
            </div>
          </div>
          <div className="input-group"><label className="input-label">Motivação</label><textarea className="input" value={form.motivation} onChange={e => setForm({ ...form, motivation: e.target.value })} placeholder="Por que isso importa?" /></div>
          <div className="input-group"><label className="input-label">Tags</label><input className="input" value={typeof form.tags === 'string' ? form.tags : form.tags?.join(', ')} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="react, frontend, carreira" /></div>
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={handleSave}>{editObj?.id ? 'Salvar' : 'Criar Objetivo'}</button>
        </div>
      </div>
    </>
  );
}

function TaskDrawer({ open, onClose, objectiveId }) {
  const { addTask } = usePriorityStore();
  const [form, setForm] = useState({ title: '', priority: 'medium', dueDate: '' });

  const handleSave = () => {
    if (!form.title.trim()) return;
    addTask({ ...form, objectiveId });
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer animate-slide">
        <div className="drawer-title"><span>Nova Tarefa</span><button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group"><label className="input-label">Título</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Tarefa..." /></div>
          <div className="input-group"><label className="input-label">Prioridade</label>
            <select className="select-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa</option>
            </select>
          </div>
          <div className="input-group"><label className="input-label">Prazo</label><input className="input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
          <button className="btn btn-primary" onClick={handleSave}>Criar Tarefa</button>
        </div>
      </div>
    </>
  );
}

const priorityColors = { critical: 'var(--red)', high: 'var(--coral)', medium: 'var(--amber)', low: 'var(--text-muted)' };
const statusBadge = { active: 'badge-coral', paused: 'badge-amber', completed: 'badge-green', pending: 'badge-muted' };

export default function PriorityOS() {
  const { objectives, milestones, tasks, updateObjective, deleteObjective, updateTask, deleteTask, addMilestone, updateMilestone } = usePriorityStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editObj, setEditObj] = useState(null);
  const [taskDrawer, setTaskDrawer] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedObj, setExpandedObj] = useState(null);

  const filtered = filter === 'all' ? objectives : objectives.filter(o => o.status === filter);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Target size={20} style={{ display: 'inline', marginRight: 8 }} />PRIORITY_OS</h1>
          <p className="page-subtitle">Gestão estratégica de objetivos</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditObj(null); setDrawerOpen(true); }}><Plus size={14} /> Novo Objetivo</button>
      </div>

      <div className="tabs">
        {['all', 'active', 'paused', 'completed'].map(f => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Todos' : f === 'active' ? 'Ativos' : f === 'paused' ? 'Pausados' : 'Concluídos'} ({f === 'all' ? objectives.length : objectives.filter(o => o.status === f).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state"><Target size={48} /><p>Nenhum objetivo {filter !== 'all' ? filter : ''} encontrado</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setEditObj(null); setDrawerOpen(true); }}>Criar primeiro objetivo</button>
        </div>
      )}

      <div className="grid-auto">
        {filtered.map(obj => {
          const objTasks = tasks.filter(t => t.objectiveId === obj.id);
          const doneTasks = objTasks.filter(t => t.status === 'completed').length;
          const progress = objTasks.length > 0 ? Math.round((doneTasks / objTasks.length) * 100) : 0;
          const isExpanded = expandedObj === obj.id;

          return (
            <div key={obj.id} className="card card-glow" style={{ cursor: 'pointer' }} onClick={() => setExpandedObj(isExpanded ? null : obj.id)}>
              <div className="card-header">
                <span className={`badge ${statusBadge[obj.status]}`}>{obj.status}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setEditObj(obj); setDrawerOpen(true); }}><Edit2 size={12} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); deleteObjective(obj.id); }}><Trash2 size={12} /></button>
                </div>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{obj.title}</h3>
              {obj.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>{obj.description.slice(0, 80)}{obj.description.length > 80 ? '...' : ''}</p>}
              <div className="progress-bar" style={{ marginBottom: 8 }}><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                <span>{doneTasks}/{objTasks.length} tarefas</span>
                <span style={{ color: priorityColors[obj.priority] }}>{obj.priority}</span>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 16, borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className="card-title">Tarefas</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => setTaskDrawer(obj.id)}><Plus size={12} /> Task</button>
                  </div>
                  {objTasks.map(t => (
                    <div key={t.id} className={`check-item ${t.status === 'completed' ? 'done' : ''}`}>
                      <div className={`check-box ${t.status === 'completed' ? 'checked' : ''}`} onClick={() => updateTask(t.id, { status: t.status === 'completed' ? 'pending' : 'completed' })}>
                        {t.status === 'completed' && <CheckCircle2 size={12} color="var(--text-inverse)" />}
                      </div>
                      <span className="check-item-text" style={{ fontSize: 12 }}>{t.title}</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteTask(t.id)}><X size={10} /></button>
                    </div>
                  ))}
                  {objTasks.length === 0 && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Nenhuma tarefa ainda</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ObjectiveDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditObj(null); }} editObj={editObj} />
      <TaskDrawer open={!!taskDrawer} onClose={() => setTaskDrawer(null)} objectiveId={taskDrawer} />
    </div>
  );
}
