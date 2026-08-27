import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { TripStyleTag } from '../types';
import { formatCurrency, getCurrencyConfig } from '../data/currencies';
import {
  Sparkles,
  MapPin,
  Calendar,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Compass,
  AlertCircle,
  BookmarkCheck,
  Send,
  Zap,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ALL_STYLE_TAGS: { id: TripStyleTag; label: string; desc: string; icon: string }[] = [
  { id: 'relaxed', label: 'Relaxed & Slow Pace', desc: 'Leisurely mornings, long lunches, café culture', icon: '☕' },
  { id: 'packed', label: 'Packed & Highlights', desc: 'See maximum highlights, early starts, high energy', icon: '⚡' },
  { id: 'adventure', label: 'Outdoor & Adventure', desc: 'Hiking, nature trails, kayaking, viewpoints', icon: '🏔️' },
  { id: 'food-focused', label: 'Gastronomy & Food', desc: 'Local markets, street food gems, tasting menus', icon: '🍜' },
  { id: 'cultural', label: 'History & Art Heritage', desc: 'Museums, ancient temples, architecture, artisans', icon: '🏛️' },
  { id: 'nature', label: 'Scenic & Wildlife', desc: 'National parks, coastal roads, botanic gardens', icon: '🌿' },
  { id: 'family', label: 'Family Friendly', desc: 'Accessible, engaging for all ages, balanced breaks', icon: '👨‍👩‍👧' },
  { id: 'luxury', label: 'Boutique & Premium', desc: 'Upscale venues, private tours, rooftop sundowners', icon: '✨' },
];

const POPULAR_REGIONS = [
  {
    region: 'East Asia',
    destinations: [
      { city: 'Tokyo', country: 'Japan' },
      { city: 'Kyoto', country: 'Japan' },
      { city: 'Seoul', country: 'South Korea' },
      { city: 'Taipei', country: 'Taiwan' },
    ],
  },
  {
    region: 'Western Europe',
    destinations: [
      { city: 'Paris', country: 'France' },
      { city: 'Rome', country: 'Italy' },
      { city: 'Barcelona', country: 'Spain' },
      { city: 'London', country: 'United Kingdom' },
      { city: 'Amsterdam', country: 'Netherlands' },
      { city: 'Zurich', country: 'Switzerland' },
    ],
  },
  {
    region: 'South & Southeast Asia',
    destinations: [
      { city: 'Bali', country: 'Indonesia' },
      { city: 'Bangkok', country: 'Thailand' },
      { city: 'Singapore', country: 'Singapore' },
      { city: 'New Delhi', country: 'India' },
      { city: 'Jaipur', country: 'India' },
      { city: 'Goa', country: 'India' },
    ],
  },
  {
    region: 'Americas & Oceania',
    destinations: [
      { city: 'New York', country: 'United States' },
      { city: 'San Francisco', country: 'United States' },
      { city: 'Sydney', country: 'Australia' },
      { city: 'Rio de Janeiro', country: 'Brazil' },
    ],
  },
  {
    region: 'Middle East',
    destinations: [
      { city: 'Dubai', country: 'United Arab Emirates' },
      { city: 'Abu Dhabi', country: 'United Arab Emirates' },
      { city: 'Doha', country: 'Qatar' },
    ],
  },
];

const PROMPT_TEMPLATES = [
  {
    title: '🇯🇵 Japan Blossom & Foodie Quest',
    prompt: 'Plan a 6-day food and culture adventure in Tokyo and Kyoto with ramen shops, ancient shrines, and bullet trains under $3000.',
  },
  {
    title: '🇫🇷 Romantic Paris & French Cafes',
    prompt: 'Create a 4-day relaxed romantic getaway in Paris focusing on art museums, quaint bakeries, and Seine river walks.',
  },
  {
    title: '🇮🇳 Golden Triangle India Heritage',
    prompt: '5-day royal heritage journey across Delhi, Agra (Taj Mahal), and Jaipur with street food, palaces, and local markets under $1500.',
  },
  {
    title: '🏝️ Bali Beach & Jungle Escape',
    prompt: '7 days in Bali covering Ubud waterfalls, rice terraces, and beach clubs in Canggu with relaxed yoga and surf vibes.',
  },
  {
    title: '🇨🇭 Swiss Alps Hiking & Scenic Trains',
    prompt: '5-day alpine journey in Interlaken and Zermatt with scenic cogwheel trains, mountain trails, and fondue dining.',
  },
];

export const NewTripWizard: React.FC = () => {
  const {
    user,
    baseCurrency,
    generateFullItinerary,
    promptToJourneyAI,
    openTrip,
    isLoading,
    aiLoadingMessage,
  } = useTrip();

  const [creationMode, setCreationMode] = useState<'prompt' | 'dropdown' | 'manual'>('prompt');
  const [naturalPrompt, setNaturalPrompt] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Manual & Dropdown wizard state
  const [step, setStep] = useState<number>(1);
  const [tripTitle, setTripTitle] = useState<string>('');
  const [destinations, setDestinations] = useState<{ city: string; country: string; days?: number }[]>([
    { city: 'Tokyo', country: 'Japan', days: 3 },
    { city: 'Kyoto', country: 'Japan', days: 3 },
  ]);

  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() + 30);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setDate(defaultEnd.getDate() + 6);

  const [startDate, setStartDate] = useState<string>(defaultStart.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(defaultEnd.toISOString().split('T')[0]);
  const [travelerCount, setTravelerCount] = useState<number>(2);
  const [budget, setBudget] = useState<number>(3500);
  const [selectedStyles, setSelectedStyles] = useState<TripStyleTag[]>(['relaxed', 'food-focused']);
  const [customNotes, setCustomNotes] = useState<string>('');

  const currencyConfig = getCurrencyConfig(baseCurrency);

  // 1-Tap Prompt Journey Generation
  const handleGenerateFromPrompt = async (promptToUse?: string) => {
    const text = promptToUse || naturalPrompt;
    if (!text.trim()) {
      setErrorMsg('Please describe where or how you want to travel.');
      return;
    }
    setErrorMsg(null);

    try {
      const newTrip = await promptToJourneyAI(text);
      try {
        confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
      } catch (e) {}
      openTrip(newTrip.id, 'itinerary');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to generate journey. Please try again.');
    }
  };

  // Structured Wizard Submit
  const handleStructuredGenerate = async () => {
    setErrorMsg(null);
    if (!destinations[0]?.city || !destinations[0]?.country) {
      setErrorMsg('Please specify at least one valid destination.');
      return;
    }

    try {
      const createdTrip = await generateFullItinerary({
        title: tripTitle || `${destinations.map((d) => d.city).join(' & ')} Journey`,
        destinations,
        startDate,
        endDate,
        travelerCount,
        budget,
        styleTags: selectedStyles,
        customNotes,
      });

      try {
        confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
      } catch (e) {}
      openTrip(createdTrip.id, 'itinerary');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to generate itinerary. Please try again.');
    }
  };

  const handleSelectQuickDestination = (city: string, country: string) => {
    setDestinations([{ city, country, days: 5 }]);
    setTripTitle(`${city} Exploration`);
  };

  const handleSelectPresetDuration = (days: number) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + days - 1);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const toggleStyle = (style: TripStyleTag) => {
    if (selectedStyles.includes(style)) {
      if (selectedStyles.length > 1) {
        setSelectedStyles(selectedStyles.filter((s) => s !== style));
      }
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Wizard Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
          Connected AI Planner
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A]">
          Create a New Journey
        </h1>
        <p className="text-xs sm:text-sm text-[#8C8881] max-w-lg mx-auto">
          TripLink cross-references your memory bank ({user.visitedPlaces.length} visited places) so you never get recommended places you've already seen.
        </p>
      </div>

      {/* Mode Switcher Pills */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1 bg-[#FDFCFB] p-1.5 rounded-2xl border border-[#E5E1DA] shadow-xs">
          <button
            onClick={() => setCreationMode('prompt')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              creationMode === 'prompt'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'text-[#8C8881] hover:text-[#1A1A1A]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Prompt to Journey</span>
            <span className="text-[9px] font-mono bg-white/20 px-1.5 py-0.2 rounded-full uppercase">Instant</span>
          </button>

          <button
            onClick={() => setCreationMode('dropdown')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              creationMode === 'dropdown'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'text-[#8C8881] hover:text-[#1A1A1A]'
            }`}
          >
            <Zap className="w-4 h-4 text-blue-500" />
            <span>Quick Dropdowns</span>
          </button>

          <button
            onClick={() => setCreationMode('manual')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              creationMode === 'manual'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'text-[#8C8881] hover:text-[#1A1A1A]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Custom Wizard</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E1DA] shadow-xs space-y-6 relative overflow-hidden">
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#1A1A1A]/95 backdrop-blur-xs z-30 flex flex-col items-center justify-center p-6 text-center text-white space-y-6 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl border border-white/20 flex items-center justify-center">
              <Compass className="w-7 h-7 text-white animate-spin" style={{ animationDuration: '4s' }} />
            </div>

            <div className="space-y-1.5 max-w-md">
              <h3 className="font-serif text-2xl font-light text-white">
                Generating Connected Journey
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed font-light">
                {aiLoadingMessage || 'Gemini 3.7 Flash cross-referencing your visited places catalog and structuring schedule...'}
              </p>
            </div>

            <div className="w-full max-w-xs space-y-2 text-left text-xs bg-white/10 p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Base Currency set to {currencyConfig.name} ({currencyConfig.symbol})</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Memory bank checked ({user.visitedPlaces.length} past stops excluded)</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>Synthesizing day-by-day morning & evening blocks...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* =========================================================================
            MODE 1: NATURAL PROMPT TO JOURNEY (Zero typing / Instant)
           ========================================================================= */}
        {creationMode === 'prompt' && (
          <div className="space-y-6">
            <div className="space-y-1 border-b border-[#E5E1DA] pb-3">
              <h2 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Describe Your Dream Travel in Natural Language
              </h2>
              <p className="text-xs text-[#8C8881]">
                Type anything you want (destination, vibe, duration, budget, pace). Gemini 3.7 Flash will handle the rest.
              </p>
            </div>

            {/* Prompt input box */}
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  rows={4}
                  value={naturalPrompt}
                  onChange={(e) => setNaturalPrompt(e.target.value)}
                  placeholder="e.g. Plan a 7-day culinary and temple exploration in Tokyo and Kyoto for 2 people with a budget around $3,000. Include scenic train rides, ramen spots, and sunset viewpoints..."
                  className="w-full p-4 rounded-2xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs sm:text-sm text-[#1A1A1A] placeholder:text-[#8C8881] focus:outline-none focus:border-[#1A1A1A] resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#8C8881] font-mono">
                  Base Currency: <strong>{currencyConfig.code} ({currencyConfig.symbol})</strong>
                </span>

                <button
                  onClick={() => handleGenerateFromPrompt()}
                  disabled={isLoading}
                  className="py-2.5 px-6 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Generate Full Journey</span>
                </button>
              </div>
            </div>

            {/* 1-Tap Quick Prompt Suggestions */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881] block">
                Or Tap a Curated Journey Blueprint
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PROMPT_TEMPLATES.map((tpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setNaturalPrompt(tpl.prompt);
                      handleGenerateFromPrompt(tpl.prompt);
                    }}
                    className="p-3.5 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] hover:border-[#1A1A1A] text-left transition-all group cursor-pointer hover:bg-white shadow-xs"
                  >
                    <h4 className="font-serif text-sm font-medium text-[#1A1A1A] group-hover:text-black">
                      {tpl.title}
                    </h4>
                    <p className="text-[11px] text-[#8C8881] line-clamp-2 mt-1 leading-relaxed">
                      {tpl.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODE 2: QUICK DROPDOWNS & PRESETS (Easy select without typing)
           ========================================================================= */}
        {creationMode === 'dropdown' && (
          <div className="space-y-6">
            <div className="space-y-1 border-b border-[#E5E1DA] pb-3">
              <h2 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Zero-Typing Quick Selector
              </h2>
              <p className="text-xs text-[#8C8881]">
                Select pre-curated destinations, durations, and budget tiers with simple taps.
              </p>
            </div>

            {/* 1. Destination Dropdown / Chips */}
            <div className="space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                1. Select Destination from World Regions
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {POPULAR_REGIONS.map((reg) => (
                  <div key={reg.region} className="p-3.5 rounded-xl border border-[#E5E1DA] bg-[#FDFCFB] space-y-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#8C8881] block">
                      {reg.region}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {reg.destinations.map((d) => {
                        const isSelected = destinations[0]?.city === d.city;
                        return (
                          <button
                            key={d.city}
                            onClick={() => handleSelectQuickDestination(d.city, d.country)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#1A1A1A] text-white shadow-xs'
                                : 'bg-white border border-[#E5E1DA] text-[#1A1A1A] hover:border-[#1A1A1A]'
                            }`}
                          >
                            {d.city}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Duration Preset Chips */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                2. Journey Duration
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Weekend (3 Days)', days: 3 },
                  { label: 'Short Break (5 Days)', days: 5 },
                  { label: 'Standard (7 Days)', days: 7 },
                  { label: 'Grand Tour (10 Days)', days: 10 },
                  { label: 'Fortnight (14 Days)', days: 14 },
                ].map((d) => (
                  <button
                    key={d.days}
                    onClick={() => handleSelectPresetDuration(d.days)}
                    className="px-3 py-2 rounded-xl border border-[#E5E1DA] text-xs font-semibold bg-white hover:border-[#1A1A1A] cursor-pointer"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Budget Range Chips */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                3. Total Target Budget ({currencyConfig.code})
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Backpacker ($1,200)', val: 1200 },
                  { label: 'Comfortable ($2,500)', val: 2500 },
                  { label: 'Upscale ($4,500)', val: 4500 },
                  { label: 'Luxury ($7,500)', val: 7500 },
                ].map((b) => (
                  <button
                    key={b.val}
                    onClick={() => setBudget(b.val)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      budget === b.val
                        ? 'bg-[#1A1A1A] text-white shadow-xs'
                        : 'bg-white border border-[#E5E1DA] text-[#1A1A1A] hover:border-[#1A1A1A]'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Style Tags */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                4. Primary Travel Vibe
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_STYLE_TAGS.map((st) => {
                  const isSelected = selectedStyles.includes(st.id);
                  return (
                    <button
                      key={st.id}
                      onClick={() => toggleStyle(st.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1A1A1A] text-white shadow-xs'
                          : 'bg-white border border-[#E5E1DA] text-[#1A1A1A] hover:border-[#1A1A1A]'
                      }`}
                    >
                      <span>{st.icon}</span>
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-4 border-t border-[#E5E1DA] flex items-center justify-between">
              <div className="text-xs text-[#8C8881]">
                Selected: <strong>{destinations[0]?.city || 'Tokyo'}</strong> for {budget ? formatCurrency(budget, baseCurrency) : ''}
              </div>

              <button
                onClick={handleStructuredGenerate}
                className="py-2.5 px-6 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Build Itinerary with Gemini</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODE 3: MANUAL MULTI-STEP WIZARD
           ========================================================================= */}
        {creationMode === 'manual' && (
          <div className="space-y-6">
            
            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-md mx-auto pb-2">
              {[
                { num: 1, label: 'Destinations' },
                { num: 2, label: 'Dates & Travelers' },
                { num: 3, label: 'Style & Budget' },
              ].map((s) => (
                <div key={s.num} className="flex items-center gap-2">
                  <button
                    onClick={() => setStep(s.num)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === s.num
                        ? 'bg-[#1A1A1A] text-white shadow-xs'
                        : step > s.num
                        ? 'bg-[#E5E1DA] text-[#1A1A1A] cursor-pointer'
                        : 'bg-[#FDFCFB] border border-[#E5E1DA] text-[#8C8881]'
                    }`}
                  >
                    {step > s.num ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                  </button>
                  {s.num < 3 && <div className={`w-6 sm:w-10 h-[1px] ${step > s.num ? 'bg-[#1A1A1A]' : 'bg-[#E5E1DA]'}`} />}
                </div>
              ))}
            </div>

            {/* STEP 1: Destinations */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                    Trip Title
                  </label>
                  <input
                    type="text"
                    value={tripTitle}
                    onChange={(e) => setTripTitle(e.target.value)}
                    placeholder="e.g. Japan Blossom Quest"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                    Destinations
                  </label>
                  {destinations.map((dest, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA]">
                      <input
                        type="text"
                        value={dest.city}
                        onChange={(e) => {
                          const updated = [...destinations];
                          updated[idx].city = e.target.value;
                          setDestinations(updated);
                        }}
                        placeholder="City (e.g. Tokyo)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#E5E1DA] text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={dest.country}
                        onChange={(e) => {
                          const updated = [...destinations];
                          updated[idx].country = e.target.value;
                          setDestinations(updated);
                        }}
                        placeholder="Country (e.g. Japan)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#E5E1DA] text-xs font-semibold"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next: Dates & Travelers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Dates & Travelers */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881] mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881] mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881] mb-1">
                    Traveler Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={travelerCount}
                    onChange={(e) => setTravelerCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold"
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl border border-[#E5E1DA] text-xs font-semibold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next: Style & Budget</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Style & Budget */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881] mb-1">
                    Target Budget ({currencyConfig.code})
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                    Travel Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_STYLE_TAGS.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => toggleStyle(st.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                          selectedStyles.includes(st.id)
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                            : 'bg-[#FDFCFB] border-[#E5E1DA] text-[#1A1A1A]'
                        }`}
                      >
                        <div className="font-semibold">{st.icon} {st.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 rounded-xl border border-[#E5E1DA] text-xs font-semibold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStructuredGenerate}
                    className="px-6 py-2.5 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Create Journey</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
