import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    return NextResponse.json(locations);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
} 