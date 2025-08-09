import React, { useMemo } from 'react';

type Deal = {
  id: string;
  name?: string;
  description?: string;
  discount?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  category?: {
    id: string;
    name: string;
    icon: string;
  };
  place?: {
    id: string;
    name: string;
    districtId?: string;
    district?: {
      id: string;
      name: string;
      stateId?: string;
      state?: {
        id: string;
        name: string;
      };
    };
  };
  vendor?: {
    id: string;
    name: string;
  };
  reviews?: Array<{
    id: string;
    rating?: number;
    dealId?: string;
  }>;
};

interface DealCardProps {
  deal: Deal;
  onClick: (deal: Deal) => void;
}

const DealCard: React.FC<DealCardProps> = React.memo(function DealCard({ deal, onClick }) {
  const handleClick = React.useCallback(() => {
    onClick(deal);
  }, [deal, onClick]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(deal);
    }
  }, [deal, onClick]);

  // Memoize computed values with safe fallbacks
  const locationText = useMemo(() => {
    if (!deal.place) return 'Location not specified';
    
    const place = deal.place.name;
    const district = deal.place.district?.name;
    const state = deal.place.district?.state?.name;
    
    if (place && district && state) {
      return `${place}, ${district}, ${state}`;
    } else if (place && district) {
      return `${place}, ${district}`;
    } else if (place) {
      return place;
    }
    return 'Location not specified';
  }, [deal.place]);

  const truncatedDescription = useMemo(() => {
    if (!deal.description) return 'No description available';
    return deal.description.length > 100 
      ? `${deal.description.substring(0, 100)}...` 
      : deal.description;
  }, [deal.description]);

  const averageRating = useMemo(() => {
    if (!deal.reviews || deal.reviews.length === 0) return 0;
    const total = deal.reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return total / deal.reviews.length;
  }, [deal.reviews]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-xs ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden card-hover animate-fade-in cursor-pointer h-full flex flex-col"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${deal.name}`}
    >
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{deal.category?.icon || '🏷️'}</span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              {deal.category?.name || 'General'}
            </span>
          </div>
          <span className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {deal.discount || 'Deal'}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 leading-tight">
          {deal.name || 'Untitled Deal'}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 leading-relaxed">
          {truncatedDescription}
        </p>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-700 mt-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-300">
                {deal.vendor?.name?.charAt(0)?.toUpperCase() || 'V'}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {deal.vendor?.name || 'Unknown Vendor'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-yellow-500 text-sm">⭐</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {deal.reviews?.length || 0}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center space-x-1">
            <span>📍</span>
            <span className="line-clamp-1">{locationText}</span>
          </span>
          {deal.reviews && deal.reviews.length > 0 && (
            <div className="flex items-center space-x-1">
              {renderStars(Math.round(averageRating))}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({averageRating.toFixed(1)})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default DealCard; 