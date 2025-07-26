'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

export default function VendorPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [states, setStates] = useState<State[]>([]);
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

  useEffect(() => {
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
    // Basic validation
    if (!form.name || !form.description || !form.discount || !form.startDate || !form.endDate || !form.categoryId || !stateId || !districtId || !placeId || !form.vendorName || !form.vendorPhone || !form.vendorEmail || !form.vendorAddress) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }
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
      setError('Failed to publish deal.');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white text-center">Publish Deal</h1>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-10 space-y-10 border border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold mb-6 text-teal-700 dark:text-teal-300 border-b pb-2">Deal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">Deal Name *</label>
                <input className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. 20% Off on All Pizzas" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">Category *</label>
                <select className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" name="categoryId" value={form.categoryId} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  {Array.isArray(categories) && categories.map((cat: Category) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-6">
              <label className="form-label font-medium text-gray-700 dark:text-gray-200">Deal Description *</label>
              <textarea className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" name="description" value={form.description} onChange={handleChange} rows={3} required placeholder="Describe your deal in detail..." />
            </div>
            <div className="grid grid-cols-1 gap-y-8 mb-6">
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">Discount *</label>
                <input className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" name="discount" value={form.discount} onChange={handleChange} required placeholder="e.g. 20%" />
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-4">
                  <label className="form-label font-medium text-gray-700 dark:text-gray-200">Start Date *</label>
                  <ReactDatePicker
                    className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    selected={startDate}
                    onChange={setStartDate}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select start date"
                    required
                    minDate={new Date()}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-4 mt-6 md:mt-0">
                  <label className="form-label font-medium text-gray-700 dark:text-gray-200">End Date *</label>
                  <ReactDatePicker
                    className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-6 text-teal-700 dark:text-teal-300 border-b pb-2">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">State *</label>
                <select className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" value={stateId} onChange={e => setStateId(e.target.value)} required>
                  <option value="">Select State</option>
                  {Array.isArray(states) && states.map((s: State) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">District *</label>
                <select className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" value={districtId} onChange={e => setDistrictId(e.target.value)} required disabled={!stateId}>
                  <option value="">Select District</option>
                  {Array.isArray(districts) && districts.map((d: District) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">City/Place *</label>
                <select className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" value={placeId} onChange={e => setPlaceId(e.target.value)} required disabled={!districtId}>
                  <option value="">Select Place</option>
                  {Array.isArray(places) && places.map((p: Place) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-6 text-teal-700 dark:text-teal-300 border-b pb-2">Vendor Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">Business Name *</label>
                <input className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" name="vendorName" value={form.vendorName} onChange={handleChange} required placeholder="e.g. Pizza Palace" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-700 dark:text-gray-200">Phone Number *</label>
                <input className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" name="vendorPhone" value={form.vendorPhone} onChange={handleChange} required placeholder="e.g. 9876543210" />
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-6">
              <label className="form-label font-medium text-gray-700 dark:text-gray-200">Email *</label>
              <input type="email" className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" name="vendorEmail" value={form.vendorEmail} onChange={handleChange} required placeholder="e.g. vendor@email.com" />
            </div>
            <div className="flex flex-col gap-2 mb-6">
              <label className="form-label font-medium text-gray-700 dark:text-gray-200">Business Address *</label>
              <textarea className="form-control border border-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" name="vendorAddress" value={form.vendorAddress} onChange={handleChange} rows={2} required placeholder="e.g. 123 Main St, Mumbai" />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="flex gap-4 justify-end">
            <button type="button" className="btn btn--outline" disabled={loading} onClick={() => {
              setForm({
                name: '', description: '', discount: '', startDate: '', endDate: '', categoryId: '', vendorName: '', vendorPhone: '', vendorEmail: '', vendorAddress: ''
              });
              setStateId(''); setDistrictId(''); setPlaceId('');
              setStartDate(null); setEndDate(null);
            }}>Clear</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? 'Publishing...' : 'Publish Deal'}</button>
          </div>
        </form>
      </div>
    </main>
  );
} 