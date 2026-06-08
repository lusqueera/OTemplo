import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/auth/login — Busca usuário por email + password (hash)
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, password: true, role: true, createdAt: true }
    });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    // Retorna sem a senha
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erro no login' }, { status: 500 });
  }
}
