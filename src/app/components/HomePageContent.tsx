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
  place: {
    id: string;
    name: string;
    districtId: string;
    district: {
      id: string;
      name: string;
      stateId: string;
      state: {
        id: string;
        name: string;
      };
    };
  };
  vendor: {
    id: string;
    name: string;
  };
  reviews: Array<{
    id: string;
    rating: number;
    dealId: string;
  }>;
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

  // When rendering DealCard, ensure reviews is always present
  const safeFeaturedDeals = useMemo(() => featuredDeals.map(deal => ({ ...deal, reviews: deal.reviews ?? [] })), [featuredDeals]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
              Discover Amazing
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600"> Local Deals</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Find the best offers from local businesses in your area. Save money while supporting your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/deals"
                className="btn btn--primary btn--lg ripple transform hover:scale-105 transition-transform"
                aria-label="Browse all deals"
                prefetch={true}
              >
                Browse All Deals
              </Link>
              <Link
                href="/vendor"
                className="btn btn--outline btn--lg ripple transform hover:scale-105 transition-transform"
                aria-label="Publish your deal"
                prefetch={true}
              >
                Publish Your Deal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Deals
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Handpicked offers you don&apos;t want to miss
            </p>
          </div>

          {safeFeaturedDeals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">•</div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No featured deals available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {safeFeaturedDeals.map((deal) => (
                <div key={deal.id} className="transform hover:scale-105 transition-transform duration-300">
                  <DealCard
                    deal={deal}
                    onClick={() => handleDealClick(deal.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Browse by Category
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Find deals in your favorite categories
            </p>
          </div>

          {initialCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">•</div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No categories available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-6xl mx-auto">
              {initialCategories.map((cat: Category) => (
                <div key={cat.id} className="transform hover:scale-105 transition-transform duration-300">
                  <CategoryCard
                    category={cat}
                    onClick={() => handleCategoryClick(cat.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Find Great Deals?
            </h2>
            <p className="text-xl mb-8 text-teal-100">
              Join thousands of users discovering amazing local offers every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/deals"
                className="btn btn--primary btn--lg bg-white text-teal-600 hover:bg-gray-100 transform hover:scale-105 transition-transform"
                aria-label="Start browsing deals"
                prefetch={true}
              >
                Start Browsing
              </Link>
              <Link
                href="/vendor"
                className="btn btn--outline btn--lg border-white text-white hover:bg-white hover:text-teal-600 transform hover:scale-105 transition-transform"
                aria-label="Become a vendor"
                prefetch={true}
              >
                Become a Vendor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 