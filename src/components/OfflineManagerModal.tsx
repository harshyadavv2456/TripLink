// src/components/OfflineManagerModal.tsx
import React, { useState, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import { getOfflineCacheStats, cacheTripsOffline, exportTripDataJSON, OfflineCacheStats } from '../utils/offlineStorage';
import {
  Database,
  Wifi,
  WifiOff,
  Download,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  X,
  FileCode,
} from 'lucide-react';

interface OfflineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({ isOpen, onClose }) => {
  const { trips, user } = useTrip();
  const [stats, setStats] = useState<OfflineCacheStats | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen, trips]);

  const loadStats = async () => {
    const s = await getOfflineCacheStats(trips);
    setStats(s);
  };

  const handleForceCache = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      await cacheTripsOffline(trips);
      await loadStats();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (e) {
      console.error('Cache error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportJSON = () => {
    exportTripDataJSON(trips, user);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#14171F] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-[#0F1116]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/50 text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Offline Storage & Device Cache
              </h3>
              <p className="text-xs text-zinc-400">
                IndexedDB local persistence for zero-connectivity travel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Connection Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              isOnline
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {isOnline ? (
                <div className="p-2 rounded-lg bg-emerald-900/50 text-emerald-400">
                  <Wifi className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-amber-900/50 text-amber-400">
                  <WifiOff className="w-4 h-4" />
                </div>
              )}
              <div>
                <span className="text-xs font-semibold block">
                  {isOnline ? 'Online Mode Active' : 'Offline Mode (Device Cache Active)'}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {isOnline
                    ? 'All trip changes sync to your local IndexedDB storage automatically.'
                    : 'Reading cached itineraries and boarding passes directly from device.'}
                </span>
              </div>
            </div>
          </div>

          {/* Storage Cache Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-zinc-900/70 border border-zinc-800 rounded-xl text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block">
                Cached Trips
              </span>
              <span className="text-xl font-semibold text-white mt-1 block">
                {stats?.tripCount || 0}
              </span>
            </div>

            <div className="p-3.5 bg-zinc-900/70 border border-zinc-800 rounded-xl text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block">
                Offline Stops
              </span>
              <span className="text-xl font-semibold text-white mt-1 block">
                {stats?.totalActivities || 0}
              </span>
            </div>

            <div className="p-3.5 bg-zinc-900/70 border border-zinc-800 rounded-xl text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block">
                Storage Used
              </span>
              <span className="text-xl font-semibold text-amber-400 mt-1 block">
                {stats?.approxSizeKB ? `${stats.approxSizeKB} KB` : '< 1 KB'}
              </span>
            </div>
          </div>

          {/* Storage Capability Features */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-start gap-2.5 text-xs text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Zero-Network Guarantee</strong>: View schedules, flight booking confirmation codes, and packing checklists in airplane mode.
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-zinc-300">
              <HardDrive className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Persistent IndexedDB Engine</strong>: Data remains safe across browser refreshes and device restarts.
              </span>
            </div>
          </div>

          {/* Feedback message */}
          {syncSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>All trips and boarding passes cached locally for offline use!</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-[#0F1116] flex items-center justify-between">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
            title="Download full JSON data backup"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-xs font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleForceCache}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Caching...' : 'Sync Offline Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
