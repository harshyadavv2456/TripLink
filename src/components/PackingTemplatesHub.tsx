import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { PackingTemplate, PackingCategory } from '../types';
import {
  Plus,
  CheckCircle2,
  ArrowRight,
  X,
  Luggage,
  Sparkles,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <section className="luxury-card-elevated rounded-3xl p-6 sm:p-8 shadow-2xl border-white/[0.1] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E5C578]">
              Cross-Trip Gear Archive
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-white">
              Reusable Packing Master Templates
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-light">
              Curate master gear checklists for climates, activities, and travel styles. Apply them to any upcoming journey with 1-click synchronization.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] hover:brightness-110 text-[#090A0E] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 btn-tactile cursor-pointer shrink-0 transition-all"
          >
            <Plus className="w-4 h-4 text-[#090A0E] stroke-[2.5]" />
            <span>Create Master Template</span>
          </button>
        </div>
      </section>

      {/* Main Split Layout: Templates List & Detail Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Template Cards (1 Column) */}
        <div className="space-y-3">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 px-1">
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
                    ? 'luxury-card-elevated border-[#E5C578]/50 shadow-lg'
                    : 'luxury-card border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-lg bg-white/10 text-[#E5C578]">
                    {tpl.category || 'General'}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    {(tpl.items || []).length} items
                  </span>
                </div>

                <h3 className="font-serif text-lg font-normal text-white">
                  {tpl.name}
                </h3>

                <p className="text-xs text-stone-400 line-clamp-1">
                  {(tpl.items || []).slice(0, 4).map((i) => i.name).join(', ')}...
                </p>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Template Items & 1-Click Apply to Trip (2 Columns) */}
        {selectedTemplate ? (
          <div className="lg:col-span-2 luxury-card rounded-3xl p-6 sm:p-8 border-white/[0.08] space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Header & Apply Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#E5C578]">
                    {selectedTemplate.category || 'Travel Style'} Template
                  </span>
                  <h2 className="font-serif text-2xl font-light text-white">
                    {selectedTemplate.name}
                  </h2>
                </div>

                {/* Apply to Trip Dropdown & Button */}
                {trips.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={applyTargetTripId}
                      onChange={(e) => setApplyTargetTripId(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-[#0D0F15] border border-white/10 text-white focus:outline-none"
                    >
                      {trips.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleApplyToTrip(selectedTemplate.id)}
                      className="px-4 py-2 rounded-xl bg-[#E5C578] hover:bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <span>Apply to Trip</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-stone-500 italic">Create a trip to apply this checklist.</span>
                )}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(selectedTemplate.items || []).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-stone-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-stone-200 block truncate">
                        {item.name}
                      </span>
                      <span className="text-[9px] uppercase font-mono tracking-widest text-stone-500 block">
                        {item.category} • Qty {item.quantity || 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-stone-400">
              <span>{(selectedTemplate.items || []).length} gear items in this master profile</span>
              <span className="font-mono text-[#E5C578]">Continuous Gear Synchronization</span>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 luxury-card rounded-3xl p-12 text-center text-stone-500">
            <Luggage className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Select a template on the left to preview its checklist items.</p>
          </div>
        )}

      </div>

      {/* MODAL: Create New Master Template */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="luxury-card-elevated rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-white/20 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-serif text-xl font-light text-white">
                Create Master Template
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g. Scuba & Coastal Pack, Winter Ski Gear"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs font-medium text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E5C578]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                  Category / Style
                </label>
                <input
                  type="text"
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value)}
                  placeholder="e.g. Adventure, Beach, Business, Winter"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white placeholder:text-stone-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                  Items (One item per line)
                </label>
                <textarea
                  rows={6}
                  value={newItemsText}
                  onChange={(e) => setNewItemsText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs font-mono text-white placeholder:text-stone-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-medium text-stone-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] text-[#090A0E] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg"
                >
                  Save Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
