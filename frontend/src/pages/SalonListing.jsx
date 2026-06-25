import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { salonsAPI } from '../api';
import Navbar from '../components/Navbar';

const CATEGORIES = ['All', 'haircut', 'coloring', 'styling', 'beard', 'facial', 'nails', 'massage', 'other'];
const CATEGORY_LABELS = {
  haircut: 'Haircut', coloring: 'Coloring', styling: 'Styling', beard: 'Beard',
  facial: 'Facial', nails: 'Nails', massage: 'Massage', other: 'Other',
};
const CITIES = ['All Cities', 'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'pune'];
const CITY_LABELS = { 'All Cities': 'All Cities', mumbai: 'Mumbai', delhi: 'Delhi', bangalore: 'Bangalore', hyderabad: 'Hyderabad', chennai: 'Chennai', pune: 'Pune' };

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} className={`w-3.5 h-3.5 ${Math.round(rating) >= s ? 'text-gold-400' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const SkeletonCard = () => (
  <div className="glass-card overflow-hidden">
    <div className="h-44 skeleton" />
    <div className="p-4 space-y-3">
      <div className="h-4 skeleton w-3/4" />
      <div className="h-3 skeleton w-1/2" />
      <div className="flex gap-2">
        <div className="h-5 skeleton w-16 rounded-full" />
        <div className="h-5 skeleton w-16 rounded-full" />
      </div>
    </div>
  </div>
);

const SalonCard = ({ salon }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <Link to={`/salons/${salon._id}`} className="salon-card group block">
      <div className="h-48 relative overflow-hidden rounded-t-2xl">
        {salon.images?.[0] && !imgError ? (
          <img 
            src={salon.images[0]} 
            alt={salon.name} 
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-800/60 to-surface-900 flex items-center justify-center">
            <span className="text-6xl">💈</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-semibold text-lg leading-tight group-hover:text-violet-300 transition-colors line-clamp-1">{salon.name}</h3>
          <div className="flex items-center gap-1 text-sm text-white/70 shrink-0 ml-2">
            <StarRating rating={salon.avgRating || 0} />
            <span className="font-medium text-white ml-1">{salon.avgRating?.toFixed(1) || '—'}</span>
            <span className="text-white/40">({salon.totalReviews})</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-white/50 text-sm mb-3">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="capitalize">{salon.city}</span>
          {salon.address && <span className="truncate"> · {salon.address}</span>}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-emerald-400 text-sm font-medium">Book Now →</span>
          <span className={`w-2 h-2 rounded-full ${salon.isApproved ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        </div>
      </div>
    </Link>
  );
};

export default function SalonListing() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [search, setSearch] = useState('');
  const [minRating, setMinRating] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  let debounceTimer;
  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => setDebouncedSearch(val), 400);
  };

  const queryParams = {
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedCity !== 'All Cities' && { city: selectedCity }),
    ...(selectedCategory !== 'All' && { category: selectedCategory }),
    ...(minRating && { minRating }),
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['salons', queryParams],
    queryFn: () => salonsAPI.getAll(queryParams),
  });

  const salons = data?.data?.data || [];
  const total = data?.data?.total || 0;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Search Header */}
      <div className="pt-24 pb-10 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6 font-display">Find a Salon</h1>
          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="salon-search"
                type="text"
                placeholder="Search salons, services…"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="input-field pl-11"
              />
            </div>
            <select
              id="city-filter"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="input-field sm:w-44"
            >
              {CITIES.map((c) => (
                <option key={c} value={c} className="bg-surface-900">{CITY_LABELS[c] || c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="glass-card p-5 sticky top-24">
            <h2 className="text-white font-semibold mb-4">Service Category</h2>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  id={`cat-${cat.toLowerCase()}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                    selectedCategory === cat
                      ? 'bg-violet-500/20 text-violet-300 font-medium border border-violet-500/30'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {cat === 'All' ? 'All Services' : CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <h2 className="text-white font-semibold mb-4">Min Rating</h2>
              <div className="space-y-2">
                {['', '4.5', '4.0', '3.5'].map((r) => (
                  <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="rating"
                      value={r}
                      checked={minRating === r}
                      onChange={() => setMinRating(r)}
                      className="accent-violet-500 w-4 h-4"
                    />
                    <span className="text-sm text-white/60 group-hover:text-white transition-colors">
                      {r ? `⭐ ${r}+` : 'Any rating'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Grid */}
        <main className="flex-1">
          {/* Mobile category pills */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 lg:hidden" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  selectedCategory === cat
                    ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                    : 'text-white/50 border-white/10 hover:text-white'
                }`}
              >
                {cat === 'All' ? 'All' : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-white/50 text-sm">
              {isLoading ? 'Searching…' : `${total} salon${total !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-white font-semibold mb-2">Unable to load salons</h3>
              <p className="text-white/40 text-sm">Make sure the backend server is running.</p>
            </div>
          ) : salons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-white font-semibold text-xl mb-2">No salons found</h3>
              <p className="text-white/50 text-sm max-w-xs">Try adjusting your filters or search term.</p>
              <button
                onClick={() => { setSearch(''); setSelectedCategory('All'); setSelectedCity('All Cities'); setMinRating(''); }}
                className="btn-secondary mt-6 px-6 py-2.5 text-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {salons.map((salon) => <SalonCard key={salon._id} salon={salon} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
