import React, { useState, useMemo } from 'react';
import { useConfigStore, usePriorityStore, useHabitStore, useAgendaStore, useFocusStore, useFinanceStore, useInvestmentStore } from 'src/store/stores';
import { ArrowRight, CheckCircle2, Clock, Flame, Sparkles, Plus, X, ChevronRight, Play, Target, Repeat, CalendarDays, SmilePlus, ListChecks, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function ScoreRing({ value, label, color = 'var(--coral)', size = 56 }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="score-ring-container">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div style={{ position: 'relative', marginTop: -(size - 8), textAlign: 'center', height: size - 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{value}</span>
      </div>
      <span className="score-ring-label" style={{ marginTop: 4 }}>{label}</span>
    </div>
  );
}

function MoodCheckin() {
  const { mood, setMood } = useConfigStore();
  const moods = [
    { emoji: '😤', val: 'frustrated' }, { emoji: '😔', val: 'low' },
    { emoji: '😐', val: 'neutral' }, { emoji: '😊', val: 'good' }, { emoji: '🔥', val: 'peak' },
  ];
  return (
    <div className="card animate-in">
      <div className="card-header"><span className="card-title">Mood Check-in</span></div>
      <div className="mood-grid">
        {moods.map(m => (
          <button key={m.val} className={`mood-btn ${mood === m.val ? 'selected' : ''}`} onClick={() => setMood(m.val)}>{m.emoji}</button>
        ))}
      </div>
      {mood && <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>STATUS: {mood.toUpperCase()}</p>}
    </div>
  );
}

function DailyPriorities() {
  const { dailyPriorities, addDailyPriority, updateDailyPriority, deleteDailyPriority } = useConfigStore();
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const todayP = dailyPriorities.filter(p => p.createdAt === today || !p.done).slice(0, 3);

  const handleAdd = () => {
    if (!text.trim()) return;
    addDailyPriority({ title: text.trim(), createdAt: today }); setText(''); setAdding(false);
  };

  return (
    <div className="card animate-in">
      <div className="card-header">
        <span className="card-title">Daily Priorities</span>
        {todayP.length < 3 && <button className="btn btn-ghost btn-sm" onClick={() => setAdding(true)}><Plus size={14} /></button>}
      </div>
      {todayP.length === 0 && !adding && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Defina até 3 prioridades</p>}
      {todayP.map(p => (
        <div key={p.id} className={`check-item ${p.done ? 'done' : ''}`}>
          <div className={`check-box ${p.done ? 'checked' : ''}`} onClick={() => updateDailyPriority(p.id, { done: !p.done })}>
            {p.done && <CheckCircle2 size={14} color="var(--text-inverse)" />}
          </div>
          <span className="check-item-text">{p.title}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => deleteDailyPriority(p.id)}><X size={12} /></button>
        </div>
      ))}
      {adding && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input className="input" style={{ flex: 1 }} placeholder="Prioridade..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} autoFocus />
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>Add</button>
        </div>
      )}
    </div>
  );
}

function NextAction() {
  const { tasks } = usePriorityStore();
  const next = tasks.find(t => t.status === 'pending');
  return (
    <div className="card card-glow animate-in" style={{ borderColor: 'var(--border-glow)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--coral), transparent)' }} />
      <div className="card-header"><span className="card-title" style={{ color: 'var(--coral)' }}>▸ Next Action</span></div>
      {next ? (
        <>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{next.title}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{next.context || 'Tarefa estratégica'}</p>
          <button className="btn btn-primary">Começar agora <ArrowRight size={14} /></button>
        </>
      ) : (
        <>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Nenhuma tarefa pendente. Sistema limpo.</p>
          <button className="btn btn-secondary">Criar tarefa <Plus size={14} /></button>
        </>
      )}
    </div>
  );
}

function LifeScore() {
  const { habits, logs } = useHabitStore();
  const { tasks } = usePriorityStore();
  const { sessions } = useFocusStore();
  const { transactions } = useFinanceStore();
  const { mood } = useConfigStore();

  const scores = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    // Saúde: Hábitos concluídos na última semana vs ativos
    const activeHabits = habits.filter(h => h.status === 'active');
    let health = 50;
    if (activeHabits.length > 0) {
      const weekLogs = logs.filter(l => l.date >= weekAgoStr && l.status === 'done');
      health = Math.min(100, Math.round((weekLogs.length / (activeHabits.length * 7)) * 100));
    }

    // Trabalho/Produtividade: Tarefas concluídas
    let work = 50;
    if (tasks.length > 0) {
      const doneTasks = tasks.filter(t => t.status === 'completed' || t.status === 'done').length;
      work = Math.min(100, Math.round((doneTasks / tasks.length) * 100));
    }

    // Foco / Estudo: Minutos de sessão
    const weekSessions = sessions.filter(s => s.startTime >= weekAgoStr);
    let focusScore = 50;
    if (weekSessions.length > 0) {
      const totalMin = weekSessions.reduce((a, s) => a + (s.endTime ? (new Date(s.endTime) - new Date(s.startTime)) / 60000 : 0), 0);
      focusScore = Math.min(100, Math.round((totalMin / 600) * 100)); // 10h/semana = 100
    }
    const studyScore = focusScore; // Podemos atrelar estudo ao tempo de foco profundo.

    // Finanças: Lucratividade baseada em Receita x Despesa
    const weekTrans = transactions.filter(t => t.date >= weekAgoStr);
    let finance = 50;
    if (weekTrans.length > 0) {
      const inc = weekTrans.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
      const exp = weekTrans.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
      if (inc > 0) {
        finance = Math.min(100, Math.max(0, Math.round(((inc - exp) / inc) * 100) + 50));
      }
    }

    // Energia/Mood
    let energy = 50;
    if (mood) {
      energy = { peak: 100, good: 80, neutral: 60, low: 30, frustrated: 20 }[mood] || 50;
    }

    return [
      { label: 'Saúde', value: health || 0, color: 'var(--green)' },
      { label: 'Trabalho', value: work || 0, color: 'var(--coral)' },
      { label: 'Estudo', value: studyScore || 0, color: 'var(--blue)' },
      { label: 'Finanças', value: finance || 0, color: 'var(--amber)' },
      { label: 'Foco', value: focusScore || 0, color: 'var(--purple)' },
      { label: 'Energia', value: energy || 0, color: '#f472b6' },
    ];
  }, [habits, logs, tasks, sessions, transactions, mood]);
  const avg = Math.round(scores.reduce((a, s) => a + s.value, 0) / scores.length);
  return (
    <div className="card animate-in">
      <div className="card-header"><span className="card-title">Life Score</span><span className="badge badge-coral">{avg}/100</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 12 }}>
        {scores.map(s => <ScoreRing key={s.label} value={s.value} label={s.label} color={s.color} />)}
      </div>
    </div>
  );
}

function HabitSnapshot() {
  const { habits, logs } = useHabitStore();
  const today = new Date().toISOString().split('T')[0];
  const active = habits.filter(h => h.status === 'active');
  const todayLogs = logs.filter(l => l.date === today);
  const done = todayLogs.filter(l => l.status === 'done').length;
  return (
    <div className="card animate-in">
      <div className="card-header"><span className="card-title">Hábitos Hoje</span><span className="badge badge-green">{done}/{active.length}</span></div>
      {active.slice(0, 4).map(h => {
        const isDone = todayLogs.find(l => l.habitId === h.id)?.status === 'done';
        return (
          <div key={h.id} className={`check-item ${isDone ? 'done' : ''}`}>
            <div className={`check-box ${isDone ? 'checked' : ''}`} style={{ width: 16, height: 16 }}>
              {isDone && <CheckCircle2 size={10} color="var(--text-inverse)" />}
            </div>
            <span className="check-item-text" style={{ fontSize: 12 }}>{h.name}</span>
            {h.streak > 0 && <span style={{ fontSize: 10, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 2 }}><Flame size={10} />{h.streak}</span>}
          </div>
        );
      })}
      {active.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nenhum hábito cadastrado</p>}
    </div>
  );
}

function TimelineWidget() {
  const events = [
    { time: '08:00', title: 'Morning routine', type: 'habit' },
    { time: '09:30', title: 'Deep work — Projeto X', type: 'focus' },
    { time: '12:00', title: 'Almoço', type: 'break' },
    { time: '14:00', title: 'Revisão semanal', type: 'review' },
    { time: '16:00', title: 'Estudo — React avançado', type: 'study' },
  ];
  return (
    <div className="card animate-in">
      <div className="card-header"><span className="card-title">Timeline</span><Clock size={14} color="var(--text-muted)" /></div>
      {events.map((e, i) => (
        <div key={i} className="timeline-item">
          <span className="timeline-time">{e.time}</span>
          <div className="timeline-dot" />
          <div className="timeline-content">
            <p style={{ fontSize: 13, fontWeight: 500 }}>{e.title}</p>
            <span className="badge badge-muted" style={{ marginTop: 4 }}>{e.type}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SmartInsights() {
  const navigate = useNavigate();
  const { habits, logs } = useHabitStore();
  const { sessions } = useFocusStore();
  const { transactions } = useFinanceStore();
  const { appointments } = useAgendaStore();
  const { tasks } = usePriorityStore();
  const { investments } = useInvestmentStore();
  const { mood, dailyPriorities } = useConfigStore();

  const insights = useMemo(() => {
    const result = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    // --- Habits ---
    const activeHabits = habits.filter(h => h.status === 'active');
    const todayLogs = logs.filter(l => l.date === todayStr && l.status === 'done');
    if (activeHabits.length > 0) {
      const pending = activeHabits.length - todayLogs.length;
      if (pending > 0 && today.getHours() >= 18) {
        result.push({ text: `Você ainda tem ${pending} hábito(s) pendente(s) hoje. O dia está acabando!`, action: 'Ir para Habit_OS', route: '/habits', color: 'var(--amber)' });
      }
      // Streak detection
      const bestStreak = activeHabits.reduce((best, h) => h.streak > best.streak ? h : best, { streak: 0 });
      if (bestStreak.streak >= 3) {
        result.push({ text: `"${bestStreak.name}" está com ${bestStreak.streak} dias de streak! Continue assim. 🔥`, action: 'Ver hábitos', route: '/habits', color: 'var(--green)' });
      }
      // Habit completion rate last 7 days
      const weekLogs = logs.filter(l => l.date >= weekAgoStr && l.status === 'done');
      const rate = activeHabits.length > 0 ? Math.round((weekLogs.length / (activeHabits.length * 7)) * 100) : 0;
      if (rate < 40 && activeHabits.length > 0) {
        result.push({ text: `Sua taxa de hábitos nos últimos 7 dias é ${rate}%. Tente manter consistência.`, action: 'Revisar hábitos', route: '/habits', color: 'var(--coral)' });
      } else if (rate >= 80) {
        result.push({ text: `Excelente! ${rate}% de conclusão de hábitos essa semana. Performance de elite.`, action: 'Ver progresso', route: '/habits', color: 'var(--green)' });
      }
    }

    // --- Focus ---
    if (sessions.length > 0) {
      const weekSessions = sessions.filter(s => s.startTime >= weekAgoStr);
      const totalMin = Math.round(weekSessions.reduce((a, s) => {
        if (!s.startTime || !s.endTime) return a;
        return a + (new Date(s.endTime) - new Date(s.startTime)) / 60000;
      }, 0));
      if (totalMin > 0) {
        const avgQ = weekSessions.filter(s => s.quality).reduce((a, s) => a + s.quality, 0) / (weekSessions.filter(s => s.quality).length || 1);
        if (avgQ < 3) {
          result.push({ text: `Qualidade média de foco esta semana: ${avgQ.toFixed(1)}/5. Experimente sessões mais curtas.`, action: 'Ajustar Focus_OS', route: '/focus', color: 'var(--purple)' });
        } else {
          result.push({ text: `${totalMin} min de foco essa semana com qualidade ${avgQ.toFixed(1)}/5. Bom trabalho!`, action: 'Ver sessões', route: '/focus', color: 'var(--purple)' });
        }
      }
    } else {
      result.push({ text: 'Nenhuma sessão de foco registrada. Comece uma sessão para aumentar produtividade.', action: 'Iniciar Focus_OS', route: '/focus', color: 'var(--purple)' });
    }

    // --- Finance ---
    const monthStr = todayStr.slice(0, 7);
    const monthExpenses = transactions.filter(t => t.type === 'expense' && t.date?.startsWith(monthStr));
    const monthIncome = transactions.filter(t => t.type === 'income' && t.date?.startsWith(monthStr));
    const totalExp = monthExpenses.reduce((a, t) => a + (t.amount || 0), 0);
    const totalInc = monthIncome.reduce((a, t) => a + (t.amount || 0), 0);
    if (totalExp > 0 && totalInc > 0 && totalExp > totalInc * 0.9) {
      result.push({ text: `Despesas do mês (R$ ${totalExp.toFixed(0)}) estão próximas da receita (R$ ${totalInc.toFixed(0)}). Atenção!`, action: 'Ver finanças', route: '/finance', color: 'var(--coral)' });
    } else if (totalExp > 0) {
      const topCat = {};
      monthExpenses.forEach(t => { topCat[t.category || 'Outros'] = (topCat[t.category || 'Outros'] || 0) + t.amount; });
      const sorted = Object.entries(topCat).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        result.push({ text: `Maior gasto do mês: ${sorted[0][0]} (R$ ${sorted[0][1].toFixed(0)}). Total: R$ ${totalExp.toFixed(0)}.`, action: 'Analisar gastos', route: '/finance', color: 'var(--amber)' });
      }
    }

    // --- Agenda ---
    const todayAppts = appointments.filter(a => a.date === todayStr);
    const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().split('T')[0];
    const tomorrowAppts = appointments.filter(a => a.date === tomorrowStr);
    if (todayAppts.length > 0) {
      result.push({ text: `Você tem ${todayAppts.length} compromisso(s) hoje. Não esqueça!`, action: 'Ver agenda', route: '/agenda', color: 'var(--blue)' });
    }
    if (tomorrowAppts.length > 0) {
      result.push({ text: `Amanhã: ${tomorrowAppts.length} compromisso(s) agendado(s). Prepare-se.`, action: 'Ver agenda', route: '/agenda', color: 'var(--blue)' });
    }

    // --- Tasks ---
    const pending = tasks.filter(t => t.status === 'pending');
    if (pending.length >= 10) {
      result.push({ text: `${pending.length} tarefas pendentes acumuladas. Hora de priorizar e limpar.`, action: 'Organizar tarefas', route: '/priority', color: 'var(--coral)' });
    } else if (pending.length === 0 && tasks.length > 0) {
      result.push({ text: 'Todas as tarefas concluídas! Sistema limpo. Defina novos objetivos.', action: 'Criar objetivos', route: '/priority', color: 'var(--green)' });
    }

    // --- Investments ---
    const activeInv = investments.filter(i => i.status === 'active');
    if (activeInv.length > 0) {
      const totalInvested = activeInv.reduce((a, i) => a + (i.amount || 0), 0);
      const withProfit = activeInv.filter(i => i.profitability != null);
      if (withProfit.length > 0) {
        const avgProfit = withProfit.reduce((a, i) => a + i.profitability, 0) / withProfit.length;
        if (avgProfit < 0) {
          result.push({ text: `Rentabilidade média negativa (${avgProfit.toFixed(1)}%). Revise sua carteira.`, action: 'Ver investimentos', route: '/investments', color: 'var(--coral)' });
        } else if (avgProfit > 10) {
          result.push({ text: `Ótima performance! Rentabilidade média de ${avgProfit.toFixed(1)}% na carteira.`, action: 'Ver portfólio', route: '/investments', color: 'var(--green)' });
        }
      }
    }

    // --- Mood ---
    if (!mood) {
      result.push({ text: 'Você ainda não registrou seu mood hoje. Como está se sentindo?', action: 'Fazer check-in', route: null, color: 'var(--amber)' });
    }

    // --- Daily Priorities ---
    const todayP = dailyPriorities.filter(p => p.createdAt === todayStr);
    if (todayP.length === 0) {
      result.push({ text: 'Defina suas prioridades do dia para manter o foco no que importa.', action: 'Definir prioridades', route: null, color: 'var(--coral)' });
    } else {
      const doneP = todayP.filter(p => p.done).length;
      if (doneP === todayP.length && todayP.length > 0) {
        result.push({ text: `Todas as ${todayP.length} prioridades do dia concluídas! Excelente execução.`, action: 'Parabéns! ✓', route: null, color: 'var(--green)' });
      }
    }

    // Fallback
    if (result.length === 0) {
      result.push({ text: 'Comece a usar o sistema para receber insights personalizados baseados nos seus dados.', action: 'Explorar módulos', route: null, color: 'var(--text-muted)' });
    }

    // Return max 4 most relevant
    return result.slice(0, 4);
  }, [habits, logs, sessions, transactions, appointments, tasks, investments, mood, dailyPriorities]);

  return (
    <div className="card animate-in">
      <div className="card-header"><span className="card-title">Smart Insights</span><Sparkles size={14} color="var(--amber)" /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {insights.map((ins, i) => (
          <div key={i} className="insight-card" style={{ borderLeftColor: ins.color || 'var(--coral)', cursor: ins.route ? 'pointer' : 'default' }} onClick={() => ins.route && navigate(ins.route)}>
            <p className="insight-text">{ins.text}</p>
            <span className="insight-action" style={{ color: ins.color || 'var(--coral)' }}>{ins.action} →</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== ROUTINE MODAL ====================
const ROUTINE_STEPS = [
  { key: 'mood', icon: SmilePlus, label: 'Mood Check', color: 'var(--amber)' },
  { key: 'priorities', icon: ListChecks, label: 'Prioridades', color: 'var(--coral)' },
  { key: 'habits', icon: Repeat, label: 'Hábitos', color: 'var(--green)' },
  { key: 'agenda', icon: CalendarDays, label: 'Agenda', color: 'var(--blue)' },
  { key: 'focus', icon: Target, label: 'Próxima Ação', color: 'var(--purple)' },
  { key: 'done', icon: Trophy, label: 'Concluído', color: 'var(--green)' },
];

function RoutineModal({ open, onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const { mood, setMood, dailyPriorities, addDailyPriority, updateDailyPriority } = useConfigStore();
  const { habits, logs, logHabit } = useHabitStore();
  const { tasks } = usePriorityStore();
  const { appointments } = useAgendaStore();
  const [newPriority, setNewPriority] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayPriorities = dailyPriorities.filter(p => p.createdAt === today || !p.done);
  const activeHabits = habits.filter(h => h.status === 'active');
  const todayLogs = logs.filter(l => l.date === today);
  const todayAppointments = appointments.filter(a => a.date === today).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const moods = [
    { emoji: '😤', val: 'frustrated', label: 'Frustrado' },
    { emoji: '😔', val: 'low', label: 'Baixo' },
    { emoji: '😐', val: 'neutral', label: 'Neutro' },
    { emoji: '😊', val: 'good', label: 'Bom' },
    { emoji: '🔥', val: 'peak', label: 'Peak' },
  ];

  const currentStep = ROUTINE_STEPS[step];
  const isLast = step === ROUTINE_STEPS.length - 1;
  const progress = ((step) / (ROUTINE_STEPS.length - 1)) * 100;

  const next = () => { if (!isLast) setStep(s => s + 1); };
  const prev = () => { if (step > 0) setStep(s => s - 1); };
  const handleClose = () => { setStep(0); onClose(); };

  if (!open) return null;

  return (
    <div className="overlay" style={{ zIndex: 400 }}>
      <div className="modal" style={{ maxWidth: 540, padding: 0, overflow: 'hidden' }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: 'var(--bg-elevated)' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--coral)', borderRadius: 'var(--radius-full)', transition: 'width 0.4s ease' }} />
        </div>

        <div style={{ padding: '28px 32px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `color-mix(in srgb, ${currentStep.color} 15%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <currentStep.icon size={18} color={currentStep.color} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>{currentStep.label}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Passo {step + 1} de {ROUTINE_STEPS.length}</p>
              </div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={handleClose}><X size={18} /></button>
          </div>

          {/* Step content */}
          {currentStep.key === 'mood' && (
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>Como você está se sentindo agora?</p>
              <div className="mood-grid">
                {moods.map(m => (
                  <div key={m.val} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <button className={`mood-btn ${mood === m.val ? 'selected' : ''}`} onClick={() => setMood(m.val)}>{m.emoji}</button>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.label}</span>
                  </div>
                ))}
              </div>
              {mood && <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--coral)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>STATUS: {mood.toUpperCase()}</p>}
            </div>
          )}

          {currentStep.key === 'priorities' && (
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Suas prioridades para hoje ({todayPriorities.length}/3)</p>
              {todayPriorities.map(p => (
                <div key={p.id} className={`check-item ${p.done ? 'done' : ''}`}>
                  <div className={`check-box ${p.done ? 'checked' : ''}`} onClick={() => updateDailyPriority(p.id, { done: !p.done })}>
                    {p.done && <CheckCircle2 size={14} color="var(--text-inverse)" />}
                  </div>
                  <span className="check-item-text">{p.title}</span>
                </div>
              ))}
              {todayPriorities.length < 3 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input className="input" style={{ flex: 1 }} placeholder="Adicionar prioridade..." value={newPriority} onChange={e => setNewPriority(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newPriority.trim()) { addDailyPriority({ title: newPriority.trim() }); setNewPriority(''); } }} />
                  <button className="btn btn-primary btn-sm" onClick={() => { if (newPriority.trim()) { addDailyPriority({ title: newPriority.trim() }); setNewPriority(''); } }}>Add</button>
                </div>
              )}
              {todayPriorities.length === 0 && !newPriority && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Defina até 3 prioridades do dia</p>}
            </div>
          )}

          {currentStep.key === 'habits' && (
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Marque os hábitos já concluídos ({todayLogs.filter(l => l.status === 'done').length}/{activeHabits.length})
              </p>
              {activeHabits.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nenhum hábito cadastrado. Cadastre em Habit_OS.</p>}
              <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                {activeHabits.map(h => {
                  const isDone = todayLogs.find(l => l.habitId === h.id)?.status === 'done';
                  return (
                    <div key={h.id} className={`check-item ${isDone ? 'done' : ''}`} onClick={() => logHabit(h.id, isDone ? 'pending' : 'done', today)}>
                      <div className={`check-box ${isDone ? 'checked' : ''}`} style={{ width: 18, height: 18 }}>
                        {isDone && <CheckCircle2 size={12} color="var(--text-inverse)" />}
                      </div>
                      <span className="check-item-text" style={{ fontSize: 13 }}>{h.name}</span>
                      {h.streak > 0 && <span style={{ fontSize: 10, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 2 }}><Flame size={10} />{h.streak}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep.key === 'agenda' && (
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                {todayAppointments.length > 0 ? `Você tem ${todayAppointments.length} compromisso(s) hoje` : 'Nenhum compromisso para hoje'}
              </p>
              {todayAppointments.length === 0 && (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>
                  <CalendarDays size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                  <p style={{ fontSize: 12 }}>Dia livre de compromissos ✓</p>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                {todayAppointments.map(apt => (
                  <div key={apt.id} className="agenda-item">
                    <div className="agenda-item-time"><Clock size={12} /><span>{apt.time || '--:--'}</span></div>
                    <div className="agenda-item-content">
                      <p className="agenda-item-title">{apt.title}</p>
                      {apt.description && <p className="agenda-item-desc">{apt.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep.key === 'focus' && (
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Sua próxima ação prioritária</p>
              {pendingTasks.length > 0 ? (
                <div className="card" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-glow)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--purple), transparent)' }} />
                  <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{pendingTasks[0].title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{pendingTasks[0].context || 'Tarefa estratégica'}</p>
                  <button className="btn btn-primary btn-sm" onClick={() => { handleClose(); navigate('/focus'); }}>
                    <Play size={12} /> Iniciar Foco
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>
                  <Target size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                  <p style={{ fontSize: 12 }}>Nenhuma tarefa pendente. Sistema limpo!</p>
                </div>
              )}
              {pendingTasks.length > 1 && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>+{pendingTasks.length - 1} tarefa(s) restante(s)</p>}
            </div>
          )}

          {currentStep.key === 'done' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
              <p style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Rotina Configurada</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 320, margin: '0 auto' }}>Sua rotina está alinhada. Hora de executar com precisão.</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
                {mood && <span className="badge badge-amber">Mood: {mood}</span>}
                <span className="badge badge-coral">{todayPriorities.filter(p => !p.done).length} prioridades</span>
                <span className="badge badge-green">{todayLogs.filter(l => l.status === 'done').length}/{activeHabits.length} hábitos</span>
                <span className="badge badge-blue">{todayAppointments.length} compromissos</span>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, gap: 8 }}>
            {step > 0 && !isLast ? (
              <button className="btn btn-secondary" onClick={prev}>Voltar</button>
            ) : <div />}
            {isLast ? (
              <button className="btn btn-primary" onClick={handleClose} style={{ marginLeft: 'auto' }}>Começar o dia <ArrowRight size={14} /></button>
            ) : (
              <button className="btn btn-primary" onClick={next}>Próximo <ChevronRight size={14} /></button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile, focusPhrase } = useConfigStore();
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const [routineOpen, setRoutineOpen] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div className="page-header" style={{ marginBottom: 8 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700 }}>
              {getGreeting()}, <span style={{ color: 'var(--coral)' }}>{profile.name}</span>
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'capitalize', marginTop: 4 }}>{today}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setRoutineOpen(true)}>Continuar rotina <ChevronRight size={14} /></button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '2px solid var(--coral)', paddingLeft: 12, marginTop: 12 }}>"{focusPhrase}"</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <NextAction />
        <LifeScore />
      </div>
      <div className="grid-3" style={{ marginBottom: 16 }}>
        <DailyPriorities />
        <HabitSnapshot />
        <MoodCheckin />
      </div>
      <div className="grid-2">
        <TimelineWidget />
        <SmartInsights />
      </div>

      <RoutineModal open={routineOpen} onClose={() => setRoutineOpen(false)} />
    </div>
  );
}
