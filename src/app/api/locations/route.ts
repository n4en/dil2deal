import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const locations = await prisma.state.findMany({
      include: {
        districts: {
          include: {
            places: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    const response = NextResponse.json(locations);
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=7200'); // Cache for 1 hour
    response.headers.set('ETag', 'locations-all');
    
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
} 