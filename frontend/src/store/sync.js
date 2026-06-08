import { apiFetch } from '../lib/api';

/**
 * Serviço de sincronização Backend ↔ Frontend
 * Carrega dados do Postgres via API e persiste mutações em background.
 * As stores Zustand continuam como cache local para performance instantânea.
 */

// ==================== SYNC: LOAD (Backend → Stores) ====================

export async function syncAllFromBackend(stores) {
  const results = { success: [], failed: [] };

  const syncTasks = [
    { name: 'habits', fn: () => syncHabitsFromBackend(stores.habits) },
    { name: 'focus', fn: () => syncFocusFromBackend(stores.focus) },
    { name: 'finance', fn: () => syncFinanceFromBackend(stores.finance) },
    { name: 'investments', fn: () => syncInvestmentsFromBackend(stores.investments) },
    { name: 'notes', fn: () => syncNotesFromBackend(stores.notes) },
    { name: 'reviews', fn: () => syncReviewsFromBackend(stores.reviews) },
    { name: 'workouts', fn: () => syncWorkoutsFromBackend(stores.workouts) },
    { name: 'priority', fn: () => syncPriorityFromBackend(stores.priority) },
  ];

  for (const task of syncTasks) {
    try {
      await task.fn();
      results.success.push(task.name);
    } catch (err) {
      console.warn(`[Sync] Falha ao sincronizar ${task.name}:`, err.message);
      results.failed.push(task.name);
    }
  }

  console.log('[Sync] Concluído:', results);
  return results;
}

async function syncHabitsFromBackend(store) {
  const data = await apiFetch('/habits');
  if (Array.isArray(data) && data.length > 0) {
    const habits = data.map(h => ({ id: h.id, name: h.name, frequency: h.frequency, time: h.time, status: h.status, streak: h.streak, createdAt: h.createdAt }));
    const logs = data.flatMap(h => (h.logs || []).map(l => ({ id: l.id, habitId: l.habitId, date: l.date, status: l.status })));
    store.setState({ habits, logs });
  }
}

async function syncFocusFromBackend(store) {
  const data = await apiFetch('/focus');
  if (Array.isArray(data) && data.length > 0) {
    store.setState({ sessions: data });
  }
}

async function syncFinanceFromBackend(store) {
  const data = await apiFetch('/finances');
  if (Array.isArray(data) && data.length > 0) {
    store.setState({ transactions: data });
  }
}

async function syncInvestmentsFromBackend(store) {
  const data = await apiFetch('/investments');
  if (Array.isArray(data) && data.length > 0) {
    store.setState({ investments: data });
  }
}

async function syncNotesFromBackend(store) {
  const data = await apiFetch('/notes');
  if (Array.isArray(data) && data.length > 0) {
    store.setState({ notes: data });
  }
}

async function syncReviewsFromBackend(store) {
  const data = await apiFetch('/reviews');
  if (Array.isArray(data) && data.length > 0) {
    store.setState({ reviews: data });
  }
}

async function syncWorkoutsFromBackend(store) {
  const data = await apiFetch('/workouts');
  if (Array.isArray(data) && data.length > 0) {
    store.setState({ workouts: data });
  }
}

async function syncPriorityFromBackend(store) {
  const [objectives, milestones, tasks] = await Promise.all([
    apiFetch('/objectives'),
    apiFetch('/milestones'),
    apiFetch('/tasks'),
  ]);
  const update = {};
  if (Array.isArray(objectives) && objectives.length > 0) update.objectives = objectives;
  if (Array.isArray(milestones) && milestones.length > 0) update.milestones = milestones;
  if (Array.isArray(tasks) && tasks.length > 0) update.tasks = tasks;
  if (Object.keys(update).length > 0) store.setState(update);
}


// ==================== SYNC: PERSIST (Stores → Backend) ====================
// Funções que as stores chamam após cada mutação para persistir no Postgres.

export async function apiCreate(endpoint, data) {
  try {
    return await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(data) });
  } catch (err) {
    console.warn(`[Sync] Erro ao criar em ${endpoint}:`, err.message);
  }
}

export async function apiUpdate(endpoint, data) {
  try {
    return await apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(data) });
  } catch (err) {
    console.warn(`[Sync] Erro ao atualizar em ${endpoint}:`, err.message);
  }
}

export async function apiDelete(endpoint, id) {
  try {
    return await apiFetch(`${endpoint}?id=${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn(`[Sync] Erro ao deletar em ${endpoint}:`, err.message);
  }
}
