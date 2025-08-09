import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=7200');
    response.headers.set('ETag', `places-${districtId}`);
    
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 });
  }
} 