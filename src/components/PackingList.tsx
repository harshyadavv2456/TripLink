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
  clothing: { label: 'Clothing & Footwear', icon: Shirt, color: 'text-[#1A1A1A] bg-[#FDFCFB]' },
  toiletries: { label: 'Toiletries & Care', icon: Heart, color: 'text-[#1A1A1A] bg-[#FDFCFB]' },
  documents: { label: 'Passports & Docs', icon: FileText, color: 'text-[#1A1A1A] bg-[#FDFCFB]' },
  electronics: { label: 'Tech & Cables', icon: Smartphone, color: 'text-[#1A1A1A] bg-[#FDFCFB]' },
  tech: { label: 'Tech & Cables', icon: Smartphone, color: 'text-[#1A1A1A] bg-[#FDFCFB]' },
  gear: { label: 'Outdoor Gear', icon: Wrench, color: 'text-[#1A1A1A] bg-[#FDFCFB]' },
  essentials: { label: 'Daily Essentials', icon: Package, color: 'text-[#1A1A1A] bg-[#FDFCFB]' },
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

  const packedCount = trip.packingList.filter((p) => p.packed).length;
  const totalCount = trip.packingList.length;
  const progressPercent = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const filteredItems = trip.packingList.filter((item) => {
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
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E1DA] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
              Preparation & Gear
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <Luggage className="w-5 h-5 text-[#1A1A1A]" />
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A]">
                Packing Checklist & Library
              </h2>
            </div>
            <p className="text-xs text-[#8C8881] mt-1">
              Curated for {trip.destinations.map((d) => d.city).join(', ')} ({trip.days.length} days, {trip.travelerCount} travelers).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => generatePackingListAI(trip.id)}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Regenerate AI List</span>
            </button>

            <button
              onClick={() => setShowLoadTemplateModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#FDFCFB] hover:bg-white border border-[#E5E1DA] text-[#8C8881] hover:text-[#1A1A1A] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Load Template</span>
            </button>

            <button
              onClick={() => setShowSaveTemplateModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#FDFCFB] hover:bg-white border border-[#E5E1DA] text-[#8C8881] hover:text-[#1A1A1A] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save As Template</span>
            </button>
          </div>
        </div>

        {/* Packing Progress Meter */}
        <div className="space-y-2 pt-2 border-t border-[#E5E1DA]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8C8881] flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1A1A1A]" />
              <span>{packedCount} of {totalCount} Items Packed</span>
            </span>
            <span className="text-[#1A1A1A] font-mono text-xs font-bold">{progressPercent}% Ready</span>
          </div>

          <div className="w-full bg-[#FDFCFB] h-2 rounded-full overflow-hidden border border-[#E5E1DA]">
            <div
              className="h-full bg-[#1A1A1A] transition-all duration-300"
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
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'bg-white text-[#8C8881] border border-[#E5E1DA] hover:text-[#1A1A1A]'
            }`}
          >
            All ({totalCount})
          </button>

          {(Object.keys(CATEGORY_MAP) as PackingCategory[]).map((catKey) => {
            const count = trip.packingList.filter((p) => p.category === catKey).length;
            const cat = CATEGORY_MAP[catKey];

            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === catKey
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'bg-white text-[#8C8881] border border-[#E5E1DA] hover:text-[#1A1A1A]'
                }`}
              >
                {cat.label.split(' ')[0]} ({count})
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowAddItem(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#1A1A1A] hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Item</span>
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
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer select-none group ${
                item.packed
                  ? 'bg-[#FDFCFB] border-[#E5E1DA] opacity-50'
                  : 'bg-white border-[#E5E1DA] hover:border-[#1A1A1A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                    item.packed
                      ? 'bg-[#1A1A1A] text-white'
                      : 'border border-[#8C8881] group-hover:border-[#1A1A1A]'
                  }`}
                >
                  {item.packed && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${item.packed ? 'line-through text-[#8C8881]' : 'text-[#1A1A1A]'}`}>
                      {item.name}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-[9px] font-mono font-bold bg-[#E5E1DA] text-[#1A1A1A] px-1.5 py-0.2 rounded">
                        x{item.quantity}
                      </span>
                    )}
                    {item.isEssential && (
                      <span className="text-[8px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#1A1A1A] text-white">
                        Essential
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-[#8C8881] uppercase tracking-wider">{cat.label}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deletePackingItem(trip.id, item.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#8C8881] hover:text-rose-600 transition-all cursor-pointer"
                title="Delete Item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL: Add Custom Packing Item */}
      {showAddItem && (
        <div className="fixed inset-0 bg-[#1A1A1A]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-[#E5E1DA] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#E5E1DA] pb-3">
              <h3 className="font-serif text-xl font-light text-[#1A1A1A]">
                Add Packing Item
              </h3>
              <button
                type="button"
                onClick={() => setShowAddItem(false)}
                className="p-1.5 rounded-full hover:bg-[#F9F8F6] text-[#8C8881] hover:text-[#1A1A1A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Travel Adapter (Type C), Merino Wool Sweater"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as PackingCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] focus:outline-none"
                  >
                    {Object.keys(CATEGORY_MAP).map((k) => (
                      <option key={k} value={k}>
                        {CATEGORY_MAP[k as PackingCategory].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newItemEssential}
                  onChange={(e) => setNewItemEssential(e.target.checked)}
                  className="rounded accent-[#1A1A1A]"
                />
                <span className="text-[11px] text-[#8C8881]">Mark as Essential Priority Item</span>
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E1DA]">
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E1DA] hover:bg-[#F9F8F6] text-[#8C8881] text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-widest shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 bg-[#1A1A1A]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-[#E5E1DA] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#E5E1DA] pb-3">
              <h3 className="font-serif text-xl font-light text-[#1A1A1A]">
                Save to Reusable Library
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveTemplateModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F9F8F6] text-[#8C8881] hover:text-[#1A1A1A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#8C8881]">
              Save this checklist ({trip.packingList.length} items) as a reusable template for any future trip.
            </p>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                Template Name
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Summer Beach Vacation or 2-Week Asia Tour"
                className="w-full px-3.5 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E1DA]">
              <button
                type="button"
                onClick={() => setShowSaveTemplateModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E5E1DA] hover:bg-[#F9F8F6] text-[#8C8881] text-[10px] font-bold uppercase tracking-widest cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="px-5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-widest shadow-xs cursor-pointer"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Load Existing Template */}
      {showLoadTemplateModal && (
        <div className="fixed inset-0 bg-[#1A1A1A]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-xl border border-[#E5E1DA] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#E5E1DA] pb-3">
              <h3 className="font-serif text-xl font-light text-[#1A1A1A]">
                Load Packing Template
              </h3>
              <button
                type="button"
                onClick={() => setShowLoadTemplateModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F9F8F6] text-[#8C8881] hover:text-[#1A1A1A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {packingTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-3.5 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] hover:border-[#1A1A1A] transition-all flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-medium text-xs sm:text-sm text-[#1A1A1A]">
                      {tmpl.name}
                    </h4>
                    <span className="text-[10px] text-[#8C8881]">
                      {tmpl.items.length} items • {tmpl.category || 'General'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      applyPackingTemplate(trip.id, tmpl.id);
                      setShowLoadTemplateModal(false);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1A1A1A] hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-widest shadow-xs cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
