import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// POST /api/auth/register — Cria novo usuário no Postgres
export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    // Verifica se email já existe
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 });
    }

    // Verifica se é o primeiro usuário (será admin)
    const count = await prisma.user.count();
    const userRole = count === 0 ? 'admin' : (role || 'user');

    const user = await prisma.user.create({
      data: { name, email, password, role: userRole }
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Erro ao registrar' }, { status: 500 });
  }
}
