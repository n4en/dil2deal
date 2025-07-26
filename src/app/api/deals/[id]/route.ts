import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

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
        reviews: true,
      },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Add caching headers for better performance
    const response = NextResponse.json(deal);
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600'); // Cache for 5 minutes
    response.headers.set('ETag', `deal-${dealId}-${deal.createdAt.getTime()}`);
    
    return response;
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json({ error: 'Failed to fetch deal' }, { status: 500 });
  }
} 