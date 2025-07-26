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

export default function DealCard({ deal, onClick }: DealCardProps) {
  const now = new Date();
  const isActive = deal.isActive && new Date(deal.endDate) >= now;
  return (
    <div
      className={
        `bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col cursor-pointer border transition hover:shadow-lg hover:border-teal-500 ${isActive ? 'border-teal-200' : 'border-gray-200 dark:border-gray-700'}`
      }
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{deal.name}</h3>
        <span className={
          `text-xs font-semibold px-2.5 py-0.5 rounded ${isActive ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`
        }>
          {deal.discount} OFF
        </span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{deal.category.icon}</span>
        <span className="text-sm text-gray-600 dark:text-gray-300">{deal.category.name}</span>
      </div>
      <div className="text-xs text-gray-500 mb-2">
        📍
        {deal.place?.name ? `${deal.place.name}, ` : ''}
        {deal.place?.district?.name ? `${deal.place.district.name}, ` : ''}
        {deal.place?.district?.state?.name ? deal.place.district.state.name : ''}
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-200 mb-2">
        {deal.description.length > 100 ? deal.description.slice(0, 100) + '...' : deal.description}
      </div>
      <div className="flex items-center justify-between mt-auto">
        <div className="text-xs text-gray-500">By {deal.vendor.name}</div>
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-teal-500' : 'bg-red-400'}`}></span>
          <span className={`text-xs font-semibold ${isActive ? 'text-teal-700 dark:text-teal-300' : 'text-red-500'}`}>{isActive ? 'Active' : 'Expired'}</span>
        </div>
      </div>
    </div>
  );
} 