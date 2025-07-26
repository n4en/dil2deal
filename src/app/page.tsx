'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DealCard from './components/DealCard';
import CategoryCard from './components/CategoryCard';
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

export default function HomePage() {
  const [featuredDeals, setFeaturedDeals] = useState<Deal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dealsRes, categoriesRes] = await Promise.all([
        fetch('/api/deals'),
        fetch('/api/categories')
      ]);

      const [dealsData, categoriesData] = await Promise.all([
        dealsRes.json(),
        categoriesRes.json()
      ]);

      if (Array.isArray(dealsData)) {
        const now = new Date();
        const activeDeals = dealsData.filter((deal: Deal) => deal.isActive && new Date(deal.endDate) >= now);
        setFeaturedDeals(activeDeals.slice(0, 3));
      }

      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-2 sm:px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">Discover Amazing Local Deals</h1>
          <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 mb-8">Find the best offers from local businesses in your area. Save money while supporting your community.</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/deals" className="btn btn--primary btn--lg">Browse All Deals</Link>
            <Link href="/vendor" className="btn btn--outline btn--lg">Publish Your Deal</Link>
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="section-title mb-8 text-2xl md:text-3xl font-semibold text-center">Featured Deals</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {Array.isArray(featuredDeals) && featuredDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} onClick={() => window.location.href = `/deals/${deal.id}`} />
              ))}
            </div>
          )}
          
          {!loading && featuredDeals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No featured deals available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 md:py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="section-title mb-8 text-2xl md:text-3xl font-semibold text-center">Browse by Category</h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col items-center animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
              {Array.isArray(categories) && categories.map((cat: Category) => (
                <CategoryCard key={cat.id} category={cat} onClick={() => window.location.href = `/deals?category=${cat.id}`} />
              ))}
            </div>
          )}
          
          {!loading && categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No categories available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
