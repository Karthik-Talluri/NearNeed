import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, sanitizeUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const safeUser = sanitizeUser(user);
    return NextResponse.json({ user: safeUser }, { status: 200 });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
