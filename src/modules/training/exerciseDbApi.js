/**
 * ExerciseDB API Service Layer
 * Base URL: https://oss.exercisedb.dev/api/v1
 * Free version — 1,500+ exercises with GIF media
 */

const BASE_URL = 'https://oss.exercisedb.dev/api/v1';

// Simple in-memory cache to avoid redundant API calls (rate limits apply)
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

async function apiFetch(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  const cacheKey = url.toString();
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `ExerciseDB API error: ${res.status}`);
  }

  const json = await res.json();
  setCache(cacheKey, json);
  return json;
}

// ==================== EXERCISES ====================

/**
 * Advanced exercise filtering with cursor-based pagination
 * @param {Object} filters - { name, targetMuscles, secondaryMuscles, bodyParts, equipments, limit, after, before }
 */
export async function fetchExercises(filters = {}) {
  return apiFetch('/exercises', {
    name: filters.name,
    targetMuscles: filters.targetMuscles,
    secondaryMuscles: filters.secondaryMuscles,
    bodyParts: filters.bodyParts,
    equipments: filters.equipments,
    limit: filters.limit || 25,
    after: filters.after,
    before: filters.before,
  });
}

/**
 * Fuzzy search exercises by name
 * @param {string} search - search term
 * @param {number} threshold - 0 = exact, 1 = very loose
 */
export async function searchExercises(search, threshold = 0.5) {
  return apiFetch('/exercises/search', { search, threshold });
}

/**
 * Filter exercises by body parts with pagination
 */
export async function fetchExercisesByBodyParts(bodyParts, limit = 25, after) {
  return apiFetch('/exercises/bodyparts', { bodyParts, limit, after });
}

/**
 * Filter exercises by muscles with pagination
 */
export async function fetchExercisesByMuscles(targetMuscles, limit = 25, after) {
  return apiFetch('/exercises/muscles', { targetMuscles, limit, after });
}

/**
 * Filter exercises by equipment with pagination
 */
export async function fetchExercisesByEquipment(equipments, limit = 25, after) {
  return apiFetch('/exercises/equipments', { equipments, limit, after });
}

/**
 * Get a single exercise by ID
 */
export async function fetchExerciseById(exerciseId) {
  return apiFetch(`/exercises/${exerciseId}`);
}

// ==================== METADATA ====================

export async function fetchAllBodyParts() {
  return apiFetch('/bodyparts');
}

export async function fetchAllMuscles() {
  return apiFetch('/muscles');
}

export async function fetchAllEquipments() {
  return apiFetch('/equipments');
}

// ==================== DEFAULT WORKOUT TEMPLATES ====================

/**
 * Pre-built workout templates using ExerciseDB body part categories.
 * Each template defines a name, description, focus body parts, and target muscles
 * so the app can fetch real exercises from the API to populate them.
 */
export const DEFAULT_WORKOUT_TEMPLATES = [
  {
    id: 'tpl-push',
    name: 'Push Day — Peito, Ombros & Tríceps',
    description: 'Treino focado em movimentos de empurrar. Ideal para desenvolvimento de peito, ombros e tríceps.',
    type: 'musculacao',
    icon: '💪',
    color: '#ff6b6b',
    bodyParts: ['chest', 'shoulders', 'upper arms'],
    targetMuscles: ['pectorals', 'delts', 'triceps'],
    defaultExercises: [
      { name: 'barbell bench press', bodyPart: 'chest', sets: 4, reps: 8 },
      { name: 'incline dumbbell press', bodyPart: 'chest', sets: 3, reps: 10 },
      { name: 'dumbbell lateral raise', bodyPart: 'shoulders', sets: 3, reps: 12 },
      { name: 'overhead press', bodyPart: 'shoulders', sets: 3, reps: 10 },
      { name: 'triceps dip', bodyPart: 'upper arms', sets: 3, reps: 12 },
      { name: 'cable pushdown', bodyPart: 'upper arms', sets: 3, reps: 15 },
    ],
  },
  {
    id: 'tpl-pull',
    name: 'Pull Day — Costas & Bíceps',
    description: 'Treino de puxar com foco em costas e bíceps. Desenvolve a largura e espessura dorsal.',
    type: 'musculacao',
    icon: '🏋️',
    color: '#60a5fa',
    bodyParts: ['back', 'upper arms'],
    targetMuscles: ['lats', 'biceps', 'upper back'],
    defaultExercises: [
      { name: 'lat pulldown', bodyPart: 'back', sets: 4, reps: 10 },
      { name: 'barbell bent over row', bodyPart: 'back', sets: 4, reps: 8 },
      { name: 'cable seated row', bodyPart: 'back', sets: 3, reps: 12 },
      { name: 'face pull', bodyPart: 'shoulders', sets: 3, reps: 15 },
      { name: 'barbell curl', bodyPart: 'upper arms', sets: 3, reps: 12 },
      { name: 'hammer curl', bodyPart: 'upper arms', sets: 3, reps: 12 },
    ],
  },
  {
    id: 'tpl-legs',
    name: 'Leg Day — Quadríceps, Posterior & Glúteos',
    description: 'Treino completo de membros inferiores. Combina movimentos compostos e isolados.',
    type: 'musculacao',
    icon: '🦵',
    color: '#2dd4a8',
    bodyParts: ['upper legs', 'lower legs'],
    targetMuscles: ['quads', 'glutes', 'hamstrings', 'calves'],
    defaultExercises: [
      { name: 'barbell squat', bodyPart: 'upper legs', sets: 4, reps: 8 },
      { name: 'leg press', bodyPart: 'upper legs', sets: 4, reps: 10 },
      { name: 'romanian deadlift', bodyPart: 'upper legs', sets: 3, reps: 10 },
      { name: 'leg extension', bodyPart: 'upper legs', sets: 3, reps: 12 },
      { name: 'leg curl', bodyPart: 'upper legs', sets: 3, reps: 12 },
      { name: 'calf raise', bodyPart: 'lower legs', sets: 4, reps: 15 },
    ],
  },
  {
    id: 'tpl-upper',
    name: 'Upper Body — Corpo Superior Completo',
    description: 'Treino full upper body equilibrando push e pull. Ótimo para quem treina 3x/semana.',
    type: 'musculacao',
    icon: '⚡',
    color: '#a78bfa',
    bodyParts: ['chest', 'back', 'shoulders', 'upper arms'],
    targetMuscles: ['pectorals', 'lats', 'delts', 'biceps', 'triceps'],
    defaultExercises: [
      { name: 'bench press', bodyPart: 'chest', sets: 4, reps: 8 },
      { name: 'barbell bent over row', bodyPart: 'back', sets: 4, reps: 8 },
      { name: 'overhead press', bodyPart: 'shoulders', sets: 3, reps: 10 },
      { name: 'lat pulldown', bodyPart: 'back', sets: 3, reps: 10 },
      { name: 'dumbbell curl', bodyPart: 'upper arms', sets: 3, reps: 12 },
      { name: 'triceps pushdown', bodyPart: 'upper arms', sets: 3, reps: 12 },
    ],
  },
  {
    id: 'tpl-core',
    name: 'Core & Abs — Fortalecimento Central',
    description: 'Treino focado em core e abdominais. Estabilização e força do tronco.',
    type: 'funcional',
    icon: '🔥',
    color: '#f0a500',
    bodyParts: ['waist'],
    targetMuscles: ['abs', 'serratus anterior'],
    defaultExercises: [
      { name: 'crunch', bodyPart: 'waist', sets: 3, reps: 20 },
      { name: 'plank', bodyPart: 'waist', sets: 3, reps: 60 },
      { name: 'bicycle crunch', bodyPart: 'waist', sets: 3, reps: 20 },
      { name: 'hanging leg raise', bodyPart: 'waist', sets: 3, reps: 12 },
      { name: 'russian twist', bodyPart: 'waist', sets: 3, reps: 20 },
    ],
  },
  {
    id: 'tpl-fullbody',
    name: 'Full Body — Treino Completo',
    description: 'Treino que trabalha todos os grandes grupos musculares em uma sessão. Ideal para iniciantes.',
    type: 'musculacao',
    icon: '🎯',
    color: '#f472b6',
    bodyParts: ['chest', 'back', 'upper legs', 'shoulders'],
    targetMuscles: ['pectorals', 'lats', 'quads', 'delts'],
    defaultExercises: [
      { name: 'bench press', bodyPart: 'chest', sets: 3, reps: 10 },
      { name: 'barbell bent over row', bodyPart: 'back', sets: 3, reps: 10 },
      { name: 'barbell squat', bodyPart: 'upper legs', sets: 3, reps: 10 },
      { name: 'overhead press', bodyPart: 'shoulders', sets: 3, reps: 10 },
      { name: 'deadlift', bodyPart: 'upper legs', sets: 3, reps: 8 },
      { name: 'plank', bodyPart: 'waist', sets: 3, reps: 60 },
    ],
  },
];
