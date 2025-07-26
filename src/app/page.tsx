import React, { Suspense } from 'react';
import HomePageContent from './components/HomePageContent';
import { prisma } from '../lib/prisma';

interface Review {
  id: string;
  rating: number;
  dealId?: string;
}

// Server-side data fetching for initial page load
async function fetchHomePageData() {
  try {
    const [deals, categories] = await Promise.all([
      prisma.deal.findMany({
        where: {
          isActive: true,
          endDate: {
            gte: new Date()
          }
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
          reviews: {
            select: {
              id: true,
              rating: true
            }
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.category.findMany({
        orderBy: { name: 'asc' }
      })
    ]);
    
    // Convert Date objects to strings for client component
    const dealsWithStringDates = deals.map(deal => ({
      ...deal,
      startDate: deal.startDate.toISOString(),
      endDate: deal.endDate.toISOString(),
      createdAt: deal.createdAt.toISOString(),
    }));
    
    return { deals: dealsWithStringDates, categories };
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return { deals: [], categories: [] };
  }
}

export default async function HomePage() {
  const { deals, categories } = await fetchHomePageData();
  // Ensure all deals have vendor.id and reviews with dealId
  const safeDeals = deals.map(deal => ({
    ...deal,
    vendor: {
      id: deal.vendor.id ?? '',
      name: deal.vendor.name,
    },
    reviews: (deal.reviews ?? []).map((r: Review) => ({
      id: r.id,
      rating: r.rating,
      dealId: r.dealId ?? deal.id,
    })),
  }));

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">Loading...</div>}>
      <HomePageContent initialDeals={safeDeals} initialCategories={categories} />
    </Suspense>
  );
}
