'use client';

import React, { useCallback, useMemo } from 'react';
import DealCard from './DealCard';
import CategoryCard from './CategoryCard';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Deal {
  id: string;
  name: string;
  description: string;
  discount: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  category: Category;
  place?: {
    name?: string;
    district?: {
      name?: string;
      state?: {
        name?: string;
      };
    };
  };
  vendor: { name: string };
}

interface HomePageContentProps {
  initialDeals: Deal[];
  initialCategories: Category[];
}

export default function HomePageContent({ initialDeals, initialCategories }: HomePageContentProps) {
  const handleDealClick = useCallback((dealId: string) => {
    window.location.href = `/deals/${dealId}`;
  }, []);

  const handleCategoryClick = useCallback((categoryId: string) => {
    window.location.href = `/deals?category=${categoryId}`;
  }, []);

  // Filter active deals for featured section
  const featuredDeals = useMemo(() => {
    const now = new Date();
    return initialDeals
      .filter((deal) => deal.isActive && new Date(deal.endDate) >= now)
      .slice(0, 3);
  }, [initialDeals]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-2 sm:px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Discover Amazing Local Deals
          </h1>
          <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 mb-8">
            Find the best offers from local businesses in your area. Save money while supporting your community.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link 
              href="/deals" 
              className="btn btn--primary btn--lg ripple" 
              aria-label="Browse all deals"
              prefetch={true}
            >
              Browse All Deals
            </Link>
            <Link 
              href="/vendor" 
              className="btn btn--outline btn--lg ripple" 
              aria-label="Publish your deal"
              prefetch={true}
            >
              Publish Your Deal
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="section-title mb-8 text-2xl md:text-3xl font-semibold text-center">
            Featured Deals
          </h2>
          
          {featuredDeals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No featured deals available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {featuredDeals.map((deal) => (
                <DealCard 
                  key={deal.id} 
                  deal={deal} 
                  onClick={() => handleDealClick(deal.id)} 
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 md:py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="section-title mb-8 text-2xl md:text-3xl font-semibold text-center">
            Browse by Category
          </h2>
          
          {initialCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No categories available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
              {initialCategories.map((cat: Category) => (
                <CategoryCard 
                  key={cat.id} 
                  category={cat} 
                  onClick={() => handleCategoryClick(cat.id)} 
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
} 