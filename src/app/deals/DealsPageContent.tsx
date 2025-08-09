'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import DealCard from '../components/DealCard';
import { useSearchParams, useRouter } from 'next/navigation';
import DealsFilterBar from '../components/DealsFilterBar';
import { OptimizedSkeletonGrid } from '../components/OptimizedSkeleton';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';

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

interface Deal {
  id: string;
  name: string;
  description: string;
  discount: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  category: Category;
  place: {
    id: string;
    name: string;
    districtId: string;
    district: {
      id: string;
      name: string;
      stateId: string;
      state: {
        id: string;
        name: string;
      };
    };
  };
  vendor: {
    id: string;
    name: string;
  };
  reviews: Array<{
    id: string;
    rating: number;
    dealId: string;
  }>;
}

const districtsCache = new Map<string, District[]>();
const placesCache = new Map<string, Place[]>();

export default function DealsPageContent({
  initialDeals,
  initialCategories,
  initialStates
}: {
  initialDeals: Deal[];
  initialCategories: Category[];
  initialStates: State[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get('category') || '';

  const [filteredDeals, setFilteredDeals] = useState<Deal[]>(initialDeals);
  const [categories] = useState<Category[]>(initialCategories);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [states] = useState<State[]>(initialStates);
  const [districts, setDistricts] = useState<District[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [stateId, setStateId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [showExpired, setShowExpired] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [displayedDeals, setDisplayedDeals] = useState<Deal[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const dealsPerPage = 12;

  // Debounce search for better performance
  const debouncedSearch = useDebounce(search, 300);

  // Update category if the URL changes (e.g., when navigating from home page)
  useEffect(() => {
    setCategory(searchParams.get('category') || '');
  }, [searchParams]);

  // Optimized district fetching with caching and error handling
  const fetchDistricts = useCallback(async (stateId: string) => {
    const cacheKey = `districts-${stateId}`;
    if (districtsCache.has(cacheKey)) {
      const cachedDistricts = districtsCache.get(cacheKey);
      if (cachedDistricts) {
        setDistricts(cachedDistricts);
        return;
      }
    }
    setLoadingDistricts(true);

    const attemptFetch = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      try {
        const response = await fetch(`/api/locations/districts?stateId=${stateId}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Failed to fetch districts');
        const data = await response.json();
        if (Array.isArray(data)) {
          districtsCache.set(cacheKey, data);
          setDistricts(data);
        } else {
          setDistricts([]);
        }
        return true;
      } catch (err) {
        clearTimeout(timeoutId);
        return false;
      }
    };

    try {
      const ok = await attemptFetch();
      if (!ok) {
        // simple one-time retry
        await attemptFetch();
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  // Optimized places fetching with caching and error handling
  const fetchPlaces = useCallback(async (districtId: string) => {
    const cacheKey = `places-${districtId}`;
    if (placesCache.has(cacheKey)) {
      const cachedPlaces = placesCache.get(cacheKey);
      if (cachedPlaces) {
        setPlaces(cachedPlaces);
        return;
      }
    }
    setLoadingPlaces(true);

    const attemptFetch = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      try {
        const response = await fetch(`/api/locations/places?districtId=${districtId}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Failed to fetch places');
        const data = await response.json();
        if (Array.isArray(data)) {
          placesCache.set(cacheKey, data);
          setPlaces(data);
        } else {
          setPlaces([]);
        }
        return true;
      } catch (err) {
        clearTimeout(timeoutId);
        return false;
      }
    };

    try {
      const ok = await attemptFetch();
      if (!ok) {
        await attemptFetch();
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      setPlaces([]);
    } finally {
      setLoadingPlaces(false);
    }
  }, []);

  // Handle state selection - fetch districts
  useEffect(() => {
    if (stateId) {
      fetchDistricts(stateId);
      setDistrictId('');
      setPlaceId('');
      setPlaces([]);
    } else {
      setDistricts([]);
      setDistrictId('');
      setPlaceId('');
      setPlaces([]);
    }
  }, [stateId, fetchDistricts]);

  // Handle district selection - fetch places
  useEffect(() => {
    if (districtId) {
      fetchPlaces(districtId);
      setPlaceId('');
    } else {
      setPlaces([]);
      setPlaceId('');
    }
  }, [districtId, fetchPlaces]);

  // Optimized filtering logic with memoization
  const applyFilters = useCallback(() => {
    setIsFiltering(true);
    
    // Use requestAnimationFrame to avoid blocking the UI
    requestAnimationFrame(() => {
      let filtered = initialDeals;
      const now = new Date();
      
      if (!showExpired) {
        filtered = filtered.filter((deal) => deal.isActive && new Date(deal.endDate) >= now);
      }
      
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        filtered = filtered.filter((deal) =>
          deal.name.toLowerCase().includes(searchLower) ||
          deal.description.toLowerCase().includes(searchLower) ||
          deal.vendor.name.toLowerCase().includes(searchLower)
        );
      }
      
      if (category) {
        filtered = filtered.filter((deal) => deal.category.id === category);
      }
      
      if (stateId) {
        filtered = filtered.filter((deal) => deal.place.district.stateId === stateId);
      }
      
      if (districtId) {
        filtered = filtered.filter((deal) => deal.place.districtId === districtId);
      }
      
      if (placeId) {
        filtered = filtered.filter((deal) => deal.place.id === placeId);
      }
      
      setFilteredDeals(filtered);
      setCurrentPage(1); // Reset to first page when filters change
      setIsFiltering(false);
    });
  }, [initialDeals, debouncedSearch, category, stateId, districtId, placeId, showExpired]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Pagination logic
  useEffect(() => {
    const startIndex = (currentPage - 1) * dealsPerPage;
    const endIndex = startIndex + dealsPerPage;
    const dealsToShow = filteredDeals.slice(startIndex, endIndex);
    setDisplayedDeals(dealsToShow);
    setShowLoadMore(endIndex < filteredDeals.length);
  }, [filteredDeals, currentPage]);

  const loadMore = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch('');
    setCategory('');
    setStateId('');
    setDistrictId('');
    setPlaceId('');
    setCurrentPage(1);
  }, []);

  const handleDealClick = useCallback((deal: Deal) => {
    router.push(`/deals/${deal.id}`);
  }, [router]);

  // Memoize stats
  const stats = useMemo(() => ({
    totalDeals: filteredDeals.length,
    showingDeals: displayedDeals.length,
    hasMore: showLoadMore
  }), [filteredDeals.length, displayedDeals.length, showLoadMore]);

  // Show skeletons if loading or filtering
  const showSkeletons = isFiltering || (filteredDeals.length === 0 && initialDeals.length === 0);

  // When rendering DealCard, ensure reviews is always present
  const safeDisplayedDeals = useMemo(() => displayedDeals.map(deal => ({ ...deal, reviews: deal.reviews ?? [] })), [displayedDeals]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header with stats */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Browse Deals</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Filter Bar with proper spacing to avoid navbar overlap */}
        <div className="relative z-50 mb-6 mt-4">
          <DealsFilterBar
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            stateId={stateId}
            setStateId={setStateId}
            districtId={districtId}
            setDistrictId={setDistrictId}
            placeId={placeId}
            setPlaceId={setPlaceId}
            showExpired={showExpired}
            setShowExpired={setShowExpired}
            categories={categories}
            states={states}
            districts={districts}
            places={places}
            loadingDistricts={loadingDistricts}
            loadingPlaces={loadingPlaces}
          />
        </div>

        {/* Deals Grid with lower z-index */}
        <div className="relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {showSkeletons ? (
              <OptimizedSkeletonGrid count={8} />
            ) : filteredDeals.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 dark:text-gray-300 py-16 animate-fadein">
                <div className="text-5xl mb-4">🔍</div>
                <div className="text-lg font-semibold mb-2">No deals found</div>
                <div className="mb-4">Try adjusting your filters or search terms</div>
                <button
                  className="btn btn--outline ripple"
                  aria-label="Clear filters"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {safeDisplayedDeals.map((deal) => (
                  <div className="animate-fadein" key={deal.id}>
                    <DealCard deal={deal} onClick={() => handleDealClick(deal)} />
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Load More Button */}
          {stats.hasMore && !showSkeletons && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="btn btn--outline"
                disabled={isFiltering}
              >
                {isFiltering ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Loading...
                  </div>
                ) : (
                  `Load More (${stats.totalDeals - stats.showingDeals} remaining)`
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 