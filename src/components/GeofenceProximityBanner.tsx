// src/components/GeofenceProximityBanner.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Trip } from '../types';
import {
  Coordinates,
  scanTripGeofences,
  GeofenceTarget,
  GPS_SIMULATION_PRESETS,
  formatDistance,
} from '../utils/geofencing';
import {
  Navigation,
  MapPin,
  Compass,
  AlertCircle,
  Radio,
  Sliders,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';

interface GeofenceProximityBannerProps {
  trip: Trip;
}

export const GeofenceProximityBanner: React.FC<GeofenceProximityBannerProps> = ({ trip }) => {
  const [userCoord, setUserCoord] = useState<Coordinates | null>(null);
  const [gpsSource, setGpsSource] = useState<'device' | 'simulator'>('simulator');
  const [selectedPresetName, setSelectedPresetName] = useState<string>(GPS_SIMULATION_PRESETS[0].name);
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Initialize with the first simulation preset or device coords
  useEffect(() => {
    const defaultPreset = GPS_SIMULATION_PRESETS[0];
    setUserCoord({ lat: defaultPreset.lat, lng: defaultPreset.lng });
  }, []);

  // Handle live device GPS tracking
  const activateDeviceGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser.');
      return;
    }

    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoord({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGpsSource('device');
      },
      (err) => {
        setGpsError(err.message || 'Unable to retrieve device GPS location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Handle simulation preset selection
  const handleSelectPreset = (presetName: string) => {
    const found = GPS_SIMULATION_PRESETS.find((p) => p.name === presetName);
    if (found) {
      setSelectedPresetName(found.name);
      setUserCoord({ lat: found.lat, lng: found.lng });
      setGpsSource('simulator');
      setGpsError(null);
    }
  };

  const nearbyTargets = userCoord ? scanTripGeofences(userCoord, trip) : [];
  const activeAlert = nearbyTargets.find((t) => t.isInsideGeofence); // < 500m
  const closestStop = nearbyTargets[0];

  if (!isTracking || !userCoord) {
    return (
      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <Navigation className="w-4 h-4 text-zinc-500" />
          <span>GPS Geofencing Proximity Radar is paused</span>
        </div>
        <button
          onClick={() => setIsTracking(true)}
          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold"
        >
          Resume Radar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Active Geofence Alert (Triggered when user is within 500m of a planned activity) */}
      {activeAlert ? (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/60 text-amber-200 shadow-lg flex items-start justify-between gap-3 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500 text-zinc-950 shrink-0 mt-0.5 animate-pulse">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
                  📍 Proximity Alert ({activeAlert.distanceFormatted} away)
                </span>
                <span className="text-xs text-amber-300/80 font-mono">Day {activeAlert.dayNumber}</span>
              </div>
              <h4 className="text-sm font-semibold text-white mt-1">
                You've reached {activeAlert.name}!
              </h4>
              <p className="text-xs text-amber-200/90 mt-0.5">
                Location: {activeAlert.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-lg bg-zinc-900/80 text-amber-400 hover:bg-zinc-800"
              title="GPS settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : closestStop ? (
        /* Regular Proximity Radar Status Bar */
        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-amber-400">
              <Navigation className="w-4 h-4" />
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-semibold text-white">
                Next Stop: {closestStop.name}
              </span>
              <span className="text-amber-400 font-mono font-semibold">
                • {closestStop.distanceFormatted} away
              </span>
              <span className="text-zinc-400 text-[11px]">
                ({closestStop.location})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 hidden sm:inline-block">
              {gpsSource === 'device' ? 'Real Device GPS' : 'Simulated GPS'}
            </span>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Configure GPS radar location"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      {/* GPS Configuration & Simulation Drawer */}
      {showSettings && (
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700/80 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-white">
                Live GPS Radar & Geofence Simulation
              </span>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] text-zinc-400">
              Test proximity alerts by teleporting your location or using your device's native GPS:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={activateDeviceGPS}
                className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  gpsSource === 'device'
                    ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Use Device Live GPS</span>
              </button>

              <select
                value={selectedPresetName}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs font-semibold focus:outline-none"
              >
                {GPS_SIMULATION_PRESETS.map((p) => (
                  <option key={p.name} value={p.name}>
                    Teleport: {p.name}
                  </option>
                ))}
              </select>
            </div>

            {gpsError && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {gpsError}
              </p>
            )}

            {/* Current Proximity Range List */}
            {nearbyTargets.length > 0 && (
              <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                  Closest Trip Itinerary Stops
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                  {nearbyTargets.slice(0, 4).map((t) => (
                    <div
                      key={t.id}
                      className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-[11px] flex items-center justify-between"
                    >
                      <span className="text-zinc-300 truncate max-w-[140px]">{t.name}</span>
                      <span className="font-mono text-amber-400 font-semibold">{t.distanceFormatted}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
