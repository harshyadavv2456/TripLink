import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { Trip } from '../types';
import {
  BookOpen,
  Sparkles,
  Star,
  Plus,
  Trash2,
  MapPin,
  BookmarkCheck,
  CheckCircle2,
  X,
} from 'lucide-react';

interface TripJournalProps {
  trip: Trip;
}

export const TripJournal: React.FC<TripJournalProps> = ({ trip }) => {
  const {
    user,
    generateJournalSummaryAI,
    recordVisitedPlace,
    deleteVisitedPlace,
    updateTripDetails,
    isLoading,
  } = useTrip();

  const [journalSummary, setJournalSummary] = useState<string>(trip.journalSummary || '');
  const [showAddMemoryModal, setShowAddMemoryModal] = useState<boolean>(false);

  // New Memory state
  const [placeName, setPlaceName] = useState<string>('');
  const [placeCity, setPlaceCity] = useState<string>(trip.destinations[0]?.city || '');
  const [placeCountry, setPlaceCountry] = useState<string>(trip.destinations[0]?.country || '');
  const [rating, setRating] = useState<number>(5);
  const [userNotes, setUserNotes] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');

  // Find memories tied to this trip
  const tripMemories = user.visitedPlaces.filter((p) => p.tripId === trip.id);

  const handleGenerateSummary = async () => {
    const summary = await generateJournalSummaryAI(trip.id);
    if (summary) setJournalSummary(summary);
  };

  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeName.trim()) return;

    recordVisitedPlace({
      tripId: trip.id,
      name: placeName,
      city: placeCity,
      country: placeCountry,
      rating,
      userNotes,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
      dateVisited: trip.endDate || new Date().toISOString().split('T')[0],
    });

    setShowAddMemoryModal(false);
    setPlaceName('');
    setUserNotes('');
    setPhotoUrl('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Gemini Narrative Generator */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E1DA] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
              Reflections & Catalog
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <BookOpen className="w-5 h-5 text-[#1A1A1A]" />
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A]">
                Trip Journal & Memory Bank
              </h2>
            </div>
            <p className="text-xs text-[#8C8881] mt-1">
              Capture highlights and rate spots. These places are saved to your global memory bank to keep future itineraries fresh.
            </p>
          </div>

          <button
            onClick={handleGenerateSummary}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Generate AI Narrative</span>
          </button>
        </div>

        {/* Narrative Summary Box */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
            Editorial Trip Story
          </label>
          <textarea
            rows={3}
            value={journalSummary}
            onChange={(e) => {
              setJournalSummary(e.target.value);
              updateTripDetails(trip.id, { journalSummary: e.target.value });
            }}
            placeholder="A short narrative of what made this journey unforgettable..."
            className="w-full px-4 py-3 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-serif text-[#1A1A1A] italic leading-relaxed focus:outline-none focus:border-[#1A1A1A]"
          />
        </div>
      </div>

      {/* Visited Places & Memories List */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E1DA] shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E1DA] pb-4">
          <div>
            <h3 className="font-serif text-xl font-light text-[#1A1A1A] flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-[#1A1A1A]" />
              Rated Places Saved to Global Memory ({tripMemories.length})
            </h3>
            <p className="text-xs text-[#8C8881] mt-0.5">
              These locations will be automatically excluded from future AI trip suggestions.
            </p>
          </div>

          <button
            onClick={() => setShowAddMemoryModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Place</span>
          </button>
        </div>

        {/* Memories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tripMemories.map((mem) => (
            <div
              key={mem.id}
              className="bg-[#FDFCFB] rounded-xl overflow-hidden border border-[#E5E1DA] hover:border-[#1A1A1A] transition-all flex flex-col justify-between group shadow-xs"
            >
              {/* Photo */}
              {mem.photoUrl && (
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={mem.photoUrl}
                    alt={mem.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-[#1A1A1A]/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 font-mono">
                    <Star className="w-3 h-3 fill-white text-white" />
                    <span>{mem.rating} / 5</span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="font-serif text-base font-light text-[#1A1A1A]">
                    {mem.name}
                  </h4>
                  <p className="text-xs text-[#8C8881] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#8C8881]" />
                    {mem.city}, {mem.country}
                  </p>

                  {mem.userNotes && (
                    <p className="text-xs text-[#8C8881] italic font-serif pt-1 leading-relaxed">
                      "{mem.userNotes}"
                    </p>
                  )}
                </div>

                <div className="pt-2.5 border-t border-[#E5E1DA] flex items-center justify-between text-[10px] text-[#8C8881]">
                  <span className="text-[#1A1A1A] font-semibold flex items-center gap-1 uppercase tracking-wider text-[9px]">
                    <CheckCircle2 className="w-3 h-3 text-[#1A1A1A]" />
                    In Memory Bank
                  </span>

                  <button
                    type="button"
                    onClick={() => deleteVisitedPlace(mem.id)}
                    className="text-[#8C8881] hover:text-rose-600 p-1 cursor-pointer"
                    title="Remove from memory"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: Record Visited Place */}
      {showAddMemoryModal && (
        <div className="fixed inset-0 bg-[#1A1A1A]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-[#E5E1DA] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#E5E1DA] pb-3">
              <h3 className="font-serif text-xl font-light text-[#1A1A1A]">
                Record Place in Memory Bank
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMemoryModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F9F8F6] text-[#8C8881] hover:text-[#1A1A1A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Place Name *
                </label>
                <input
                  type="text"
                  required
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  placeholder="e.g. Fushimi Inari Taisha or Trattoria da Enzo"
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
                    value={placeCity}
                    onChange={(e) => setPlaceCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs text-[#1A1A1A] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                    Country
                  </label>
                  <input
                    type="text"
                    value={placeCountry}
                    onChange={(e) => setPlaceCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs text-[#1A1A1A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Personal Rating
                </label>
                <div className="flex items-center gap-1.5">
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
                  <span className="text-xs font-mono font-bold text-[#1A1A1A] ml-2">{rating} / 5</span>
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
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs text-[#1A1A1A] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Notes & Impressions
                </label>
                <textarea
                  rows={2}
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="e.g., Go at sunrise before crowds arrive. Try the matcha soft serve..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs text-[#1A1A1A] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E1DA]">
                <button
                  type="button"
                  onClick={() => setShowAddMemoryModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E1DA] hover:bg-[#F9F8F6] text-[#8C8881] text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-widest shadow-xs cursor-pointer"
                >
                  Save to Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
