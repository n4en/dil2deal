import React from 'react';

type CategoryCardProps = {
  category: {
    id: string;
    name: string;
    icon: string;
  };
  onClick?: () => void;
};

const CategoryCard: React.FC<CategoryCardProps> = React.memo(function CategoryCard({ category, onClick }) {
  const handleClick = React.useCallback(() => {
    onClick?.();
  }, [onClick]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <div
      className="card card--hover w-full max-w-xs sm:max-w-sm p-4 sm:p-6 flex flex-col items-center cursor-pointer animate-fadein transition-transform duration-200 active:scale-95 hover:shadow-xl focus:shadow-xl"
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={`View category: ${category.name}`}
      style={{ outline: 'none' }}
      onKeyDown={handleKeyDown}
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mb-3 sm:mb-4">
        <span className="text-3xl sm:text-4xl">{category.icon}</span>
      </div>
      <div className="font-semibold text-gray-900 dark:text-white text-center text-sm sm:text-base leading-tight">{category.name}</div>
    </div>
  );
});

export default CategoryCard; 