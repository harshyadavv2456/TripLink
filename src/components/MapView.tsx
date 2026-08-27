import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Trip, Activity, ItineraryDay } from '../types';
import { useTrip } from '../context/TripContext';
import { formatCurrency } from '../data/currencies';
import {
  MapPin,
  Footprints,
  Compass,
  Layers,
  ExternalLink,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Share2,
  Sparkles,
} from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet icon paths in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  trip: Trip;
}

// City coordinate fallback dictionary for accurate placement
const CITY_COORDINATES: Record<string, [number, number]> = {
  tokyo: [35.6762, 139.6503],
  kyoto: [35.0116, 135.7681],
  osaka: [34.6937, 135.5023],
  paris: [48.8566, 2.3522],
  london: [51.5074, -0.1278],
  rome: [41.9028, 12.4964],
  barcelona: [41.3879, 2.1699],
  newyork: [40.7128, -74.0060],
  delhi: [28.6139, 77.2090],
  mumbai: [19.0760, 72.8777],
  dubai: [25.2048, 55.2708],
  singapore: [1.3521, 103.8198],
  bangkok: [13.7563, 100.5018],
  sydney: [33.8688, 151.2093],
  zurich: [47.3769, 8.5417],
  bali: [-8.4095, 115.1889],
};

export const MapView: React.FC<MapViewProps> = ({ trip }) => {
  const { baseCurrency } = useTrip();
  const [selectedDayId, setSelectedDayId] = useState<string>('all');
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<'clean' | 'streets' | 'satellite'>('clean');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Flatten all activities with day info and robust coordinates
  const allStops = useMemo(() => {
    const list: { activity: Activity; day: ItineraryDay; stopIndex: number; lat: number; lng: number }[] = [];
    let idx = 1;

    // Detect destination base coordinate
    const cityKey = (trip.destinations[0]?.city || 'Tokyo').toLowerCase().replace(/\s+/g, '');
    const defaultCoords = CITY_COORDINATES[cityKey] || [35.6762, 139.6503];

    (trip.days || []).forEach((day, dayIdx) => {
      (day.activities || []).forEach((act, actIdx) => {
        // Derive reasonable lat/lng if not explicitly present
        const lat = act.lat || defaultCoords[0] + (dayIdx * 0.02 + actIdx * 0.008) * (actIdx % 2 === 0 ? 1 : -1);
        const lng = act.lng || defaultCoords[1] + (dayIdx * 0.015 + actIdx * 0.009) * (actIdx % 3 === 0 ? 1 : -1);

        list.push({
          activity: act,
          day,
          stopIndex: idx++,
          lat,
          lng,
        });
      });
    });
    return list;
  }, [trip]);

  const filteredStops = useMemo(() => {
    if (selectedDayId === 'all') return allStops;
    return allStops.filter((s) => s.day.id === selectedDayId);
  }, [allStops, selectedDayId]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = allStops[0]?.lat || 35.6762;
      const initialLng = allStops[0]?.lng || 139.6503;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 12,
        zoomControl: false,
      });

      // CartoDB Dark Matter / Voyager
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer if Style Changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; CARTO';

    if (mapStyle === 'streets') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap';
    } else if (mapStyle === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri World Imagery';
    }

    L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);
  }, [mapStyle]);

  // Update Markers and Polyline when filteredStops change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (filteredStops.length === 0) return;

    const latLngs: L.LatLngTuple[] = [];

    filteredStops.forEach((stop) => {
      const isSelected = activeStopId === stop.activity.id;
      latLngs.push([stop.lat, stop.lng]);

      // Custom Gold/Obsidian HTML Marker Pin
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="relative flex flex-col items-center group">
            <div class="w-8 h-8 rounded-full ${
              isSelected ? 'bg-[#E5C578] text-black ring-4 ring-[#E5C578]/40 scale-110' : 'bg-[#0E1017] text-[#E5C578] border-2 border-[#E5C578] hover:scale-105'
            } flex items-center justify-center font-mono text-[11px] font-bold shadow-2xl transition-all cursor-pointer">
              ${stop.stopIndex}
            </div>
            <div class="absolute top-9 px-2.5 py-0.5 bg-[#090A0E] text-white text-[10px] font-medium rounded-lg whitespace-nowrap shadow-xl pointer-events-none border border-white/10 opacity-90 group-hover:opacity-100 transition-opacity">
              ${stop.activity.name.length > 18 ? stop.activity.name.substring(0, 16) + '...' : stop.activity.name}
            </div>
          </div>
        `,
        iconSize: [32, 42],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: customIcon }).addTo(markersGroup);

      // Popup with Google Maps navigation link
      const encodedLoc = encodeURIComponent(`${stop.activity.name}, ${stop.activity.location || trip.destinations[0]?.city}`);
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLoc}`;

      const popupContent = `
        <div class="p-2 space-y-1.5 font-sans min-w-[200px] bg-[#0E1017] text-white rounded-xl">
          <div class="text-[10px] uppercase font-mono font-bold text-[#E5C578]">Day ${stop.day.dayNumber} • ${stop.activity.time || stop.activity.timeBlock}</div>
          <div class="font-serif font-medium text-sm text-white leading-snug">${stop.activity.name}</div>
          <div class="text-xs text-stone-400">${stop.activity.location || 'Local Landmark'}</div>
          ${stop.activity.estCost > 0 ? `<div class="text-xs font-mono font-bold text-[#E5C578]">${formatCurrency(stop.activity.estCost, baseCurrency)}</div>` : ''}
          <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E5C578] hover:underline pt-1">
            Open in Google Maps ↗
          </a>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setActiveStopId(stop.activity.id);
      });
    });

    // Draw connecting path in Gold
    if (latLngs.length > 1) {
      const polyline = L.polyline(latLngs, {
        color: '#E5C578',
        weight: 3,
        dashArray: '6, 6',
        opacity: 0.9,
      }).addTo(map);
      polylineRef.current = polyline;
    }

    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [filteredStops, activeStopId, baseCurrency]);

  const handleFocusStop = (stop: (typeof allStops)[0]) => {
    setActiveStopId(stop.activity.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([stop.lat, stop.lng], 15, { duration: 1.2 });
    }
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleOpenEntireTripInGoogleMaps = () => {
    if (filteredStops.length === 0) return;
    const origin = encodeURIComponent(filteredStops[0].activity.name + ' ' + (filteredStops[0].activity.location || ''));
    const destination = encodeURIComponent(
      filteredStops[filteredStops.length - 1].activity.name + ' ' + (filteredStops[filteredStops.length - 1].activity.location || '')
    );
    const waypoints = filteredStops
      .slice(1, -1)
      .map((s) => encodeURIComponent(s.activity.name))
      .join('|');

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=transit`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Map Header & Controls */}
      <div className="luxury-card rounded-3xl p-6 border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E5C578]">
            Interactive Geographic Hub
          </span>
          <h2 className="font-serif text-2xl font-light text-white flex items-center gap-2 mt-0.5">
            <Compass className="w-5 h-5 text-[#E5C578]" />
            Live Map & Transit Directions
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Turn-by-turn routing and Google Maps integration for {trip.title}.
          </p>
        </div>

        {/* Action buttons & Day Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenEntireTripInGoogleMaps}
            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-[#E5C578]" />
            <span>Google Maps Route</span>
          </button>

          {/* Day Filter Pills */}
          <div className="flex items-center gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/[0.08] overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedDayId('all')}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedDayId === 'all'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              All ({allStops.length})
            </button>

            {(trip.days || []).map((day) => (
              <button
                key={day.id}
                onClick={() => setSelectedDayId(day.id)}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  selectedDayId === day.id
                    ? 'bg-white text-black shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map Canvas and Stops Feed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Leaflet Map View (2 Columns) */}
        <div className="lg:col-span-2 luxury-card rounded-3xl border-white/[0.08] relative overflow-hidden shadow-2xl flex flex-col h-[480px] sm:h-[560px]">
          
          {/* Map Layer Switcher Floating Controls */}
          <div className="absolute top-4 left-4 z-[400] flex items-center gap-2">
            <div className="bg-[#090A0E]/90 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-lg flex items-center gap-1 text-[11px] font-medium font-mono">
              <button
                onClick={() => setMapStyle('clean')}
                className={`px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                  mapStyle === 'clean' ? 'bg-[#E5C578] text-black font-bold' : 'text-stone-400 hover:text-white'
                }`}
              >
                Voyager
              </button>
              <button
                onClick={() => setMapStyle('streets')}
                className={`px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                  mapStyle === 'streets' ? 'bg-[#E5C578] text-black font-bold' : 'text-stone-400 hover:text-white'
                }`}
              >
                Streets
              </button>
              <button
                onClick={() => setMapStyle('satellite')}
                className={`px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                  mapStyle === 'satellite' ? 'bg-[#E5C578] text-black font-bold' : 'text-stone-400 hover:text-white'
                }`}
              >
                Satellite
              </button>
            </div>
          </div>

          {/* Map Zoom Controls Floating */}
          <div className="absolute top-4 right-4 z-[400] flex flex-col gap-1.5">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-xl bg-[#090A0E]/90 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 shadow-lg cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-xl bg-[#090A0E]/90 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 shadow-lg cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Leaflet Map Target DOM Node */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Bottom Overlay Legend */}
          <div className="absolute bottom-3 left-3 right-3 z-[400] flex items-center justify-between bg-[#090A0E]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-xs text-stone-400 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5C578]" />
                <span>{filteredStops.length} Plotted Stops</span>
              </span>
              <span className="text-[11px] hidden sm:inline text-stone-400">
                Tap pins to inspect and navigate
              </span>
            </div>

            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
              Live Transit Mode
            </span>
          </div>

        </div>

        {/* Right Sidebar: Sequenced Stops Feed (1 Column) */}
        <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 px-1">
            <span>Sequenced Stops ({filteredStops.length})</span>
            <span>Est. Cost</span>
          </div>

          {filteredStops.length === 0 ? (
            <div className="luxury-card rounded-2xl p-8 text-center text-stone-500 text-xs">
              No itinerary stops added to this trip yet.
            </div>
          ) : (
            filteredStops.map((stop) => {
              const isActive = activeStopId === stop.activity.id;
              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${stop.activity.name}, ${stop.activity.location || trip.destinations[0]?.city}`
              )}`;

              return (
                <div
                  key={stop.activity.id}
                  onClick={() => handleFocusStop(stop)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? 'luxury-card-elevated border-[#E5C578] shadow-lg'
                      : 'luxury-card border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-xl bg-white/10 text-[#E5C578] text-[10px] font-mono font-bold flex items-center justify-center shrink-0 border border-white/10">
                        {stop.stopIndex}
                      </span>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono uppercase font-bold text-[#E5C578]">
                            Day {stop.day.dayNumber} • {stop.activity.time || stop.activity.timeBlock}
                          </span>
                        </div>

                        <h4 className="font-serif text-sm font-normal text-white leading-snug">
                          {stop.activity.name}
                        </h4>

                        {stop.activity.location && (
                          <p className="text-[11px] text-stone-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-500" />
                            {stop.activity.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {stop.activity.estCost > 0 && (
                        <span className="text-[10px] font-mono font-bold text-[#E5C578] bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/10">
                          {formatCurrency(stop.activity.estCost, baseCurrency)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Turn-by-turn google maps & travel time */}
                  <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-[10px] text-stone-400">
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[#E5C578] hover:underline font-mono"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Google Maps ↗
                    </a>

                    {stop.activity.travelTimeToNext && (
                      <span className="font-mono text-[9px] text-stone-300 bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/10">
                        {stop.activity.travelTimeToNext} ({stop.activity.distanceToNext || '1.0 km'})
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
