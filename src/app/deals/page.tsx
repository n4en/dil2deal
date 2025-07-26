'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import DealCard from '../components/DealCard';
import { useSearchParams } from 'next/navigation';
import DealsFilterBar from '../components/DealsFilterBar';

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

// Cache for location data to avoid repeated API calls
const locationCache = new Map<string, any>();

function DealsPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [stateId, setStateId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [showExpired, setShowExpired] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Update category if the URL changes (e.g., when navigating from home page)
  useEffect(() => {
    setCategory(searchParams.get('category') || '');
  }, [searchParams]);

  // Optimized initial data loading - fetch all data in parallel
  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        const [dealsRes, categoriesRes, statesRes] = await Promise.all([
          fetch('/api/deals'),
          fetch('/api/categories'),
          fetch('/api/locations/states')
        ]);

        const [dealsData, categoriesData, statesData] = await Promise.all([
          dealsRes.json(),
          categoriesRes.json(),
          statesRes.json()
        ]);

        if (Array.isArray(dealsData)) {
          setDeals(dealsData);
          setFilteredDeals(dealsData);
        }

        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }

        if (Array.isArray(statesData)) {
          setStates(statesData);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Optimized district fetching with caching
  const fetchDistricts = useCallback(async (stateId: string) => {
    const cacheKey = `districts-${stateId}`;
    
    if (locationCache.has(cacheKey)) {
      setDistricts(locationCache.get(cacheKey));
      return;
    }

    setLoadingDistricts(true);
    try {
      const response = await fetch(`/api/locations/districts?stateId=${stateId}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        locationCache.set(cacheKey, data);
        setDistricts(data);
      } else {
        setDistricts([]);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  // Optimized places fetching with caching
  const fetchPlaces = useCallback(async (districtId: string) => {
    const cacheKey = `places-${districtId}`;
    
    if (locationCache.has(cacheKey)) {
      setPlaces(locationCache.get(cacheKey));
      return;
    }

    setLoadingPlaces(true);
    try {
      const response = await fetch(`/api/locations/places?districtId=${districtId}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        locationCache.set(cacheKey, data);
        setPlaces(data);
      } else {
        setPlaces([]);
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
      // Clear dependent filters
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
      // Clear dependent filter
      setPlaceId('');
    } else {
      setPlaces([]);
      setPlaceId('');
    }
  }, [districtId, fetchPlaces]);

  // Optimized filtering with useCallback to prevent unnecessary re-computations
  const applyFilters = useCallback(() => {
    let filtered = deals;
    const now = new Date();
    
    if (!showExpired) {
      filtered = filtered.filter((deal) => deal.isActive && new Date(deal.endDate) >= now);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
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
  }, [deals, search, category, stateId, districtId, placeId, showExpired]);

  // Apply filters when any filter changes
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

  if (initialLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading deals...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

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
          {filteredDeals.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-300 py-16">
              <div className="text-5xl mb-4">🔍</div>
              <div className="text-lg font-semibold mb-2">No deals found</div>
              <div className="mb-4">Try adjusting your filters or search terms</div>
              <button className="btn btn--outline" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            filteredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} onClick={() => window.location.href = `/deals/${deal.id}`} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

export default function DealsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center">Loading...</div>}>
      <DealsPageContent />
    </Suspense>
  );
} 