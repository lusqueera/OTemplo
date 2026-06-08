import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Sparkles, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Zap, Repeat, Wallet, Dumbbell, Activity, ChevronRight, ArrowUpRight, ArrowDownRight, Eye, BrainCircuit, Target, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitStore, useFocusStore, useFinanceStore, useConfigStore, useWorkoutStore, useReviewStore } from '../../store/stores';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { generateInsights } from './insightsEngine';

const ICON_MAP = { Zap, Repeat, Wallet, Dumbbell, Activity };

function ScoreRing({ score }) {
  const r = 58, c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--coral)';
  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
        <motion.circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.span style={{ fontSize: 32, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>{score}</motion.span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Score</span>
      </div>
    </div>
  );
}

function KpiCard({ kpi, index }) {
  const Icon = ICON_MAP[kpi.icon] || Zap;
  return (
    <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }} style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, ${kpi.color}08, transparent)`, borderRadius: '0 var(--radius-lg) 0 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${kpi.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={kpi.color} />
        </div>
        {kpi.change !== null && kpi.change !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)',
            color: kpi.change >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {kpi.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(kpi.change)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: kpi.color, fontFamily: 'var(--font-mono)' }}>{kpi.value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>{kpi.label}</div>
    </motion.div>
  );
}

function InsightCard({ item, index, variant }) {
  const colors = { positive: 'var(--green)', warning: 'var(--amber)', critical: 'var(--red)', info: 'var(--blue)' };
  const bgColors = { positive: 'var(--green-dim)', warning: 'var(--amber-dim)', critical: 'var(--red-dim)', info: 'var(--blue-dim)' };
  const c = colors[item.type] || 'var(--coral)';
  const bg = bgColors[item.type] || 'var(--coral-dim)';
  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * index }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderLeft: `3px solid ${c}`,
        borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
        {item.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{item.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.text}</div>
        {item.module && (
          <span style={{ display: 'inline-flex', marginTop: 8, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--bg-elevated)', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: 0.5, textTransform: 'uppercase' }}>{item.module}</span>
        )}
      </div>
    </motion.div>
  );
}

function RecommendationCard({ item, index }) {
  const pColors = { high: 'var(--coral)', medium: 'var(--amber)', low: 'var(--blue)' };
  const pLabels = { high: 'Alta', medium: 'Média', low: 'Baixa' };
  const c = pColors[item.priority] || 'var(--coral)';
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * index }}
      className="card card-glow" style={{ cursor: 'default' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</span>
            <span style={{ padding: '1px 6px', borderRadius: 'var(--radius-full)', background: `${c}18`, color: c, fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: 0.5 }}>
              {pLabels[item.priority]}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.text}</div>
        </div>
      </div>
    </motion.div>
  );
}

function PredictionCard({ item, index }) {
  const confColors = { alta: 'var(--green)', média: 'var(--amber)', baixa: 'var(--text-muted)' };
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * index }}
      style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(167,139,250,0.05) 100%)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)', padding: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20 }}>{item.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.text}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: confColors[item.confidence] }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Confiança: {item.confidence}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PerformanceChart({ data }) {
  const tooltipStyle = { background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, fontSize: 12 };
  return (
    <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
      <div className="card-header">
        <span className="card-title">Evolução 30 Dias</span>
        <Eye size={14} color="var(--text-muted)" />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gFoco" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--coral)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--coral)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gHabitos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--green)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} interval={4} />
          <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [n === 'foco' ? `${v}min` : `${v}%`, n === 'foco' ? 'Foco' : 'Hábitos']} />
          <Area type="monotone" dataKey="foco" stroke="var(--coral)" strokeWidth={2} fill="url(#gFoco)" />
          <Area type="monotone" dataKey="habitos" stroke="var(--green)" strokeWidth={2} fill="url(#gHabitos)" />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
          <span style={{ width: 12, height: 3, borderRadius: 2, background: 'var(--coral)' }} /> Foco (min)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
          <span style={{ width: 12, height: 3, borderRadius: 2, background: 'var(--green)' }} /> Hábitos (%)
        </div>
      </div>
    </motion.div>
  );
}

export default function InsightsAI() {
  const { habits, logs: habitLogs } = useHabitStore();
  const { sessions } = useFocusStore();
  const { transactions } = useFinanceStore();
  const { moodHistory, dailyPriorities } = useConfigStore();
  const { logs: workoutLogs } = useWorkoutStore();
  const { reviews } = useReviewStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(null);

  const data = useMemo(() => generateInsights({
    habits, habitLogs, sessions, transactions, moodHistory, workoutLogs, reviews, dailyPriorities
  }), [habits, habitLogs, sessions, transactions, moodHistory, workoutLogs, reviews, dailyPriorities]);

  useEffect(() => { setLastUpdate(new Date()); }, [data]);

  const handleRefresh = useCallback(() => {
    setIsProcessing(true);
    setTimeout(() => { setIsProcessing(false); setLastUpdate(new Date()); }, 1800);
  }, []);

  const tabs = [
    { key: 'all', label: 'Visão Geral', icon: BrainCircuit },
    { key: 'insights', label: 'Insights', icon: Lightbulb, count: data.insights.length },
    { key: 'alerts', label: 'Alertas', icon: AlertTriangle, count: data.alerts.length },
    { key: 'recs', label: 'Ações', icon: Target, count: data.recommendations.length },
    { key: 'predictions', label: 'Projeções', icon: TrendingUp, count: data.predictions.length },
  ];

  const hasData = data.insights.length > 0 || data.alerts.length > 0 || data.recommendations.length > 0 || data.predictions.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Sparkles size={20} style={{ display: 'inline', marginRight: 8, color: 'var(--purple)' }} />
            INSIGHTS_AI
          </h1>
          <p className="page-subtitle">Análise inteligente de métricas cross-módulo</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastUpdate && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Atualizado {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button className="btn btn-secondary" onClick={handleRefresh} disabled={isProcessing}>
            <RefreshCw size={14} style={{ animation: isProcessing ? 'spin 1s linear infinite' : 'none' }} />
            {isProcessing ? 'Processando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Processing overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(255,107,107,0.05))', border: '1px solid rgba(167,139,250,0.2)',
              borderRadius: 'var(--radius-lg)', padding: '16px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="insights-pulse" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--purple)' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>IA processando dados...</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Analisando métricas, correlações e tendências</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasData && !isProcessing ? (
        <div className="empty-state" style={{ padding: 80 }}>
          <BrainCircuit size={48} />
          <h3 style={{ marginTop: 16, fontSize: 16, fontWeight: 600 }}>Sem dados suficientes</h3>
          <p style={{ marginTop: 8 }}>Comece a usar os módulos (Foco, Hábitos, Finanças, etc.) para gerar insights inteligentes.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 24 }}>
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.key} className={`tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
                  <Icon size={12} style={{ marginRight: 4, display: 'inline' }} />
                  {t.label}
                  {t.count > 0 && <span style={{ marginLeft: 4, padding: '0 5px', borderRadius: 'var(--radius-full)', background: activeTab === t.key ? 'var(--coral-dim)' : 'var(--bg-elevated)', fontSize: 10 }}>{t.count}</span>}
                </button>
              );
            })}
          </div>

          {/* ===== ALL TAB ===== */}
          {activeTab === 'all' && (
            <div className="animate-in">
              {/* Score + KPIs Row */}
              <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
                {/* Score Card */}
                <motion.div className="card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, minWidth: 200, background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(167,139,250,0.04) 100%)' }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Performance Geral</div>
                  <ScoreRing score={data.score} />
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 12, textAlign: 'center' }}>
                    {data.score >= 75 ? '🔥 Excelente!' : data.score >= 50 ? '📈 Bom progresso' : '🎯 Em construção'}
                  </div>
                </motion.div>

                {/* KPIs Grid */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, minWidth: 0 }}>
                  {data.kpis.map((kpi, i) => <KpiCard key={i} kpi={kpi} index={i} />)}
                </div>
              </div>

              {/* Alerts (prominent) */}
              {data.alerts.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={12} /> Alertas Ativos
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.alerts.map((a, i) => <InsightCard key={i} item={a} index={i} />)}
                  </div>
                </div>
              )}

              {/* Chart + Top Insights */}
              <div className="grid-2" style={{ marginBottom: 24 }}>
                <PerformanceChart data={data.performanceChart} />
                <div>
                  <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={12} /> Top Insights
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.insights.slice(0, 4).map((ins, i) => <InsightCard key={i} item={ins} index={i} />)}
                    {data.insights.length === 0 && (
                      <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                        Insights serão gerados conforme você usa o sistema.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommendations + Predictions */}
              <div className="grid-2">
                <div>
                  <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Target size={12} /> Recomendações
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.recommendations.length > 0 ? data.recommendations.map((r, i) => <RecommendationCard key={i} item={r} index={i} />) : (
                      <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                        Nenhuma recomendação no momento. Continue assim! ✨
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TrendingUp size={12} /> Projeções
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.predictions.length > 0 ? data.predictions.map((p, i) => <PredictionCard key={i} item={p} index={i} />) : (
                      <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                        Mais dados são necessários para gerar projeções.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== INSIGHTS TAB ===== */}
          {activeTab === 'insights' && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.insights.length > 0 ? data.insights.map((ins, i) => <InsightCard key={i} item={ins} index={i} />) : (
                <div className="empty-state"><p>Nenhum insight disponível ainda.</p></div>
              )}
            </div>
          )}

          {/* ===== ALERTS TAB ===== */}
          {activeTab === 'alerts' && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.alerts.length > 0 ? data.alerts.map((a, i) => <InsightCard key={i} item={a} index={i} />) : (
                <div className="empty-state" style={{ padding: 60 }}>
                  <Shield size={48} />
                  <p style={{ marginTop: 16 }}>Nenhum alerta ativo. Tudo sob controle! ✅</p>
                </div>
              )}
            </div>
          )}

          {/* ===== RECS TAB ===== */}
          {activeTab === 'recs' && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.recommendations.length > 0 ? data.recommendations.map((r, i) => <RecommendationCard key={i} item={r} index={i} />) : (
                <div className="empty-state" style={{ padding: 60 }}>
                  <Target size={48} />
                  <p style={{ marginTop: 16 }}>Sem recomendações. Performance otimizada! 🚀</p>
                </div>
              )}
            </div>
          )}

          {/* ===== PREDICTIONS TAB ===== */}
          {activeTab === 'predictions' && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.predictions.length > 0 ? data.predictions.map((p, i) => <PredictionCard key={i} item={p} index={i} />) : (
                <div className="empty-state" style={{ padding: 60 }}>
                  <TrendingUp size={48} />
                  <p style={{ marginTop: 16 }}>Mais dados são necessários para projeções.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
