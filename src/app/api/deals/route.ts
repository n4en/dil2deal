import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const stateId = searchParams.get('stateId');
    const districtId = searchParams.get('districtId');
    const placeId = searchParams.get('placeId');
    const showExpired = searchParams.get('showExpired') === 'true';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      categoryId?: string;
      place?: {
        district?: {
          stateId?: string;
        };
        districtId?: string;
      };
      placeId?: string;
      isActive?: boolean;
      endDate?: {
        gte: Date;
      };
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
        vendor?: { name: { contains: string; mode: 'insensitive' } };
      }>;
    } = {};
    
    if (category) {
      where.categoryId = category;
    }
    
    if (stateId) {
      where.place = {
        district: {
          stateId: stateId
        }
      };
    }
    
    if (districtId) {
      where.place = {
        ...where.place,
        districtId: districtId
      };
    }
    
    if (placeId) {
      where.placeId = placeId;
    }
    
    if (!showExpired) {
      where.isActive = true;
      where.endDate = {
        gte: new Date()
      };
    }

    // Build search conditions
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { vendor: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
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
              rating: true
            }
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.deal.count({ where })
    ]);

    const response = NextResponse.json({
      deals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

    // Add caching headers
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300'); // Cache for 1 minute
    response.headers.set('ETag', `deals-${JSON.stringify(where)}-${page}-${limit}`);
    
    return response;
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
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