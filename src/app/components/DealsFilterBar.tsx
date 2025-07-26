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
  clearFilters: () => void;
}

const DealsFilterBar: React.FC<DealsFilterBarProps> = ({
  search, setSearch,
  category, setCategory, categories,
  stateId, setStateId, states,
  districtId, setDistrictId, districts,
  placeId, setPlaceId, places,
  showExpired, setShowExpired,
  clearFilters
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-wrap gap-3 items-center border border-gray-200 dark:border-gray-700 mt-4 mb-8">
      <input
        type="text"
        placeholder="Search deals..."
        className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 w-40 md:w-48"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <select
        className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 w-36"
        value={category}
        onChange={e => setCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        {Array.isArray(categories) && categories.map((cat: Category) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <select
        className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 w-32"
        value={stateId}
        onChange={e => setStateId(e.target.value)}
      >
        <option value="">All States</option>
        {Array.isArray(states) && states.map((s: State) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <select
        className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 w-32"
        value={districtId}
        onChange={e => setDistrictId(e.target.value)}
        disabled={!stateId}
      >
        <option value="">All Districts</option>
        {Array.isArray(districts) && districts.map((d: District) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      <select
        className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 w-32"
        value={placeId}
        onChange={e => setPlaceId(e.target.value)}
        disabled={!districtId}
      >
        <option value="">All Places</option>
        {Array.isArray(places) && places.map((p: Place) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <button
        className="ml-2 px-4 py-2 rounded-lg font-semibold bg-teal-500 text-white shadow transition-colors duration-200"
        onClick={clearFilters}
      >
        Clear Filters
      </button>
      <div className="ml-auto flex items-center gap-2 md:ml-4 mt-2 md:mt-0">
        <label htmlFor="toggle-expired" className="text-xs font-semibold text-teal-700 dark:text-teal-300 select-none">Show Expired</label>
        <button
          id="toggle-expired"
          type="button"
          aria-pressed={showExpired}
          className={`w-14 h-8 rounded-full border-2 border-teal-500 flex items-center transition-colors duration-200 shadow-sm ${showExpired ? 'bg-teal-500' : 'bg-gray-200'}`}
          onClick={() => setShowExpired(!showExpired)}
        >
          <span className={`inline-block w-7 h-7 rounded-full bg-white shadow transform transition-transform duration-200 ${showExpired ? 'translate-x-6' : ''}`}></span>
        </button>
      </div>
    </div>
  );
};

export default DealsFilterBar; 