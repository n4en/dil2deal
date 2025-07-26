'use client';

import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    fetch('/api/deals')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const now = new Date();
          const activeDeals = data.filter((deal: Deal) => deal.isActive && new Date(deal.endDate) >= now);
          setFeaturedDeals(activeDeals.slice(0, 3));
        } else {
          setFeaturedDeals([]);
        }
      })
      .catch(() => setFeaturedDeals([]));
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories([]);
        }
      })
      .catch(() => setCategories([]));
  }, []);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {Array.isArray(featuredDeals) && featuredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} onClick={() => window.location.href = `/deals/${deal.id}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 md:py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="section-title mb-8 text-2xl md:text-3xl font-semibold text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
            {Array.isArray(categories) && categories.map((cat: Category) => (
              <CategoryCard key={cat.id} category={cat} onClick={() => window.location.href = `/deals?category=${cat.id}`} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
