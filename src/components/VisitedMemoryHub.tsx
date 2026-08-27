import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import {
  BookmarkCheck,
  Star,
  Plus,
  Trash2,
  Search,
  X,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Compass,
} from 'lucide-react';

export const VisitedMemoryHub: React.FC = () => {
  const { user, recordVisitedPlace, deleteVisitedPlace, trips, openTrip } = useTrip();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state
  const [name, setName] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [userNotes, setUserNotes] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const places = user.visitedPlaces || [];
  const countries = Array.from(new Set(places.map((p) => p.country))).filter(Boolean);

  const filteredPlaces = places.filter((place) => {
    const matchSearch =
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (place.userNotes || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchCountry = selectedCountry === 'all' || place.country.toLowerCase() === selectedCountry.toLowerCase();
    return matchSearch && matchCountry;
  });

  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    recordVisitedPlace({
      name,
      city,
      country,
      rating,
      userNotes,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80',
      dateVisited: new Date().toISOString().split('T')[0],
    });

    setShowAddModal(false);
    setName('');
    setCity('');
    setCountry('');
    setUserNotes('');
    setPhotoUrl('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner explaining the Connected AI Brain */}
      <section className="luxury-card-elevated rounded-3xl p-6 sm:p-8 shadow-2xl border-white/[0.1] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E5C578]">
                Continuous Memory Vault
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Zero-Duplicate Protection
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-white">
              Visited Memory & Places
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-light">
              TripLink catalogs every attraction, restaurant, and neighborhood you experience. Our AI engine dynamically cross-checks this vault so future itineraries only contain fresh, unvisited gems.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="border border-white/10 bg-white/[0.03] px-6 py-3.5 rounded-2xl text-center shadow-lg">
              <span className="font-serif text-3xl sm:text-4xl font-light text-[#E5C578] block">
                {places.length}
              </span>
              <span className="text-[9px] text-stone-400 uppercase font-mono font-bold tracking-widest">
                Cataloged Stops
              </span>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] hover:brightness-110 text-[#090A0E] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 btn-tactile cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 text-[#090A0E] stroke-[2.5]" />
              <span>Record Memory</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="luxury-card rounded-2xl p-4 sm:p-5 border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories, cities, notes..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0D0F15] border border-white/10 text-xs font-medium text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E5C578]/60"
          />
        </div>

        {/* Country Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <button
            onClick={() => setSelectedCountry('all')}
            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              selectedCountry === 'all'
                ? 'bg-white text-black shadow-sm'
                : 'bg-white/[0.04] border border-white/[0.08] text-stone-400 hover:text-white'
            }`}
          >
            All ({places.length})
          </button>

          {countries.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCountry(c)}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                selectedCountry === c
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-white/[0.04] border border-white/[0.08] text-stone-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of Visited Places or Empty State */}
      {places.length === 0 ? (
        <div className="luxury-card rounded-3xl p-12 text-center space-y-4">
          <Compass className="w-12 h-12 text-stone-600 mx-auto" />
          <h3 className="font-serif text-2xl text-white font-light">No Recorded Memories Yet</h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            Add places you have already visited or complete trips to start building your personal AI travel memory bank.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#E5C578]" />
            <span>Record Your First Memory</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => {
            const tripTied = trips.find((t) => t.id === place.tripId);

            return (
              <div
                key={place.id}
                className="luxury-card rounded-2xl overflow-hidden border-white/[0.08] hover:border-[#E5C578]/40 hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                {place.photoUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={place.photoUrl}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1017] via-transparent to-transparent" />

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-[#E5C578] px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border border-white/20">
                      <Star className="w-3 h-3 fill-[#E5C578] text-[#E5C578]" />
                      <span>{place.rating}/5</span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#E5C578]">
                        {place.city}, {place.country}
                      </span>
                      <h3 className="font-serif text-lg font-normal truncate mt-0.5">
                        {place.name}
                      </h3>
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {!place.photoUrl && (
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[9px] font-mono uppercase tracking-widest text-[#E5C578]">
                            {place.city}, {place.country}
                          </span>
                          <h3 className="font-serif text-lg font-light text-white">
                            {place.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 text-[#E5C578] font-bold text-xs font-mono">
                          <Star className="w-3.5 h-3.5 fill-[#E5C578] text-[#E5C578]" />
                          <span>{place.rating}/5</span>
                        </div>
                      </div>
                    )}

                    {place.userNotes && (
                      <p className="text-xs text-stone-300 italic font-serif leading-relaxed bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.06]">
                        "{place.userNotes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-stone-400">
                    {tripTied ? (
                      <button
                        type="button"
                        onClick={() => openTrip(tripTied.id, 'journal')}
                        className="text-[#E5C578] hover:underline font-mono text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <span>From {tripTied.title}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500">Direct Entry</span>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteVisitedPlace(place.id)}
                      className="text-stone-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remove from memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Record Visited Place */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="luxury-card-elevated rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-white/20 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-serif text-xl font-light text-white">
                Add Memory Entry
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                  Place / Venue Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Louvre Museum, Tokyo Tower, Osteria Francescana"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs font-medium text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E5C578]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Paris"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white placeholder:text-stone-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. France"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white placeholder:text-stone-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                  Rating (1 to 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRating(r)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        rating >= r
                          ? 'bg-[#E5C578] text-black'
                          : 'bg-white/[0.04] border border-white/10 text-stone-400'
                      }`}
                    >
                      ★ {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                  Notes & Impressions
                </label>
                <textarea
                  rows={3}
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="What made this spot memorable? Highlights, favorite dish, or timing tips..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white placeholder:text-stone-500 focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                  Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white placeholder:text-stone-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-medium text-stone-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] text-[#090A0E] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
