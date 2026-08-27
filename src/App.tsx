import React from 'react';
import { TripProvider, useTrip } from './context/TripContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { NewTripWizard } from './components/NewTripWizard';
import { TripDetailView } from './components/TripDetailView';
import { VisitedMemoryHub } from './components/VisitedMemoryHub';
import { CrossTripAnalytics } from './components/CrossTripAnalytics';
import { PackingTemplatesHub } from './components/PackingTemplatesHub';
import { Compass, Sparkles, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeScreen, activeTrip, trips } = useTrip();
  const liveTrip = trips.find((t) => t.status === 'active');

  return (
    <div className="min-h-screen bg-[#090A0E] text-[#F3F4F6] flex flex-col font-sans relative selection:bg-[#D4AF37]/30 selection:text-[#F3F4F6]">
      {/* Background ambient lighting effects */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[300px] bg-rose-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Luxury Navigation */}
      <Navbar />

      {/* Main Content Viewport */}
      <main className="flex-1 pb-20">
        {activeScreen === 'dashboard' && <Dashboard />}
        {activeScreen === 'new-trip-wizard' && <NewTripWizard />}
        {activeScreen === 'trip-detail' && activeTrip && <TripDetailView trip={activeTrip} />}
        {activeScreen === 'trip-detail' && !activeTrip && <Dashboard />}
        {activeScreen === 'visited-memory-hub' && <VisitedMemoryHub />}
        {activeScreen === 'cross-trip-analytics' && <CrossTripAnalytics />}
        {activeScreen === 'packing-templates' && <PackingTemplatesHub />}
      </main>

      {/* Luxury Obsidian Footer */}
      <footer className="border-t border-white/[0.08] bg-[#090A0E]/90 backdrop-blur-xl px-6 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
                Active Expedition: <strong className="text-white">{liveTrip ? liveTrip.title : 'None in progress'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-[#E5C578]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
                Gemini Multi-Journey Engine: <strong className="text-[#E5C578]">Online</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-stone-400 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
              <span>Visited Memory Shield Active</span>
            </div>
            <span className="text-stone-700">•</span>
            <span className="text-[11px] font-mono text-stone-400">
              TripLink OS
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <TripProvider>
      <AppContent />
    </TripProvider>
  );
}
