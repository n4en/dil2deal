import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const deals = await prisma.deal.findMany({
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
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(deals);
  } catch (error) {
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
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  }
} 