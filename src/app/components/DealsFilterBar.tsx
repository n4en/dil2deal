import React from 'react';

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

interface DealsFilterBarProps {
  search: string;
  setSearch: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  categories: Category[];
  stateId: string;
  setStateId: (v: string) => void;
  states: State[];
  districtId: string;
  setDistrictId: (v: string) => void;
  districts: District[];
  placeId: string;
  setPlaceId: (v: string) => void;
  places: Place[];
  showExpired: boolean;
  setShowExpired: (v: boolean) => void;
  loadingDistricts?: boolean;
  loadingPlaces?: boolean;
  clearFilters: () => void;
}

const DealsFilterBar: React.FC<DealsFilterBarProps> = ({
  search, setSearch,
  category, setCategory, categories,
  stateId, setStateId, states,
  districtId, setDistrictId, districts,
  placeId, setPlaceId, places,
  showExpired, setShowExpired,
  loadingDistricts = false,
  loadingPlaces = false,
  clearFilters
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 flex flex-wrap md:flex-nowrap gap-4 items-center border border-gray-200 dark:border-gray-700 mt-4 mb-8 flex-col sm:flex-row">
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <input
          type="text"
          placeholder="Search deals..."
          className="form-control w-full sm:w-48 md:w-56"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="form-control w-full sm:w-40"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {Array.isArray(categories) && categories.map((cat: Category) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <select
          className="form-control w-full sm:w-36"
          value={stateId}
          onChange={e => setStateId(e.target.value)}
        >
          <option value="">All States</option>
          {Array.isArray(states) && states.map((s: State) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select
          className={`form-control w-full sm:w-36 ${loadingDistricts ? 'opacity-50 cursor-not-allowed' : ''}`}
          value={districtId}
          onChange={e => setDistrictId(e.target.value)}
          disabled={!stateId || loadingDistricts}
        >
          <option value="">
            {loadingDistricts ? 'Loading...' : 'All Districts'}
          </option>
          {Array.isArray(districts) && districts.map((d: District) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select
          className={`form-control w-full sm:w-36 ${loadingPlaces ? 'opacity-50 cursor-not-allowed' : ''}`}
          value={placeId}
          onChange={e => setPlaceId(e.target.value)}
          disabled={!districtId || loadingPlaces}
        >
          <option value="">
            {loadingPlaces ? 'Loading...' : 'All Places'}
          </option>
          {Array.isArray(places) && places.map((p: Place) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
        <button
          className="btn btn--primary w-full sm:w-auto"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
        <div className="flex items-center gap-3">
          <label htmlFor="toggle-expired" className="text-sm font-medium text-teal-700 dark:text-teal-300 select-none">Show Expired</label>
          <button
            id="toggle-expired"
            type="button"
            aria-pressed={showExpired}
            className={`w-12 h-6 rounded-full border-2 border-teal-500 flex items-center transition-colors duration-200 shadow-sm ${showExpired ? 'bg-teal-500' : 'bg-gray-200'}`}
            onClick={() => setShowExpired(!showExpired)}
          >
            <span className={`inline-block w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${showExpired ? 'translate-x-6' : ''}`}></span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealsFilterBar; 