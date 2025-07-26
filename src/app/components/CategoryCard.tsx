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
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:shadow-md transition"
      onClick={onClick}
    >
      <span className="text-4xl mb-2">{category.icon}</span>
      <div className="font-semibold text-gray-900 dark:text-white text-center">{category.name}</div>
    </div>
  );
} 