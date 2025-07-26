import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const districtId = searchParams.get('districtId');
  if (!districtId) {
    return NextResponse.json({ error: 'Missing districtId' }, { status: 400 });
  }
  try {
    const places = await prisma.place.findMany({
      where: { districtId },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(places);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 });
  }
} 