import React from 'react';
import { TripProvider, useTrip } from './context/TripContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { NewTripWizard } from './components/NewTripWizard';
import { TripDetailView } from './components/TripDetailView';
import { VisitedMemoryHub } from './components/VisitedMemoryHub';
import { CrossTripAnalytics } from './components/CrossTripAnalytics';
import { PackingTemplatesHub } from './components/PackingTemplatesHub';

const AppContent: React.FC = () => {
  const { activeScreen, activeTrip, trips } = useTrip();
  const liveTrip = trips.find((t) => t.status === 'active');

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#E5E1DA] selection:text-[#1A1A1A]">
      
      {/* Clean Minimalism Navigation */}
      <Navbar />

      {/* Main Content Viewport */}
      <main className="flex-1 pb-16">
        {activeScreen === 'dashboard' && <Dashboard />}
        {activeScreen === 'new-trip-wizard' && <NewTripWizard />}
        {activeScreen === 'trip-detail' && activeTrip && <TripDetailView trip={activeTrip} />}
        {activeScreen === 'trip-detail' && !activeTrip && <Dashboard />}
        {activeScreen === 'visited-memory-hub' && <VisitedMemoryHub />}
        {activeScreen === 'cross-trip-analytics' && <CrossTripAnalytics />}
        {activeScreen === 'packing-templates' && <PackingTemplatesHub />}
      </main>

      {/* Clean Minimalism Minimalist Footer */}
      <footer className="border-t border-[#E5E1DA] bg-white px-6 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#D16B4B]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                Active: {liveTrip ? liveTrip.title : 'None in progress'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#1A1A1A]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                AI System: Ready
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
              TripLink • Linked Journey Hub
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

