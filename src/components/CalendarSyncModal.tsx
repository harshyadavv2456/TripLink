// src/components/CalendarSyncModal.tsx
import React, { useState } from 'react';
import { Trip, ItineraryDay, Activity } from '../types';
import { downloadTripICS, buildGoogleCalendarUrl } from '../utils/calendarSync';
import {
  Calendar,
  Download,
  ExternalLink,
  CheckCircle2,
  Share2,
  Clock,
  MapPin,
  X,
  CalendarCheck,
} from 'lucide-react';

interface CalendarSyncModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({ trip, isOpen, onClose }) => {
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [selectedDayId, setSelectedDayId] = useState<string>(trip.days?.[0]?.id || '');

  if (!isOpen) return null;

  const totalActivities = (trip.days || []).reduce(
    (acc, day) => acc + (day.activities || []).length,
    0
  );

  const selectedDay = (trip.days || []).find((d) => d.id === selectedDayId) || trip.days?.[0];

  const handleDownloadICS = () => {
    downloadTripICS(trip);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#14171F] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-[#0F1116]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/50 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Calendar Sync & Export
              </h3>
              <p className="text-xs text-zinc-400">
                Sync {trip.title} ({totalActivities} activities) with your native calendars
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

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Method 1: Apple Calendar / Outlook / iCal universal download */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3.5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400">
                  Universal Export (RFC 5545)
                </span>
                <h4 className="text-sm font-semibold text-white">
                  Download Complete .ICS Calendar File
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm">
                  One file containing all {totalActivities} stops, exact times, addresses, and 30-minute reminder alarms.
                </p>
              </div>

              <button
                onClick={handleDownloadICS}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download .ICS</span>
              </button>
            </div>

            {downloaded && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Downloaded! Tap the .ics file to import into Apple Calendar or Outlook.</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-zinc-400 font-mono">
              <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/60">✓ Apple iCal (iOS / macOS)</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/60">✓ Microsoft Outlook</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/60">✓ Google Calendar</span>
            </div>
          </div>

          {/* Method 2: Google Calendar 1-Click Direct Links */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-white">
                  1-Click Direct Google Calendar Sync
                </h4>
                <p className="text-xs text-zinc-400">
                  Add activities directly to your web Google Calendar without downloading files
                </p>
              </div>

              {/* Day filter */}
              <select
                value={selectedDayId}
                onChange={(e) => setSelectedDayId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs font-semibold focus:outline-none"
              >
                {(trip.days || []).map((d) => (
                  <option key={d.id} value={d.id}>
                    Day {d.dayNumber}: {d.destination}
                  </option>
                ))}
              </select>
            </div>

            {/* List of activities for selected day with 1-click Google Cal button */}
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {selectedDay && (selectedDay.activities || []).length > 0 ? (
                selectedDay.activities.map((act) => {
                  const gcalUrl = buildGoogleCalendarUrl(selectedDay.date, act, trip.title);
                  return (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white truncate">{act.name}</span>
                          {act.time && (
                            <span className="text-[10px] font-mono text-amber-400 shrink-0">
                              {act.time}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-400 truncate block">
                          {act.location || selectedDay.destination}
                        </span>
                      </div>

                      <a
                        href={gcalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-medium flex items-center gap-1.5 shrink-0 transition-colors"
                      >
                        <span>Add to GCal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-xl border border-zinc-800/60">
                  No activities logged for this day yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-[#0F1116] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
