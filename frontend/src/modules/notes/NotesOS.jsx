import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { FileText, Plus, X, Search, Star, Edit3, Trash2, Clock, ArrowUpDown, Tag, ChevronDown, SortAsc, SortDesc, Heart, Filter, FolderOpen, PenLine, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotesStore } from 'src/store/stores';

const SORT_OPTIONS = [
  { key: 'newest', label: 'Mais recentes', field: 'createdAt', dir: 'desc' },
  { key: 'oldest', label: 'Mais antigos', field: 'createdAt', dir: 'asc' },
  { key: 'updated', label: 'Última edição', field: 'updatedAt', dir: 'desc' },
  { key: 'alpha', label: 'A → Z', field: 'title', dir: 'asc' },
  { key: 'alpha-desc', label: 'Z → A', field: 'title', dir: 'desc' },
];

const CATEGORY_COLORS = {
  'Pessoal': 'var(--blue)',
  'Trabalho': 'var(--coral)',
  'Estudos': 'var(--green)',
  'Projetos': 'var(--purple)',
  'Ideias': 'var(--amber)',
  'Lembretes': '#f472b6',
};

function getRelativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Agora';
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d atrás`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ===== NOTE EDITOR (Drawer with auto-save) =====
function NoteEditor({ note, onClose }) {
  const { addNote, updateNote, categories } = useNotesStore();
  const isNew = !note?.id;
  const [form, setForm] = useState({
    title: note?.title || '',
    content: note?.content || '',
    category: note?.category || '',
    favorite: note?.favorite || false,
  });
  const [saved, setSaved] = useState(false);
  const saveTimerRef = useRef(null);
  const hasChanges = useRef(false);

  // Auto-save for existing notes
  const doSave = useCallback(() => {
    if (!note?.id || !hasChanges.current) return;
    if (!form.title.trim() && !form.content.trim()) return;
    updateNote(note.id, form);
    setSaved(true);
    hasChanges.current = false;
    setTimeout(() => setSaved(false), 1500);
  }, [note?.id, form, updateNote]);

  useEffect(() => {
    if (!note?.id) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(doSave, 1200);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [form, doSave, note?.id]);

  const handleChange = (field, value) => {
    hasChanges.current = true;
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = () => {
    if (!form.title.trim()) return;
    addNote(form);
    onClose();
  };

  const handleClose = () => {
    // Save any pending changes before closing
    if (note?.id && hasChanges.current) {
      if (form.title.trim() || form.content.trim()) {
        updateNote(note.id, form);
      }
    }
    onClose();
  };

  return (
    <>
      <motion.div className="drawer-overlay" onClick={handleClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div className="drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--purple-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PenLine size={15} color="var(--purple)" />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
              {isNew ? 'Nova Anotação' : 'Editar'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AnimatePresence>
              {saved && (
                <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                  style={{ fontSize: 11, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)' }}>
                  <Check size={12} /> Salvo
                </motion.span>
              )}
            </AnimatePresence>
            <button className="btn btn-ghost btn-icon" onClick={handleClose}><X size={18} /></button>
          </div>
        </div>

        {/* Form */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title */}
          <input
            className="input"
            value={form.title}
            onChange={e => handleChange('title', e.target.value)}
            placeholder="Título da anotação..."
            style={{ fontSize: 18, fontWeight: 600, padding: '14px 16px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-subtle)' }}
            autoFocus
          />

          {/* Category selector + Favorite toggle */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="select-input"
              value={form.category}
              onChange={e => handleChange('category', e.target.value)}
              style={{ flex: 1, minWidth: 130 }}
            >
              <option value="">Sem categoria</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              className={`btn btn-sm ${form.favorite ? '' : 'btn-secondary'}`}
              onClick={() => handleChange('favorite', !form.favorite)}
              style={form.favorite ? { background: 'var(--amber-dim)', color: 'var(--amber)', border: '1px solid rgba(240,165,0,0.3)' } : {}}
            >
              <Star size={13} fill={form.favorite ? 'var(--amber)' : 'none'} />
              {form.favorite ? 'Favorita' : 'Favoritar'}
            </button>
          </div>

          {/* Content */}
          <div className="input-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label className="input-label">Conteúdo</label>
            <textarea
              className="input"
              value={form.content}
              onChange={e => handleChange('content', e.target.value)}
              placeholder="Escreva suas anotações aqui..."
              style={{ flex: 1, minHeight: 240, resize: 'vertical', lineHeight: 1.7, fontSize: 13 }}
            />
          </div>

          {/* Meta info (edit mode) */}
          {!isNew && note && (
            <div style={{ padding: '12px 0', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={10} /> Criada: {formatDate(note.createdAt)}
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Edit3 size={10} /> Editada: {formatDate(note.updatedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Action button (create mode only) */}
        {isNew && (
          <div style={{ flexShrink: 0, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }} onClick={handleCreate} disabled={!form.title.trim()}>
              <Plus size={14} /> Criar Anotação
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}

// ===== NOTE CARD =====
function NoteCard({ note, onEdit, onDelete, onToggleFav, index }) {
  const catColor = CATEGORY_COLORS[note.category] || 'var(--text-muted)';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
      className="card card-glow"
      style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
      onClick={() => onEdit(note)}
    >
      {/* Favorite star */}
      {note.favorite && (
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <Star size={14} fill="var(--amber)" color="var(--amber)" />
        </div>
      )}

      {/* Category color bar */}
      {note.category && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: catColor, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }} />
      )}

      {/* Title */}
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, paddingRight: note.favorite ? 24 : 0, lineHeight: 1.4 }}>
        {note.title || 'Sem título'}
      </h3>

      {/* Content preview */}
      {note.content && (
        <p style={{
          fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {note.content}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {note.category && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 'var(--radius-full)',
              background: `${catColor}12`, color: catColor, fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)'
            }}>
              <Tag size={9} /> {note.category}
            </span>
          )}
          <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={9} /> {getRelativeTime(note.updatedAt || note.createdAt)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
          <button className="btn btn-ghost btn-sm" onClick={() => onToggleFav(note.id)} title={note.favorite ? 'Remover favorito' : 'Favoritar'}
            style={{ padding: '4px 6px' }}>
            <Star size={12} fill={note.favorite ? 'var(--amber)' : 'none'} color={note.favorite ? 'var(--amber)' : 'var(--text-muted)'} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => onDelete(note.id)} title="Excluir"
            style={{ padding: '4px 6px' }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ===== DELETE CONFIRMATION MODAL =====
function DeleteModal({ onConfirm, onCancel }) {
  return (
    <>
      <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}>
        <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()} style={{ maxWidth: 380, textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--red-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <AlertCircle size={24} color="var(--red)" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Excluir Anotação?</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Essa ação não pode ser desfeita.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel}>Cancelar</button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={onConfirm}>Excluir</button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

// ===== MAIN COMPONENT =====
export default function NotesOS() {
  const { notes, categories, deleteNote, toggleFavorite } = useNotesStore();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterFav, setFilterFav] = useState(false);
  const [sortKey, setSortKey] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const sortMenuRef = useRef(null);

  // Close sort menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) setShowSortMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filtered & sorted notes
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q) ||
        n.category?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter(n => n.category === filterCategory);
    }

    // Favorites filter
    if (filterFav) {
      result = result.filter(n => n.favorite);
    }

    // Sort
    const sortOpt = SORT_OPTIONS.find(s => s.key === sortKey) || SORT_OPTIONS[0];
    result.sort((a, b) => {
      // Favorites always first
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;

      let va = a[sortOpt.field] || '';
      let vb = b[sortOpt.field] || '';
      if (sortOpt.field === 'title') {
        va = va.toLowerCase();
        vb = vb.toLowerCase();
      }
      if (sortOpt.dir === 'desc') return va > vb ? -1 : va < vb ? 1 : 0;
      return va < vb ? -1 : va > vb ? 1 : 0;
    });

    return result;
  }, [notes, search, filterCategory, filterFav, sortKey]);

  const openEditor = (note) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) { deleteNote(deleteId); setDeleteId(null); }
  };

  const favCount = notes.filter(n => n.favorite).length;
  const currentSort = SORT_OPTIONS.find(s => s.key === sortKey);
  const catCounts = useMemo(() => {
    const map = {};
    notes.forEach(n => { const c = n.category || 'Sem categoria'; map[c] = (map[c] || 0) + 1; });
    return map;
  }, [notes]);

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileText size={20} style={{ display: 'inline', marginRight: 8 }} />
            NOTES_OS
          </h1>
          <p className="page-subtitle">Suas anotações — organize, registre, consulte</p>
        </div>
        <button className="btn btn-primary" onClick={() => openEditor(null)}>
          <Plus size={14} /> Nova Anotação
        </button>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">Total</div>
          <div className="card-value" style={{ marginTop: 8 }}>{notes.length}</div>
        </div>
        <div className="card">
          <div className="card-title">Favoritas</div>
          <div className="card-value" style={{ marginTop: 8, color: 'var(--amber)' }}>{favCount}</div>
        </div>
        <div className="card">
          <div className="card-title">Categorias</div>
          <div className="card-value" style={{ marginTop: 8, color: 'var(--purple)' }}>
            {Object.keys(catCounts).length}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Esta semana</div>
          <div className="card-value" style={{ marginTop: 8, color: 'var(--green)' }}>
            {notes.filter(n => {
              const d = new Date(n.createdAt);
              const now = new Date();
              return (now - d) < 7 * 86400000;
            }).length}
          </div>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: 34, width: '100%' }} value={search}
            onChange={e => setSearch(e.target.value)} placeholder="Buscar anotações..." />
        </div>

        {/* Category filter */}
        <select className="select-input" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          style={{ minWidth: 130 }}>
          <option value="all">Todas categorias</option>
          {categories.map(c => <option key={c} value={c}>{c} ({catCounts[c] || 0})</option>)}
        </select>

        {/* Favorites toggle */}
        <button className={`btn btn-sm ${filterFav ? '' : 'btn-secondary'}`}
          onClick={() => setFilterFav(!filterFav)}
          style={filterFav ? { background: 'var(--amber-dim)', color: 'var(--amber)', border: '1px solid rgba(240,165,0,0.3)' } : {}}>
          <Star size={12} fill={filterFav ? 'var(--amber)' : 'none'} /> Favoritas
        </button>

        {/* Sort dropdown */}
        <div ref={sortMenuRef} style={{ position: 'relative' }}>
          <button className="btn btn-sm btn-secondary" onClick={() => setShowSortMenu(!showSortMenu)}>
            <ArrowUpDown size={12} /> {currentSort?.label}
            <ChevronDown size={10} style={{ transform: showSortMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          <AnimatePresence>
            {showSortMenu && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 4, background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 10, minWidth: 170
                }}>
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.key} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                    width: '100%', textAlign: 'left', fontSize: 12, color: sortKey === opt.key ? 'var(--coral)' : 'var(--text-secondary)',
                    background: sortKey === opt.key ? 'var(--coral-dim)' : 'transparent', transition: 'all 0.15s'
                  }}
                    onMouseEnter={e => { if (sortKey !== opt.key) e.target.style.background = 'var(--bg-elevated)'; }}
                    onMouseLeave={e => { if (sortKey !== opt.key) e.target.style.background = 'transparent'; }}
                    onClick={() => { setSortKey(opt.key); setShowSortMenu(false); }}>
                    {opt.dir === 'asc' ? <SortAsc size={12} /> : <SortDesc size={12} />}
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Active filters display */}
      {(filterCategory !== 'all' || filterFav || search) && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Filtros:</span>
          {search && (
            <span className="badge badge-muted" style={{ cursor: 'pointer', fontSize: 10 }} onClick={() => setSearch('')}>
              "{search}" ✕
            </span>
          )}
          {filterCategory !== 'all' && (
            <span className="badge badge-purple" style={{ cursor: 'pointer', fontSize: 10 }} onClick={() => setFilterCategory('all')}>
              {filterCategory} ✕
            </span>
          )}
          {filterFav && (
            <span className="badge badge-amber" style={{ cursor: 'pointer', fontSize: 10 }} onClick={() => setFilterFav(false)}>
              Favoritas ✕
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            · {filteredNotes.length} resultado{filteredNotes.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Notes grid */}
      {filteredNotes.length === 0 ? (
        <div className="empty-state" style={{ padding: 60 }}>
          <FileText size={48} />
          {notes.length === 0 ? (
            <>
              <h3 style={{ marginTop: 16, fontSize: 16, fontWeight: 600 }}>Nenhuma anotação ainda</h3>
              <p style={{ marginTop: 8 }}>Crie sua primeira anotação para começar a organizar suas ideias.</p>
              <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => openEditor(null)}>
                <Plus size={14} /> Criar Primeira Anotação
              </button>
            </>
          ) : (
            <>
              <p style={{ marginTop: 16 }}>Nenhuma anotação encontrada com os filtros atuais.</p>
              <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => { setSearch(''); setFilterCategory('all'); setFilterFav(false); }}>
                Limpar filtros
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid-auto">
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note, i) => (
              <NoteCard
                key={note.id}
                note={note}
                index={i}
                onEdit={openEditor}
                onDelete={(id) => setDeleteId(id)}
                onToggleFav={toggleFavorite}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Editor drawer */}
      <AnimatePresence>
        {editorOpen && (
          <NoteEditor
            note={editingNote}
            onClose={() => { setEditorOpen(false); setEditingNote(null); }}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteId && (
          <DeleteModal onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
