import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Zap, Brain, Calendar, Filter, Dumbbell, Wallet, Repeat, Activity, ChevronDown } from 'lucide-react';
import { useHabitStore, useFocusStore, useFinanceStore, useReviewStore, useConfigStore, useWorkoutStore } from 'src/store/stores';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const PERIODS = [
  { key: '7d', label: '7 dias', days: 7 },
  { key: '14d', label: '14 dias', days: 14 },
  { key: '30d', label: '30 dias', days: 30 },
  { key: '90d', label: '90 dias', days: 90 },
];

const MODULES = [
  { key: 'focus', label: 'Foco', icon: Zap, color: 'var(--coral)' },
  { key: 'habits', label: 'Hábitos', icon: Repeat, color: 'var(--green)' },
  { key: 'mood', label: 'Humor', icon: Activity, color: 'var(--amber)' },
  { key: 'energy', label: 'Energia', icon: Brain, color: 'var(--purple)' },
  { key: 'finance', label: 'Finanças', icon: Wallet, color: 'var(--blue)' },
  { key: 'training', label: 'Treinos', icon: Dumbbell, color: '#f472b6' },
];

function getDaysArray(days) {
  const arr = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(d.toISOString().split('T')[0]);
  }
  return arr;
}

function KpiCard({ title, value, sub, color }) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="card-value" style={{ marginTop: 8, color: color || 'var(--text-primary)' }}>{value}</div>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

export default function AnalyticsOS() {
  const { habits, logs: habitLogs } = useHabitStore();
  const { sessions } = useFocusStore();
  const { transactions } = useFinanceStore();
  const { reviews } = useReviewStore();
  const { moodHistory } = useConfigStore();
  const { logs: workoutLogs } = useWorkoutStore();

  const [period, setPeriod] = useState('14d');
  const [activeModules, setActiveModules] = useState(['focus', 'habits', 'mood', 'energy', 'finance', 'training']);
  const [showFilters, setShowFilters] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const isModuleActive = (key) => activeModules.includes(key);
  const toggleModule = (key) => {
    setActiveModules(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const days = useMemo(() => {
    if (period === 'custom' && customFrom && customTo) {
      const arr = [];
      const start = new Date(customFrom);
      const end = new Date(customTo);
      const d = new Date(start);
      while (d <= end) {
        arr.push(d.toISOString().split('T')[0]);
        d.setDate(d.getDate() + 1);
      }
      return arr;
    }
    const p = PERIODS.find(p => p.key === period);
    return getDaysArray(p?.days || 14);
  }, [period, customFrom, customTo]);

  const tooltipStyle = { background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, fontSize: 12 };
  const moodValues = { frustrated: 1, low: 2, neutral: 3, good: 4, peak: 5 };
  const moodLabels = { 1: 'Frustrado', 2: 'Baixo', 3: 'Neutro', 4: 'Bom', 5: 'Peak' };

  // ===== COMPUTED DATA =====
  const focusData = useMemo(() => {
    return days.map(ds => {
      const daySessions = sessions.filter(s => s.startTime?.startsWith(ds));
      const totalMin = daySessions.reduce((a, s) => {
        if (!s.endTime) return a;
        return a + (new Date(s.endTime) - new Date(s.startTime)) / 60000;
      }, 0);
      const avgQuality = daySessions.length > 0
        ? daySessions.reduce((a, s) => a + (s.quality || 0), 0) / daySessions.length
        : 0;
      return { day: ds.slice(5), minutes: Math.round(totalMin), sessions: daySessions.length, quality: Math.round(avgQuality * 10) / 10 };
    });
  }, [days, sessions]);

  const habitData = useMemo(() => {
    const active = habits.filter(h => h.status === 'active');
    return days.map(ds => {
      const dayLogs = habitLogs.filter(l => l.date === ds && l.status === 'done');
      const rate = active.length > 0 ? Math.round((dayLogs.length / active.length) * 100) : 0;
      return { day: ds.slice(5), rate, done: dayLogs.length, total: active.length };
    });
  }, [days, habits, habitLogs]);

  const moodData = useMemo(() => {
    return days.map(ds => {
      const entry = moodHistory.find(m => m.date === ds);
      return { day: ds.slice(5), value: entry ? (moodValues[entry.mood] || 3) : null };
    }).filter(d => d.value !== null);
  }, [days, moodHistory]);

  const energyData = useMemo(() => {
    return days.map(ds => {
      const review = reviews.find(r => r.type === 'daily' && r.date === ds);
      return { day: ds.slice(5), energy: review?.energy || null };
    }).filter(d => d.energy !== null);
  }, [days, reviews]);

  const financeData = useMemo(() => {
    return days.map(ds => {
      const dayTx = transactions.filter(t => t.date === ds);
      const income = dayTx.filter(t => t.type === 'income').reduce((a, t) => a + (t.amount || 0), 0);
      const expense = dayTx.filter(t => t.type === 'expense').reduce((a, t) => a + (t.amount || 0), 0);
      return { day: ds.slice(5), receita: income, despesa: expense };
    });
  }, [days, transactions]);

  const trainingData = useMemo(() => {
    return days.map(ds => {
      const dayLogs = workoutLogs.filter(l => l.date?.startsWith(ds));
      const totalMin = dayLogs.reduce((a, l) => a + (l.duration || 0), 0);
      return { day: ds.slice(5), minutes: totalMin, count: dayLogs.length };
    });
  }, [days, workoutLogs]);

  // ===== KPIs =====
  const totalFocusMin = focusData.reduce((a, d) => a + d.minutes, 0);
  const avgFocusMin = days.length > 0 ? Math.round(totalFocusMin / days.length) : 0;
  const avgHabitRate = habitData.length > 0 ? Math.round(habitData.reduce((a, d) => a + d.rate, 0) / habitData.length) : 0;
  const avgMood = moodData.length > 0 ? (moodData.reduce((a, d) => a + d.value, 0) / moodData.length).toFixed(1) : '—';
  const totalExpenses = financeData.reduce((a, d) => a + d.despesa, 0);
  const totalIncome = financeData.reduce((a, d) => a + d.receita, 0);
  const totalWorkouts = trainingData.reduce((a, d) => a + d.count, 0);
  const totalTrainingMin = trainingData.reduce((a, d) => a + d.minutes, 0);

  // Finance category breakdown
  const categoryBreakdown = useMemo(() => {
    const filtered = transactions.filter(t => t.type === 'expense' && days.includes(t.date));
    const map = {};
    filtered.forEach(t => {
      const cat = t.category || 'Outros';
      map[cat] = (map[cat] || 0) + (t.amount || 0);
    });
    const colors = ['#ff6b6b', '#f0a500', '#60a5fa', '#a78bfa', '#2dd4a8', '#f472b6', '#34d399', '#6b7280'];
    return Object.entries(map).map(([name, value], i) => ({ name, value: Math.round(value * 100) / 100, fill: colors[i % colors.length] }));
  }, [transactions, days]);

  // Insights
  const insights = useMemo(() => {
    const arr = [];
    if (avgFocusMin > 0) arr.push({ text: `Média de ${avgFocusMin} min/dia de foco. ${avgFocusMin > 60 ? 'Performance acima da média!' : 'Tente aumentar para 60+ min/dia.'}`, type: avgFocusMin > 60 ? 'positive' : 'neutral' });
    if (avgHabitRate > 0) arr.push({ text: `Consistência de hábitos: ${avgHabitRate}%. ${avgHabitRate > 70 ? 'Excelente!' : 'Meta: 70%+.'}`, type: avgHabitRate > 70 ? 'positive' : 'warning' });
    if (totalWorkouts > 0) arr.push({ text: `${totalWorkouts} treinos no período (${totalTrainingMin} min total).`, type: totalWorkouts >= days.length * 0.4 ? 'positive' : 'neutral' });
    if (totalExpenses > 0 && totalIncome > 0) {
      const ratio = Math.round((totalExpenses / totalIncome) * 100);
      arr.push({ text: `Você gastou ${ratio}% da receita no período. ${ratio > 80 ? 'Atenção ao orçamento!' : 'Bom controle financeiro.'}`, type: ratio > 80 ? 'warning' : 'positive' });
    }
    return arr;
  }, [avgFocusMin, avgHabitRate, totalWorkouts, totalTrainingMin, totalExpenses, totalIncome, days.length]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title"><BarChart3 size={20} style={{ display: 'inline', marginRight: 8 }} />ANALYTICS_OS</h1>
          <p className="page-subtitle">Inteligência integrada cross-módulo</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
          <Filter size={14} /> Filtros <ChevronDown size={12} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
      </div>

      {/* ===== FILTER PANEL ===== */}
      {showFilters && (
        <div className="card animate-in" style={{ marginBottom: 24 }}>
          {/* Period selector */}
          <div style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 8 }}><Calendar size={12} style={{ marginRight: 4, display: 'inline' }} /> Período</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PERIODS.map(p => (
                <button
                  key={p.key}
                  className={`btn btn-sm ${period === p.key ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setPeriod(p.key)}
                >
                  {p.label}
                </button>
              ))}
              <button
                className={`btn btn-sm ${period === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPeriod('custom')}
              >
                Personalizado
              </button>
            </div>
            {period === 'custom' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <div className="input-group" style={{ flex: 1, minWidth: 140 }}>
                  <label className="input-label">De</label>
                  <input className="input" type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
                </div>
                <div className="input-group" style={{ flex: 1, minWidth: 140 }}>
                  <label className="input-label">Até</label>
                  <input className="input" type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Module toggles */}
          <div>
            <div className="section-title" style={{ marginBottom: 8 }}><Filter size={12} style={{ marginRight: 4, display: 'inline' }} /> Módulos</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {MODULES.map(m => {
                const Icon = m.icon;
                const active = isModuleActive(m.key);
                return (
                  <button
                    key={m.key}
                    className={`btn btn-sm ${active ? '' : 'btn-secondary'}`}
                    style={active ? { background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}40` } : { opacity: 0.5 }}
                    onClick={() => toggleModule(m.key)}
                  >
                    <Icon size={12} /> {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
            Exibindo {days.length} dias · {activeModules.length} módulos ativos
          </div>
        </div>
      )}

      {/* Period pill (always visible) */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {PERIODS.map(p => (
          <button key={p.key} className={`badge ${period === p.key ? 'badge-coral' : 'badge-muted'}`}
            style={{ cursor: 'pointer', fontSize: 11 }} onClick={() => setPeriod(p.key)}>
            {p.label}
          </button>
        ))}
        {period === 'custom' && <span className="badge badge-coral" style={{ fontSize: 11 }}>Personalizado</span>}
      </div>

      {/* ===== KPIs ===== */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {isModuleActive('focus') && <KpiCard title="Foco médio/dia" value={`${avgFocusMin}min`} sub={`${totalFocusMin}min total`} color="var(--coral)" />}
        {isModuleActive('habits') && <KpiCard title="Consistência" value={`${avgHabitRate}%`} sub={`${habits.filter(h => h.status === 'active').length} hábitos ativos`} color="var(--green)" />}
        {isModuleActive('mood') && <KpiCard title="Humor médio" value={avgMood} sub={moodLabels[Math.round(parseFloat(avgMood))] || ''} color="var(--amber)" />}
        {isModuleActive('training') && <KpiCard title="Treinos" value={totalWorkouts} sub={`${totalTrainingMin}min total`} color="#f472b6" />}
        {isModuleActive('finance') && <KpiCard title="Receita" value={`R$${totalIncome.toFixed(0)}`} color="var(--green)" />}
        {isModuleActive('finance') && <KpiCard title="Despesa" value={`R$${totalExpenses.toFixed(0)}`} color="var(--red)" />}
      </div>

      {/* ===== INSIGHTS ===== */}
      {insights.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {insights.map((ins, i) => (
            <div key={i} className="insight-card" style={{ borderLeftColor: ins.type === 'positive' ? 'var(--green)' : ins.type === 'warning' ? 'var(--amber)' : 'var(--coral)' }}>
              <p className="insight-text">{ins.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ===== CHARTS ===== */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Focus */}
        {isModuleActive('focus') && (
          <div className="card">
            <div className="card-header"><span className="card-title">Performance de Foco</span><Zap size={14} color="var(--coral)" /></div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={focusData}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} minTickGap={20} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [n === 'minutes' ? `${v} min` : v, n === 'minutes' ? 'Minutos' : 'Sessões']} />
                <Bar dataKey="minutes" fill="var(--coral)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Habits */}
        {isModuleActive('habits') && (
          <div className="card">
            <div className="card-header"><span className="card-title">Consistência de Hábitos</span><TrendingUp size={14} color="var(--green)" /></div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={habitData}>
                <defs>
                  <linearGradient id="gradHabit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--green)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} minTickGap={20} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Consistência']} />
                <Area type="monotone" dataKey="rate" stroke="var(--green)" strokeWidth={2} fill="url(#gradHabit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Mood */}
        {isModuleActive('mood') && (
          <div className="card">
            <div className="card-header"><span className="card-title">Tendência de Humor</span><Activity size={14} color="var(--amber)" /></div>
            {moodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={moodData}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} minTickGap={20} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [moodLabels[v] || v, 'Humor']} />
                  <Line type="monotone" dataKey="value" stroke="var(--amber)" strokeWidth={2} dot={{ fill: 'var(--amber)', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="empty-state" style={{ padding: 24 }}><p>Sem dados de humor no período</p></div>}
          </div>
        )}

        {/* Energy */}
        {isModuleActive('energy') && (
          <div className="card">
            <div className="card-header"><span className="card-title">Tendência de Energia</span><Brain size={14} color="var(--purple)" /></div>
            {energyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={energyData}>
                  <defs>
                    <linearGradient id="gradEnergy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--purple)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} minTickGap={20} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} domain={[1, 5]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="energy" stroke="var(--purple)" strokeWidth={2} fill="url(#gradEnergy)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="empty-state" style={{ padding: 24 }}><p>Sem dados (registre revisões diárias)</p></div>}
          </div>
        )}
      </div>

      <div className="grid-2">
        {/* Finance */}
        {isModuleActive('finance') && (
          <div className="card">
            <div className="card-header"><span className="card-title">Fluxo Financeiro</span><Wallet size={14} color="var(--blue)" /></div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={financeData}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} minTickGap={20} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`R$${v.toFixed(2)}`, n === 'receita' ? 'Receita' : 'Despesa']} />
                <Bar dataKey="receita" fill="var(--green)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesa" fill="var(--coral)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Finance breakdown */}
        {isModuleActive('finance') && categoryBreakdown.length > 0 && (
          <div className="card">
            <div className="card-header"><span className="card-title">Despesas por Categoria</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 140px', minWidth: 140, height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                      {categoryBreakdown.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`R$${v.toFixed(2)}`]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: '1 1 140px', minWidth: 140 }}>
                {categoryBreakdown.map((cat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '3px 0' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.fill, flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{cat.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>R${cat.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Training */}
        {isModuleActive('training') && (
          <div className="card">
            <div className="card-header"><span className="card-title">Volume de Treino</span><Dumbbell size={14} color="#f472b6" /></div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trainingData}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} minTickGap={20} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [n === 'minutes' ? `${v} min` : v, n === 'minutes' ? 'Minutos' : 'Treinos']} />
                <Bar dataKey="minutes" fill="#f472b6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
