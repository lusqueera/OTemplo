import React, { useState, useMemo } from 'react';
import { useInvestmentStore } from '../../store/stores';
import { TrendingUp, Plus, X, Edit2, Trash2, Landmark, ArrowUpRight, ArrowDownRight, BarChart3, DollarSign, PieChart as PieChartIcon, Upload } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import CsvImportModal from '../../components/CsvImportModal';

const INVESTMENT_TYPES = [
  { value: 'acoes', label: 'Ações', color: '#60a5fa' },
  { value: 'renda_fixa', label: 'Renda Fixa', color: '#2dd4a8' },
  { value: 'cripto', label: 'Criptomoedas', color: '#f0a500' },
  { value: 'fundos', label: 'Fundos', color: '#a78bfa' },
  { value: 'fii', label: 'FIIs', color: '#f472b6' },
  { value: 'tesouro', label: 'Tesouro Direto', color: '#34d399' },
  { value: 'outros', label: 'Outros', color: '#6b7280' },
];

const INVESTMENT_CSV_FIELDS = [
  { key: 'name', label: 'Nome / Ativo', required: true, aliases: ['nome', 'name', 'ativo', 'ticker', 'papel', 'titulo', 'título', 'asset'] },
  { key: 'type', label: 'Tipo', required: false, aliases: ['tipo', 'type', 'categoria', 'category', 'classe', 'class'], defaultValue: 'outros' },
  { key: 'amount', label: 'Valor Investido', required: true, type: 'number', aliases: ['valor', 'amount', 'value', 'investido', 'aporte', 'preco', 'preço', 'total', 'invested'] },
  { key: 'date', label: 'Data', required: false, aliases: ['data', 'date', 'dia', 'dt', 'data_compra', 'purchase_date'], defaultValue: new Date().toISOString().split('T')[0] },
  { key: 'profitability', label: 'Rentabilidade (%)', required: false, type: 'number', aliases: ['rentabilidade', 'profitability', 'retorno', 'return', 'yield', 'rendimento', 'profit'] },
  { key: 'status', label: 'Status', required: false, aliases: ['status', 'estado', 'situacao', 'situação'], defaultValue: 'active' },
];

function getTypeInfo(type) {
  return INVESTMENT_TYPES.find(t => t.value === type) || INVESTMENT_TYPES[INVESTMENT_TYPES.length - 1];
}

function normalizeType(rawType) {
  if (!rawType) return 'outros';
  const t = rawType.toString().toLowerCase().trim().replace(/[_\s-]/g, '');
  if (['acao', 'acoes', 'ações', 'ação', 'acão', 'stock', 'stocks'].includes(t)) return 'acoes';
  if (['rendafixa', 'fixedincome', 'cdb', 'lci', 'lca', 'debenture'].includes(t)) return 'renda_fixa';
  if (['cripto', 'crypto', 'criptomoeda', 'criptomoedas', 'bitcoin', 'btc', 'eth'].includes(t)) return 'cripto';
  if (['fundo', 'fundos', 'fund', 'funds'].includes(t)) return 'fundos';
  if (['fii', 'fiis', 'fundoimobiliario', 'fundoimobiliário', 'reit'].includes(t)) return 'fii';
  if (['tesouro', 'tesourodireto', 'treasury'].includes(t)) return 'tesouro';
  return 'outros';
}

function normalizeStatus(rawStatus) {
  if (!rawStatus) return 'active';
  const s = rawStatus.toString().toLowerCase().trim();
  if (['ativo', 'active', 'aberto', 'open', 'a'].includes(s)) return 'active';
  if (['vendido', 'sold', 'fechado', 'closed', 'v'].includes(s)) return 'sold';
  if (['vencido', 'matured', 'expirado', 'expired', 'm'].includes(s)) return 'matured';
  return 'active';
}

function InvestmentDrawer({ open, onClose, editItem }) {
  const { addInvestment, updateInvestment } = useInvestmentStore();
  const [form, setForm] = useState(editItem || {
    name: '',
    type: 'acoes',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    profitability: '',
    status: 'active',
  });

  const handleSave = () => {
    if (!form.name || !form.amount) return;
    const data = {
      ...form,
      amount: parseFloat(form.amount),
      profitability: form.profitability ? parseFloat(form.profitability) : null,
    };
    if (editItem?.id) {
      updateInvestment(editItem.id, data);
    } else {
      addInvestment(data);
    }
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer animate-slide">
        <div className="drawer-title">
          <span>{editItem?.id ? 'Editar' : 'Novo'} Investimento</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group">
            <label className="input-label">Nome / Ativo</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: PETR4, Bitcoin, CDB 120%" />
          </div>
          <div className="input-group">
            <label className="input-label">Tipo de Investimento</label>
            <select className="select-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {INVESTMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="invest-drawer-row">
            <div className="input-group">
              <label className="input-label">Valor Investido (R$)</label>
              <input className="input" type="number" step="0.01" style={{ width: '100%' }} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0,00" />
            </div>
            <div className="input-group">
              <label className="input-label">Data do Investimento</label>
              <input className="input" type="date" style={{ width: '100%' }} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="invest-drawer-row">
            <div className="input-group">
              <label className="input-label">Rentabilidade (%)</label>
              <input className="input" type="number" step="0.01" style={{ width: '100%' }} value={form.profitability || ''} onChange={e => setForm({ ...form, profitability: e.target.value })} placeholder="Ex: 12.5" />
            </div>
            <div className="input-group">
              <label className="input-label">Status</label>
              <select className="select-input" style={{ width: '100%' }} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="active">Ativo</option>
                <option value="sold">Vendido</option>
                <option value="matured">Vencido</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>{editItem?.id ? 'Salvar' : 'Adicionar'}</button>
        </div>
      </div>
    </>
  );
}

export default function InvestmentsOS() {
  const { investments, deleteInvestment, importInvestments } = useInvestmentStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [csvOpen, setCsvOpen] = useState(false);

  const totalInvested = useMemo(() =>
    investments.filter(i => i.status === 'active').reduce((a, i) => a + (i.amount || 0), 0),
    [investments]
  );

  const avgProfitability = useMemo(() => {
    const withProfit = investments.filter(i => i.profitability != null && i.status === 'active');
    if (withProfit.length === 0) return 0;
    return withProfit.reduce((a, i) => a + i.profitability, 0) / withProfit.length;
  }, [investments]);

  const estimatedReturn = useMemo(() => {
    return investments
      .filter(i => i.status === 'active' && i.profitability != null)
      .reduce((a, i) => a + (i.amount * i.profitability / 100), 0);
  }, [investments]);

  // Distribution by type
  const distData = useMemo(() => {
    const byType = {};
    investments.filter(i => i.status === 'active').forEach(inv => {
      const typeKey = inv.type || 'outros';
      byType[typeKey] = (byType[typeKey] || 0) + inv.amount;
    });
    return Object.entries(byType).map(([type, value]) => {
      const info = getTypeInfo(type);
      return { name: info.label, value, color: info.color };
    });
  }, [investments]);

  // Bar chart: by type count
  const barData = useMemo(() => {
    const byType = {};
    investments.forEach(inv => {
      const info = getTypeInfo(inv.type);
      byType[info.label] = (byType[info.label] || 0) + 1;
    });
    return Object.entries(byType).map(([name, count]) => ({ name, count }));
  }, [investments]);

  const filteredInvestments = useMemo(() => {
    let list = [...investments];
    if (filterType !== 'all') list = list.filter(i => i.type === filterType);
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [investments, filterType]);

  const fmt = (v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const statusLabels = { active: 'Ativo', sold: 'Vendido', matured: 'Vencido' };
  const statusBadge = { active: 'badge-green', sold: 'badge-amber', matured: 'badge-muted' };

  const handleCsvImport = (items) => {
    const normalized = items.map(item => ({
      ...item,
      type: normalizeType(item.type),
      status: normalizeStatus(item.status),
      amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0,
      profitability: item.profitability ? (typeof item.profitability === 'number' ? item.profitability : parseFloat(item.profitability) || null) : null,
      date: item.date || new Date().toISOString().split('T')[0],
    }));
    importInvestments(normalized);
  };

  return (
    <div style={{ overflow: 'hidden', maxWidth: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Landmark size={20} style={{ display: 'inline', marginRight: 8 }} />INVEST_OS</h1>
          <p className="page-subtitle">Gestão de investimentos e patrimônio</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setCsvOpen(true)}>
            <Upload size={14} /> Importar CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setDrawerOpen(true); }}><Plus size={14} /> Novo Investimento</button>
        </div>
      </div>

      {/* Stats */}
      <div className="invest-stats-grid">
        <div className="card">
          <div className="card-title">Total Investido</div>
          <div className="card-value invest-stat-value" style={{ color: 'var(--blue)' }}>{fmt(totalInvested)}</div>
        </div>
        <div className="card">
          <div className="card-title">Rentabilidade Média</div>
          <div className="card-value invest-stat-value" style={{ color: avgProfitability >= 0 ? 'var(--green)' : 'var(--coral)' }}>
            {avgProfitability >= 0 ? <ArrowUpRight size={16} style={{ display: 'inline' }} /> : <ArrowDownRight size={16} style={{ display: 'inline' }} />}
            {' '}{avgProfitability.toFixed(2)}%
          </div>
        </div>
        <div className="card">
          <div className="card-title">Retorno Estimado</div>
          <div className="card-value invest-stat-value" style={{ color: estimatedReturn >= 0 ? 'var(--green)' : 'var(--coral)' }}>
            {estimatedReturn >= 0 ? '+' : ''}{fmt(estimatedReturn)}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Ativos</div>
          <div className="card-value invest-stat-value">{investments.filter(i => i.status === 'active').length}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="invest-charts-grid">
        <div className="card">
          <div className="card-header"><span className="card-title">Distribuição por Tipo</span></div>
          {distData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={distData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={3}>
                  {distData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, fontSize: 12 }} formatter={v => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding: 24 }}><p>Sem investimentos registrados</p></div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {distData.map(d => (
              <span key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: 'inline-block' }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Qtde por Categoria</span></div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="var(--blue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding: 24 }}><p>Sem dados</p></div>}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        <button className={`tab ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>Todos</button>
        {INVESTMENT_TYPES.map(t => (
          <button key={t.value} className={`tab ${filterType === t.value ? 'active' : ''}`} onClick={() => setFilterType(t.value)}>{t.label}</button>
        ))}
      </div>

      {/* Investment List */}
      {filteredInvestments.length === 0 && (
        <div className="empty-state">
          <Landmark size={48} />
          <p>Nenhum investimento encontrado</p>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filteredInvestments.map(inv => {
          const typeInfo = getTypeInfo(inv.type);
          return (
            <div key={inv.id} className="card invest-list-item">
              <div className="invest-list-icon" style={{ background: `${typeInfo.color}18`, border: `1px solid ${typeInfo.color}30` }}>
                <TrendingUp size={16} color={typeInfo.color} />
              </div>
              <div className="invest-list-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, wordBreak: 'break-word' }}>{inv.name}</p>
                  <span className="badge" style={{ background: `${typeInfo.color}18`, color: typeInfo.color, fontSize: 10 }}>{typeInfo.label}</span>
                  <span className={`badge ${statusBadge[inv.status]}`} style={{ fontSize: 10 }}>{statusLabels[inv.status]}</span>
                </div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{inv.date}</p>
              </div>
              <div className="invest-list-value">
                <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                  {fmt(inv.amount)}
                </p>
                {inv.profitability != null && (
                  <p style={{ fontSize: 11, color: inv.profitability >= 0 ? 'var(--green)' : 'var(--coral)', fontFamily: 'var(--font-mono)' }}>
                    {inv.profitability >= 0 ? '+' : ''}{inv.profitability.toFixed(2)}%
                  </p>
                )}
              </div>
              <div className="invest-list-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditItem(inv); setDrawerOpen(true); }}><Edit2 size={12} /></button>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteInvestment(inv.id)}><Trash2 size={12} /></button>
              </div>
            </div>
          );
        })}
      </div>

      <InvestmentDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditItem(null); }}
        editItem={editItem}
      />

      <CsvImportModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onImport={handleCsvImport}
        fields={INVESTMENT_CSV_FIELDS}
        title="Importar Investimentos"
        helpText="O CSV deve conter colunas como nome/ativo, tipo (ações, renda fixa, cripto, etc.), valor investido, data e rentabilidade. Separe por vírgulas ou ponto-e-vírgula."
      />
    </div>
  );
}
