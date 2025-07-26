import React from 'react';

type Deal = {
  id: string;
  name: string;
  price?: number;
  description: string;
  discount: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  category: { name: string; icon: string };
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
  createdAt?: string;
};

type DealCardProps = {
  deal: Deal;
  onClick?: () => void;
};

const DealCard: React.FC<DealCardProps> = React.memo(function DealCard({ deal, onClick }) {
  const now = new Date();
  const isActive = deal.isActive && new Date(deal.endDate) >= now;
  
  const handleClick = React.useCallback(() => {
    onClick?.();
  }, [onClick]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const locationText = React.useMemo(() => {
    const parts = [];
    if (deal.place?.name) parts.push(deal.place.name);
    if (deal.place?.district?.name) parts.push(deal.place.district.name);
    if (deal.place?.district?.state?.name) parts.push(deal.place.district.state.name);
    return parts.join(', ');
  }, [deal.place]);

  const truncatedDescription = React.useMemo(() => {
    return deal.description.length > 100 ? deal.description.slice(0, 100) + '...' : deal.description;
  }, [deal.description]);

  return (
    <div
      className={
        `card card--hover w-full max-w-md sm:max-w-full p-4 sm:p-6 flex flex-col cursor-pointer animate-fadein transition-transform duration-200 active:scale-95 hover:shadow-xl focus:shadow-xl ${isActive ? 'border-teal-200' : 'border-gray-200 dark:border-gray-700'}`
      }
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={`View deal: ${deal.name}`}
      style={{ outline: 'none' }}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white line-clamp-2 flex-1 mr-2">{deal.name}</h3>
        <span className={
          `text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${isActive ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`
        }>
          {deal.discount} OFF
        </span>
      </div>
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <span className="text-xl sm:text-2xl">{deal.category.icon}</span>
        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{deal.category.name}</span>
      </div>
      <div className="text-xs text-gray-500 mb-2 sm:mb-3 flex items-center gap-1">
        <span>📍</span>
        <span className="line-clamp-1">{locationText}</span>
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-200 mb-3 sm:mb-4 line-clamp-3 flex-1">
        {truncatedDescription}
      </div>
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="text-xs text-gray-500 font-medium">By {deal.vendor.name}</div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-teal-500' : 'bg-red-400'}`}></span>
          <span className={`text-xs font-semibold ${isActive ? 'text-teal-700 dark:text-teal-300' : 'text-red-500'}`}>{isActive ? 'Active' : 'Expired'}</span>
        </div>
      </div>
    </div>
  );
});

export default DealCard; 