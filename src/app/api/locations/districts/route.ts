import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stateId = searchParams.get('stateId');
  if (!stateId) {
    return NextResponse.json({ error: 'Missing stateId' }, { status: 400 });
  }
  try {
    const districts = await prisma.district.findMany({
      where: { stateId },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(districts);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch districts' }, { status: 500 });
  }
} 