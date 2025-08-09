import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Ensure Node.js runtime (required for Prisma) and disable caching
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stateId = searchParams.get('stateId');
  if (!stateId) {
    return NextResponse.json({ error: 'Missing stateId' }, { status: 400 });
  }
  try {
    const districts = await prisma.district.findMany({
      where: { stateId },
      select: {
        id: true,
        name: true,
        stateId: true
      },
      orderBy: { name: 'asc' },
    });
    
    const response = NextResponse.json(districts);
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=7200');
    response.headers.set('ETag', `districts-${stateId}`);
    
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to fetch districts' }, { status: 500 });
  }
} 