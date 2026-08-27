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
  Sparkles,
  Trash2,
  Edit,
  Share2,
  CalendarCheck,
  ChevronDown,
  X,
} from 'lucide-react';
import { ItineraryEditor } from './ItineraryEditor';
import { MapView } from './MapView';
import { BudgetTracker } from './BudgetTracker';
import { PackingList } from './PackingList';
import { DocumentsBookings } from './DocumentsBookings';
import { Collaboration } from './Collaboration';
import { TripJournal } from './TripJournal';
import { VibeDiscoverySwipe } from './VibeDiscoverySwipe';
import { CalendarSyncModal } from './CalendarSyncModal';
import { GeofenceProximityBanner } from './GeofenceProximityBanner';

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
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(trip.title);
  const [editBudget, setEditBudget] = useState<number>(trip.budget);
  const [editCover, setEditCover] = useState<string>(trip.coverImage || '');
  const [editColor, setEditColor] = useState<string>(trip.color || '#F59E0B');

  const totalSpent = (trip.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const packedCount = (trip.packingList || []).filter((p) => p.packed).length;
  const packingTotal = (trip.packingList || []).length;

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
    if (window.confirm(`Are you sure you want to remove "${trip.title}"?`)) {
      deleteTrip(trip.id);
      setActiveTripId(null);
      setActiveScreen('dashboard');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Controls Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => {
            setActiveTripId(null);
            setActiveScreen('dashboard');
          }}
          className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-amber-400" />
          <span>Back to All Trips</span>
        </button>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Calendar Sync Button */}
          <button
            onClick={() => setShowCalendarModal(true)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Calendar Sync</span>
          </button>

          {/* Status Selector */}
          <div className="flex items-center gap-1.5">
            <select
              value={trip.status}
              onChange={(e) => handleStatusChange(e.target.value as TripStatus)}
              className="text-xs font-mono font-semibold px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 cursor-pointer focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Live Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Geofence Radar Notification */}
      <GeofenceProximityBanner trip={trip} />

      {/* Trip Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-[#14171F] border border-zinc-800">
        
        {/* Cover Photo */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-zinc-950">
          <img
            src={trip.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80'}
            alt={trip.title}
            className="w-full h-full object-cover opacity-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14171F] via-[#14171F]/60 to-transparent" />

          {/* Accent Color Line */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: trip.color || '#F59E0B' }}
          />

          {/* Edit / Delete Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => {
                setEditTitle(trip.title);
                setEditBudget(trip.budget);
                setEditCover(trip.coverImage || '');
                setEditColor(trip.color || '#F59E0B');
                setShowEditModal(true);
              }}
              className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
              title="Edit Trip Settings"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl bg-zinc-900/90 hover:bg-rose-950 text-rose-400 border border-zinc-700 transition-colors cursor-pointer"
              title="Delete Trip"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Header Details Overlay */}
          <div className="absolute bottom-5 left-5 right-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-zinc-900/90 border border-zinc-700 text-amber-400">
                  {(trip.destinations || []).map((d) => `${d.city}, ${d.country}`).join(' • ') || 'Custom Destination'}
                </span>
                <span className="text-zinc-400 text-xs">•</span>
                <span className="text-xs font-mono text-zinc-300">
                  {formatDateRange(trip.startDate, trip.endDate)}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white">
                {trip.title}
              </h1>
            </div>

            {/* Micro Quick Stats */}
            <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-700 px-4 py-2.5 rounded-xl text-xs shrink-0 font-mono">
              <div>
                <span className="text-zinc-400 text-[10px] block">BUDGET</span>
                <span className="font-semibold text-amber-400">
                  {formatCurrency(totalSpent, baseCurrency)} / {formatCurrency(trip.budget, baseCurrency)}
                </span>
              </div>

              <div className="h-5 w-px bg-zinc-700" />

              <div>
                <span className="text-zinc-400 text-[10px] block">PACKED</span>
                <span className="font-semibold text-white">
                  {packedCount}/{packingTotal}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 overflow-x-auto px-4 py-2.5 bg-[#0F1218] border-t border-zinc-800 no-scrollbar">
          {[
            { id: 'itinerary', label: 'Itinerary Plan', icon: Compass, badge: `${(trip.days || []).length}d` },
            { id: 'map', label: 'Route Map', icon: MapIcon, badge: null },
            { id: 'discover', label: 'Discover Places', icon: Sparkles, badge: 'AI' },
            { id: 'budget', label: 'Expenses & Budget', icon: DollarSign, badge: formatCurrency(totalSpent, baseCurrency) },
            { id: 'packing', label: 'Packing Checklist', icon: Luggage, badge: `${packedCount}/${packingTotal}` },
            { id: 'documents', label: 'Bookings & Docs', icon: FileText, badge: (trip.documents || []).length.toString() },
            { id: 'collaborators', label: 'Travel Party', icon: Users, badge: (trip.collaborators || []).length.toString() },
            { id: 'journal', label: 'Journal & Notes', icon: BookOpen, badge: null },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTripTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTripTab(tab.id as TripScreenTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isActive ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'
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

      {/* MODAL: Calendar Sync */}
      <CalendarSyncModal
        trip={trip}
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
      />

      {/* MODAL: Edit Trip Settings */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#14171F] border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-semibold text-white">
                Edit Trip Settings
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-300">
                  Trip Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400 selectable-text"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-300">
                  Budget ({baseCurrency})
                </label>
                <input
                  type="number"
                  min={0}
                  value={editBudget}
                  onChange={(e) => setEditBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono font-semibold text-white focus:outline-none focus:border-amber-400 selectable-text"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-300">
                  Cover Photo URL
                </label>
                <input
                  type="url"
                  value={editCover}
                  onChange={(e) => setEditCover(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400 selectable-text"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-300">
                  Theme Color
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {['#F59E0B', '#EF4444', '#0EA5E9', '#10B981', '#8B5CF6', '#D97706'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setEditColor(col)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        editColor === col ? 'scale-110 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold"
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

