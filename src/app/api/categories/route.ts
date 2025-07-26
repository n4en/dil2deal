import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    const response = NextResponse.json(categories);
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=7200'); // Cache for 1 hour
    response.headers.set('ETag', 'categories-all');
    
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
} 