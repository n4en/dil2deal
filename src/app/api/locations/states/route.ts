import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Ensure Node.js runtime (required for Prisma)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    response.headers.set('Cache-Control', 'no-store');
    
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to fetch states' }, { status: 500 });
  }
} 