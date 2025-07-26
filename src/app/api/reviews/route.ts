import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { user, rating, comment, dealId } = data;
    if (!user || !rating || !comment || !dealId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const review = await prisma.review.create({
      data: { user, rating, comment, dealId },
    });
    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
} 