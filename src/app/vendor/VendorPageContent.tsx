'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import LoadingSpinner from '../components/LoadingSpinner';

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

interface VendorPageProps {
  initialCategories: Category[];
  initialStates: State[];
}

export default function VendorPageContent({ initialCategories, initialStates }: VendorPageProps) {
  const router = useRouter();
  const [categories] = useState<Category[]>(initialCategories);
  const [states] = useState<State[]>(initialStates);
  const [districts, setDistricts] = useState<District[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [stateId, setStateId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    discount: '',
    startDate: '',
    endDate: '',
    categoryId: '',
    vendorName: '',
    vendorPhone: '',
    vendorEmail: '',
    vendorAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(form.startDate ? new Date(form.startDate) : null);
  const [endDate, setEndDate] = useState<Date | null>(form.endDate ? new Date(form.endDate) : null);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  useEffect(() => {
    if (stateId) {
      setLoadingDistricts(true);
      fetch(`/api/locations/districts?stateId=${stateId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setDistricts(data);
          } else {
            setDistricts([]);
          }
        })
        .catch(() => setDistricts([]))
        .finally(() => setLoadingDistricts(false));
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
      setLoadingPlaces(true);
      fetch(`/api/locations/places?districtId=${districtId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setPlaces(data);
          } else {
            setPlaces([]);
          }
        })
        .catch(() => setPlaces([]))
        .finally(() => setLoadingPlaces(false));
      setPlaceId('');
    } else {
      setPlaces([]);
      setPlaceId('');
    }
  }, [districtId]);

  // Sync form state with date pickers
  useEffect(() => {
    setForm((f) => ({ ...f, startDate: startDate ? startDate.toISOString().slice(0, 10) : '' }));
  }, [startDate]);
  useEffect(() => {
    setForm((f) => ({ ...f, endDate: endDate ? endDate.toISOString().slice(0, 10) : '' }));
  }, [endDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Enhanced validation
    const requiredFields = [
      { field: form.name, name: 'Deal Name' },
      { field: form.description, name: 'Description' },
      { field: form.discount, name: 'Discount' },
      { field: form.startDate, name: 'Start Date' },
      { field: form.endDate, name: 'End Date' },
      { field: form.categoryId, name: 'Category' },
      { field: stateId, name: 'State' },
      { field: districtId, name: 'District' },
      { field: placeId, name: 'Place' },
      { field: form.vendorName, name: 'Business Name' },
      { field: form.vendorPhone, name: 'Phone Number' },
      { field: form.vendorEmail, name: 'Email' },
      { field: form.vendorAddress, name: 'Address' }
    ];

    const missingFields = requiredFields.filter(({ field }) => !field);
    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.map(f => f.name).join(', ')}`);
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.vendorEmail)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Date validation
    if (startDate && endDate && startDate >= endDate) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          discount: form.discount,
          startDate: form.startDate,
          endDate: form.endDate,
          categoryId: form.categoryId,
          placeId,
          vendor: {
            name: form.vendorName,
            phone: form.vendorPhone,
            email: form.vendorEmail,
            address: form.vendorAddress,
          },
        }),
      });
      
      if (res.ok) {
        router.push('/deals');
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to publish deal');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Publish Your Deal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Share your amazing offers with the community
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 sm:p-10 space-y-8 border border-gray-200 dark:border-gray-700">
          {/* Deal Information */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-teal-700 dark:text-teal-300 border-b pb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                <span className="text-teal-600 dark:text-teal-400 text-sm font-bold">D</span>
              </span>
              Deal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">Deal Name *</label>
                <input 
                  className="form-control" 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. 20% Off on All Pizzas" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">Category *</label>
                <select 
                  className="form-control" 
                  name="categoryId" 
                  value={form.categoryId} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select Category</option>
                  {Array.isArray(categories) && categories.map((cat: Category) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-6">
              <label className="form-label font-medium text-gray-700 dark:text-gray-200">Deal Description *</label>
              <textarea 
                className="form-control" 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                rows={4} 
                required 
                placeholder="Describe your deal in detail..." 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">Discount *</label>
                <input 
                  className="form-control" 
                  name="discount" 
                  value={form.discount} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. 20%" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">Start Date *</label>
                <ReactDatePicker
                  className="form-control"
                  selected={startDate}
                  onChange={setStartDate}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select start date"
                  required
                  minDate={new Date()}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">End Date *</label>
                <ReactDatePicker
                  className="form-control"
                  selected={endDate}
                  onChange={setEndDate}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select end date"
                  required
                  minDate={startDate || new Date()}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-teal-700 dark:text-teal-300 border-b pb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                <span className="text-teal-600 dark:text-teal-400 text-sm font-bold">L</span>
              </span>
              Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">State *</label>
                <select 
                  className="form-control" 
                  value={stateId} 
                  onChange={e => setStateId(e.target.value)} 
                  required
                >
                  <option value="">Select State</option>
                  {Array.isArray(states) && states.map((s: State) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">District *</label>
                <div className="relative">
                  <select 
                    className="form-control" 
                    value={districtId} 
                    onChange={e => setDistrictId(e.target.value)} 
                    required 
                    disabled={!stateId || loadingDistricts}
                  >
                    <option value="">
                      {loadingDistricts ? 'Loading...' : 'Select District'}
                    </option>
                    {Array.isArray(districts) && districts.map((d: District) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {loadingDistricts && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">City/Place *</label>
                <div className="relative">
                  <select 
                    className="form-control" 
                    value={placeId} 
                    onChange={e => setPlaceId(e.target.value)} 
                    required 
                    disabled={!districtId || loadingPlaces}
                  >
                    <option value="">
                      {loadingPlaces ? 'Loading...' : 'Select Place'}
                    </option>
                    {Array.isArray(places) && places.map((p: Place) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {loadingPlaces && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-teal-700 dark:text-teal-300 border-b pb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                <span className="text-teal-600 dark:text-teal-400 text-sm font-bold">V</span>
              </span>
              Vendor Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">Business Name *</label>
                <input 
                  className="form-control" 
                  name="vendorName" 
                  value={form.vendorName} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Pizza Palace" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">Phone Number *</label>
                <input 
                  className="form-control" 
                  name="vendorPhone" 
                  value={form.vendorPhone} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. 9876543210" 
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-6">
              <label className="form-label font-medium text-gray-700 dark:text-gray-200">Email *</label>
              <input 
                type="email" 
                className="form-control" 
                name="vendorEmail" 
                value={form.vendorEmail} 
                onChange={handleChange} 
                required 
                placeholder="e.g. vendor@email.com" 
              />
            </div>
            
            <div className="flex flex-col gap-2 mt-6">
              <label className="form-label font-medium text-gray-700 dark:text-gray-200">Business Address *</label>
              <textarea 
                className="form-control" 
                name="vendorAddress" 
                value={form.vendorAddress} 
                onChange={handleChange} 
                rows={3} 
                required 
                placeholder="e.g. 123 Main St, Mumbai" 
              />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚠</span>
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <button 
              type="button" 
              className="btn btn--outline" 
              disabled={loading} 
              onClick={() => {
                setForm({ name: '', description: '', discount: '', startDate: '', endDate: '', categoryId: '', vendorName: '', vendorPhone: '', vendorEmail: '', vendorAddress: '' });
                setStateId(''); setDistrictId(''); setPlaceId('');
                setStartDate(null); setEndDate(null);
                setError('');
              }}
            >
              Clear Form
            </button>
            <button 
              type="submit" 
              className="btn btn--primary" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" color="white" />
                  Publishing...
                </div>
              ) : (
                'Publish Deal'
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 