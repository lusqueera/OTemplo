import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// PUT /api/users/me — Atualiza dados do usuário autenticado
export async function PUT(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { name, email, password, currentPassword } = data;

    // Busca o usuário atual
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    // Se está tentando alterar email, verifica se a senha está correta
    if (email && email !== user.email) {
      if (!currentPassword || currentPassword !== user.password) {
        return NextResponse.json({ error: 'Senha incorreta' }, { status: 403 });
      }
      // Verifica se o email já está em uso
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: 'Email já em uso' }, { status: 409 });
      }
    }

    // Se está tentando alterar a senha, verifica a senha atual
    if (password) {
      if (!currentPassword || currentPassword !== user.password) {
        return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 403 });
      }
    }

    // Monta os dados de atualização
    const updateData: Record<string, string> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
  }
}

// DELETE /api/users/me — Deleta conta do usuário autenticado
export async function DELETE(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');

    // Busca o usuário atual para verificar a senha
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    if (!password || password !== user.password) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 403 });
    }

    // Deleta o usuário (cascata apaga todos os dados relacionados)
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Erro ao deletar conta' }, { status: 500 });
  }
}
