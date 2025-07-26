'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LoadingSpinner from '../../components/LoadingSpinner';

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
      fetch(`/api/deals/${dealId}?t=${Date.now()}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Deal not found');
          }
          return res.json();
        })
        .then((data) => {
          console.log('Deal data received:', data);
          console.log('Reviews count:', data.reviews?.length || 0);
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
    
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...review, dealId }),
      });
      
      if (res.ok) {
        setReview({ user: '', rating: 5, comment: '' });
        // Force a complete page refresh to show the new review
        window.location.reload();
      } else {
        setError('Failed to add review');
      }
    } catch {
      setError('Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading deal details...</p>
        </div>
      </div>
    );
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
  const averageRating = deal.reviews.length > 0 
    ? deal.reviews.reduce((acc, r) => acc + r.rating, 0) / deal.reviews.length 
    : 0;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <button className="btn btn--outline mb-8" onClick={() => router.back()}>&larr; Back to Deals</button>
        
        {/* Deal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{deal.name}</h1>
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full dark:bg-teal-900 dark:text-teal-300">
              {deal.discount} OFF
            </span>
            <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="text-xl">{deal.category.icon}</span> 
              <span>{deal.category.name}</span>
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              📍
              {deal.place?.name ? `${deal.place.name}, ` : ''}
              {deal.place?.district?.name ? `${deal.place.district.name}, ` : ''}
              {deal.place?.district?.state?.name ? deal.place.district.state.name : ''}
            </span>
            <span className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-400'}`}></span>
              <span className={isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {isActive ? 'Active Deal' : 'Expired Deal'}
              </span>
            </span>
          </div>
          <div className="text-gray-700 dark:text-gray-200 mb-6 text-lg leading-relaxed">{deal.description}</div>
          <div className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <strong>Valid from:</strong> {new Date(deal.startDate).toLocaleDateString()} to {new Date(deal.endDate).toLocaleDateString()}
          </div>
        </div>

        {/* Vendor Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">🏢</span>
            Vendor Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Business Details</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-200">
                <div><strong>Name:</strong> {deal.vendor.name}</div>
                <div><strong>Address:</strong> {deal.vendor.address}</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Information</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-200">
                <div>
                  <strong>Phone:</strong> 
                  <a href={`tel:${deal.vendor.phone}`} className="text-teal-600 dark:text-teal-400 hover:underline ml-1">
                    {deal.vendor.phone}
                  </a>
                </div>
                <div>
                  <strong>Email:</strong> 
                  <a href={`mailto:${deal.vendor.email}`} className="text-teal-600 dark:text-teal-400 hover:underline ml-1">
                    {deal.vendor.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-xl">⭐</span>
              Reviews ({deal.reviews?.length || 0})
            </h2>
            {deal.reviews && deal.reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Average:</span>
                {renderStars(Math.round(averageRating))}
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  ({averageRating.toFixed(1)})
                </span>
              </div>
            )}
          </div>

          {!deal.reviews || deal.reviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📝</div>
              <div className="text-gray-500 dark:text-gray-300 mb-1 text-sm font-medium">No reviews yet</div>
              <div className="text-xs text-gray-400">Be the first to review this deal!</div>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {deal.reviews.map((r: Review) => (
                <div key={r.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className="text-teal-600 dark:text-teal-300 font-semibold text-sm">
                        {r.user?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{r.user || 'Anonymous'}</div>
                        <div className="flex items-center gap-1">
                          {renderStars(r.rating)}
                          <span className="text-xs text-gray-500 dark:text-gray-400">{r.rating}/5</span>
                        </div>
                      </div>
                      <div className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{r.comment || 'No comment provided'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Review Form */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">Add Your Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    className="form-control w-full text-sm"
                    placeholder="Enter your name"
                    value={review.user}
                    onChange={e => setReview({ ...review, user: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Rating *
                  </label>
                  <select
                    className="form-control w-full text-sm"
                    value={review.rating}
                    onChange={e => setReview({ ...review, rating: Number(e.target.value) })}
                    required
                  >
                    {[5,4,3,2,1].map(n => (
                      <option key={n} value={n}>
                        {n} Star{n > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Your Review *
                </label>
                <textarea
                  className="form-control w-full text-sm"
                  rows={3}
                  placeholder="Share your experience with this deal..."
                  value={review.comment}
                  onChange={e => setReview({ ...review, comment: e.target.value })}
                  required
                />
              </div>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 text-sm">⚠️</span>
                    <span className="text-red-700 dark:text-red-300 text-xs">{error}</span>
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn btn--primary text-sm px-4 py-2" 
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" color="white" />
                    Adding Review...
                  </div>
                ) : (
                  'Submit Review'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
} 