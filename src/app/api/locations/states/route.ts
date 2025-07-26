import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const states = await prisma.state.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(states);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch states' }, { status: 500 });
  }
} 