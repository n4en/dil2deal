import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const states = await prisma.state.findMany({ 
      select: {
        id: true,
        name: true
      },
      orderBy: { name: 'asc' } 
    });
    
    const response = NextResponse.json(states);
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=7200');
    response.headers.set('ETag', 'states-all');
    
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to fetch states' }, { status: 500 });
  }
} 