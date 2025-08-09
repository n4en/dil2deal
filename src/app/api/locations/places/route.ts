import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Ensure Node.js runtime (required for Prisma) and disable caching
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const districtId = searchParams.get('districtId');
  if (!districtId) {
    return NextResponse.json({ error: 'Missing districtId' }, { status: 400 });
  }
  try {
    const places = await prisma.place.findMany({
      where: { districtId },
      select: {
        id: true,
        name: true,
        districtId: true
      },
      orderBy: { name: 'asc' },
    });
    
    const response = NextResponse.json(places);
    response.headers.set('Cache-Control', 'no-store');
    
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 });
  }
} 