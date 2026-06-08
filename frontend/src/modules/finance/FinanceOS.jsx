import React, { useState, useMemo, useEffect } from 'react';
import { useFinanceStore } from 'src/store/stores';
import { Wallet, Plus, X, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Upload, Tags } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CsvImportModal from 'src/components/CsvImportModal';

const FINANCE_CSV_FIELDS = [
  { key: 'type', label: 'Tipo', required: true, aliases: ['tipo', 'type', 'natureza', 'operacao', 'operação'] },
  { key: 'amount', label: 'Valor', required: true, type: 'number', aliases: ['valor', 'amount', 'value', 'quantia', 'preco', 'preço', 'total'] },
  { key: 'category', label: 'Categoria', required: false, aliases: ['categoria', 'category', 'cat', 'grupo'] },
  { key: 'description', label: 'Descrição', required: false, aliases: ['descricao', 'descrição', 'description', 'desc', 'nome', 'name', 'titulo', 'título'] },
  { key: 'date', label: 'Data', required: false, aliases: ['data', 'date', 'dia', 'dt', 'vencimento'], defaultValue: new Date().toISOString().split('T')[0] },
  { key: 'recurrence', label: 'Recorrência', required: false, aliases: ['recorrencia', 'recorrência', 'recurrence', 'frequencia', 'frequência'], defaultValue: 'none' },
  { key: 'tags', label: 'Tags', required: false, aliases: ['tags', 'etiquetas', 'labels'] },
];

function TransactionDrawer({ open, onClose, editTx }) {
  const { addTransaction, updateTransaction, categories } = useFinanceStore();
  const [form, setForm] = useState(editTx || { type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0], recurrence: 'none', tags: '' });

  useEffect(() => {
    if (open) {
      setForm(editTx || { type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0], recurrence: 'none', tags: '' });
    }
  }, [editTx, open]);

  const handleSave = () => {
    if (!form.amount) return;
    const data = { ...form, amount: parseFloat(form.amount), tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags };
    if (editTx?.id) { updateTransaction(editTx.id, data); } else { addTransaction(data); }
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer animate-slide">
        <div className="drawer-title"><span>{editTx?.id ? 'Editar' : 'Nova'} Transação</span><button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group"><label className="input-label">Tipo</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={`btn ${form.type === 'income' ? 'btn-primary' : 'btn-secondary'}`} style={form.type === 'income' ? { background: 'var(--green)', borderColor: 'var(--green)' } : {}} onClick={() => setForm({ ...form, type: 'income' })}>Receita</button>
              <button className={`btn ${form.type === 'expense' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setForm({ ...form, type: 'expense' })}>Despesa</button>
            </div>
          </div>
          <div className="input-group"><label className="input-label">Valor (R$)</label><input className="input" type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0,00" /></div>
          <div className="input-group"><label className="input-label">Categoria</label>
            <select className="select-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="">Selecione...</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="input-group"><label className="input-label">Descrição</label><input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição..." /></div>
          <div className="input-group"><label className="input-label">Data</label><input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          <div className="input-group"><label className="input-label">Recorrência</label>
            <select className="select-input" value={form.recurrence} onChange={e => setForm({ ...form, recurrence: e.target.value })}>
              <option value="none">Nenhuma</option><option value="daily">Diária</option><option value="weekly">Semanal</option><option value="monthly">Mensal</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>{editTx?.id ? 'Salvar' : 'Adicionar'}</button>
        </div>
      </div>
    </>
  );
}

function CategoryModal({ open, onClose }) {
  const { categories, addCategory, deleteCategory } = useFinanceStore();
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#60a5fa');

  const handleAdd = () => {
    if (!newCatName.trim()) return;
    addCategory({ name: newCatName.trim(), color: newCatColor, monthlyLimit: 0 });
    setNewCatName('');
  };

  if (!open) return null;
  return (
    <div className="overlay" style={{ zIndex: 400 }}>
      <div className="drawer-overlay" onClick={onClose} style={{ position: 'absolute', inset: 0 }} />
      <div className="modal animate-in" style={{ maxWidth: 400, zIndex: 401 }}>
        <div className="modal-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Categorias de Finanças</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input className="input" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Nome da categoria..." style={{ flex: 1 }} />
          <input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} style={{ width: 36, height: 36, padding: 0, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer', flexShrink: 0 }} title="Cor" />
          <button className="btn btn-primary" onClick={handleAdd}><Plus size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
          {categories.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: c.color }} />
                <span style={{ fontSize: 13 }}>{c.name}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => deleteCategory(c.id)} title="Excluir categoria">
                <Trash2 size={14} style={{ color: 'var(--red)' }} />
              </button>
            </div>
          ))}
          {categories.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>Nenhuma categoria cadastrada</p>}
        </div>
      </div>
    </div>
  );
}

export default function FinanceOS() {
  const { transactions, categories, deleteTransaction, importTransactions } = useFinanceStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  const income = transactions.filter(t => t.type === 'income').reduce((a, t) => a + (t.amount || 0), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + (t.amount || 0), 0);
  const balance = income - expense;

  // Distribution chart data
  const distData = useMemo(() => {
    const byCategory = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      byCategory[t.category || 'Outros'] = (byCategory[t.category || 'Outros'] || 0) + t.amount;
    });
    return Object.entries(byCategory).map(([name, value]) => {
      const cat = categories.find(c => c.name === name);
      return { name, value, color: cat?.color || '#6b7280' };
    });
  }, [transactions, categories]);

  // Line chart (last 30 days balance)
  const lineData = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayIncome = transactions.filter(t => t.type === 'income' && t.date === ds).reduce((a, t) => a + t.amount, 0);
      const dayExpense = transactions.filter(t => t.type === 'expense' && t.date === ds).reduce((a, t) => a + t.amount, 0);
      days.push({ day: ds.slice(5), income: dayIncome, expense: dayExpense });
    }
    return days;
  }, [transactions]);

  const fmt = (v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const handleCsvImport = (items) => {
    // Normalize type values
    const normalized = items.map(item => {
      let type = (item.type || '').toString().toLowerCase().trim();
      if (['receita', 'income', 'entrada', 'credito', 'crédito', 'credit', 'c', 'r'].includes(type)) {
        type = 'income';
      } else {
        type = 'expense';
      }
      return {
        ...item,
        type,
        amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0,
        tags: typeof item.tags === 'string' ? item.tags.split(',').map(t => t.trim()).filter(Boolean) : (item.tags || []),
        recurrence: item.recurrence || 'none',
        date: item.date || new Date().toISOString().split('T')[0],
      };
    });
    importTransactions(normalized);
  };

  return (
    <div style={{ overflow: 'hidden', maxWidth: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Wallet size={20} style={{ display: 'inline', marginRight: 8 }} />FINANCE_OS</h1>
          <p className="page-subtitle">Controle financeiro operacional</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setCatOpen(true)}>
            <Tags size={14} /> Categorias
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setCsvOpen(true)}>
            <Upload size={14} /> Importar CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditTx(null); setDrawerOpen(true); }}><Plus size={14} /> Nova Transação</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">Saldo</div>
          <div className="card-value" style={{ marginTop: 8, color: balance >= 0 ? 'var(--green)' : 'var(--coral)', fontSize: 'clamp(18px, 3vw, 28px)', wordBreak: 'break-all' }}>{fmt(balance)}</div>
        </div>
        <div className="card">
          <div className="card-title">Receitas</div>
          <div className="card-value" style={{ marginTop: 8, color: 'var(--green)', fontSize: 'clamp(18px, 3vw, 28px)', wordBreak: 'break-all' }}><ArrowUpRight size={16} style={{ display: 'inline' }} /> {fmt(income)}</div>
        </div>
        <div className="card">
          <div className="card-title">Despesas</div>
          <div className="card-value" style={{ marginTop: 8, color: 'var(--coral)', fontSize: 'clamp(18px, 3vw, 28px)', wordBreak: 'break-all' }}><ArrowDownRight size={16} style={{ display: 'inline' }} /> {fmt(expense)}</div>
        </div>
        <div className="card">
          <div className="card-title">Transações</div>
          <div className="card-value" style={{ marginTop: 8 }}>{transactions.length}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Fluxo (30 dias)</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="income" stroke="var(--green)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expense" stroke="var(--coral)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Distribuição</span></div>
          {distData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={distData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={3}>
                  {distData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, fontSize: 12 }} formatter={v => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding: 24 }}><p>Sem despesas registradas</p></div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {distData.map(d => (
              <span key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: 'inline-block' }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="section-title">Transações Recentes</div>
      {transactions.length === 0 && <div className="empty-state"><DollarSign size={48} /><p>Nenhuma transação</p></div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[...transactions].reverse().slice(0, 30).map(t => (
          <div key={t.id} className="card invest-list-item">
            <div className="invest-list-icon" style={{ background: t.type === 'income' ? 'var(--green-dim)' : 'var(--coral-dim)' }}>
              {t.type === 'income' ? <ArrowUpRight size={14} color="var(--green)" /> : <ArrowDownRight size={14} color="var(--coral)" />}
            </div>
            <div className="invest-list-info">
              <p style={{ fontSize: 13, fontWeight: 500, wordBreak: 'break-word' }}>{t.description || t.category || 'Transação'}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.category} · {t.date}</p>
            </div>
            <div className="invest-list-value">
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 14, color: t.type === 'income' ? 'var(--green)' : 'var(--coral)' }}>
                {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
              </span>
            </div>
            <div className="invest-list-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => { setEditTx(t); setDrawerOpen(true); }}><Edit2 size={12} /></button>
              <button className="btn btn-ghost btn-sm" onClick={() => deleteTransaction(t.id)}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>

      <TransactionDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditTx(null); }} editTx={editTx} />

      <CsvImportModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onImport={handleCsvImport}
        fields={FINANCE_CSV_FIELDS}
        title="Importar Transações"
        helpText="O CSV deve conter colunas como tipo (receita/despesa), valor, categoria, descrição e data. Separe por vírgulas ou ponto-e-vírgula."
      />

      <CategoryModal open={catOpen} onClose={() => setCatOpen(false)} />
    </div>
  );
}
