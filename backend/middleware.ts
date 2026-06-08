import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware global que trata requisições CORS preflight (OPTIONS)
 * e adiciona os headers necessários em todas as respostas de API.
 */
export function middleware(request: NextRequest) {
  // Se for preflight (OPTIONS), responde imediatamente com 204
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-user-id',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Para outras requisições, adiciona os headers CORS na resposta
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-user-id');

  return response;
}

// Aplica o middleware apenas nas rotas de API
export const config = {
  matcher: '/api/:path*',
};
