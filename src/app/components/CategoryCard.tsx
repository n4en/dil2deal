import React from 'react';

type CategoryCardProps = {
  category: {
    id: string;
    name: string;
    icon: string;
  };
  onClick?: (categoryId: string) => void;
};

const CategoryCard: React.FC<CategoryCardProps> = React.memo(function CategoryCard({ category, onClick }) {
  const handleClick = React.useCallback(() => {
    onClick?.(category.id);
  }, [category.id, onClick]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(category.id);
    }
  }, [category.id, onClick]);

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 card-hover animate-scale-in cursor-pointer h-full flex flex-col"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Browse ${category.name} deals`}
    >
      <div className="flex flex-col items-center text-center flex-1">
        <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800 rounded-xl flex items-center justify-center mb-3 shadow-sm">
          <span className="text-2xl">{category.icon}</span>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {category.name}
        </h3>
      </div>
    </div>
  );
});

export default CategoryCard; 