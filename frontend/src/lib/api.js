// Configuração central da API para comunicar com o Backend Next.js

// O Vite injeta as variáveis do .env através do import.meta.env
// Usamos o fallback para localhost:3000 caso a variável não exista no desenvolvimento
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Função utilitária para fazer chamadas HTTP padronizadas para o backend.
 * Ela já anexa automaticamente a URL base do servidor.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // Aqui você pode adicionar lógica para pegar um token JWT do localStorage futuramente
  // const token = localStorage.getItem('coreos_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    // Authorization: token ? `Bearer ${token}` : undefined
  };

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
