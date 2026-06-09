import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/config — Retorna config do usuário autenticado
export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const config = await prisma.userConfig.findUnique({ where: { userId } });
    if (!config) {
      // Retorna defaults se não existe config
      return NextResponse.json({
        profileName: 'Operador',
        archetype: 'Estrategista',
        intensity: 'high',
        focusPhrase: 'Execute com precisão.',
        focusDuration: 25,
        notifications: true,
        theme: 'dark',
        mood: null,
        moodHistory: [],
      });
    }
    return NextResponse.json(config);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
  }
}

// PUT /api/config — Cria ou atualiza config do usuário (upsert)
export async function PUT(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    // Remove campos que não devem ser atualizados diretamente
    const { id, userId: _, createdAt, updatedAt, user, ...updateData } = data;

    const config = await prisma.userConfig.upsert({
      where: { userId },
      update: updateData,
      create: { ...updateData, userId },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 });
  }
}
