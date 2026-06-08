import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const workouts = await prisma.workout.findMany({
      where: { userId },
      include: { exercises: true }
    });
    return NextResponse.json(workouts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar treinos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { exercises, ...workoutData } = data;
    
    const workout = await prisma.workout.create({
      data: {
        ...workoutData,
        userId,
        exercises: exercises ? {
          create: exercises.map((ex: { name: string; sets: number; reps: string; weight?: number; rest?: number; targetMuscles?: string[]; secondaryMuscles?: string[]; equipments?: string[]; bodyParts?: string[]; instructions?: string[] }) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight || 0,
            rest: ex.rest || 60,
            targetMuscles: ex.targetMuscles || [],
            secondaryMuscles: ex.secondaryMuscles || [],
            equipments: ex.equipments || [],
            bodyParts: ex.bodyParts || [],
            instructions: ex.instructions || []
          }))
        } : undefined
      },
      include: { exercises: true }
    });
    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar treino' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    delete updateData.exercises;
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    // Para atualizar treinos complexos (com exercícios), uma abordagem simples é deletar e recriar os exercícios
    // ou apenas atualizar os dados primários do treino caso seja simples.
    // Neste caso, focaremos na atualização básica do treino.
    await prisma.workout.updateMany({
      where: { id, userId },
      data: updateData
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar treino' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    await prisma.workout.deleteMany({
      where: { id, userId }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao deletar treino' }, { status: 500 });
  }
}
