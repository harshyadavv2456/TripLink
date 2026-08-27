import React, { useState, useMemo } from 'react';
import { Trip, Activity } from '../types';
import { useTrip } from '../context/TripContext';
import { formatCurrency } from '../data/currencies';
import {
  Sparkles,
  Heart,
  X,
  MapPin,
  Clock,
  Compass,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Plus,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VibeDiscoverySwipeProps {
  trip: Trip;
}

interface CuratedDiscoverySpot {
  id: string;
  name: string;
  tagline: string;
  category: 'food' | 'sightseeing' | 'adventure' | 'relaxation' | 'nightlife' | 'cultural';
  timeBlock: 'morning' | 'afternoon' | 'evening';
  estCost: number;
  location: string;
  image: string;
  rating: number;
  reason: string;
}

const DISCOVERY_POOLS: Record<string, CuratedDiscoverySpot[]> = {
  tokyo: [
    {
      id: 'disc-1',
      name: 'Omoide Yokocho Yakitori Alleys',
      tagline: 'Atmospheric lantern-lit alley with sizzling skewers & craft beer',
      category: 'food',
      timeBlock: 'evening',
      estCost: 28,
      location: 'Shinjuku, Tokyo',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      reason: 'Authentic local dining experience away from standard tourist chain spots.',
    },
    {
      id: 'disc-2',
      name: 'Nezu Shrine Secret Azalea Gardens',
      tagline: 'Quiet vermilion torii tunnel without the Kyoto crowds',
      category: 'cultural',
      timeBlock: 'morning',
      estCost: 0,
      location: 'Bunkyo, Tokyo',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      reason: 'Scenic photogenic torii gates and tranquil pond paths.',
    },
    {
      id: 'disc-3',
      name: 'teamLab Borderless Immersive Art',
      tagline: 'Mind-bending digital projections that react to your movement',
      category: 'sightseeing',
      timeBlock: 'afternoon',
      estCost: 38,
      location: 'Azabudai Hills, Tokyo',
      image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      reason: 'World-renowned sensory light exhibition.',
    },
    {
      id: 'disc-4',
      name: 'Shimokitazawa Vintage & Specialty Coffee',
      tagline: 'Indie vinyl records, thrift treasures & pour-over cafes',
      category: 'relaxation',
      timeBlock: 'afternoon',
      estCost: 15,
      location: 'Setagaya, Tokyo',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
      rating: 4.7,
      reason: 'Relaxed hipster quarter loved by Tokyo designers.',
    },
    {
      id: 'disc-5',
      name: 'Rooftop Shibuya Sky at Sunset',
      tagline: '360° panoramic open-air skyline overlooking Shibuya Crossing',
      category: 'sightseeing',
      timeBlock: 'evening',
      estCost: 22,
      location: 'Shibuya, Tokyo',
      image: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      reason: 'Unmatched dusk views of Mount Fuji and Tokyo Tower.',
    },
  ],
  general: [
    {
      id: 'disc-g1',
      name: 'Hidden Artisan Roastery & Pastry Lab',
      tagline: 'Locally roasted single origins paired with fresh pastries',
      category: 'food',
      timeBlock: 'morning',
      estCost: 12,
      location: 'City Old Quarter',
      image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      reason: 'Perfect morning kickstart voted top hidden gem.',
    },
    {
      id: 'disc-g2',
      name: 'Panoramic Skyline Funicular & Hillside Trail',
      tagline: 'Scenic ridge walk with elevated harbor viewpoints',
      category: 'adventure',
      timeBlock: 'afternoon',
      estCost: 18,
      location: 'Upper Ridge Outlook',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      reason: 'Stunning photos and fresh air walk.',
    },
    {
      id: 'disc-g3',
      name: 'Underground Jazz Speakeasy & Cocktails',
      tagline: 'Live acoustic quartets with custom mixology',
      category: 'nightlife',
      timeBlock: 'evening',
      estCost: 35,
      location: 'Historic Cellar Vaults',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      reason: 'Intimate evening atmosphere with high rating.',
    },
  ],
};

export const VibeDiscoverySwipe: React.FC<VibeDiscoverySwipeProps> = ({ trip }) => {
  const { addActivity, baseCurrency, user } = useTrip();
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [approvedList, setApprovedList] = useState<CuratedDiscoverySpot[]>([]);

  // Find discovery pool for this trip's destination
  const pool = useMemo(() => {
    const cityKey = (trip.destinations[0]?.city || 'general').toLowerCase().replace(/\s+/g, '');
    const found = DISCOVERY_POOLS[cityKey] || DISCOVERY_POOLS.general;

    // Filter out places already visited in user's profile
    const visitedNames = user.visitedPlaces.map((vp) => vp.name.toLowerCase());
    return found.filter((spot) => !visitedNames.includes(spot.name.toLowerCase()));
  }, [trip, user]);

  const currentSpot = pool[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentSpot) return;

    setSwipeDirection(direction);

    if (direction === 'right') {
      // Approved!
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      } catch (e) {}

      // Find day id
      const targetDay = trip.days.find((d) => d.dayNumber === selectedDayNumber) || trip.days[0];
      if (targetDay) {
        addActivity(trip.id, targetDay.id, {
          name: currentSpot.name,
          location: currentSpot.location,
          timeBlock: currentSpot.timeBlock,
          time: currentSpot.timeBlock === 'morning' ? '10:00 AM' : currentSpot.timeBlock === 'afternoon' ? '03:00 PM' : '08:00 PM',
          category: (currentSpot.category as any) || 'sightseeing',
          estCost: currentSpot.estCost,
          reason: `Vibe-matched discovery: ${currentSpot.reason}`,
          notes: currentSpot.tagline,
        });
      }

      setApprovedList((prev) => [currentSpot, ...prev]);
    }

    setTimeout(() => {
      setSwipeDirection(null);
      setCurrentIndex((prev) => prev + 1);
    }, 280);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSwipeDirection(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E1DA] shadow-xs text-center space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
          Gesture-Based Curation
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Vibe Discovery Deck
        </h2>
        <p className="text-xs text-[#8C8881] max-w-md mx-auto">
          Swipe right to approve and add directly into your itinerary; swipe left to skip. Zero repetitive typing needed!
        </p>

        {/* Day Target Selector */}
        <div className="pt-3 flex items-center justify-center gap-2">
          <span className="text-xs font-semibold text-[#8C8881]">Add approved spots into:</span>
          <select
            value={selectedDayNumber}
            onChange={(e) => setSelectedDayNumber(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-[#E5E1DA] text-xs font-semibold bg-[#FDFCFB] text-[#1A1A1A] focus:outline-none"
          >
            {trip.days.map((d) => (
              <option key={d.id} value={d.dayNumber}>
                Day {d.dayNumber}: {d.destination}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Swipe Deck Container */}
      <div className="relative min-h-[460px] flex items-center justify-center">
        {currentSpot ? (
          <div
            className={`w-full bg-white rounded-3xl border border-[#E5E1DA] shadow-md overflow-hidden transition-all duration-300 select-none ${
              swipeDirection === 'right'
                ? 'translate-x-32 rotate-6 opacity-0'
                : swipeDirection === 'left'
                ? '-translate-x-32 -rotate-6 opacity-0'
                : 'translate-x-0 rotate-0 opacity-100'
            }`}
          >
            {/* Spot Hero Image */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-stone-100">
              <img
                src={currentSpot.image}
                alt={currentSpot.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                  {currentSpot.category}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#1A1A1A] text-[10px] font-bold">
                  ★ {currentSpot.rating}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                <h3 className="font-serif text-xl sm:text-2xl font-medium leading-tight">
                  {currentSpot.name}
                </h3>
                <p className="text-xs text-stone-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-300" />
                  {currentSpot.location}
                </p>
              </div>
            </div>

            {/* Details Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-[#1A1A1A] leading-relaxed">
                {currentSpot.tagline}
              </p>

              <div className="p-3 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs text-[#8C8881] space-y-1">
                <div className="flex items-center justify-between font-medium">
                  <span>Best Timing: <strong className="text-[#1A1A1A] capitalize">{currentSpot.timeBlock}</strong></span>
                  <span className="font-mono font-bold text-[#1A1A1A]">
                    {currentSpot.estCost > 0 ? formatCurrency(currentSpot.estCost, baseCurrency) : 'Free Admission'}
                  </span>
                </div>
                <p className="text-[11px] text-[#8C8881]">
                  💡 {currentSpot.reason}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-center gap-4">
                <button
                  onClick={() => handleSwipe('left')}
                  className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
                  title="Pass / Skip (Swipe Left)"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="text-[11px] font-mono text-[#8C8881] uppercase tracking-wider">
                  Card {currentIndex + 1} of {pool.length}
                </div>

                <button
                  onClick={() => handleSwipe('right')}
                  className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
                  title="Add to Itinerary (Swipe Right)"
                >
                  <Heart className="w-6 h-6 fill-current" />
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* Empty / Finished Deck */
          <div className="w-full p-8 rounded-3xl bg-white border border-[#E5E1DA] shadow-xs text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-xl font-medium text-[#1A1A1A]">
                You've Curated All Current Vibe Spots!
              </h3>
              <p className="text-xs text-[#8C8881] max-w-sm mx-auto">
                {approvedList.length} spots approved and seamlessly integrated into your itinerary.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] hover:bg-stone-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Deck</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Approved list preview */}
      {approvedList.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-[#E5E1DA] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881] block">
            Approved & Added in this session ({approvedList.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {approvedList.map((spot) => (
              <span
                key={spot.id}
                className="px-2.5 py-1 rounded-lg bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-medium text-[#1A1A1A] flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {spot.name}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
