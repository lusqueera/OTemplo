// ===== INSIGHTS AI ENGINE =====
// Processes cross-module data and generates intelligent insights

function getDaysArray(n) {
  const arr = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    arr.push(d.toISOString().split('T')[0]);
  }
  return arr;
}

function trend(arr) {
  if (arr.length < 2) return 0;
  const n = arr.length;
  const xMean = (n - 1) / 2;
  const yMean = arr.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  arr.forEach((y, i) => { num += (i - xMean) * (y - yMean); den += (i - xMean) ** 2; });
  return den === 0 ? 0 : num / den;
}

function pctChange(curr, prev) {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

const moodMap = { frustrated: 1, low: 2, neutral: 3, good: 4, peak: 5 };

export function generateInsights({ habits, habitLogs, sessions, transactions, moodHistory, workoutLogs, reviews, dailyPriorities }) {
  const days30 = getDaysArray(30);
  const days7 = getDaysArray(7);
  const days14prev = getDaysArray(14).slice(0, 7);

  const insights = [];
  const alerts = [];
  const recommendations = [];
  const kpis = [];
  const predictions = [];

  try {
    // ===== FOCUS ANALYSIS =====
    const focusMinByDay = days30.map(d => {
      const ds = sessions.filter(s => s.startTime?.startsWith(d) && s.endTime);
      return ds.reduce((a, s) => a + (new Date(s.endTime) - new Date(s.startTime)) / 60000, 0);
    });
    const focusLast7 = focusMinByDay.slice(-7);
    const focusPrev7 = focusMinByDay.slice(-14, -7);
    const avgFocus7 = focusLast7.reduce((a, b) => a + b, 0) / 7;
    const avgFocusPrev = focusPrev7.reduce((a, b) => a + b, 0) / 7;
    const focusTrend = trend(focusLast7);
    const focusChange = pctChange(avgFocus7, avgFocusPrev);

    kpis.push({ label: 'Foco Médio/Dia', value: `${Math.round(avgFocus7)}min`, change: focusChange, color: 'var(--coral)', icon: 'Zap' });

    if (avgFocus7 > 0) {
      if (focusTrend > 2) {
        insights.push({ type: 'positive', icon: '📈', title: 'Foco em Ascensão', text: `Sua média de foco cresceu ${Math.abs(focusChange)}% vs semana anterior. Tendência de alta consistente.`, module: 'focus' });
      } else if (focusTrend < -2) {
        alerts.push({ type: 'warning', icon: '⚠️', title: 'Queda no Foco', text: `Foco reduziu ${Math.abs(focusChange)}% comparado à semana anterior. Considere ajustar sua rotina.`, module: 'focus' });
      }
      if (avgFocus7 >= 90) {
        insights.push({ type: 'positive', icon: '🏆', title: 'Performance Elite', text: `${Math.round(avgFocus7)}min/dia de foco profundo. Você está no top tier de produtividade.`, module: 'focus' });
      } else if (avgFocus7 < 30 && avgFocus7 > 0) {
        recommendations.push({ icon: '🎯', title: 'Aumente o Foco', text: 'Tente sessões Pomodoro de 25min para construir o hábito de foco gradualmente.', priority: 'high' });
      }
      const bestDay = focusLast7.indexOf(Math.max(...focusLast7));
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const bestDayDate = new Date(days7[bestDay]);
      insights.push({ type: 'info', icon: '💡', title: 'Melhor Dia de Foco', text: `${dayNames[bestDayDate.getDay()]} foi seu melhor dia com ${Math.round(focusLast7[bestDay])}min de foco.`, module: 'focus' });
    }

    // ===== HABITS ANALYSIS =====
    const activeHabits = habits.filter(h => h.status === 'active');
    const habitRateByDay = days30.map(d => {
      const done = habitLogs.filter(l => l.date === d && l.status === 'done').length;
      return activeHabits.length > 0 ? (done / activeHabits.length) * 100 : 0;
    });
    const habitLast7 = habitRateByDay.slice(-7);
    const habitPrev7 = habitRateByDay.slice(-14, -7);
    const avgHabit7 = habitLast7.reduce((a, b) => a + b, 0) / 7;
    const avgHabitPrev = habitPrev7.reduce((a, b) => a + b, 0) / 7;
    const habitChange = pctChange(avgHabit7, avgHabitPrev);
    const habitTrend = trend(habitLast7);

    kpis.push({ label: 'Consistência', value: `${Math.round(avgHabit7)}%`, change: habitChange, color: 'var(--green)', icon: 'Repeat' });

    if (activeHabits.length > 0) {
      if (avgHabit7 >= 80) {
        insights.push({ type: 'positive', icon: '🔥', title: 'Consistência Excepcional', text: `${Math.round(avgHabit7)}% dos hábitos concluídos. Disciplina em nível máximo!`, module: 'habits' });
      } else if (avgHabit7 < 40 && avgHabit7 > 0) {
        alerts.push({ type: 'critical', icon: '🚨', title: 'Hábitos em Risco', text: `Apenas ${Math.round(avgHabit7)}% de consistência. Reduza a quantidade e foque nos essenciais.`, module: 'habits' });
        recommendations.push({ icon: '📋', title: 'Simplifique Hábitos', text: `Você tem ${activeHabits.length} hábitos ativos. Tente focar em 3-5 hábitos-chave primeiro.`, priority: 'high' });
      }
      if (habitTrend > 1.5) {
        predictions.push({ icon: '📊', title: 'Projeção de Hábitos', text: `Mantendo essa tendência, você atingirá 90%+ de consistência em ~${Math.max(1, Math.ceil((90 - avgHabit7) / (habitTrend * 1.2)))} dias.`, confidence: 'média' });
      }
    }

    // ===== FINANCE ANALYSIS =====
    const incLast30 = transactions.filter(t => t.type === 'income' && days30.includes(t.date)).reduce((a, t) => a + (t.amount || 0), 0);
    const expLast30 = transactions.filter(t => t.type === 'expense' && days30.includes(t.date)).reduce((a, t) => a + (t.amount || 0), 0);
    const savingsRate = incLast30 > 0 ? Math.round(((incLast30 - expLast30) / incLast30) * 100) : 0;

    kpis.push({ label: 'Taxa de Economia', value: `${savingsRate}%`, change: null, color: savingsRate >= 20 ? 'var(--green)' : 'var(--amber)', icon: 'Wallet' });

    if (incLast30 > 0 || expLast30 > 0) {
      if (savingsRate >= 30) {
        insights.push({ type: 'positive', icon: '💰', title: 'Saúde Financeira Excelente', text: `Economia de ${savingsRate}% da renda. Acima da meta recomendada de 20%.`, module: 'finance' });
      } else if (savingsRate < 10 && incLast30 > 0) {
        alerts.push({ type: 'warning', icon: '💸', title: 'Margem de Economia Baixa', text: `Apenas ${savingsRate}% economizado. Revise despesas não-essenciais.`, module: 'finance' });
      }
      if (expLast30 > incLast30 && incLast30 > 0) {
        alerts.push({ type: 'critical', icon: '🔴', title: 'Gastos Excedem Receita', text: `Despesas R$${(expLast30 - incLast30).toFixed(0)} acima da receita. Ação imediata necessária.`, module: 'finance' });
      }
      // Category analysis
      const catMap = {};
      transactions.filter(t => t.type === 'expense' && days30.includes(t.date)).forEach(t => {
        const c = t.category || 'Outros';
        catMap[c] = (catMap[c] || 0) + (t.amount || 0);
      });
      const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
      if (topCat && expLast30 > 0) {
        const pct = Math.round((topCat[1] / expLast30) * 100);
        if (pct > 40) {
          recommendations.push({ icon: '🔍', title: `Atenção: ${topCat[0]}`, text: `${pct}% dos gastos estão em "${topCat[0]}". Avalie se há otimização possível.`, priority: 'medium' });
        }
      }
    }

    // ===== MOOD ANALYSIS =====
    const moodByDay = days30.map(d => { const e = moodHistory.find(m => m.date === d); return e ? moodMap[e.mood] || 3 : null; });
    const validMood = moodByDay.filter(v => v !== null);
    const moodLast7 = moodByDay.slice(-7).filter(v => v !== null);
    const avgMood = validMood.length > 0 ? validMood.reduce((a, b) => a + b, 0) / validMood.length : 0;
    const moodTrend = trend(moodLast7);

    if (validMood.length > 0) {
      const moodLabels = { 1: 'Frustrado', 2: 'Baixo', 3: 'Neutro', 4: 'Bom', 5: 'Peak' };
      kpis.push({ label: 'Humor Médio', value: moodLabels[Math.round(avgMood)] || '—', change: null, color: avgMood >= 4 ? 'var(--green)' : avgMood >= 3 ? 'var(--amber)' : 'var(--red)', icon: 'Activity' });
      if (moodTrend < -0.3) {
        alerts.push({ type: 'warning', icon: '😔', title: 'Humor em Declínio', text: 'Tendência negativa no humor. Priorize descanso e atividades prazerosas.', module: 'mood' });
        recommendations.push({ icon: '🧘', title: 'Cuide da Mente', text: 'Inclua pausas ativas, meditação ou exercício leve na rotina.', priority: 'high' });
      }
    } else {
      kpis.push({ label: 'Humor Médio', value: '—', change: null, color: 'var(--text-muted)', icon: 'Activity' });
    }

    // ===== TRAINING ANALYSIS =====
    const workoutsLast7 = workoutLogs.filter(l => days7.some(d => l.date?.startsWith(d))).length;
    const workoutsLast30 = workoutLogs.filter(l => days30.some(d => l.date?.startsWith(d))).length;
    const trainMinLast30 = workoutLogs.filter(l => days30.some(d => l.date?.startsWith(d))).reduce((a, l) => a + (l.duration || 0), 0);

    kpis.push({ label: 'Treinos/Semana', value: `${workoutsLast7}x`, change: null, color: '#f472b6', icon: 'Dumbbell' });

    if (workoutsLast30 > 0) {
      const freq = workoutsLast30 / 4.3;
      if (freq >= 4) {
        insights.push({ type: 'positive', icon: '💪', title: 'Treino Consistente', text: `${freq.toFixed(1)}x/semana. Frequência ideal para resultados sólidos.`, module: 'training' });
      } else if (freq < 2 && freq > 0) {
        recommendations.push({ icon: '🏋️', title: 'Aumente a Frequência', text: 'Tente 3-4x/semana para resultados mais rápidos. Comece com treinos curtos de 30min.', priority: 'medium' });
      }
    }

    // ===== CROSS-MODULE CORRELATIONS =====
    if (avgFocus7 > 60 && avgHabit7 > 70) {
      insights.push({ type: 'positive', icon: '🔗', title: 'Sinergia Detectada', text: 'Alto foco + alta consistência de hábitos. Seus sistemas estão trabalhando juntos!', module: 'cross' });
    }

    if (validMood.length > 0 && focusLast7.length > 0) {
      const highMoodDays = days7.filter((d, i) => { const m = moodByDay[moodByDay.length - 7 + i]; return m && m >= 4; });
      const highMoodFocus = highMoodDays.map(d => {
        const ds = sessions.filter(s => s.startTime?.startsWith(d) && s.endTime);
        return ds.reduce((a, s) => a + (new Date(s.endTime) - new Date(s.startTime)) / 60000, 0);
      });
      if (highMoodFocus.length > 0) {
        const avgHighMoodFocus = highMoodFocus.reduce((a, b) => a + b, 0) / highMoodFocus.length;
        if (avgHighMoodFocus > avgFocus7 * 1.2) {
          insights.push({ type: 'info', icon: '🧠', title: 'Humor → Foco', text: `Em dias de bom humor, seu foco é ${Math.round(((avgHighMoodFocus / avgFocus7) - 1) * 100)}% maior. Cuide do bem-estar!`, module: 'cross' });
        }
      }
    }

    // ===== OVERALL SCORE =====
    let score = 50;
    if (avgFocus7 >= 60) score += 10; else if (avgFocus7 >= 30) score += 5;
    if (avgHabit7 >= 70) score += 15; else if (avgHabit7 >= 40) score += 7;
    if (savingsRate >= 20) score += 10; else if (savingsRate >= 10) score += 5;
    if (avgMood >= 4) score += 10; else if (avgMood >= 3) score += 5;
    if (workoutsLast7 >= 3) score += 5;
    score = Math.min(100, Math.max(0, score));

    // ===== PREDICTIONS =====
    if (focusTrend > 0 && avgFocus7 > 0) {
      const projected = Math.round(avgFocus7 + focusTrend * 7);
      predictions.push({ icon: '🔮', title: 'Projeção de Foco', text: `Se mantiver o ritmo, projetamos ~${projected}min/dia de foco na próxima semana.`, confidence: 'alta' });
    }
    if (expLast30 > 0) {
      const dailyAvgExp = expLast30 / 30;
      const projectedMonthly = Math.round(dailyAvgExp * 30);
      predictions.push({ icon: '📉', title: 'Projeção de Gastos', text: `Projeção mensal: R$${projectedMonthly}. ${savingsRate >= 20 ? 'Dentro do saudável.' : 'Considere otimizar.'}`, confidence: 'alta' });
    }

    // Chart data
    const performanceChart = days30.map((d, i) => ({
      day: d.slice(5),
      foco: Math.round(focusMinByDay[i] || 0),
      habitos: Math.round(habitRateByDay[i] || 0),
      humor: moodByDay[i] ? moodByDay[i] * 20 : null,
    }));

    return { insights, alerts, recommendations, kpis, predictions, score, performanceChart, generatedAt: new Date().toISOString() };
  } catch (error) {
    console.error("Insights AI Engine Error:", error);
    return { insights: [], alerts: [], recommendations: [], kpis: [], predictions: [], score: 50, performanceChart: [], generatedAt: new Date().toISOString() };
  }
}
