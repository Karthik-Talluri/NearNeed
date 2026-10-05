import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, setSessionCookie, sanitizeUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, phone, address, city } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 409 }
      );
    }

    // Hash the password securely
    const hashedPassword = await hashPassword(password);

    // Prevent public registration of ADMIN role
    let requestedRole: Role = Role.CUSTOMER;
    if (role === 'STORE_OWNER') {
      requestedRole = Role.STORE_OWNER;
    } else if (role === 'CUSTOMER') {
      requestedRole = Role.CUSTOMER;
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: requestedRole,
        phone: phone || null,
        address: address || null,
        city: city || 'Chennai, Tamil Nadu',
      },
    });

    // Create session cookie
    await setSessionCookie({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const safeUser = sanitizeUser(newUser);
    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
