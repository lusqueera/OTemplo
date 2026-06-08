import React, { useState, useEffect } from 'react';
import { useWorkoutStore } from 'src/store/stores';
import { useToastStore } from 'src/store/toastStore';
import { Dumbbell, Plus, X, Edit2, Trash2, Play, CheckCircle2, Clock, TrendingUp, ChevronDown, ChevronUp, Search, Zap, Eye, Loader2, BookOpen } from 'lucide-react';
import ExerciseBrowser, { ExerciseDetailModal } from 'src/modules/training/ExerciseBrowser';
import { DEFAULT_WORKOUT_TEMPLATES, fetchExercises } from 'src/modules/training/exerciseDbApi';

const muscleColors = {
  peito: 'var(--coral)', costas: 'var(--blue)', pernas: 'var(--green)',
  ombros: 'var(--amber)', biceps: 'var(--purple)', triceps: '#f472b6',
  core: 'var(--green)', cardio: 'var(--coral)', chest: 'var(--coral)',
  back: 'var(--blue)', shoulders: 'var(--amber)', 'upper arms': 'var(--purple)',
  'upper legs': 'var(--green)', 'lower legs': 'var(--green)', waist: 'var(--amber)',
  pectorals: 'var(--coral)', lats: 'var(--blue)', delts: 'var(--amber)',
  quads: 'var(--green)', glutes: 'var(--green)', hamstrings: 'var(--green)',
};

function WorkoutDrawer({ open, onClose, editWorkout }) {
  const { addWorkout, updateWorkout } = useWorkoutStore();
  const [form, setForm] = useState(editWorkout || { name: '', description: '', type: 'musculacao', exercises: [] });
  const [showBrowser, setShowBrowser] = useState(false);
  const [viewEx, setViewEx] = useState(null);

  useEffect(() => {
    setForm(editWorkout || { name: '', description: '', type: 'musculacao', exercises: [] });
    setShowBrowser(false);
  }, [editWorkout, open]);

  const addApiExercise = (ex) => {
    if (form.exercises.find(e => e.exerciseId === ex.exerciseId)) {
      useToastStore.getState().error('Exercício já adicionado');
      return;
    }
    setForm(f => ({
      ...f, exercises: [...f.exercises, {
        exerciseId: ex.exerciseId, name: ex.name, gifUrl: ex.gifUrl,
        muscle: ex.targetMuscles?.[0] || '', bodyPart: ex.bodyParts?.[0] || '',
        equipment: ex.equipments?.[0] || '', sets: 3, reps: 12, weight: 0, rest: 60,
        targetMuscles: ex.targetMuscles, secondaryMuscles: ex.secondaryMuscles,
        instructions: ex.instructions, equipments: ex.equipments, bodyParts: ex.bodyParts,
      }],
    }));
    useToastStore.getState().success(`"${ex.name}" adicionado`);
  };

  const removeEx = (idx) => setForm(f => ({ ...f, exercises: f.exercises.filter((_, i) => i !== idx) }));
  const updateEx = (idx, data) => setForm(f => ({ ...f, exercises: f.exercises.map((e, i) => i === idx ? { ...e, ...data } : e) }));

  const handleSave = () => {
    if (!form.name.trim()) { useToastStore.getState().error('Nome do treino é obrigatório'); return; }
    if (editWorkout?.id) { updateWorkout(editWorkout.id, form); useToastStore.getState().success('Treino atualizado'); }
    else { addWorkout(form); useToastStore.getState().success('Treino criado com sucesso'); }
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer animate-slide" style={{ width: showBrowser ? 720 : 420, maxWidth: '95vw' }}>
        <div className="drawer-title">
          <span>{editWorkout?.id ? 'Editar' : 'Novo'} Treino</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group"><label className="input-label">Nome do Treino</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Treino A — Peito/Tríceps" /></div>
          <div className="input-group"><label className="input-label">Descrição</label><input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Foco do treino..." /></div>
          <div className="input-group"><label className="input-label">Tipo</label>
            <select className="select-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="musculacao">Musculação</option><option value="funcional">Funcional</option>
              <option value="cardio">Cardio</option><option value="hiit">HIIT</option><option value="calistenia">Calistenia</option>
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="input-label">Exercícios ({form.exercises.length})</span>
              <button className="btn btn-primary btn-sm" onClick={() => setShowBrowser(!showBrowser)}>
                <Search size={12} /> {showBrowser ? 'Fechar Busca' : 'Buscar ExerciseDB'}
              </button>
            </div>

            {showBrowser && (
              <div style={{ marginBottom: 16, padding: 12, background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', maxHeight: 400, overflowY: 'auto' }}>
                <ExerciseBrowser onAddExercise={addApiExercise} embedded />
              </div>
            )}

            {form.exercises.map((ex, idx) => (
              <div key={idx} style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  {ex.gifUrl && <img src={ex.gifUrl} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</span>
                    {ex.muscle && <span className="badge badge-coral" style={{ fontSize: 8 }}>{ex.muscle}</span>}
                  </div>
                  <button className="btn btn-ghost btn-sm" title="Ver detalhes" onClick={() => setViewEx(ex)}><Eye size={12} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeEx(idx)}><X size={12} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8, overflow: 'hidden' }}>
                  <div className="input-group" style={{ minWidth: 0 }}><label className="input-label" style={{ fontSize: 9 }}>Séries</label><input className="input" type="number" style={{ width: '100%', minWidth: 0 }} value={ex.sets} onChange={e => updateEx(idx, { sets: parseInt(e.target.value) || 0 })} /></div>
                  <div className="input-group" style={{ minWidth: 0 }}><label className="input-label" style={{ fontSize: 9 }}>Reps</label><input className="input" type="number" style={{ width: '100%', minWidth: 0 }} value={ex.reps} onChange={e => updateEx(idx, { reps: parseInt(e.target.value) || 0 })} /></div>
                  <div className="input-group" style={{ minWidth: 0 }}><label className="input-label" style={{ fontSize: 9 }}>Peso (kg)</label><input className="input" type="number" style={{ width: '100%', minWidth: 0 }} value={ex.weight} onChange={e => updateEx(idx, { weight: parseFloat(e.target.value) || 0 })} /></div>
                  <div className="input-group" style={{ minWidth: 0 }}><label className="input-label" style={{ fontSize: 9 }}>Desc (s)</label><input className="input" type="number" style={{ width: '100%', minWidth: 0 }} value={ex.rest} onChange={e => updateEx(idx, { rest: parseInt(e.target.value) || 0 })} /></div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={handleSave}>{editWorkout?.id ? 'Salvar' : 'Criar Treino'}</button>
        </div>
      </div>
      {viewEx && <ExerciseDetailModal exercise={viewEx} onClose={() => setViewEx(null)} />}
    </>
  );
}

function LogWorkoutModal({ open, onClose, workout }) {
  const { logWorkout } = useWorkoutStore();
  const [exercises, setExercises] = useState((workout?.exercises || []).map(ex => ({ ...ex, completed: true, actualWeight: ex.weight, actualReps: ex.reps, notes: '' })));
  const [duration, setDuration] = useState(45);
  const [perception, setPerception] = useState('good');

  const handleLog = () => {
    logWorkout({ workoutId: workout.id, workoutName: workout.name, duration, perception, exercises });
    useToastStore.getState().success(`Treino "${workout.name}" registrado!`, 'Treino Concluído');
    onClose();
  };

  if (!open) return null;
  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-title">Registrar Treino — {workout?.name}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group"><label className="input-label">Duração (min)</label><input className="input" type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 0)} /></div>
            <div className="input-group"><label className="input-label">Percepção</label>
              <select className="select-input" value={perception} onChange={e => setPerception(e.target.value)}>
                <option value="excellent">Excelente</option><option value="good">Boa</option><option value="ok">OK</option><option value="bad">Ruim</option>
              </select>
            </div>
          </div>
          <div className="section-title" style={{ marginTop: 8, marginBottom: 0 }}>Exercícios</div>
          {exercises.map((ex, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              {ex.gifUrl && <img src={ex.gifUrl} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} />}
              <div className={`check-box ${ex.completed ? 'checked' : ''}`} style={{ width: 18, height: 18, cursor: 'pointer' }} onClick={() => {
                const updated = [...exercises]; updated[idx] = { ...updated[idx], completed: !updated[idx].completed }; setExercises(updated);
              }}>
                {ex.completed && <CheckCircle2 size={10} color="var(--text-inverse)" />}
              </div>
              <span style={{ fontSize: 12, flex: 1, opacity: ex.completed ? 1 : 0.4, textTransform: 'capitalize' }}>{ex.name}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{ex.sets}×{ex.reps} · {ex.weight}kg</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleLog}>Registrar</button>
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DefaultTemplatesSection({ onUseTemplate }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleUse = async (tpl) => {
    setLoadingId(tpl.id);
    try {
      // Busca exercícios de todos os bodyParts do template (não apenas o primeiro)
      const allExercises = [];
      for (const bp of tpl.bodyParts) {
        const res = await fetchExercises({ bodyParts: bp, limit: 50 });
        if (res?.data) allExercises.push(...res.data);
      }

      const mapped = tpl.defaultExercises.map(de => {
        // Matching melhorado: tenta por nome completo, depois por palavras individuais
        const searchWords = de.name.toLowerCase().split(' ');
        const match = allExercises.find(ae => {
          const apiName = ae.name.toLowerCase();
          // Match exato ou se o nome da API contém todas as palavras-chave
          return apiName === de.name.toLowerCase() || searchWords.every(w => apiName.includes(w));
        }) || allExercises.find(ae => {
          const apiName = ae.name.toLowerCase();
          // Fallback: qualquer exercício que contenha pelo menos a palavra principal (a mais longa)
          const mainWord = searchWords.reduce((a, b) => a.length >= b.length ? a : b, '');
          return mainWord.length >= 4 && apiName.includes(mainWord);
        });

        if (match) {
          return {
            exerciseId: match.exerciseId, name: match.name, gifUrl: match.gifUrl,
            muscle: match.targetMuscles?.[0] || '', bodyPart: match.bodyParts?.[0] || '',
            equipment: match.equipments?.[0] || '', sets: de.sets, reps: de.reps, weight: 0, rest: 60,
            targetMuscles: match.targetMuscles, secondaryMuscles: match.secondaryMuscles,
            instructions: match.instructions, equipments: match.equipments, bodyParts: match.bodyParts,
          };
        }
        return { name: de.name, muscle: de.bodyPart, bodyPart: de.bodyPart, sets: de.sets, reps: de.reps, weight: 0, rest: 60 };
      });
      onUseTemplate({ name: tpl.name, description: tpl.description, type: tpl.type, exercises: mapped });
    } catch {
      onUseTemplate({ name: tpl.name, description: tpl.description, type: tpl.type, exercises: tpl.defaultExercises.map(de => ({ name: de.name, muscle: de.bodyPart, bodyPart: de.bodyPart, sets: de.sets, reps: de.reps, weight: 0, rest: 60 })) });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <BookOpen size={16} color="var(--coral)" />
        <h2 style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Treinos Sugeridos</h2>
        <span className="badge badge-coral" style={{ fontSize: 9 }}>ExerciseDB</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {DEFAULT_WORKOUT_TEMPLATES.map(tpl => (
          <div key={tpl.id} className="card card-glow" style={{ padding: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${tpl.color}, ${tpl.color}40)` }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 24 }}>{tpl.icon}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700 }}>{tpl.name}</h3>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, marginTop: 2 }}>{tpl.description}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
              {tpl.targetMuscles.slice(0, 4).map(m => (
                <span key={m} className="badge" style={{ fontSize: 9, padding: '1px 6px', background: `${tpl.color}15`, color: tpl.color, border: `1px solid ${tpl.color}30` }}>{m}</span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
              {tpl.defaultExercises.length} exercícios · {tpl.type}
            </div>
            <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => handleUse(tpl)} disabled={!!loadingId}>
              {loadingId === tpl.id ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Carregando...</> : <><Zap size={12} /> Usar Template</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TrainingOS() {
  const { workouts, logs, deleteWorkout, deleteLog } = useWorkoutStore();
  const toast = useToastStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editWorkout, setEditWorkout] = useState(null);
  const [logModal, setLogModal] = useState(null);
  const [tab, setTab] = useState('workouts');
  const [expandedLog, setExpandedLog] = useState(null);
  const [viewEx, setViewEx] = useState(null);

  const totalLogs = logs.length;
  const totalMinutes = logs.reduce((a, l) => a + (l.duration || 0), 0);
  const thisWeek = logs.filter(l => { const d = new Date(l.date); return (new Date() - d) / 864e5 <= 7; }).length;
  const avgPerception = logs.length > 0 ? (() => {
    const v = { excellent: 5, good: 4, ok: 3, bad: 2 };
    return (logs.reduce((a, l) => a + (v[l.perception] || 3), 0) / logs.length).toFixed(1);
  })() : '—';

  const handleUseTemplate = (tplData) => {
    setEditWorkout(tplData);
    setDrawerOpen(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Dumbbell size={20} style={{ display: 'inline', marginRight: 8 }} />TRAINING_OS</h1>
          <p className="page-subtitle">Gestão de treinos com ExerciseDB — 1,500+ exercícios com GIFs</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditWorkout(null); setDrawerOpen(true); }}><Plus size={14} /> Novo Treino</button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card"><div className="card-title">Total treinos</div><div className="card-value" style={{ marginTop: 8 }}>{totalLogs}</div></div>
        <div className="card"><div className="card-title">Esta semana</div><div className="card-value" style={{ marginTop: 8, color: 'var(--green)' }}>{thisWeek}</div></div>
        <div className="card"><div className="card-title">Tempo total</div><div className="card-value" style={{ marginTop: 8, color: 'var(--coral)' }}>{totalMinutes}min</div></div>
        <div className="card"><div className="card-title">Percepção média</div><div className="card-value" style={{ marginTop: 8, color: 'var(--amber)' }}>{avgPerception}</div></div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'workouts' ? 'active' : ''}`} onClick={() => setTab('workouts')}>Treinos ({workouts.length})</button>
        <button className={`tab ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>Explorar Exercícios</button>
        <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>Histórico ({logs.length})</button>
      </div>

      {/* WORKOUTS TAB */}
      {tab === 'workouts' && (
        <>
          <DefaultTemplatesSection onUseTemplate={handleUseTemplate} />
          {workouts.length === 0 && (
            <div className="empty-state"><Dumbbell size={48} /><p>Nenhum treino criado. Use um template acima ou crie do zero!</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setDrawerOpen(true)}>Criar treino</button>
            </div>
          )}
          <div className="grid-auto">
            {workouts.map(w => (
              <div key={w.id} className="card card-glow">
                <div className="card-header">
                  <span className="badge badge-coral">{w.type}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditWorkout(w); setDrawerOpen(true); }}><Edit2 size={12} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => { deleteWorkout(w.id); toast.success('Treino removido'); }}><Trash2 size={12} /></button>
                  </div>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{w.name}</h3>
                {w.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{w.description}</p>}
                <div style={{ marginBottom: 12 }}>
                  {(w.exercises || []).map((ex, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', fontSize: 12, cursor: ex.gifUrl ? 'pointer' : 'default' }}
                      onClick={() => ex.gifUrl && setViewEx(ex)}>
                      {ex.gifUrl ? (
                        <img src={ex.gifUrl} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} />
                      ) : (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: muscleColors[ex.muscle] || 'var(--text-muted)', flexShrink: 0 }} />
                      )}
                      <span style={{ flex: 1, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{ex.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{ex.sets}×{ex.reps}</span>
                    </div>
                  ))}
                  {(!w.exercises || w.exercises.length === 0) && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sem exercícios</p>}
                </div>
                <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => setLogModal(w)}>
                  <Play size={12} /> Iniciar Treino
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* BROWSE TAB */}
      {tab === 'browse' && (
        <div style={{ marginTop: 8 }}>
          <ExerciseBrowser onAddExercise={(ex) => {
            toast.success(`Para adicionar "${ex.name}", crie ou edite um treino`);
          }} />
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === 'history' && (
        <>
          {logs.length === 0 && <div className="empty-state"><Clock size={48} /><p>Nenhum treino registrado</p></div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...logs].reverse().map(log => {
              const isExpanded = expandedLog === log.id;
              const percColor = { excellent: 'var(--green)', good: 'var(--blue)', ok: 'var(--amber)', bad: 'var(--coral)' };
              return (
                <div key={log.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setExpandedLog(isExpanded ? null : log.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--coral-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Dumbbell size={16} color="var(--coral)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{log.workoutName}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(log.date).toLocaleDateString('pt-BR')} · {log.duration}min</p>
                    </div>
                    <span className="badge" style={{ background: `${percColor[log.perception]}20`, color: percColor[log.perception] }}>{log.perception}</span>
                    {isExpanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                    <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); deleteLog(log.id); toast.success('Registro removido'); }}><Trash2 size={12} /></button>
                  </div>
                  {isExpanded && log.exercises && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                      {log.exercises.map((ex, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, opacity: ex.completed ? 1 : 0.4 }}>
                          {ex.gifUrl && <img src={ex.gifUrl} alt="" style={{ width: 22, height: 22, borderRadius: 3, objectFit: 'cover' }} />}
                          <CheckCircle2 size={12} color={ex.completed ? 'var(--green)' : 'var(--text-muted)'} />
                          <span style={{ flex: 1, textTransform: 'capitalize' }}>{ex.name}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{ex.sets}×{ex.reps} · {ex.weight}kg</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <WorkoutDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditWorkout(null); }} editWorkout={editWorkout} />
      {logModal && <LogWorkoutModal open={!!logModal} onClose={() => setLogModal(null)} workout={logModal} />}
      {viewEx && <ExerciseDetailModal exercise={viewEx} onClose={() => setViewEx(null)} />}
    </div>
  );
}
