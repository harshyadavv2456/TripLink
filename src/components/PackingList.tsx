import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { Trip, PackingCategory } from '../types';
import {
  Luggage,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Bookmark,
  Download,
  Shirt,
  Smartphone,
  FileText,
  Heart,
  Package,
  Wrench,
  X,
} from 'lucide-react';

const CATEGORY_MAP: Record<PackingCategory, { label: string; icon: any; color: string }> = {
  clothing: { label: 'Clothing & Footwear', icon: Shirt, color: 'text-[#E5C578] bg-white/[0.02]' },
  toiletries: { label: 'Toiletries & Care', icon: Heart, color: 'text-[#E5C578] bg-white/[0.02]' },
  documents: { label: 'Passports & Docs', icon: FileText, color: 'text-[#E5C578] bg-white/[0.02]' },
  electronics: { label: 'Tech & Cables', icon: Smartphone, color: 'text-[#E5C578] bg-white/[0.02]' },
  tech: { label: 'Tech & Cables', icon: Smartphone, color: 'text-[#E5C578] bg-white/[0.02]' },
  gear: { label: 'Outdoor Gear', icon: Wrench, color: 'text-[#E5C578] bg-white/[0.02]' },
  essentials: { label: 'Daily Essentials', icon: Package, color: 'text-[#E5C578] bg-white/[0.02]' },
};

interface PackingListProps {
  trip: Trip;
}

export const PackingList: React.FC<PackingListProps> = ({ trip }) => {
  const {
    togglePackedItem,
    addPackingItem,
    deletePackingItem,
    generatePackingListAI,
    packingTemplates,
    saveAsPackingTemplate,
    applyPackingTemplate,
    isLoading,
  } = useTrip();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddItem, setShowAddItem] = useState<boolean>(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState<boolean>(false);
  const [showLoadTemplateModal, setShowLoadTemplateModal] = useState<boolean>(false);

  // New item state
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<PackingCategory>('clothing');
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemEssential, setNewItemEssential] = useState<boolean>(false);

  // New template name state
  const [templateName, setTemplateName] = useState<string>(`${trip.destinations[0]?.country || 'Travel'} Essentials`);

  const packedCount = (trip.packingList || []).filter((p) => p.packed).length;
  const totalCount = (trip.packingList || []).length;
  const progressPercent = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const filteredItems = (trip.packingList || []).filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addPackingItem(trip.id, {
      name: newItemName,
      category: newItemCategory,
      quantity: Number(newItemQty) || 1,
      packed: false,
      isEssential: newItemEssential,
    });

    setNewItemName('');
    setShowAddItem(false);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    saveAsPackingTemplate(templateName, trip.packingList);
    setShowSaveTemplateModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Packing Header & Controls */}
      <div className="luxury-card rounded-3xl p-6 sm:p-8 border-white/[0.08] shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E5C578]">
              Preparation & Gear
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <Luggage className="w-5 h-5 text-[#E5C578]" />
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-white">
                Packing Checklist & Library
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Curated for {(trip.destinations || []).map((d) => d.city).join(', ') || 'Your Journey'} ({(trip.days || []).length} days, {trip.travelerCount} travelers).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => generatePackingListAI(trip.id)}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] text-[#090A0E] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#D4AF37]/20 btn-tactile cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#090A0E]" />
              <span>Generate AI List</span>
            </button>

            <button
              onClick={() => setShowLoadTemplateModal(true)}
              className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-stone-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#E5C578]" />
              <span>Load Template</span>
            </button>

            <button
              onClick={() => setShowSaveTemplateModal(true)}
              className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-stone-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#E5C578]" />
              <span>Save Template</span>
            </button>
          </div>
        </div>

        {/* Packing Progress Meter */}
        <div className="space-y-2 pt-2 border-t border-white/[0.08]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-400 flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold tracking-widest">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#E5C578]" />
              <span>{packedCount} of {totalCount} Items Packed</span>
            </span>
            <span className="text-[#E5C578] font-mono text-xs font-bold">{progressPercent}% Ready</span>
          </div>

          <div className="w-full bg-white/[0.04] h-2 rounded-full overflow-hidden border border-white/[0.08]">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E5C578] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Tabs and Add Button */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-white text-black shadow-sm'
                : 'luxury-card text-stone-400 border-white/[0.08] hover:text-white'
            }`}
          >
            All ({totalCount})
          </button>

          {(Object.keys(CATEGORY_MAP) as PackingCategory[]).map((catKey) => {
            const count = (trip.packingList || []).filter((p) => p.category === catKey).length;
            const cat = CATEGORY_MAP[catKey];

            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === catKey
                    ? 'bg-white text-black shadow-sm'
                    : 'luxury-card text-stone-400 border-white/[0.08] hover:text-white'
                }`}
              >
                {cat.label.split(' ')[0]} ({count})
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowAddItem(true)}
          className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#E5C578]" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {filteredItems.map((item) => {
          const cat = CATEGORY_MAP[item.category] || CATEGORY_MAP.essentials;

          return (
            <div
              key={item.id}
              onClick={() => togglePackedItem(trip.id, item.id)}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer select-none group ${
                item.packed
                  ? 'luxury-card border-white/[0.04] opacity-50'
                  : 'luxury-card border-white/[0.08] hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                    item.packed
                      ? 'bg-[#E5C578] text-black'
                      : 'border border-white/30 group-hover:border-[#E5C578]'
                  }`}
                >
                  {item.packed && <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[2.5]" />}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${item.packed ? 'line-through text-stone-500' : 'text-white'}`}>
                      {item.name}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-[9px] font-mono font-bold bg-white/10 text-[#E5C578] px-1.5 py-0.2 rounded">
                        x{item.quantity}
                      </span>
                    )}
                    {item.isEssential && (
                      <span className="text-[8px] font-mono uppercase font-bold px-1.5 py-0.2 rounded bg-[#E5C578]/20 text-[#E5C578] border border-[#E5C578]/30">
                        Essential
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-stone-400 uppercase tracking-wider font-mono">{cat.label}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deletePackingItem(trip.id, item.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-stone-500 hover:text-rose-400 transition-all cursor-pointer"
                title="Delete Item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-2 luxury-card rounded-2xl p-8 text-center text-xs text-stone-500">
            No packing items found in this category. Click "+ Add Item" or generate with AI.
          </div>
        )}
      </div>

      {/* MODAL: Add Custom Packing Item */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="luxury-card-elevated rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-white/20 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-serif text-xl font-light text-white">
                Add Packing Item
              </h3>
              <button
                type="button"
                onClick={() => setShowAddItem(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Travel Adapter (Type C), Merino Wool Sweater"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs font-medium text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E5C578]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as PackingCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white focus:outline-none"
                  >
                    {Object.keys(CATEGORY_MAP).map((k) => (
                      <option key={k} value={k}>
                        {CATEGORY_MAP[k as PackingCategory].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-white cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newItemEssential}
                  onChange={(e) => setNewItemEssential(e.target.checked)}
                  className="rounded accent-[#E5C578]"
                />
                <span className="text-[11px] text-stone-400 font-mono">Mark as Essential Priority Item</span>
              </label>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-stone-400 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] text-[#090A0E] text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Save as Reusable Template */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="luxury-card-elevated rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-white/20 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-serif text-xl font-light text-white">
                Save to Reusable Library
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveTemplateModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-400">
              Save this checklist ({(trip.packingList || []).length} items) as a reusable template for any future trip.
            </p>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                Template Name
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Summer Beach Vacation or 2-Week Asia Tour"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E5C578]"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowSaveTemplateModal(false)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-stone-400 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] text-[#090A0E] text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Load Existing Template */}
      {showLoadTemplateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="luxury-card-elevated rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-white/20 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-serif text-xl font-light text-white">
                Load Packing Template
              </h3>
              <button
                type="button"
                onClick={() => setShowLoadTemplateModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {packingTemplates.length === 0 ? (
                <div className="text-center text-xs text-stone-500 py-6">No custom templates saved yet.</div>
              ) : (
                packingTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="p-4 rounded-2xl luxury-card border-white/[0.08] hover:border-white/20 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <h4 className="font-medium text-xs sm:text-sm text-white">
                        {tmpl.name}
                      </h4>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {tmpl.items.length} items • {tmpl.category || 'General'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        applyPackingTemplate(trip.id, tmpl.id);
                        setShowLoadTemplateModal(false);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-stone-200 text-[10px] font-mono font-bold uppercase tracking-widest shadow-sm cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
