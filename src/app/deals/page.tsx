'use client';

import React, { useEffect, useState, Suspense } from 'react';
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

  // Update category if the URL changes (e.g., when navigating from home page)
  useEffect(() => {
    setCategory(searchParams.get('category') || '');
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/deals')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDeals(data);
          setFilteredDeals(data);
        } else {
          setDeals([]);
          setFilteredDeals([]);
        }
      })
      .catch(() => { setDeals([]); setFilteredDeals([]); });
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories([]);
        }
      })
      .catch(() => setCategories([]));
    fetch('/api/locations/states')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStates(data);
        } else {
          setStates([]);
        }
      })
      .catch(() => setStates([]));
  }, []);

  useEffect(() => {
    if (stateId) {
      fetch(`/api/locations/districts?stateId=${stateId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setDistricts(data);
          } else {
            setDistricts([]);
          }
        })
        .catch(() => setDistricts([]));
      setDistrictId('');
      setPlaceId('');
      setPlaces([]);
    } else {
      setDistricts([]);
      setDistrictId('');
      setPlaceId('');
      setPlaces([]);
    }
  }, [stateId]);

  useEffect(() => {
    if (districtId) {
      fetch(`/api/locations/places?districtId=${districtId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setPlaces(data);
          } else {
            setPlaces([]);
          }
        })
        .catch(() => setPlaces([]));
      setPlaceId('');
    } else {
      setPlaces([]);
      setPlaceId('');
    }
  }, [districtId]);

  useEffect(() => {
    let filtered = deals;
    const now = new Date();
    if (!showExpired) {
      filtered = filtered.filter((deal) => deal.isActive && new Date(deal.endDate) >= now);
    }
    if (search) {
      filtered = filtered.filter((deal) =>
        deal.name.toLowerCase().includes(search.toLowerCase()) ||
        deal.description.toLowerCase().includes(search.toLowerCase()) ||
        deal.vendor.name.toLowerCase().includes(search.toLowerCase())
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
  }, [search, category, stateId, districtId, placeId, deals, showExpired]);

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
          clearFilters={() => { setSearch(''); setCategory(''); setStateId(''); setDistrictId(''); setPlaceId(''); }}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredDeals.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-300 py-16">
              <div className="text-5xl mb-4">🔍</div>
              <div className="text-lg font-semibold mb-2">No deals found</div>
              <div className="mb-4">Try adjusting your filters or search terms</div>
              <button className="btn btn--outline" onClick={() => { setSearch(''); setCategory(''); setStateId(''); setDistrictId(''); setPlaceId(''); }}>Clear Filters</button>
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