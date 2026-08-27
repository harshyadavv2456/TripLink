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

  const countries = Array.from(new Set(user.visitedPlaces.map((p) => p.country))).filter(Boolean);

  const filteredPlaces = user.visitedPlaces.filter((place) => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* Top Banner explaining the Connected AI Brain */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-[#E5E1DA] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
              Continuous Memory Catalog
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A]">
              Visited Memory & Places
            </h1>
            <p className="text-xs sm:text-sm text-[#8C8881] leading-relaxed">
              TripLink remembers all previously visited attractions, restaurants, and neighborhoods so AI never re-suggests places you’ve already experienced.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="border border-[#E5E1DA] bg-[#FDFCFB] px-5 py-3 rounded-xl text-center">
              <span className="font-serif text-3xl font-light text-[#1A1A1A] block">
                {user.visitedPlaces.length}
              </span>
              <span className="text-[9px] text-[#8C8881] uppercase font-bold tracking-widest">
                Cataloged Stops
              </span>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-3 rounded-xl bg-[#1A1A1A] hover:bg-stone-800 text-white font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record Memory</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E1DA] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#8C8881] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search places, cities, or notes..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
          />
        </div>

        {/* Country Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <button
            onClick={() => setSelectedCountry('all')}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
              selectedCountry === 'all'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'bg-[#FDFCFB] border border-[#E5E1DA] text-[#8C8881] hover:text-[#1A1A1A]'
            }`}
          >
            All ({user.visitedPlaces.length})
          </button>

          {countries.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCountry(c)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                selectedCountry === c
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-[#FDFCFB] border border-[#E5E1DA] text-[#8C8881] hover:text-[#1A1A1A]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of Visited Places */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaces.map((place) => {
          const tripTied = trips.find((t) => t.id === place.tripId);

          return (
            <div
              key={place.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#E5E1DA] hover:border-[#D5D0C7] hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {place.photoUrl && (
                <div className="relative h-44 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                  <img
                    src={place.photoUrl}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-white/20">
                    <Star className="w-3 h-3 fill-white text-white" />
                    <span>{place.rating}/5</span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">
                      {place.city}, {place.country}
                    </span>
                    <h3 className="font-serif text-lg font-normal truncate">
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
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#8C8881]">
                          {place.city}, {place.country}
                        </span>
                        <h3 className="font-serif text-lg font-light text-[#1A1A1A]">
                          {place.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 text-[#1A1A1A] font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-[#1A1A1A] text-[#1A1A1A]" />
                        <span>{place.rating}/5</span>
                      </div>
                    </div>
                  )}

                  {place.userNotes && (
                    <p className="text-xs text-[#8C8881] italic font-serif leading-relaxed bg-[#FDFCFB] p-3 rounded-xl border border-[#E5E1DA]">
                      "{place.userNotes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E5E1DA]/60 flex items-center justify-between text-xs text-[#8C8881]">
                  {tripTied ? (
                    <button
                      type="button"
                      onClick={() => openTrip(tripTied.id, 'journal')}
                      className="text-[#1A1A1A] hover:opacity-75 font-semibold text-[10px] uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                    >
                      <span>From {tripTied.title}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[10px] uppercase tracking-widest">Direct Entry</span>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteVisitedPlace(place.id)}
                    className="text-[#8C8881] hover:text-rose-600 p-1 transition-colors cursor-pointer"
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

      {/* MODAL: Record Visited Place */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#1A1A1A]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-[#E5E1DA] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#E5E1DA] pb-3">
              <h3 className="font-serif text-xl font-light text-[#1A1A1A]">
                Add Memory Entry
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F9F8F6] text-[#8C8881] hover:text-[#1A1A1A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Place / Venue Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Louvre Museum, Tokyo Tower, Osteria Francescana"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Paris"
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs text-[#1A1A1A] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. France"
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs text-[#1A1A1A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 text-[#1A1A1A] hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${s <= rating ? 'fill-[#1A1A1A] text-[#1A1A1A]' : 'text-[#E5E1DA]'}`}
                      />
                    </button>
                  ))}
                  <span className="text-[10px] font-bold text-[#8C8881] uppercase tracking-wider ml-2">{rating} / 5 Stars</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs text-[#1A1A1A] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Impressions & Tips
                </label>
                <textarea
                  rows={2}
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="What made this place memorable..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs text-[#1A1A1A] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E1DA]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E1DA] hover:bg-[#F9F8F6] text-[#8C8881] text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-widest shadow-xs cursor-pointer"
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
