// src/utils/offlineStorage.ts
// Offline storage engine using IndexedDB with localStorage fallback

const DB_NAME = 'triplink_offline_db_v2';
const DB_VERSION = 1;
const STORE_TRIPS = 'trips';
const STORE_SETTINGS = 'settings';

export interface OfflineCacheStats {
  tripCount: number;
  totalActivities: number;
  totalDocuments: number;
  lastCachedAt: string | null;
  approxSizeKB: number;
  isSupported: boolean;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB not supported'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_TRIPS)) {
          db.createObjectStore(STORE_TRIPS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

/**
 * Save all trips to IndexedDB for instant offline access
 */
export async function cacheTripsOffline(trips: any[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction([STORE_TRIPS, STORE_SETTINGS], 'readwrite');
    const tripStore = tx.objectStore(STORE_TRIPS);
    
    // Clear and re-populate
    tripStore.clear();
    for (const trip of trips) {
      tripStore.put(trip);
    }

    const settingsStore = tx.objectStore(STORE_SETTINGS);
    settingsStore.put({
      key: 'last_cached_metadata',
      timestamp: new Date().toISOString(),
      count: trips.length,
    });

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB write failed, falling back to localStorage:', err);
    try {
      localStorage.setItem('triplink_offline_backup_v2', JSON.stringify(trips));
      localStorage.setItem('triplink_offline_last_cached', new Date().toISOString());
    } catch (lsErr) {
      console.warn('LocalStorage offline cache failed:', lsErr);
    }
  }
}

/**
 * Load all offline trips from IndexedDB
 */
export async function loadOfflineTrips(): Promise<any[] | null> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_TRIPS, 'readonly');
    const store = tx.objectStore(STORE_TRIPS);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB read failed, trying localStorage fallback:', err);
    try {
      const raw = localStorage.getItem('triplink_offline_backup_v2');
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  }
}

/**
 * Get offline cache statistics
 */
export async function getOfflineCacheStats(trips: any[]): Promise<OfflineCacheStats> {
  let totalActivities = 0;
  let totalDocuments = 0;

  trips.forEach((t) => {
    (t.days || []).forEach((d: any) => {
      totalActivities += (d.activities || []).length;
    });
    totalDocuments += (t.documents || []).length;
  });

  const serialized = JSON.stringify(trips);
  const approxSizeKB = Math.round(new Blob([serialized]).size / 1024);

  let lastCachedAt: string | null = null;
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_SETTINGS, 'readonly');
    const req = tx.objectStore(STORE_SETTINGS).get('last_cached_metadata');
    const res = await new Promise<any>((resolve) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
    if (res?.timestamp) {
      lastCachedAt = res.timestamp;
    }
  } catch {
    lastCachedAt = localStorage.getItem('triplink_offline_last_cached');
  }

  return {
    tripCount: trips.length,
    totalActivities,
    totalDocuments,
    lastCachedAt: lastCachedAt || new Date().toISOString(),
    approxSizeKB,
    isSupported: typeof window !== 'undefined' && 'indexedDB' in window,
  };
}

/**
 * Export full offline backup JSON to device
 */
export function exportTripDataJSON(trips: any[], user: any): void {
  const data = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    user,
    trips,
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TripLink-Backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
