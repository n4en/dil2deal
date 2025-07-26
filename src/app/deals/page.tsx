import React, { Suspense } from 'react';
import DealsPageContent from './DealsPageContent';
import { prisma } from '../../lib/prisma';

interface Review {
  id: string;
  rating: number;
  dealId?: string;
}

// Server-side data fetching for initial page load
async function fetchInitialDealsData() {
  try {
    // Fetch all data in parallel using direct Prisma calls with optimized queries
    const [deals, categories, states] = await Promise.all([
      prisma.deal.findMany({
        where: {
          isActive: true,
          endDate: {
            gte: new Date()
          }
        },
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
            select: {
              id: true,
              name: true,
              icon: true
            }
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
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          },
          vendor: {
            select: {
              id: true,
              name: true
            }
          },
          reviews: {
            select: {
              id: true,
              rating: true
            }
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 30, // Reduced initial load for better performance
      }),
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          icon: true
        },
        orderBy: { name: 'asc' }
      }),
      prisma.state.findMany({
        select: {
          id: true,
          name: true
        },
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
    
    return { deals: dealsWithStringDates, categories, states };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    // Return empty arrays as fallback
    return { deals: [], categories: [], states: [] };
  }
}

export default async function DealsPage() {
  const { deals, categories, states } = await fetchInitialDealsData();

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
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-8 max-w-md"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <DealsPageContent initialDeals={safeDeals} initialCategories={categories} initialStates={states} />
    </Suspense>
  );
} 