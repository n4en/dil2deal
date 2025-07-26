import React, { Suspense } from 'react';
import DealsPageContent from './DealsPageContent';
import { prisma } from '../../lib/prisma';

// Server-side data fetching for initial page load
async function fetchInitialDealsData() {
  try {
    // Fetch all data in parallel using direct Prisma calls
    const [deals, categories, states] = await Promise.all([
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
        take: 50, // Limit initial load
      }),
      prisma.category.findMany({
        orderBy: { name: 'asc' }
      }),
      prisma.state.findMany({
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
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center">Loading...</div>}>
      <DealsPageContent initialDeals={deals} initialCategories={categories} initialStates={states} />
    </Suspense>
  );
} 