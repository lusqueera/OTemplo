import { create } from 'zustand';
import { nanoid } from 'nanoid';

const persist = (key, fn) => (set, get) => {
  const stored = localStorage.getItem(key);
  const initial = fn(set, get);
  if (stored) {
    try { Object.assign(initial, JSON.parse(stored)); } catch {}
  }
  return new Proxy(initial, {
    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  });
};

const save = (key, state) => {
  const s = { ...state };
  Object.keys(s).forEach(k => { if (typeof s[k] === 'function') delete s[k]; });
  localStorage.setItem(key, JSON.stringify(s));
};

const getCurrentUserId = () => {
  try {
    const auth = JSON.parse(localStorage.getItem('coreos_auth'));
    return auth?.user?.id || null;
  } catch { return null; }
};

const getStoreKey = (base) => {
  const uid = getCurrentUserId();
  return uid ? `${base}_${uid}` : base;
};

// ==================== PRIORITY STORE ====================
export const usePriorityStore = create((set, get) => {
  const KEY = getStoreKey('coreos_priority');
  const stored = localStorage.getItem(KEY);
  let init = { objectives: [], milestones: [], tasks: [] };
  if (stored) try { init = { ...init, ...JSON.parse(stored) }; } catch {}

  const _save = () => {
    const { objectives, milestones, tasks } = get();
    localStorage.setItem(KEY, JSON.stringify({ objectives, milestones, tasks }));
  };

  return {
    ...init,
    addObjective: (obj) => { set(s => ({ objectives: [...s.objectives, { id: nanoid(), createdAt: new Date().toISOString(), status: 'active', progress: 0, ...obj }] })); _save(); },
    updateObjective: (id, data) => { set(s => ({ objectives: s.objectives.map(o => o.id === id ? { ...o, ...data } : o) })); _save(); },
    deleteObjective: (id) => { set(s => ({ objectives: s.objectives.filter(o => o.id !== id) })); _save(); },

    addMilestone: (m) => { set(s => ({ milestones: [...s.milestones, { id: nanoid(), createdAt: new Date().toISOString(), status: 'pending', ...m }] })); _save(); },
    updateMilestone: (id, data) => { set(s => ({ milestones: s.milestones.map(m => m.id === id ? { ...m, ...data } : m) })); _save(); },
    deleteMilestone: (id) => { set(s => ({ milestones: s.milestones.filter(m => m.id !== id) })); _save(); },

    addTask: (t) => { set(s => ({ tasks: [...s.tasks, { id: nanoid(), createdAt: new Date().toISOString(), status: 'pending', ...t }] })); _save(); },
    updateTask: (id, data) => { set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...data } : t) })); _save(); },
    deleteTask: (id) => { set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })); _save(); },
  };
});

// ==================== HABIT STORE ====================
export const useHabitStore = create((set, get) => {
  const KEY = getStoreKey('coreos_habits');
  const stored = localStorage.getItem(KEY);
  let init = { habits: [], logs: [] };
  if (stored) try { init = { ...init, ...JSON.parse(stored) }; } catch {}

  const _save = () => {
    const { habits, logs } = get();
    localStorage.setItem(KEY, JSON.stringify({ habits, logs }));
  };

  return {
    ...init,
    addHabit: (h) => { set(s => ({ habits: [...s.habits, { id: nanoid(), createdAt: new Date().toISOString(), status: 'active', streak: 0, ...h }] })); _save(); },
    updateHabit: (id, data) => { set(s => ({ habits: s.habits.map(h => h.id === id ? { ...h, ...data } : h) })); _save(); },
    deleteHabit: (id) => { set(s => ({ habits: s.habits.filter(h => h.id !== id) })); _save(); },
    logHabit: (habitId, status, date) => {
      const logDate = date || new Date().toISOString().split('T')[0];
      set(s => {
        const existing = s.logs.findIndex(l => l.habitId === habitId && l.date === logDate);
        let newLogs;
        if (existing >= 0) {
          newLogs = [...s.logs]; newLogs[existing] = { ...newLogs[existing], status };
        } else {
          newLogs = [...s.logs, { id: nanoid(), habitId, date: logDate, status }];
        }
        return { logs: newLogs };
      });
      _save();
    },
  };
});

// ==================== FOCUS STORE ====================
export const useFocusStore = create((set, get) => {
  const KEY = getStoreKey('coreos_focus');
  const stored = localStorage.getItem(KEY);
  let init = { sessions: [], activeSession: null };
  if (stored) try { init = { ...init, ...JSON.parse(stored) }; } catch {}

  const _save = () => {
    const { sessions, activeSession } = get();
    localStorage.setItem(KEY, JSON.stringify({ sessions, activeSession }));
  };

  return {
    ...init,
    startSession: (data) => {
      const session = { id: nanoid(), startTime: new Date().toISOString(), status: 'active', ...data };
      set({ activeSession: session }); _save();
    },
    endSession: (result) => {
      const { activeSession } = get();
      if (!activeSession) return;
      const completed = { ...activeSession, ...result, endTime: new Date().toISOString(), status: 'completed' };
      set(s => ({ sessions: [...s.sessions, completed], activeSession: null }));
      _save();
    },
    cancelSession: () => { set({ activeSession: null }); _save(); },
  };
});

// ==================== BRAIN STORE ====================
export const useBrainStore = create((set, get) => {
  const KEY = 'coreos_brain';
  const stored = localStorage.getItem(KEY);
  let init = { notes: [] };
  if (stored) try { init = { ...init, ...JSON.parse(stored) }; } catch {}

  const _save = () => {
    const { notes } = get();
    localStorage.setItem(KEY, JSON.stringify({ notes }));
  };

  return {
    ...init,
    addNote: (n) => { set(s => ({ notes: [...s.notes, { id: nanoid(), createdAt: new Date().toISOString(), status: 'active', ...n }] })); _save(); },
    updateNote: (id, data) => { set(s => ({ notes: s.notes.map(n => n.id === id ? { ...n, ...data } : n) })); _save(); },
    deleteNote: (id) => { set(s => ({ notes: s.notes.filter(n => n.id !== id) })); _save(); },
    archiveNote: (id) => { set(s => ({ notes: s.notes.map(n => n.id === id ? { ...n, status: 'archived' } : n) })); _save(); },
  };
});

// ==================== FINANCE STORE ====================
export const useFinanceStore = create((set, get) => {
  const KEY = getStoreKey('coreos_finance');
  const stored = localStorage.getItem(KEY);
  let init = { transactions: [], categories: [
    { id: 'cat-1', name: 'Moradia', monthlyLimit: 0, color: '#ff6b6b' },
    { id: 'cat-2', name: 'Alimentação', monthlyLimit: 0, color: '#f0a500' },
    { id: 'cat-3', name: 'Transporte', monthlyLimit: 0, color: '#60a5fa' },
    { id: 'cat-4', name: 'Lazer', monthlyLimit: 0, color: '#a78bfa' },
    { id: 'cat-5', name: 'Saúde', monthlyLimit: 0, color: '#2dd4a8' },
    { id: 'cat-6', name: 'Educação', monthlyLimit: 0, color: '#f472b6' },
    { id: 'cat-7', name: 'Salário', monthlyLimit: 0, color: '#34d399' },
    { id: 'cat-8', name: 'Outros', monthlyLimit: 0, color: '#6b7280' },
  ], goals: [] };
  if (stored) try { init = { ...init, ...JSON.parse(stored) }; } catch {}

  const _save = () => {
    const { transactions, categories, goals } = get();
    localStorage.setItem(KEY, JSON.stringify({ transactions, categories, goals }));
  };

  return {
    ...init,
    addTransaction: (t) => { set(s => ({ transactions: [...s.transactions, { id: nanoid(), createdAt: new Date().toISOString(), ...t }] })); _save(); },
    updateTransaction: (id, data) => { set(s => ({ transactions: s.transactions.map(t => t.id === id ? { ...t, ...data } : t) })); _save(); },
    deleteTransaction: (id) => { set(s => ({ transactions: s.transactions.filter(t => t.id !== id) })); _save(); },
    importTransactions: (items) => { set(s => ({ transactions: [...s.transactions, ...items.map(t => ({ id: nanoid(), createdAt: new Date().toISOString(), ...t }))] })); _save(); },
    addCategory: (c) => { set(s => ({ categories: [...s.categories, { id: nanoid(), ...c }] })); _save(); },
    deleteCategory: (id) => { set(s => ({ categories: s.categories.filter(c => c.id !== id) })); _save(); },
    addGoal: (g) => { set(s => ({ goals: [...s.goals, { id: nanoid(), createdAt: new Date().toISOString(), status: 'active', current: 0, ...g }] })); _save(); },
    updateGoal: (id, data) => { set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, ...data } : g) })); _save(); },
    deleteGoal: (id) => { set(s => ({ goals: s.goals.filter(g => g.id !== id) })); _save(); },
  };
});

// ==================== REVIEW STORE ====================
export const useReviewStore = create((set, get) => {
  const KEY = getStoreKey('coreos_reviews');
  const stored = localStorage.getItem(KEY);
  let init = { reviews: [] };
  if (stored) try { init = { ...init, ...JSON.parse(stored) }; } catch {}

  const _save = () => {
    const { reviews } = get();
    localStorage.setItem(KEY, JSON.stringify({ reviews }));
  };

  return {
    ...init,
    addReview: (r) => { set(s => ({ reviews: [...s.reviews, { id: nanoid(), createdAt: new Date().toISOString(), ...r }] })); _save(); },
    updateReview: (id, data) => { set(s => ({ reviews: s.reviews.map(r => r.id === id ? { ...r, ...data } : r) })); _save(); },
    deleteReview: (id) => { set(s => ({ reviews: s.reviews.filter(r => r.id !== id) })); _save(); },
  };
});

// ==================== CONFIG STORE ====================
export const useConfigStore = create((set, get) => {
  const KEY = getStoreKey('coreos_config');
  const stored = localStorage.getItem(KEY);
  let init = {
    profile: { name: 'Operador', archetype: 'Estrategista', intensity: 'high', mainObjectives: [] },
    profileImage: null,
    preferences: { theme: 'dark', notifications: true, focusDuration: 25, modules: ['dashboard','priority','habits','focus','brain','finance','review','analytics','config'] },
    dailyPriorities: [],
    mood: null,
    moodHistory: [],
    focusPhrase: 'Execute com precisão.',
  };
  if (stored) try { init = { ...init, ...JSON.parse(stored) }; } catch {}

  const _save = () => {
    const s = get();
    const { updateProfile, updatePreferences, setMood, setFocusPhrase, setProfileImage, addDailyPriority, updateDailyPriority, deleteDailyPriority, reorderPriorities, ...data } = s;
    localStorage.setItem(KEY, JSON.stringify(data));
  };

  return {
    ...init,
    updateProfile: (data) => { set(s => ({ profile: { ...s.profile, ...data } })); _save(); },
    setProfileImage: (img) => { set({ profileImage: img }); _save(); },
    updatePreferences: (data) => { set(s => ({ preferences: { ...s.preferences, ...data } })); _save(); },
    setMood: (mood) => {
      const entry = { mood, date: new Date().toISOString().split('T')[0], time: new Date().toISOString() };
      set(s => ({ mood, moodHistory: [...s.moodHistory, entry] }));
      _save();
    },
    setFocusPhrase: (phrase) => { set({ focusPhrase: phrase }); _save(); },
    addDailyPriority: (p) => { set(s => ({ dailyPriorities: [...s.dailyPriorities, { id: nanoid(), done: false, createdAt: new Date().toISOString().split('T')[0], ...p }] })); _save(); },
    updateDailyPriority: (id, data) => { set(s => ({ dailyPriorities: s.dailyPriorities.map(p => p.id === id ? { ...p, ...data } : p) })); _save(); },
    deleteDailyPriority: (id) => { set(s => ({ dailyPriorities: s.dailyPriorities.filter(p => p.id !== id) })); _save(); },
    reorderPriorities: (priorities) => { set({ dailyPriorities: priorities }); _save(); },
  };
});

// ==================== WORKOUT STORE ====================
export const useWorkoutStore = create((set, get) => {
  const KEY = getStoreKey('coreos_workouts');
  const stored = localStorage.getItem(KEY);
  let init = {
    exercises: [
      { id: 'ex-1', name: 'Supino Reto', muscle: 'peito', type: 'compound' },
      { id: 'ex-2', name: 'Agachamento', muscle: 'pernas', type: 'compound' },
      { id: 'ex-3', name: 'Levantamento Terra', muscle: 'costas', type: 'compound' },
      { id: 'ex-4', name: 'Desenvolvimento', muscle: 'ombros', type: 'compound' },
      { id: 'ex-5', name: 'Rosca Direta', muscle: 'biceps', type: 'isolation' },
      { id: 'ex-6', name: 'Tríceps Corda', muscle: 'triceps', type: 'isolation' },
      { id: 'ex-7', name: 'Puxada Frontal', muscle: 'costas', type: 'compound' },
      { id: 'ex-8', name: 'Leg Press', muscle: 'pernas', type: 'compound' },
      { id: 'ex-9', name: 'Crucifixo', muscle: 'peito', type: 'isolation' },
      { id: 'ex-10', name: 'Elevação Lateral', muscle: 'ombros', type: 'isolation' },
      { id: 'ex-11', name: 'Prancha', muscle: 'core', type: 'isometric' },
      { id: 'ex-12', name: 'Corrida', muscle: 'cardio', type: 'cardio' },
    ],
    workouts: [],
    logs: [],
  };
  if (stored) try { init = { ...init, ...JSON.parse(stored) }; } catch {}

  const _save = () => {
    const { exercises, workouts, logs } = get();
    localStorage.setItem(KEY, JSON.stringify({ exercises, workouts, logs }));
  };

  return {
    ...init,
    addExercise: (e) => { set(s => ({ exercises: [...s.exercises, { id: nanoid(), ...e }] })); _save(); },
    updateExercise: (id, data) => { set(s => ({ exercises: s.exercises.map(e => e.id === id ? { ...e, ...data } : e) })); _save(); },
    deleteExercise: (id) => { set(s => ({ exercises: s.exercises.filter(e => e.id !== id) })); _save(); },

    addWorkout: (w) => {
      const workout = { id: nanoid(), createdAt: new Date().toISOString(), status: 'active', ...w, exercises: w.exercises || [] };
      set(s => ({ workouts: [...s.workouts, workout] }));
      _save();
    },
    updateWorkout: (id, data) => { set(s => ({ workouts: s.workouts.map(w => w.id === id ? { ...w, ...data } : w) })); _save(); },
    deleteWorkout: (id) => { set(s => ({ workouts: s.workouts.filter(w => w.id !== id) })); _save(); },

    logWorkout: (log) => {
      const entry = { id: nanoid(), date: new Date().toISOString(), ...log };
      set(s => ({ logs: [...s.logs, entry] }));
      _save();
    },
    deleteLog: (id) => { set(s => ({ logs: s.logs.filter(l => l.id !== id) })); _save(); },
  };
});

// ==================== AGENDA STORE ====================
export const useAgendaStore = create((set, get) => {
  const KEY = getStoreKey('coreos_agenda');
  const stored = localStorage.getItem(KEY);
  let init = { appointments: [] };
  if (stored) try { init = { ...init, ...JSON.parse(stored) }; } catch {}

  const _save = () => {
    const { appointments } = get();
    localStorage.setItem(KEY, JSON.stringify({ appointments }));
  };

  return {
    ...init,
    addAppointment: (a) => { set(s => ({ appointments: [...s.appointments, { id: nanoid(), createdAt: new Date().toISOString(), ...a }] })); _save(); },
    updateAppointment: (id, data) => { set(s => ({ appointments: s.appointments.map(a => a.id === id ? { ...a, ...data } : a) })); _save(); },
    deleteAppointment: (id) => { set(s => ({ appointments: s.appointments.filter(a => a.id !== id) })); _save(); },
  };
});

// ==================== INVESTMENT STORE ====================
export const useInvestmentStore = create((set, get) => {
  const KEY = getStoreKey('coreos_investments');
  const stored = localStorage.getItem(KEY);
  let init = { investments: [] };
  if (stored) try { init = { ...init, ...JSON.parse(stored) }; } catch {}

  const _save = () => {
    const { investments } = get();
    localStorage.setItem(KEY, JSON.stringify({ investments }));
  };

  return {
    ...init,
    addInvestment: (i) => { set(s => ({ investments: [...s.investments, { id: nanoid(), createdAt: new Date().toISOString(), ...i }] })); _save(); },
    updateInvestment: (id, data) => { set(s => ({ investments: s.investments.map(i => i.id === id ? { ...i, ...data } : i) })); _save(); },
    deleteInvestment: (id) => { set(s => ({ investments: s.investments.filter(i => i.id !== id) })); _save(); },
    importInvestments: (items) => { set(s => ({ investments: [...s.investments, ...items.map(i => ({ id: nanoid(), createdAt: new Date().toISOString(), ...i }))] })); _save(); },
  };
});

// ==================== NOTES STORE ====================
export const useNotesStore = create((set, get) => {
  const KEY = getStoreKey('coreos_notes');
  const stored = localStorage.getItem(KEY);
  let init = {
    notes: [],
    categories: ['Pessoal', 'Trabalho', 'Estudos', 'Projetos', 'Ideias', 'Lembretes'],
  };
  if (stored) try { init = { ...init, ...JSON.parse(stored) }; } catch {}

  const _save = () => {
    const { notes, categories } = get();
    localStorage.setItem(KEY, JSON.stringify({ notes, categories }));
  };

  return {
    ...init,
    addNote: (n) => {
      const now = new Date().toISOString();
      set(s => ({ notes: [{ id: nanoid(), createdAt: now, updatedAt: now, favorite: false, category: '', ...n }, ...s.notes] }));
      _save();
    },
    updateNote: (id, data) => {
      set(s => ({ notes: s.notes.map(n => n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n) }));
      _save();
    },
    deleteNote: (id) => { set(s => ({ notes: s.notes.filter(n => n.id !== id) })); _save(); },
    toggleFavorite: (id) => {
      set(s => ({ notes: s.notes.map(n => n.id === id ? { ...n, favorite: !n.favorite, updatedAt: new Date().toISOString() } : n) }));
      _save();
    },
    addCategory: (cat) => {
      set(s => ({ categories: s.categories.includes(cat) ? s.categories : [...s.categories, cat] }));
      _save();
    },
    deleteCategory: (cat) => {
      set(s => ({ categories: s.categories.filter(c => c !== cat) }));
      _save();
    },
  };
});

// ==================== AUTH STORE ====================
async function hashPassword(pw) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pw);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const useAuthStore = create((set, get) => {
  const KEY = 'coreos_auth';
  const USERS_KEY = 'coreos_users';
  const stored = localStorage.getItem(KEY);
  const usersStored = localStorage.getItem(USERS_KEY);
  let init = { user: null, isAuthenticated: false };
  let users = [];
  if (stored) try { init = { ...init, ...JSON.parse(stored) }; } catch {}
  if (usersStored) try { users = JSON.parse(usersStored); } catch {}

  const _save = () => {
    const { user, isAuthenticated } = get();
    localStorage.setItem(KEY, JSON.stringify({ user, isAuthenticated }));
  };
  const _saveUsers = () => {
    const { _users } = get();
    localStorage.setItem(USERS_KEY, JSON.stringify(_users));
  };

  return {
    ...init,
    _users: users,

    register: async ({ name, email, password }) => {
      const { _users } = get();
      if (_users.find(u => u.email === email)) return { error: 'Email já cadastrado' };
      const hashed = await hashPassword(password);
      const isFirstUser = _users.length === 0;
      const user = { id: nanoid(), name, email, password: hashed, role: isFirstUser ? 'admin' : 'user', createdAt: new Date().toISOString() };
      const newUsers = [..._users, user];
      set({ _users: newUsers, user: { id: user.id, name, email, role: user.role, createdAt: user.createdAt }, isAuthenticated: true });
      localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
      _save();
      return { success: true };
    },

    login: async ({ email, password }) => {
      const { _users } = get();
      const hashed = await hashPassword(password);
      const user = _users.find(u => u.email === email && u.password === hashed);
      if (!user) return { error: 'Email ou senha incorretos' };
      // Ensure existing users have a role
      const role = user.role || (_users.indexOf(user) === 0 ? 'admin' : 'user');
      set({ user: { id: user.id, name: user.name, email: user.email, role, createdAt: user.createdAt }, isAuthenticated: true });
      _save();
      window.location.reload();
      return { success: true };
    },

    logout: () => {
      set({ user: null, isAuthenticated: false });
      _save();
      window.location.reload();
    },

    updateName: (name) => {
      const { user, _users } = get();
      if (!user) return;
      const updatedUsers = _users.map(u => u.id === user.id ? { ...u, name } : u);
      set({ user: { ...user, name }, _users: updatedUsers });
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      _save();
    },

    updateEmail: async (newEmail, password) => {
      const { user, _users } = get();
      if (!user) return { error: 'Não autenticado' };
      if (_users.find(u => u.email === newEmail && u.id !== user.id)) return { error: 'Email já em uso' };
      const hashed = await hashPassword(password);
      const currentUser = _users.find(u => u.id === user.id);
      if (currentUser.password !== hashed) return { error: 'Senha incorreta' };
      const updatedUsers = _users.map(u => u.id === user.id ? { ...u, email: newEmail } : u);
      set({ user: { ...user, email: newEmail }, _users: updatedUsers });
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      _save();
      return { success: true };
    },

    updatePassword: async (currentPassword, newPassword) => {
      const { user, _users } = get();
      if (!user) return { error: 'Não autenticado' };
      const currentHash = await hashPassword(currentPassword);
      const currentUser = _users.find(u => u.id === user.id);
      if (currentUser.password !== currentHash) return { error: 'Senha atual incorreta' };
      const newHash = await hashPassword(newPassword);
      const updatedUsers = _users.map(u => u.id === user.id ? { ...u, password: newHash } : u);
      set({ _users: updatedUsers });
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      return { success: true };
    },

    deleteAccount: async (password) => {
      const { user, _users } = get();
      if (!user) return { error: 'Não autenticado' };
      const hashed = await hashPassword(password);
      const currentUser = _users.find(u => u.id === user.id);
      if (currentUser.password !== hashed) return { error: 'Senha incorreta' };
      const updatedUsers = _users.filter(u => u.id !== user.id);
      set({ user: null, isAuthenticated: false, _users: updatedUsers });
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      _save();
      // Clear all user data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('coreos_') && key !== USERS_KEY) localStorage.removeItem(key);
      });
      return { success: true };
    },

    adminDeleteUser: (userId) => {
      const { user, _users } = get();
      if (!user || user.role !== 'admin') return { error: 'Acesso negado' };
      if (userId === user.id) return { error: 'Você não pode deletar sua própria conta por aqui' };
      const updatedUsers = _users.filter(u => u.id !== userId);
      set({ _users: updatedUsers });
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      return { success: true };
    },

    adminCreateUser: async (data) => {
      const { user, _users } = get();
      if (!user || user.role !== 'admin') return { error: 'Acesso negado' };
      if (_users.find(u => u.email === data.email)) return { error: 'Email já cadastrado no sistema' };
      const hashed = await hashPassword(data.password);
      const newUser = { id: nanoid(), name: data.name, email: data.email, password: hashed, role: data.role || 'admin', createdAt: new Date().toISOString() };
      const updatedUsers = [..._users, newUser];
      set({ _users: updatedUsers });
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      return { success: true };
    },

    adminUpdateRole: (userId, newRole) => {
      const { user, _users } = get();
      if (!user || user.role !== 'admin') return { error: 'Acesso negado' };
      if (userId === user.id) return { error: 'Você não pode alterar seu próprio nível de acesso' };
      const updatedUsers = _users.map(u => u.id === userId ? { ...u, role: newRole } : u);
      set({ _users: updatedUsers });
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      return { success: true };
    }
  };
});
