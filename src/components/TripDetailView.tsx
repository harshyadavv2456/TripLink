import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { Trip, TripScreenTab, TripStatus } from '../types';
import { formatCurrency } from '../data/currencies';
import {
  Calendar,
  MapPin,
  Clock,
  Compass,
  ArrowLeft,
  DollarSign,
  Luggage,
  FileText,
  Users,
  BookOpen,
  Map as MapIcon,
  Layers,
  Sparkles,
  Trash2,
  Edit,
  Share2,
  CheckCircle2,
  ChevronDown,
  X,
  Heart,
} from 'lucide-react';
import { ItineraryEditor } from './ItineraryEditor';
import { MapView } from './MapView';
import { BudgetTracker } from './BudgetTracker';
import { PackingList } from './PackingList';
import { DocumentsBookings } from './DocumentsBookings';
import { Collaboration } from './Collaboration';
import { TripJournal } from './TripJournal';
import { VibeDiscoverySwipe } from './VibeDiscoverySwipe';

interface TripDetailViewProps {
  trip: Trip;
}

export const TripDetailView: React.FC<TripDetailViewProps> = ({ trip }) => {
  const {
    activeTripTab,
    setActiveTripTab,
    setActiveTripId,
    setActiveScreen,
    updateTripDetails,
    deleteTrip,
    baseCurrency,
    user,
  } = useTrip();

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(trip.title);
  const [editBudget, setEditBudget] = useState<number>(trip.budget);
  const [editCover, setEditCover] = useState<string>(trip.coverImage || '');
  const [editColor, setEditColor] = useState<string>(trip.color || '#D97706');

  const totalSpent = trip.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const packedCount = trip.packingList.filter((p) => p.packed).length;
  const packingTotal = trip.packingList.length;

  const formatDateRange = (startStr: string, endStr: string) => {
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      const startFmt = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endFmt = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startFmt} – ${endFmt}`;
    } catch {
      return `${startStr} – ${endStr}`;
    }
  };

  const handleStatusChange = (status: TripStatus) => {
    updateTripDetails(trip.id, { status });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTripDetails(trip.id, {
      title: editTitle,
      budget: Number(editBudget),
      coverImage: editCover,
      color: editColor,
    });
    setShowEditModal(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${trip.title}"?`)) {
      deleteTrip(trip.id);
      setActiveTripId(null);
      setActiveScreen('dashboard');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Back to Timeline Navigation Link & Status */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setActiveTripId(null);
            setActiveScreen('dashboard');
          }}
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#8C8881] hover:text-[#1A1A1A] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Horizon</span>
        </button>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">Status:</span>
          <select
            value={trip.status}
            onChange={(e) => handleStatusChange(e.target.value as TripStatus)}
            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border capitalize cursor-pointer focus:outline-none ${
              trip.status === 'active'
                ? 'bg-[#D16B4B]/10 text-[#D16B4B] border-[#D16B4B]/30'
                : trip.status === 'upcoming'
                ? 'bg-[#2D3E50]/10 text-[#2D3E50] border-[#2D3E50]/30'
                : trip.status === 'completed'
                ? 'bg-[#8C8881]/10 text-[#8C8881] border-[#8C8881]/30'
                : 'bg-[#6B705C]/10 text-[#6B705C] border-[#6B705C]/30'
            }`}
          >
            <option value="draft">Draft</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Live Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Hero Trip Card */}
      <div className="relative rounded-2xl overflow-hidden shadow-xs border border-[#E5E1DA] bg-white">
        
        {/* Cover Photo */}
        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-[#1A1A1A]">
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="w-full h-full object-cover opacity-75"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Accent Color Top Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ backgroundColor: trip.color || '#D16B4B' }}
          />

          {/* Edit / Delete Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => {
                setEditTitle(trip.title);
                setEditBudget(trip.budget);
                setEditCover(trip.coverImage || '');
                setEditColor(trip.color || '#D97706');
                setShowEditModal(true);
              }}
              className="p-2 rounded-xl bg-black/40 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 transition-all cursor-pointer"
              title="Edit Trip Settings"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl bg-black/40 hover:bg-rose-900/80 backdrop-blur-md text-white border border-white/20 transition-all cursor-pointer"
              title="Delete Trip"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Overlay Content */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5 text-white">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                  {trip.destinations.map((d) => `${d.city}, ${d.country}`).join(' • ')}
                </span>
                <span className="text-white/60 text-xs">•</span>
                <span className="text-xs font-mono text-white/90">
                  {formatDateRange(trip.startDate, trip.endDate)}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-white">
                {trip.title}
              </h1>

              {/* Style tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {trip.styleTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Micro Stats Banner */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 text-xs shrink-0">
              <div className="space-y-0.5">
                <span className="text-white/60 uppercase text-[9px] font-bold block">Budget</span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(totalSpent, baseCurrency)} / {formatCurrency(trip.budget, baseCurrency)}
                </span>
              </div>

              <div className="h-6 w-px bg-white/20" />

              <div className="space-y-0.5">
                <span className="text-white/60 uppercase text-[9px] font-bold block">Packing</span>
                <span className="font-bold text-white">
                  {packedCount}/{packingTotal}
                </span>
              </div>

              <div className="h-6 w-px bg-white/20" />

              <div className="flex -space-x-1.5 items-center pl-1">
                {trip.collaborators.map((c) => (
                  <img
                    key={c.id}
                    src={c.avatar}
                    alt={c.name}
                    title={c.name}
                    className="w-6 h-6 rounded-full border-2 border-white/40 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-4 sm:px-6 py-2.5 bg-white border-t border-[#E5E1DA] no-scrollbar">
          {[
            { id: 'itinerary', label: 'Itinerary Plan', icon: Compass, badge: `${trip.days.length}d` },
            { id: 'map', label: 'Route Map', icon: MapIcon, badge: null },
            { id: 'discover', label: 'Vibe Swipe Deck', icon: Sparkles, badge: '✨' },
            { id: 'budget', label: 'Budget & Spend', icon: DollarSign, badge: formatCurrency(totalSpent, baseCurrency) },
            { id: 'packing', label: 'Packing List', icon: Luggage, badge: `${packedCount}/${packingTotal}` },
            { id: 'documents', label: 'Bookings & Docs', icon: FileText, badge: trip.documents.length.toString() },
            { id: 'collaborators', label: 'Travel Party', icon: Users, badge: trip.collaborators.length.toString() },
            { id: 'journal', label: 'Journal & Memory', icon: BookOpen, badge: null },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTripTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTripTab(tab.id as TripScreenTab)}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white shadow-xs font-bold'
                    : 'text-[#8C8881] hover:text-[#1A1A1A] hover:bg-[#F9F8F6]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#E5E1DA] text-[#1A1A1A]'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab View Body */}
      <div className="pt-2">
        {activeTripTab === 'itinerary' && <ItineraryEditor trip={trip} />}
        {activeTripTab === 'map' && <MapView trip={trip} />}
        {activeTripTab === 'discover' && <VibeDiscoverySwipe trip={trip} />}
        {activeTripTab === 'budget' && <BudgetTracker trip={trip} />}
        {activeTripTab === 'packing' && <PackingList trip={trip} />}
        {activeTripTab === 'documents' && <DocumentsBookings trip={trip} />}
        {activeTripTab === 'collaborators' && <Collaboration trip={trip} />}
        {activeTripTab === 'journal' && <TripJournal trip={trip} />}
      </div>

      {/* MODAL: Edit Trip Settings */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#1A1A1A]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-[#E5E1DA] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#E5E1DA] pb-3">
              <h3 className="font-serif text-xl font-light text-[#1A1A1A]">
                Edit Trip Settings
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F9F8F6] text-[#8C8881] hover:text-[#1A1A1A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Trip Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Budget ({baseCurrency})
                </label>
                <input
                  type="number"
                  min={0}
                  value={editBudget}
                  onChange={(e) => setEditBudget(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Cover Photo URL
                </label>
                <input
                  type="url"
                  value={editCover}
                  onChange={(e) => setEditCover(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Theme Color
                </label>
                <div className="flex items-center gap-2">
                  {['#D16B4B', '#2D3E50', '#6B705C', '#8C8881', '#059669', '#7C3AED'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setEditColor(col)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        editColor === col ? 'scale-110 border-[#1A1A1A]' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E1DA]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E1DA] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
