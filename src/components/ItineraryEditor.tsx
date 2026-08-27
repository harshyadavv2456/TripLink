import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { Trip, Activity, ActivityCategory, TimeBlock } from '../types';
import { formatCurrency } from '../data/currencies';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  MoveUp,
  MoveDown,
  MapPin,
  Footprints,
  Compass,
  CheckCircle2,
  Utensils,
  Camera,
  Eye,
  Coffee,
  TreePine,
  ShoppingBag,
  Bus,
  X,
} from 'lucide-react';

const CATEGORY_CONFIG: Record<ActivityCategory, { label: string; icon: any }> = {
  food: { label: 'Culinary & Dining', icon: Utensils },
  sightseeing: { label: 'Sightseeing', icon: Eye },
  adventure: { label: 'Adventure', icon: Compass },
  relaxation: { label: 'Relaxation', icon: Coffee },
  culture: { label: 'Culture & Arts', icon: Camera },
  transport: { label: 'Transit', icon: Bus },
  shopping: { label: 'Shopping', icon: ShoppingBag },
  nature: { label: 'Nature', icon: TreePine },
  nightlife: { label: 'Nightlife & Drinks', icon: Coffee },
};

interface ItineraryEditorProps {
  trip: Trip;
}

export const ItineraryEditor: React.FC<ItineraryEditorProps> = ({ trip }) => {
  const {
    baseCurrency,
    addActivity,
    updateActivity,
    deleteActivity,
    reorderActivities,
    moveActivity,
    regenerateDayAI,
  } = useTrip();

  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [targetAddDayId, setTargetAddDayId] = useState<string>(trip.days[0]?.id || '');
  const [showRegenModal, setShowRegenModal] = useState<boolean>(false);
  const [regenFocusPrompt, setRegenFocusPrompt] = useState<string>('');
  const [editingAct, setEditingAct] = useState<{ dayId: string; act: Activity } | null>(null);

  // New activity form state
  const [newActName, setNewActName] = useState<string>('');
  const [newActLocation, setNewActLocation] = useState<string>('');
  const [newActTimeBlock, setNewActTimeBlock] = useState<TimeBlock>('afternoon');
  const [newActTime, setNewActTime] = useState<string>('02:00 PM');
  const [newActCategory, setNewActCategory] = useState<ActivityCategory>('sightseeing');
  const [newActCost, setNewActCost] = useState<number>(20);
  const [newActReason, setNewActReason] = useState<string>('');
  const [newActNotes, setNewActNotes] = useState<string>('');

  const currentDay = (trip.days || []).find((d) => d.dayNumber === selectedDayNumber) || trip.days[0];

  // Handle reorder up/down
  const handleMoveUp = (dayId: string, activities: Activity[], index: number) => {
    if (index <= 0) return;
    const newActs = [...activities];
    const temp = newActs[index - 1];
    newActs[index - 1] = newActs[index];
    newActs[index] = temp;
    reorderActivities(trip.id, dayId, newActs);
  };

  const handleMoveDown = (dayId: string, activities: Activity[], index: number) => {
    if (index >= activities.length - 1) return;
    const newActs = [...activities];
    const temp = newActs[index + 1];
    newActs[index + 1] = newActs[index];
    newActs[index] = temp;
    reorderActivities(trip.id, dayId, newActs);
  };

  // Submit custom activity
  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActName.trim()) return;

    if (editingAct) {
      updateActivity(trip.id, editingAct.dayId, editingAct.act.id, {
        name: newActName,
        location: newActLocation,
        timeBlock: newActTimeBlock,
        time: newActTime,
        category: newActCategory,
        estCost: Number(newActCost) || 0,
        reason: newActReason,
        notes: newActNotes,
      });
      setEditingAct(null);
    } else {
      addActivity(trip.id, targetAddDayId || currentDay.id, {
        name: newActName,
        location: newActLocation || currentDay.destination,
        timeBlock: newActTimeBlock,
        time: newActTime,
        category: newActCategory,
        estCost: Number(newActCost) || 0,
        reason: newActReason || 'Custom added experience',
        notes: newActNotes,
        travelTimeToNext: '15 min walk',
        distanceToNext: '1.0 km',
        completed: false,
      });
      setShowAddModal(false);
    }

    // Reset form
    setNewActName('');
    setNewActLocation('');
    setNewActReason('');
    setNewActNotes('');
  };

  const openEditModal = (dayId: string, act: Activity) => {
    setEditingAct({ dayId, act });
    setNewActName(act.name);
    setNewActLocation(act.location || '');
    setNewActTimeBlock(act.timeBlock);
    setNewActTime(act.time || '');
    setNewActCategory(act.category);
    setNewActCost(act.estCost || 0);
    setNewActReason(act.reason || '');
    setNewActNotes(act.notes || '');
  };

  const handleRegenerateDay = async () => {
    if (!currentDay) return;
    setShowRegenModal(false);
    await regenerateDayAI(trip.id, currentDay.dayNumber, regenFocusPrompt);
    setRegenFocusPrompt('');
  };

  if (!trip.days || trip.days.length === 0) {
    return (
      <div className="luxury-card rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto border-white/[0.08]">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 text-[#E5C578] flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-2xl font-light text-white">
          No Itinerary Days Created
        </h3>
        <p className="text-xs text-stone-400">
          This trip is currently in draft. You can generate a full day-by-day plan using Gemini AI or add custom activities manually.
        </p>
        <button
          onClick={() => regenerateDayAI(trip.id, 1, 'Initial draft itinerary')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] text-[#090A0E] font-bold text-xs flex items-center gap-2 mx-auto shadow-lg cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#090A0E]" />
          <span>Generate Day 1 with Gemini</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Day Selector Pills Bar */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 no-scrollbar">
        <div className="flex items-center gap-2">
          {trip.days.map((day) => {
            const isSelected = day.dayNumber === selectedDayNumber;
            const completedCount = (day.activities || []).filter((a) => a.completed).length;

            return (
              <button
                key={day.id}
                onClick={() => setSelectedDayNumber(day.dayNumber)}
                className={`px-4 py-2.5 rounded-2xl border text-left transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'luxury-card-elevated border-[#E5C578]/50 shadow-lg'
                    : 'luxury-card border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${isSelected ? 'text-[#E5C578]' : 'text-stone-500'}`}>
                    Day {day.dayNumber}
                  </span>
                  {completedCount === (day.activities || []).length && (day.activities || []).length > 0 && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  )}
                </div>
                <div className={`font-medium text-xs truncate max-w-[120px] ${isSelected ? 'text-white font-semibold' : 'text-stone-300'}`}>
                  {day.destination.split(',')[0]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setTargetAddDayId(currentDay.id);
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#E5C578]" />
            <span>Add Activity</span>
          </button>

          <button
            onClick={() => setShowRegenModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white text-black hover:bg-stone-200 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer transition-all"
            title="Regenerate this specific day in context of previous/next days"
          >
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>Re-craft Day {currentDay?.dayNumber}</span>
          </button>
        </div>
      </div>

      {/* Active Day Header Banner */}
      {currentDay && (
        <div className="luxury-card rounded-3xl p-6 sm:p-8 border-white/[0.08] space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-400">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-[#E5C578]">
                  Day {currentDay.dayNumber}
                </span>
                <span>•</span>
                <span className="font-mono text-[11px] text-stone-300">{currentDay.date}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-white font-medium text-[11px]">
                  <MapPin className="w-3 h-3 text-[#E5C578]" />
                  {currentDay.destination}
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-light text-white">
                {currentDay.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <div className="luxury-card px-3.5 py-1.5 rounded-xl border-white/[0.08] text-stone-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Est. Spend: </span>
                <span className="font-bold text-[#E5C578]">
                  {formatCurrency((currentDay.activities || []).reduce((s, a) => s + (a.estCost || 0), 0), baseCurrency)}
                </span>
              </div>

              <div className="luxury-card px-3.5 py-1.5 rounded-xl border-white/[0.08] text-stone-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Stops: </span>
                <span className="font-bold text-white">{(currentDay.activities || []).length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Timeline List for Current Day */}
      <div className="space-y-3">
        {currentDay && (currentDay.activities || []).map((act, index) => {
          const catConfig = CATEGORY_CONFIG[act.category] || CATEGORY_CONFIG.sightseeing;
          const CategoryIcon = catConfig.icon;

          return (
            <div
              key={act.id}
              className={`group luxury-card rounded-2xl p-5 border-white/[0.08] transition-all relative ${
                act.completed ? 'opacity-50' : 'hover:border-white/20'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                
                {/* Left: Time block, Checkbox, Icon */}
                <div className="flex items-start gap-3 sm:gap-4 flex-1">
                  
                  {/* Mark Completed Checkbox */}
                  <button
                    type="button"
                    onClick={() => updateActivity(trip.id, currentDay.id, act.id, { completed: !act.completed })}
                    className="mt-1 text-stone-500 hover:text-[#E5C578] transition-colors shrink-0 cursor-pointer"
                    title={act.completed ? 'Mark uncompleted' : 'Mark completed'}
                  >
                    {act.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-md border border-white/20 hover:border-[#E5C578]" />
                    )}
                  </button>

                  {/* Category Badge Icon */}
                  <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02] shrink-0 text-[#E5C578]">
                    <CategoryIcon className="w-4 h-4" />
                  </div>

                  {/* Activity Details */}
                  <div className="space-y-1.5 flex-1">
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white/10 text-[#E5C578]">
                        {act.time || (act.timeBlock === 'morning' ? '09:30 AM' : act.timeBlock === 'afternoon' ? '02:00 PM' : '07:30 PM')}
                      </span>

                      <span className="text-[10px] uppercase font-mono font-bold text-stone-400 tracking-wider">
                        {act.timeBlock}
                      </span>

                      <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded border border-white/10 text-stone-300 bg-white/[0.02]">
                        {catConfig.label}
                      </span>

                      {act.estCost > 0 && (
                        <span className="text-[10px] font-mono font-bold text-[#E5C578] bg-white/[0.04] px-2 py-0.5 rounded border border-white/10">
                          {formatCurrency(act.estCost, baseCurrency)}
                        </span>
                      )}
                    </div>

                    <h3 className={`font-serif text-lg font-normal text-white ${act.completed ? 'line-through text-stone-500' : ''}`}>
                      {act.name}
                    </h3>

                    {act.location && (
                      <div className="text-xs text-stone-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-500" />
                        {act.location}
                      </div>
                    )}

                    {act.reason && (
                      <p className="text-xs text-stone-400 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.06] font-light">
                        <span className="font-semibold text-stone-200">Context: </span>
                        {act.reason}
                      </p>
                    )}

                    {act.notes && (
                      <div className="text-xs text-stone-300 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.06]">
                        💡 {act.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions (Reorder, Edit, Delete, Move Day) */}
                <div className="flex lg:flex-col items-center justify-end gap-1.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/[0.08] shrink-0">
                  
                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-0.5 bg-white/[0.02] border border-white/10 p-0.5 rounded-xl">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(currentDay.id, currentDay.activities, index)}
                      className="p-1 rounded text-stone-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === currentDay.activities.length - 1}
                      onClick={() => handleMoveDown(currentDay.id, currentDay.activities, index)}
                      className="p-1 rounded text-stone-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Move to another day dropdown */}
                  {trip.days.length > 1 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          moveActivity(trip.id, currentDay.id, e.target.value, act.id);
                        }
                      }}
                      value=""
                      className="text-[10px] font-mono font-semibold text-stone-400 bg-[#0D0F15] hover:text-white rounded-xl px-2 py-1 border border-white/10 focus:outline-none cursor-pointer"
                      title="Move activity to another day"
                    >
                      <option value="" disabled>Move day...</option>
                      {trip.days.filter((d) => d.id !== currentDay.id).map((d) => (
                        <option key={d.id} value={d.id}>To Day {d.dayNumber}</option>
                      ))}
                    </select>
                  )}

                  {/* Edit Activity */}
                  <button
                    type="button"
                    onClick={() => openEditModal(currentDay.id, act)}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Edit Activity"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Activity */}
                  <button
                    type="button"
                    onClick={() => deleteActivity(trip.id, currentDay.id, act.id)}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete Activity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Transit connector between stops */}
              {index < currentDay.activities.length - 1 && (
                <div className="mt-3 pt-2.5 border-t border-dashed border-white/[0.08] flex items-center justify-between text-xs text-stone-400">
                  <div className="flex items-center gap-1.5">
                    <Footprints className="w-3.5 h-3.5 text-[#E5C578]" />
                    <span className="text-[10px] font-mono">Transit to next stop:</span>
                    <span className="font-mono text-[10px] text-[#E5C578] bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/10">
                      {act.travelTimeToNext || '15 min transit'} ({act.distanceToNext || '1.2 km'})
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: Add / Edit Activity */}
      {(showAddModal || editingAct) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="luxury-card-elevated rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-white/20 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-serif text-xl font-light text-white">
                {editingAct ? 'Edit Activity' : 'Add Custom Activity'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAct(null);
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                  Activity Name *
                </label>
                <input
                  type="text"
                  required
                  value={newActName}
                  onChange={(e) => setNewActName(e.target.value)}
                  placeholder="e.g. Senso-ji Temple Dawn Walk or Osteria Francescana"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs font-medium text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E5C578]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                    Time Block
                  </label>
                  <select
                    value={newActTimeBlock}
                    onChange={(e) => setNewActTimeBlock(e.target.value as TimeBlock)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white focus:outline-none"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                    Time (e.g. 10:00 AM)
                  </label>
                  <input
                    type="text"
                    value={newActTime}
                    onChange={(e) => setNewActTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                    Category
                  </label>
                  <select
                    value={newActCategory}
                    onChange={(e) => setNewActCategory(e.target.value as ActivityCategory)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white focus:outline-none"
                  >
                    {Object.keys(CATEGORY_CONFIG).map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_CONFIG[cat as ActivityCategory].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                    Est. Cost (USD)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newActCost}
                    onChange={(e) => setNewActCost(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                  Location / Address
                </label>
                <input
                  type="text"
                  value={newActLocation}
                  onChange={(e) => setNewActLocation(e.target.value)}
                  placeholder="e.g. Asakusa, Taito City, Tokyo"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                  Reason / Description
                </label>
                <textarea
                  rows={2}
                  value={newActReason}
                  onChange={(e) => setNewActReason(e.target.value)}
                  placeholder="Why this activity is special..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingAct(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-stone-400 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] text-[#090A0E] text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer"
                >
                  {editingAct ? 'Update Activity' : 'Save to Day'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Regenerate Day with Gemini in Context */}
      {showRegenModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="luxury-card-elevated rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-white/20 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="font-serif text-xl font-light text-white">
                  Re-craft Day {currentDay?.dayNumber} Only
                </h3>
                <p className="text-xs text-stone-400">
                  Gemini AI will craft a new schedule for this day while harmonizing with adjacent days.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRegenModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                Any specific adjustments for this day? (Optional)
              </label>
              <textarea
                rows={3}
                value={regenFocusPrompt}
                onChange={(e) => setRegenFocusPrompt(e.target.value)}
                placeholder="e.g., Replace museum with scenic outdoor hike; focus entirely on local street food..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white focus:outline-none focus:border-[#E5C578] resize-none"
              />
            </div>

            <div className="bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.08] text-xs text-stone-400 space-y-0.5">
              <span className="font-bold text-white uppercase tracking-wider text-[10px] block font-mono">Cross-Trip Memory Active</span>
              <p className="text-[11px] leading-relaxed">
                Gemini ensures all newly proposed stops on this day continue to exclude places from your memory bank.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowRegenModal(false)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-stone-400 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegenerateDay}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] text-[#090A0E] text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#090A0E]" />
                <span>Re-craft Day {currentDay?.dayNumber}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
