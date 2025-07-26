import React from 'react';

type CategoryCardProps = {
  category: {
    id: string;
    name: string;
    icon: string;
  };
  onClick?: () => void;
};

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <div
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-200 transform hover:scale-105"
      onClick={onClick}
    >
      <span className="text-5xl mb-3">{category.icon}</span>
      <div className="font-semibold text-gray-900 dark:text-white text-center text-lg">{category.name}</div>
    </div>
  );
} 