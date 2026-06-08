import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Target, Repeat, Timer, Brain, Wallet, BookOpen, BarChart3, Settings, Plus, X, ListTodo, StickyNote, DollarSign, Crosshair, Zap, LogOut, User, Dumbbell, CalendarDays, Landmark, Sparkles, FileText, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { useAuthStore, useConfigStore, useHabitStore, useFocusStore, useFinanceStore, useInvestmentStore, useNotesStore, useReviewStore, useWorkoutStore, usePriorityStore } from 'src/store/stores';
import { syncAllFromBackend } from 'src/store/sync';
import ToastContainer from 'src/components/ui/ToastContainer';
import { LoginPage, RegisterPage } from 'src/modules/auth/AuthPages';
import Dashboard from 'src/modules/dashboard/Dashboard';
import PriorityOS from 'src/modules/priority/PriorityOS';
import HabitOS from 'src/modules/habits/HabitOS';
import FocusOS from 'src/modules/focus/FocusOS';
import BrainOS from 'src/modules/brain/BrainOS';
import FinanceOS from 'src/modules/finance/FinanceOS';
import ReviewOS from 'src/modules/review/ReviewOS';
import AnalyticsOS from 'src/modules/analytics/AnalyticsOS';
import TrainingOS from 'src/modules/training/TrainingOS';
import AgendaOS from 'src/modules/agenda/AgendaOS';
import InvestmentsOS from 'src/modules/investments/InvestmentsOS';
import InsightsAI from 'src/modules/insights/InsightsAI';
import NotesOS from 'src/modules/notes/NotesOS';
import SystemConfig from 'src/modules/config/SystemConfig';
import AdminOS from 'src/modules/admin/AdminOS';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', section: null },
  { path: '/priority', icon: Target, label: 'Priority_OS', section: 'modules' },
  { path: '/habits', icon: Repeat, label: 'Habit_OS', section: 'modules' },
  { path: '/focus', icon: Timer, label: 'Focus_OS', section: 'modules' },
  { path: '/brain', icon: Brain, label: 'Brain_OS', section: 'modules' },
  { path: '/finance', icon: Wallet, label: 'Finance_OS', section: 'modules' },
  { path: '/review', icon: BookOpen, label: 'Review_OS', section: 'modules' },
  { path: '/training', icon: Dumbbell, label: 'Training_OS', section: 'modules' },
  { path: '/agenda', icon: CalendarDays, label: 'Agenda_OS', section: 'modules' },
  { path: '/investments', icon: Landmark, label: 'Invest_OS', section: 'modules' },
  { path: '/notes', icon: FileText, label: 'Notes_OS', section: 'modules' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics', section: 'system' },
  { path: '/insights', icon: Sparkles, label: 'Insights_AI', section: 'system' },
  { path: '/config', icon: Settings, label: 'System_Config', section: 'system' },
];

function QuickCaptureFAB() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const items = [
    { icon: ListTodo, label: 'Nova Tarefa', color: 'var(--coral)', route: '/priority' },
    { icon: StickyNote, label: 'Nova Nota', color: 'var(--blue)', route: '/brain' },
    { icon: DollarSign, label: 'Nova Despesa', color: 'var(--amber)', route: '/finance' },
    { icon: Crosshair, label: 'Nova Meta', color: 'var(--green)', route: '/priority' },
    { icon: Zap, label: 'Sessão Foco', color: 'var(--purple)', route: '/focus' },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 198 }}
              onClick={() => setOpen(false)}
            />
            <motion.div className="fab-menu" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
              {items.map((item, i) => (
                <motion.button
                  key={item.label}
                  className="fab-menu-item"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                  onClick={() => { navigate(item.route); setOpen(false); }}
                >
                  <item.icon size={16} style={{ color: item.color }} />
                  {item.label}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <button className="fab" onClick={() => setOpen(!open)} style={{ transform: open ? 'rotate(45deg)' : 'none' }}>
        {open ? <X size={24} /> : <Plus size={24} />}
      </button>
    </>
  );
}

function AuthGate() {
  const [page, setPage] = useState('login');

  if (page === 'register') {
    return <RegisterPage onSwitch={() => setPage('login')} />;
  }
  return <LoginPage onSwitch={() => setPage('register')} />;
}

function AppShell() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { profileImage } = useConfigStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  // Sincroniza dados do backend ao montar
  useEffect(() => {
    syncAllFromBackend({
      habits: useHabitStore,
      focus: useFocusStore,
      finance: useFinanceStore,
      investments: useInvestmentStore,
      notes: useNotesStore,
      reviews: useReviewStore,
      workouts: useWorkoutStore,
      priority: usePriorityStore,
    });
  }, []);

  const systemItems = [...navItems.filter(n => n.section === 'system')];
  if (user?.role === 'admin') {
    systemItems.unshift({ path: '/admin', icon: ShieldCheck, label: 'Admin_OS', section: 'system' });
  }

  const grouped = {
    main: navItems.filter(n => !n.section),
    modules: navItems.filter(n => n.section === 'modules'),
    system: systemItems,
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="logo-icon">T</div>
          <div className="logo-text" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: 1 }}>O Templo</div>
        </div>
        <button className={`hamburger ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span /><span /><span />
        </button>
      </header>

      {/* Sidebar Backdrop (mobile) */}
      {sidebarOpen && <div className="sidebar-backdrop" onClick={closeSidebar} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">T</div>
          <div className="logo-text">O Templo</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            {grouped.main.map(item => (
              <NavLink key={item.path} to={item.path} end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                <item.icon size={18} />{item.label}
              </NavLink>
            ))}
          </div>
          <div className="nav-section">
            <div className="nav-section-label">Módulos</div>
            {grouped.modules.map(item => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                <item.icon size={18} />{item.label}
              </NavLink>
            ))}
          </div>
          <div className="nav-section">
            <div className="nav-section-label">Sistema</div>
            {grouped.system.map(item => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                <item.icon size={18} />{item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User footer */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--coral-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {profileImage ? <img src={profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={14} color="var(--coral)" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Operador'}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || ''}</p>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Sair" style={{ flexShrink: 0 }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/priority" element={<PriorityOS />} />
              <Route path="/habits" element={<HabitOS />} />
              <Route path="/focus" element={<FocusOS />} />
              <Route path="/brain" element={<BrainOS />} />
              <Route path="/finance" element={<FinanceOS />} />
              <Route path="/review" element={<ReviewOS />} />
              <Route path="/training" element={<TrainingOS />} />
              <Route path="/agenda" element={<AgendaOS />} />
              <Route path="/investments" element={<InvestmentsOS />} />
              <Route path="/notes" element={<NotesOS />} />
              <Route path="/analytics" element={<AnalyticsOS />} />
              <Route path="/insights" element={<InsightsAI />} />
              <Route path="/config" element={<SystemConfig />} />
              <Route path="/admin" element={<AdminOS />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <QuickCaptureFAB />
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <ToastContainer />
      {isAuthenticated ? <AppShell /> : <AuthGate />}
    </>
  );
}
