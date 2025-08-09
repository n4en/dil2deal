import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// Ensure Node.js runtime (required for Prisma)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dealId } = await params;

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        category: true,
        place: {
          include: {
            district: {
              include: {
                state: true
              }
            }
          }
        },
        vendor: true,
        reviews: {
          select: {
            id: true,
            user: true,
            rating: true,
            comment: true,
            dealId: true
          }
        },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Add caching headers for better performance
    const response = NextResponse.json(deal);
    // Set aggressive caching for better performance
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('ETag', `"deal-${deal.id}-${deal.createdAt.getTime()}"`);
    response.headers.set('Vary', 'Accept-Encoding');
    
    return response;
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json({ error: 'Failed to fetch deal' }, { status: 500 });
  }
} 