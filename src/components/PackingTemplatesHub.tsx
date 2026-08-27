import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { PackingTemplate, PackingCategory } from '../types';
import {
  Plus,
  CheckCircle2,
  ArrowRight,
  X,
} from 'lucide-react';

export const PackingTemplatesHub: React.FC = () => {
  const { packingTemplates, trips, applyPackingTemplate, saveAsPackingTemplate, openTrip } = useTrip();

  const [selectedTemplate, setSelectedTemplate] = useState<PackingTemplate>(packingTemplates[0] || null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [applyTargetTripId, setApplyTargetTripId] = useState<string>(trips[0]?.id || '');
  const [newTemplateName, setNewTemplateName] = useState<string>('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<string>('General');
  const [newItemsText, setNewItemsText] = useState<string>('Passport\nPower Bank\nUniversal Adapter\nSunscreen\nComfortable Walking Shoes\nLight Rain Jacket');

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    const items = newItemsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((name, idx) => ({
        id: `tpl-item-${Date.now()}-${idx}`,
        name,
        category: 'essentials' as PackingCategory,
        quantity: 1,
        packed: false,
        isEssential: true,
      }));

    saveAsPackingTemplate(newTemplateName, items, newTemplateCategory);
    setShowCreateModal(false);
    setNewTemplateName('');
  };

  const handleApplyToTrip = (templateId: string) => {
    if (!applyTargetTripId) return;
    applyPackingTemplate(applyTargetTripId, templateId);
    openTrip(applyTargetTripId, 'packing');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* Top Banner */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-[#E5E1DA] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
              Cross-Trip Gear Archive
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A]">
              Reusable Packing Master Templates
            </h1>
            <p className="text-xs sm:text-sm text-[#8C8881] leading-relaxed">
              Curate master gear checklists for climates, activities, and travel styles. Apply them to any upcoming journey with 1-click synchronization.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-3 rounded-xl bg-[#1A1A1A] hover:bg-stone-800 text-white font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Master Template</span>
          </button>
        </div>
      </section>

      {/* Main Split Layout: Templates List & Detail Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Template Cards (1 Column) */}
        <div className="space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881] px-1">
            Master Templates ({packingTemplates.length})
          </div>

          {packingTemplates.map((tpl) => {
            const isSelected = selectedTemplate?.id === tpl.id;

            return (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-white border-[#1A1A1A] shadow-xs'
                    : 'bg-[#FDFCFB] border-[#E5E1DA] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-[#E5E1DA] text-[#1A1A1A]">
                    {tpl.category || 'General'}
                  </span>
                  <span className="text-[10px] font-mono text-[#8C8881]">
                    {tpl.items.length} items
                  </span>
                </div>

                <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">
                  {tpl.name}
                </h3>

                <p className="text-xs text-[#8C8881] line-clamp-1">
                  {tpl.items.slice(0, 4).map((i) => i.name).join(', ')}...
                </p>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Template Items & 1-Click Apply to Trip (2 Columns) */}
        {selectedTemplate ? (
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E1DA] shadow-xs space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Header & Apply Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E1DA] pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C8881]">
                    {selectedTemplate.category || 'Travel Style'} Template
                  </span>
                  <h2 className="font-serif text-2xl font-light text-[#1A1A1A]">
                    {selectedTemplate.name}
                  </h2>
                </div>

                {/* Apply to Trip Dropdown & Button */}
                <div className="flex items-center gap-2">
                  <select
                    value={applyTargetTripId}
                    onChange={(e) => setApplyTargetTripId(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] focus:outline-none"
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        Apply to: {t.title}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleApplyToTrip(selectedTemplate.id)}
                    className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                  >
                    <span>Apply</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-[#8C8881] uppercase tracking-widest">
                  Included Items ({selectedTemplate.items.length})
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedTemplate.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1A1A1A] shrink-0" />
                        <span className="font-medium text-[#1A1A1A]">{item.name}</span>
                      </div>
                      <span className="text-[9px] text-[#8C8881] uppercase tracking-wider">{item.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E1DA] text-xs text-[#8C8881] flex items-center justify-between">
              <span>Saved in personal travel library</span>
              <span className="text-[#1A1A1A] font-semibold">1-Click Synchronization</span>
            </div>
          </div>
        ) : null}

      </div>

      {/* MODAL: Create Master Template */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#1A1A1A]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-[#E5E1DA] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#E5E1DA] pb-3">
              <h3 className="font-serif text-xl font-light text-[#1A1A1A]">
                Create Packing Template
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F9F8F6] text-[#8C8881] hover:text-[#1A1A1A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g., Alpine Hiking Gear or Urban Nomad Setup"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Category / Style
                </label>
                <input
                  type="text"
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value)}
                  placeholder="e.g., Adventure, Beach, Urban"
                  className="w-full px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs text-[#1A1A1A] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Items (One per line)
                </label>
                <textarea
                  rows={5}
                  value={newItemsText}
                  onChange={(e) => setNewItemsText(e.target.value)}
                  placeholder="Passport&#10;Power Bank&#10;Hiking Boots"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs text-[#1A1A1A] font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E1DA]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E1DA] hover:bg-[#F9F8F6] text-[#8C8881] text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-widest shadow-xs cursor-pointer"
                >
                  Save Master Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
