import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, X, Plus, Eye, Dumbbell } from 'lucide-react';
import { fetchExercises, fetchAllBodyParts, fetchAllMuscles, fetchAllEquipments } from './exerciseDbApi';

const bodyPartEmoji = {
  back: '🔙', cardio: '❤️', chest: '💪', 'lower arms': '💪', 'lower legs': '🦵',
  neck: '🦒', shoulders: '🏋️', 'upper arms': '💪', 'upper legs': '🦵', waist: '🔥',
};

function ExerciseDetailModal({ exercise, onClose, onAdd }) {
  if (!exercise) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, textTransform: 'capitalize', marginBottom: 4 }}>{exercise.name}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {exercise.bodyParts?.map(bp => (
                <span key={bp} className="badge badge-coral" style={{ fontSize: 10 }}>{bp}</span>
              ))}
              {exercise.equipments?.map(eq => (
                <span key={eq} className="badge badge-blue" style={{ fontSize: 10 }}>{eq}</span>
              ))}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* GIF Preview */}
        <div style={{
          background: 'var(--bg-deep)', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          marginBottom: 20, display: 'flex', justifyContent: 'center', alignItems: 'center',
          border: '1px solid var(--border-subtle)', minHeight: 200,
        }}>
          <img
            src={exercise.gifUrl}
            alt={exercise.name}
            style={{ width: '100%', maxWidth: 320, height: 'auto', display: 'block' }}
            loading="lazy"
          />
        </div>

        {/* Muscles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ padding: 12, background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Músculos Alvo</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {exercise.targetMuscles?.map(m => (
                <span key={m} className="badge badge-coral" style={{ fontSize: 10 }}>{m}</span>
              ))}
            </div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Secundários</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {exercise.secondaryMuscles?.map(m => (
                <span key={m} className="badge badge-purple" style={{ fontSize: 10 }}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        {exercise.instructions?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Instruções</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {exercise.instructions.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', background: 'var(--coral-dim)', color: 'var(--coral)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700,
                    fontFamily: 'var(--font-mono)', flexShrink: 0, marginTop: 1,
                  }}>{i + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {onAdd && (
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { onAdd(exercise); onClose(); }}>
            <Plus size={14} /> Adicionar ao Treino
          </button>
        )}
      </div>
    </div>
  );
}

export default function ExerciseBrowser({ onAddExercise, embedded = false }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [bodyParts, setBodyParts] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [detailExercise, setDetailExercise] = useState(null);
  const [cursors, setCursors] = useState({ next: null, prev: null, hasNext: false, hasPrev: false });
  const [total, setTotal] = useState(0);

  // Load metadata on mount
  useEffect(() => {
    fetchAllBodyParts().then(r => { if (r?.data) setBodyParts(r.data.map(d => d.name)); }).catch(() => {});
    fetchAllEquipments().then(r => { if (r?.data) setEquipments(r.data.map(d => d.name)); }).catch(() => {});
  }, []);

  const loadExercises = useCallback(async (after, before) => {
    setLoading(true);
    setError(null);
    try {
      const filters = { limit: 12, after, before };
      if (searchTerm.trim()) filters.name = searchTerm.trim();
      if (selectedBodyPart) filters.bodyParts = selectedBodyPart;
      if (selectedEquipment) filters.equipments = selectedEquipment;

      const res = await fetchExercises(filters);
      if (res?.data) {
        setExercises(res.data);
        setTotal(res.meta?.total || 0);
        setCursors({
          next: res.meta?.nextCursor || null,
          prev: res.meta?.previousCursor || null,
          hasNext: res.meta?.hasNextPage || false,
          hasPrev: res.meta?.hasPreviousPage || false,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedBodyPart, selectedEquipment]);

  useEffect(() => {
    loadExercises();
  }, [selectedBodyPart, selectedEquipment]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadExercises();
  };

  const containerStyle = embedded ? {} : { padding: 0 };

  return (
    <div style={containerStyle}>
      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input"
            placeholder="Buscar exercícios... (ex: bench press, squat)"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-sm">
          <Search size={12} /> Buscar
        </button>
        <button type="button" className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowFilters(!showFilters)}>
          <Filter size={12} />
        </button>
      </form>

      {/* Filters */}
      {showFilters && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, padding: 16, background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div className="input-group">
            <label className="input-label">Parte do Corpo</label>
            <select className="select-input" value={selectedBodyPart} onChange={e => setSelectedBodyPart(e.target.value)}>
              <option value="">Todas</option>
              {bodyParts.map(bp => <option key={bp} value={bp}>{bp}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Equipamento</label>
            <select className="select-input" value={selectedEquipment} onChange={e => setSelectedEquipment(e.target.value)}>
              <option value="">Todos</option>
              {equipments.map(eq => <option key={eq} value={eq}>{eq}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Results count */}
      {total > 0 && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
          {total} exercícios encontrados
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Loader2 size={28} color="var(--coral)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: 16, background: 'var(--red-dim)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 'var(--radius-md)', color: 'var(--red)', fontSize: 12, marginBottom: 16 }}>
          {error}
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={() => loadExercises()}>Tentar novamente</button>
        </div>
      )}

      {/* Exercise Grid */}
      {!loading && exercises.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {exercises.map(ex => (
            <div key={ex.exerciseId} className="card" style={{
              padding: 0, overflow: 'hidden', cursor: 'pointer',
              transition: 'all 0.2s ease', position: 'relative',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--coral)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = ''; }}
            >
              {/* GIF Thumbnail */}
              <div style={{
                background: 'var(--bg-deep)', height: 160, display: 'flex',
                alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                borderBottom: '1px solid var(--border-subtle)', position: 'relative',
              }}>
                <img
                  src={ex.gifUrl}
                  alt={ex.name}
                  loading="lazy"
                  style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                />
                {/* Hover overlay */}
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: 0, transition: 'opacity 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                >
                  <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); setDetailExercise(ex); }}>
                    <Eye size={12} /> Ver
                  </button>
                  {onAddExercise && (
                    <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); onAddExercise(ex); }}>
                      <Plus size={12} /> Adicionar
                    </button>
                  )}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '10px 14px' }} onClick={() => setDetailExercise(ex)}>
                <h4 style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize', marginBottom: 6, lineHeight: 1.3 }}>{ex.name}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {ex.targetMuscles?.slice(0, 2).map(m => (
                    <span key={m} className="badge badge-coral" style={{ fontSize: 9, padding: '1px 6px' }}>{m}</span>
                  ))}
                  {ex.equipments?.slice(0, 1).map(eq => (
                    <span key={eq} className="badge badge-muted" style={{ fontSize: 9, padding: '1px 6px' }}>{eq}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && exercises.length === 0 && !error && (
        <div className="empty-state">
          <Dumbbell size={48} />
          <p>Busque exercícios por nome, parte do corpo ou equipamento</p>
        </div>
      )}

      {/* Pagination */}
      {(cursors.hasNext || cursors.hasPrev) && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
          <button className="btn btn-secondary btn-sm" disabled={!cursors.hasPrev} onClick={() => loadExercises(undefined, cursors.prev)}>
            <ChevronLeft size={14} /> Anterior
          </button>
          <button className="btn btn-secondary btn-sm" disabled={!cursors.hasNext} onClick={() => loadExercises(cursors.next)}>
            Próximo <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {detailExercise && (
        <ExerciseDetailModal
          exercise={detailExercise}
          onClose={() => setDetailExercise(null)}
          onAdd={onAddExercise}
        />
      )}
    </div>
  );
}

export { ExerciseDetailModal };
