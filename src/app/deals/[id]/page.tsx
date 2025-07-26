'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Vendor {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface Place {
  id: string;
  name: string;
  district: {
    id: string;
    name: string;
    state: {
      id: string;
      name: string;
    };
  };
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
  place: Place;
  vendor: Vendor;
  reviews: Review[];
}

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params?.id as string;
  const [deal, setDeal] = useState<Deal | null>(null);
  const [review, setReview] = useState({ user: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dealId) {
      setLoading(true);
      fetch(`/api/deals/${dealId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Deal not found');
          }
          return res.json();
        })
        .then((data) => {
          setDeal(data);
        })
        .catch((error) => {
          console.error('Error fetching deal:', error);
          setError('Failed to load deal details');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [dealId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...review, dealId }),
    });
    if (res.ok) {
      setReview({ user: '', rating: 5, comment: '' });
      // Refresh deal data
      fetch(`/api/deals/${dealId}`)
        .then((res) => res.json())
        .then((data) => {
          setDeal(data);
        });
    } else {
      setError('Failed to add review');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center text-gray-500 dark:text-gray-300">Loading...</div>;
  }

  if (!deal) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-gray-500 dark:text-gray-300">
        <div className="text-5xl mb-4">🔍</div>
        <div className="text-lg font-semibold mb-2">Deal not found</div>
        <div className="mb-4">The deal you&apos;re looking for doesn&apos;t exist or has been removed.</div>
        <button className="btn btn--outline" onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  const isActive = deal.isActive;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <button className="btn btn--outline mb-8" onClick={() => router.back()}>&larr; Back to Deals</button>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{deal.name}</h1>
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">{deal.discount} OFF</span>
            <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
              <span className="text-xl">{deal.category.icon}</span> {deal.category.name}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              📍
              {deal.place?.name ? `${deal.place.name}, ` : ''}
              {deal.place?.district?.name ? `${deal.place.district.name}, ` : ''}
              {deal.place?.district?.state?.name ? deal.place.district.state.name : ''}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-400'}`}></span>
              {isActive ? 'Active Deal' : 'Expired Deal'}
            </span>
          </div>
          <div className="text-gray-700 dark:text-gray-200 mb-4">{deal.description}</div>
          <div className="text-xs text-gray-500 mb-2">
            <strong>Valid from:</strong> {new Date(deal.startDate).toLocaleDateString()} to {new Date(deal.endDate).toLocaleDateString()}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Vendor Information</h2>
          <div className="mb-2"><strong>Business:</strong> {deal.vendor.name}</div>
          <div className="mb-2"><strong>Address:</strong> {deal.vendor.address}</div>
          <div className="mb-2"><strong>Phone:</strong> <a href={`tel:${deal.vendor.phone}`} className="text-blue-600 dark:text-blue-400">{deal.vendor.phone}</a></div>
          <div className="mb-2"><strong>Email:</strong> <a href={`mailto:${deal.vendor.email}`} className="text-blue-600 dark:text-blue-400">{deal.vendor.email}</a></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Reviews ({deal.reviews.length})</h2>
          {deal.reviews.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-300 mb-4">No reviews yet. Be the first to review this deal!</div>
          ) : (
            <div className="space-y-4 mb-4">
              {deal.reviews.map((r: Review) => (
                <div key={r.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">{r.user}</span>
                    <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-200">{r.comment}</div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleReviewSubmit} className="mt-4 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Your name"
                value={review.user}
                onChange={e => setReview({ ...review, user: e.target.value })}
                required
              />
              <select
                className="form-control"
                value={review.rating}
                onChange={e => setReview({ ...review, rating: Number(e.target.value) })}
                required
              >
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <textarea
              className="form-control"
              placeholder="Your review"
              value={review.comment}
              onChange={e => setReview({ ...review, comment: e.target.value })}
              required
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button type="submit" className="btn btn--primary" disabled={submitting}>{submitting ? 'Adding...' : 'Add Review'}</button>
          </form>
        </div>
      </div>
    </main>
  );
} 