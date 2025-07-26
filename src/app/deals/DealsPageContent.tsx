'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import DealCard from '../components/DealCard';
import { useSearchParams } from 'next/navigation';
import DealsFilterBar from '../components/DealsFilterBar';
import Skeleton from '../components/Skeleton';
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
}

interface Place {
  id: string;
  name: string;
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
    name: string;
  };
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

  // Debounce search for better performance
  const debouncedSearch = useDebounce(search, 300);

  // Update category if the URL changes (e.g., when navigating from home page)
  useEffect(() => {
    setCategory(searchParams.get('category') || '');
  }, [searchParams]);

  // Optimized district fetching with caching
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
    try {
      const response = await fetch(`/api/locations/districts?stateId=${stateId}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        districtsCache.set(cacheKey, data);
        setDistricts(data);
      } else {
        setDistricts([]);
      }
    } catch {
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  // Optimized places fetching with caching
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
    try {
      const response = await fetch(`/api/locations/places?districtId=${districtId}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        placesCache.set(cacheKey, data);
        setPlaces(data);
      } else {
        setPlaces([]);
      }
    } catch {
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

  // Memoized filtering logic for better performance
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
      setIsFiltering(false);
    });
  }, [initialDeals, debouncedSearch, category, stateId, districtId, placeId, showExpired]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setCategory('');
    setStateId('');
    setDistrictId('');
    setPlaceId('');
  }, []);

  const handleDealClick = useCallback((dealId: string) => {
    window.location.href = `/deals/${dealId}`;
  }, []);

  // Memoized skeleton array to prevent unnecessary re-renders
  const skeletonArray = useMemo(() => Array.from({ length: 6 }), []);

  // Show skeletons if loading or filtering
  const showSkeletons = filteredDeals.length === 0 && (isFiltering || initialDeals.length === 0);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <DealsFilterBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          categories={categories}
          stateId={stateId}
          setStateId={setStateId}
          states={states}
          districtId={districtId}
          setDistrictId={setDistrictId}
          districts={districts}
          placeId={placeId}
          setPlaceId={setPlaceId}
          places={places}
          showExpired={showExpired}
          setShowExpired={setShowExpired}
          loadingDistricts={loadingDistricts}
          loadingPlaces={loadingPlaces}
          clearFilters={clearFilters}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {showSkeletons ? (
            skeletonArray.map((_, i) => <Skeleton key={i} />)
          ) : filteredDeals.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-300 py-16 animate-fadein">
              <div className="text-5xl mb-4">🔍</div>
              <div className="text-lg font-semibold mb-2">No deals found</div>
              <div className="mb-4">Try adjusting your filters or search terms</div>
              <button className="btn btn--outline ripple" aria-label="Clear filters" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            filteredDeals.map((deal) => (
              <div className="animate-fadein" key={deal.id}>
                <DealCard deal={deal} onClick={() => handleDealClick(deal.id)} />
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
} 