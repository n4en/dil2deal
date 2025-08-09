import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface WhereClause {
  isActive?: boolean;
  endDate?: {
    gte?: Date;
  };
  categoryId?: string;
  placeId?: string;
  place?: {
    districtId?: string;
    district?: {
      stateId?: string;
    };
  };
  OR?: Array<{
    name?: { contains: string; mode: 'insensitive' };
    description?: { contains: string; mode: 'insensitive' };
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const stateId = searchParams.get('stateId') || '';
    const districtId = searchParams.get('districtId') || '';
    const placeId = searchParams.get('placeId') || '';
    const showExpired = searchParams.get('showExpired') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Build dynamic where clause
    const where: WhereClause = {
      isActive: true,
      endDate: {
        gte: showExpired ? undefined : new Date()
      }
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (placeId) {
      where.placeId = placeId;
    } else if (districtId) {
      where.place = {
        districtId: districtId
      };
    } else if (stateId) {
      where.place = {
        district: {
          stateId: stateId
        }
      };
    }

    // Optimized query with minimal data fetching
    const [deals, totalCount] = await Promise.all([
      prisma.deal.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          discount: true,
          startDate: true,
          endDate: true,
          isActive: true,
          createdAt: true,
          category: {
            select: { id: true, name: true, icon: true }
          },
          place: {
            select: { 
              id: true, 
              name: true, 
              districtId: true,
              district: {
                select: {
                  id: true,
                  name: true,
                  stateId: true,
                  state: {
                    select: { id: true, name: true }
                  }
                }
              }
            }
          },
          vendor: {
            select: { id: true, name: true }
          },
          reviews: {
            select: { 
              id: true,
              rating: true,
              dealId: true
            },
            take: 5 // Limit reviews for performance
          }
        },
        orderBy: [
          { isActive: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
        skip: offset
      }),
      prisma.deal.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Enhanced caching headers
    const response = NextResponse.json({
      deals,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

    // Set aggressive caching for better performance
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    response.headers.set('ETag', `"deals-${totalCount}-${page}-${limit}"`);
    response.headers.set('Vary', 'Accept-Encoding');

    return response;
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, description, discount, startDate, endDate, categoryId, placeId, vendor } = data;
    
    // Find or create vendor
    let dbVendor = await prisma.vendor.findUnique({ where: { email: vendor.email } });
    if (!dbVendor) {
      dbVendor = await prisma.vendor.create({ data: vendor });
    }
    
    // Create deal
    const deal = await prisma.deal.create({
      data: {
        name,
        description,
        discount,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
        categoryId,
        placeId,
        vendorId: dbVendor.id,
      },
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
    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  }
} 