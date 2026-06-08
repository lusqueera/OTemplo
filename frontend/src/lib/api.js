// Configuração central da API para comunicar com o Backend Next.js

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Retorna o ID do usuário autenticado a partir do localStorage.
 */
function getUserId() {
  try {
    const auth = JSON.parse(localStorage.getItem('coreos_auth'));
    return auth?.user?.id || null;
  } catch {
    return null;
  }
}

/**
 * Função utilitária para fazer chamadas HTTP padronizadas para o backend.
 * Anexa automaticamente a URL base e o header x-user-id.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const userId = getUserId();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Anexa o user ID se existir
  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisição para a API');
  }

  return data;
}
