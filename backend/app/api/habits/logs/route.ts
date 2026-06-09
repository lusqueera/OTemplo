import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const logs = await prisma.habitLog.findMany({ where: { userId } });
    return NextResponse.json(logs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { id, ...logData } = data;

    // Upsert: if a log for this habit+date already exists, update it
    const log = await prisma.habitLog.upsert({
      where: {
        habitId_date: {
          habitId: logData.habitId,
          date: logData.date,
        },
      },
      update: { status: logData.status, userId },
      create: { id, ...logData, userId },
    });
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar log de hábito' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    // Use upsert by habitId+date for idempotency
    if (updateData.habitId && updateData.date) {
      await prisma.habitLog.upsert({
        where: {
          habitId_date: {
            habitId: updateData.habitId,
            date: updateData.date,
          },
        },
        update: { status: updateData.status, userId },
        create: { id, ...updateData, userId },
      });
    } else {
      await prisma.habitLog.updateMany({
        where: { id, userId },
        data: updateData,
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar log de hábito' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    await prisma.habitLog.deleteMany({
      where: { id, userId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao deletar log de hábito' }, { status: 500 });
  }
}
