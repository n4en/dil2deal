'use client';

import React, { useState, useCallback, useMemo } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface State {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
  stateId: string;
}

interface Place {
  id: string;
  name: string;
  districtId: string;
}

interface DealsFilterBarProps {
  search: string;
  setSearch: (search: string) => void;
  category: string;
  setCategory: (category: string) => void;
  stateId: string;
  setStateId: (stateId: string) => void;
  districtId: string;
  setDistrictId: (districtId: string) => void;
  placeId: string;
  setPlaceId: (placeId: string) => void;
  showExpired: boolean;
  setShowExpired: (showExpired: boolean) => void;
  categories: Category[];
  states: State[];
  districts: District[];
  places: Place[];
  loadingDistricts: boolean;
  loadingPlaces: boolean;
}

export default function DealsFilterBar({
  search,
  setSearch,
  category,
  setCategory,
  stateId,
  setStateId,
  districtId,
  setDistrictId,
  placeId,
  setPlaceId,
  showExpired,
  setShowExpired,
  categories,
  states,
  districts,
  places,
  loadingDistricts,
  loadingPlaces
}: DealsFilterBarProps) {
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Memoize active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (category) count++;
    if (stateId) count++;
    if (districtId) count++;
    if (placeId) count++;
    if (showExpired) count++;
    return count;
  }, [search, category, stateId, districtId, placeId, showExpired]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearch('');
    setCategory('');
    setStateId('');
    setDistrictId('');
    setPlaceId('');
    setShowExpired(false);
  }, [setSearch, setCategory, setStateId, setDistrictId, setPlaceId, setShowExpired]);

  // Handle search input changes
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    
    // Generate search suggestions
    if (value.length > 2) {
      const suggestions = ['beauty', 'spa', 'restaurant', 'shopping', 'fitness', 'entertainment'];
      const filtered = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()));
      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [setSearch]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setSearch(suggestion);
    setShowSuggestions(false);
  }, [setSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, []);

  return (
    <div className="mb-6 relative z-50">
      {/* Active Filters Indicator */}
      {activeFilterCount > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Active filters: {activeFilterCount}
          </span>
          <button
            onClick={clearFilters}
            className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        {/* Search and Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Search Input */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
              Search deals
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={handleKeyDown}
                placeholder="Search deals..."
                className="form-control w-full pl-8 pr-3 text-sm focus:shadow-sm"
                aria-label="Search deals"
              />
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
              Category
            </label>
            <div className="relative w-full">
              <select
                className="form-control w-full transition-all duration-300 ease-in-out focus:shadow-sm text-sm"
                value={category}
                onChange={e => setCategory(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {Array.isArray(categories) && categories.map((cat: Category) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Location Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
              State
            </label>
            <div className="relative w-full">
              <select
                className="form-control w-full transition-all duration-300 ease-in-out focus:shadow-sm text-sm"
                value={stateId}
                onChange={e => setStateId(e.target.value)}
                aria-label="Filter by state"
              >
                <option value="">All States</option>
                {Array.isArray(states) && states.map((s: State) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
              District
            </label>
            <div className="relative w-full">
              <select
                className={`form-control w-full transition-all duration-300 ease-in-out focus:shadow-sm text-sm ${loadingDistricts ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={districtId}
                onChange={e => setDistrictId(e.target.value)}
                disabled={!stateId || loadingDistricts}
                aria-label="Filter by district"
              >
                <option value="">
                  {loadingDistricts ? 'Loading...' : 'All Districts'}
                </option>
                {Array.isArray(districts) && districts.map((d: District) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {loadingDistricts && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
              Place
            </label>
            <div className="relative w-full">
              <select
                className={`form-control w-full transition-all duration-300 ease-in-out focus:shadow-sm text-sm ${loadingPlaces ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={placeId}
                onChange={e => setPlaceId(e.target.value)}
                disabled={!districtId || loadingPlaces}
                aria-label="Filter by place"
                style={{ zIndex: 9999, maxWidth: '100%' }}
              >
                <option value="">
                  {loadingPlaces ? 'Loading...' : 'All Places'}
                </option>
                {Array.isArray(places) && places.map((p: Place) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {loadingPlaces && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Show Expired Deals Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showExpired"
              checked={showExpired}
              onChange={e => setShowExpired(e.target.checked)}
              className="h-3 w-3 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="showExpired" className="ml-2 block text-xs text-gray-700 dark:text-gray-200">
              Show expired deals
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 