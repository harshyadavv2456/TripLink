import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Trip,
  UserProfile,
  PackingTemplate,
  VisitedPlace,
  ActiveScreen,
  TripTab,
  TripScreenTab,
  Activity,
  Expense,
  BookingDocument,
  DocumentItem,
  PackingItem,
  Suggestion,
  Collaborator,
  CollaboratorSuggestion,
} from '../types';
import {
  INITIAL_TRIPS,
  INITIAL_USER,
  INITIAL_PACKING_TEMPLATES,
  INITIAL_VISITED_PLACES,
  TRIP_PALETTE,
} from '../data/initialData';

interface TripContextType {
  trips: Trip[];
  user: UserProfile;
  activeScreen: ActiveScreen;
  activeTripId: string | null;
  activeTrip: Trip | null;
  activeTab: TripTab;
  activeTripTab: TripScreenTab;
  isLoading: boolean;
  aiLoadingMessage: string | null;

  // Currency & Profile
  baseCurrency: string;
  setBaseCurrency: (currency: string) => void;
  connectGoogleUser: (googleUser: any) => void;
  disconnectGoogleUser: () => void;
  toggleGoogleDriveSync: (enabled: boolean) => void;

  // Navigation
  setActiveScreen: (screen: ActiveScreen) => void;
  setActiveTripId: (id: string | null) => void;
  setActiveTab: (tab: TripTab) => void;
  setActiveTripTab: (tab: TripScreenTab) => void;
  openTrip: (id: string, tab?: TripTab) => void;

  // Trip CRUD
  createTrip: (tripData: Partial<Trip>) => Trip;
  updateTrip: (id: string, partial: Partial<Trip>) => void;
  updateTripDetails: (id: string, partial: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;

  // Activities
  addActivity: (tripId: string, dayId: string, activity: Omit<Activity, 'id' | 'dayId' | 'orderIndex'>) => void;
  updateActivity: (tripId: string, dayId: string, actId: string, partial: Partial<Activity>) => void;
  deleteActivity: (tripId: string, dayId: string, actId: string) => void;
  reorderActivities: (tripId: string, dayId: string, newActivities: Activity[]) => void;
  moveActivity: (tripId: string, sourceDayId: string, targetDayId: string, actId: string) => void;

  // Expenses & Budget
  addExpense: (tripId: string, expense: Omit<Expense, 'id' | 'tripId'>) => void;
  deleteExpense: (tripId: string, expId: string) => void;

  // Documents & Bookings
  addDocument: (tripId: string, doc: Omit<BookingDocument, 'id' | 'tripId'>) => void;
  deleteDocument: (tripId: string, docId: string) => void;

  // Packing
  togglePackingItem: (tripId: string, itemId: string) => void;
  addPackingItem: (tripId: string, item: Omit<PackingItem, 'id' | 'packed'>) => void;
  deletePackingItem: (tripId: string, itemId: string) => void;
  packingTemplates: PackingTemplate[];
  savePackingTemplate: (title: string, style: string, items: { name: string; category: any; quantity?: number }[]) => void;
  saveAsPackingTemplate: (title: string, items: any[], style?: string) => void;
  applyPackingTemplate: (tripId: string, templateId: string) => void;

  // Visited Memory & Journal
  addVisitedPlace: (place: Omit<VisitedPlace, 'id'>) => void;
  recordVisitedPlace: (place: Omit<VisitedPlace, 'id'>) => void;
  removeVisitedPlace: (id: string) => void;
  deleteVisitedPlace: (id: string) => void;
  completeTripAndSaveMemories: (tripId: string, memoriesWithRatings: { placeName: string; city: string; country: string; rating: number; memory: string; category?: any }[]) => void;

  // Collaboration
  addCollaborator: (tripId: string, collaborator: Omit<Collaborator, 'id' | 'joinedAt'>) => void;
  addSuggestion: (tripId: string, suggestion: Partial<Suggestion>) => void;
  approveSuggestion: (tripId: string, sugId: string) => void;
  rejectSuggestion: (tripId: string, sugId: string) => void;
  declineSuggestion: (tripId: string, sugId: string) => void;

  // AI Actions (Server Gemini)
  generateFullItinerary: (wizardInput: {
    title: string;
    destinations: { city: string; country: string; days?: number }[];
    startDate: string;
    endDate: string;
    travelerCount: number;
    budget: number;
    styleTags: any[];
    customNotes?: string;
  }) => Promise<Trip>;

  promptToJourneyAI: (prompt: string) => Promise<Trip>;
  scanBookingScreenshotAI: (imageBase64: string, tripId?: string, autoRecordExpense?: boolean) => Promise<BookingDocument>;
  regenerateDayAI: (tripId: string, dayNumber: number, focusPrompt?: string) => Promise<void>;
  generatePackingListAI: (tripId: string) => Promise<void>;
  summarizeJournalAI: (tripId: string, customNotes?: string) => Promise<string>;
  generateJournalSummaryAI: (tripId: string, customNotes?: string) => Promise<string>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const STORAGE_KEY_TRIPS = 'triplink_trips_clean_v1';
const STORAGE_KEY_USER = 'triplink_user_clean_v1';
const STORAGE_KEY_TEMPLATES = 'triplink_templates_clean_v1';

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_TRIPS);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return INITIAL_TRIPS;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_USER);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return INITIAL_USER;
  });

  const [packingTemplates, setPackingTemplates] = useState<PackingTemplate[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return INITIAL_PACKING_TEMPLATES;
  });

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('dashboard');
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TripTab>('itinerary');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiLoadingMessage, setAiLoadingMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(trips));
    } catch (e) {
      console.error('Failed to save trips to localStorage', e);
    }
  }, [trips]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user to localStorage', e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(packingTemplates));
    } catch (e) {
      console.error('Failed to save packingTemplates to localStorage', e);
    }
  }, [packingTemplates]);

  // Initial load / sync with server backend
  useEffect(() => {
    async function loadServerData() {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            if (Array.isArray(json.data.trips)) {
              setTrips(json.data.trips);
            }
            if (json.data.user && json.data.user.name) {
              setUser((prev) => ({ ...prev, ...json.data.user }));
            }
            if (Array.isArray(json.data.packingTemplates)) {
              setPackingTemplates(json.data.packingTemplates);
            }
          }
        }
      } catch (e) {
        console.warn('Server sync offline or fallback to local:', e);
      }
    }
    loadServerData();
  }, []);

  // Background server sync on state change
  const syncServer = useCallback(async (newTrips: Trip[], newUser: UserProfile, newTemplates: PackingTemplate[]) => {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trips: newTrips,
          user: newUser,
          packingTemplates: newTemplates,
        }),
      });
    } catch (e) {
      console.warn('Background server sync error:', e);
    }
  }, []);

  const activeTrip = trips.find((t) => t.id === activeTripId) || null;

  const openTrip = (id: string, tab: TripTab = 'itinerary') => {
    setActiveTripId(id);
    setActiveTab(tab);
    setActiveScreen('trip-detail');
  };

  const createTrip = (tripData: Partial<Trip>): Trip => {
    const paletteIndex = trips.length % TRIP_PALETTE.length;
    const assignedColor = tripData.color || TRIP_PALETTE[paletteIndex];
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      userId: user.id,
      ownerId: user.id,
      title: tripData.title || 'Untitled Journey',
      destinations: tripData.destinations || [{ city: 'Tokyo', country: 'Japan' }],
      startDate: tripData.startDate || new Date().toISOString().split('T')[0],
      endDate: tripData.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      budget: tripData.budget || 3000,
      styleTags: tripData.styleTags || ['relaxed'],
      status: tripData.status || 'upcoming',
      color: assignedColor,
      coverImage:
        tripData.coverImage ||
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      collaborators: [
        {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: 'owner',
          joinedAt: new Date().toISOString(),
        },
      ],
      suggestions: [],
      days: tripData.days || [],
      documents: tripData.documents || [],
      packingList: tripData.packingList || [],
      expenses: tripData.expenses || [],
      journalSummary: '',
      isShared: false,
      shareToken: `trip-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...tripData,
    };

    setTrips((prev) => {
      const updated = [newTrip, ...prev];
      syncServer(updated, user, packingTemplates);
      return updated;
    });

    return newTrip;
  };

  const updateTrip = (id: string, partial: Partial<Trip>) => {
    setTrips((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...partial, updatedAt: new Date().toISOString() } : t));
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  const deleteTrip = (id: string) => {
    setTrips((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      syncServer(updated, user, packingTemplates);
      return updated;
    });
    if (activeTripId === id) {
      setActiveTripId(null);
      setActiveScreen('dashboard');
    }
  };

  // Activities
  const addActivity = (tripId: string, dayId: string, activityData: Omit<Activity, 'id' | 'dayId' | 'orderIndex'>) => {
    setTrips((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== tripId) return t;
        const newDays = t.days.map((d) => {
          if (d.id !== dayId) return d;
          const newAct: Activity = {
            id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            dayId,
            orderIndex: d.activities.length,
            ...activityData,
          };
          return { ...d, activities: [...d.activities, newAct] };
        });
        return { ...t, days: newDays, updatedAt: new Date().toISOString() };
      });
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  const updateActivity = (tripId: string, dayId: string, actId: string, partial: Partial<Activity>) => {
    setTrips((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== tripId) return t;
        const newDays = t.days.map((d) => {
          if (d.id !== dayId) return d;
          const newActs = d.activities.map((a) => (a.id === actId ? { ...a, ...partial } : a));
          return { ...d, activities: newActs };
        });
        return { ...t, days: newDays, updatedAt: new Date().toISOString() };
      });
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  const deleteActivity = (tripId: string, dayId: string, actId: string) => {
    setTrips((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== tripId) return t;
        const newDays = t.days.map((d) => {
          if (d.id !== dayId) return d;
          const newActs = d.activities
            .filter((a) => a.id !== actId)
            .map((a, idx) => ({ ...a, orderIndex: idx }));
          return { ...d, activities: newActs };
        });
        return { ...t, days: newDays, updatedAt: new Date().toISOString() };
      });
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  const reorderActivities = (tripId: string, dayId: string, newActivities: Activity[]) => {
    setTrips((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== tripId) return t;
        const newDays = t.days.map((d) => {
          if (d.id !== dayId) return d;
          return {
            ...d,
            activities: newActivities.map((a, idx) => ({ ...a, orderIndex: idx })),
          };
        });
        return { ...t, days: newDays, updatedAt: new Date().toISOString() };
      });
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  const moveActivity = (tripId: string, sourceDayId: string, targetDayId: string, actId: string) => {
    setTrips((prev) => {
      const targetTrip = prev.find((t) => t.id === tripId);
      if (!targetTrip) return prev;

      let movedItem: Activity | undefined;
      targetTrip.days.forEach((d) => {
        if (d.id === sourceDayId) {
          movedItem = d.activities.find((a) => a.id === actId);
        }
      });
      if (!movedItem) return prev;

      const newDays = targetTrip.days.map((d) => {
        if (d.id === sourceDayId) {
          return {
            ...d,
            activities: d.activities.filter((a) => a.id !== actId).map((a, i) => ({ ...a, orderIndex: i })),
          };
        }
        if (d.id === targetDayId) {
          const itemToAdd = { ...movedItem!, dayId: targetDayId, orderIndex: d.activities.length };
          return {
            ...d,
            activities: [...d.activities, itemToAdd],
          };
        }
        return d;
      });

      const updated = prev.map((t) => (t.id === tripId ? { ...t, days: newDays, updatedAt: new Date().toISOString() } : t));
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  // Expenses
  const addExpense = (tripId: string, expenseData: Omit<Expense, 'id' | 'tripId'>) => {
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      tripId,
      ...expenseData,
    };
    setTrips((prev) => {
      const updated = prev.map((t) => (t.id === tripId ? { ...t, expenses: [newExp, ...t.expenses], updatedAt: new Date().toISOString() } : t));
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  const deleteExpense = (tripId: string, expId: string) => {
    setTrips((prev) => {
      const updated = prev.map((t) => (t.id === tripId ? { ...t, expenses: t.expenses.filter((e) => e.id !== expId), updatedAt: new Date().toISOString() } : t));
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  // Documents
  const addDocument = (tripId: string, docData: Omit<BookingDocument, 'id' | 'tripId'>) => {
    const newDoc: BookingDocument = {
      id: `doc-${Date.now()}`,
      tripId,
      ...docData,
    };
    setTrips((prev) => {
      const updated = prev.map((t) => (t.id === tripId ? { ...t, documents: [...t.documents, newDoc], updatedAt: new Date().toISOString() } : t));
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  const deleteDocument = (tripId: string, docId: string) => {
    setTrips((prev) => {
      const updated = prev.map((t) => (t.id === tripId ? { ...t, documents: t.documents.filter((d) => d.id !== docId), updatedAt: new Date().toISOString() } : t));
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  // Packing
  const togglePackingItem = (tripId: string, itemId: string) => {
    setTrips((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== tripId) return t;
        const newPack = t.packingList.map((p) => (p.id === itemId ? { ...p, packed: !p.packed } : p));
        return { ...t, packingList: newPack };
      });
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  const addPackingItem = (tripId: string, itemData: Omit<PackingItem, 'id' | 'packed'>) => {
    const newItem: PackingItem = {
      id: `pack-${Date.now()}`,
      packed: false,
      ...itemData,
    };
    setTrips((prev) => {
      const updated = prev.map((t) => (t.id === tripId ? { ...t, packingList: [...t.packingList, newItem] } : t));
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  const deletePackingItem = (tripId: string, itemId: string) => {
    setTrips((prev) => {
      const updated = prev.map((t) => (t.id === tripId ? { ...t, packingList: t.packingList.filter((p) => p.id !== itemId) } : t));
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  const savePackingTemplate = (title: string, style: string, items: { name: string; category: any; quantity?: number }[]) => {
    const newTemplate: PackingTemplate = {
      id: `template-${Date.now()}`,
      userId: user.id,
      title,
      name: title,
      style,
      category: style,
      items: items.map((i, idx) => ({ id: `tpl-i-${idx}`, ...i })),
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updatedTemplates = [newTemplate, ...packingTemplates];
    setPackingTemplates(updatedTemplates);
    setUser((prev) => ({ ...prev, savedPackingTemplates: updatedTemplates }));
    syncServer(trips, { ...user, savedPackingTemplates: updatedTemplates }, updatedTemplates);
  };

  const saveAsPackingTemplate = (title: string, items: any[], style?: string) => {
    savePackingTemplate(title, style || 'General', items);
  };

  const applyPackingTemplate = (tripId: string, templateId: string) => {
    const template = packingTemplates.find((tp) => tp.id === templateId);
    if (!template) return;

    setTrips((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== tripId) return t;
        const newItems: PackingItem[] = template.items.map((item) => ({
          id: `pack-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: item.name,
          category: item.category,
          packed: false,
          quantity: item.quantity || 1,
        }));
        return { ...t, packingList: [...t.packingList, ...newItems] };
      });
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  // Visited Memory & Journal
  const addVisitedPlace = (placeData: Omit<VisitedPlace, 'id'>) => {
    const newPlace: VisitedPlace = {
      id: `vp-${Date.now()}`,
      ...placeData,
    };
    setUser((prev) => {
      const updated = { ...prev, visitedPlaces: [newPlace, ...prev.visitedPlaces] };
      syncServer(trips, updated, packingTemplates);
      return updated;
    });
  };

  const removeVisitedPlace = (id: string) => {
    setUser((prev) => {
      const updated = { ...prev, visitedPlaces: prev.visitedPlaces.filter((p) => p.id !== id) };
      syncServer(trips, updated, packingTemplates);
      return updated;
    });
  };

  const completeTripAndSaveMemories = (
    tripId: string,
    memoriesWithRatings: { placeName: string; city: string; country: string; rating: number; memory: string; category?: any }[]
  ) => {
    const targetTrip = trips.find((t) => t.id === tripId);
    if (!targetTrip) return;

    // Build visited places
    const newVisited: VisitedPlace[] = memoriesWithRatings.map((m) => ({
      id: `vp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: m.placeName,
      city: m.city,
      country: m.country,
      tripId,
      tripTitle: targetTrip.title,
      rating: m.rating,
      memory: m.memory,
      userNotes: m.memory,
      visitDate: targetTrip.endDate,
      dateVisited: targetTrip.endDate,
      category: m.category || 'sightseeing',
    }));

    // Update trip status to completed
    const updatedTrips = trips.map((t) => (t.id === tripId ? { ...t, status: 'completed' as const } : t));
    setTrips(updatedTrips);

    // Update user visited places memory
    const updatedUser = {
      ...user,
      visitedPlaces: [...newVisited, ...user.visitedPlaces],
    };
    setUser(updatedUser);

    syncServer(updatedTrips, updatedUser, packingTemplates);
  };

  // Collaboration
  const addCollaborator = (tripId: string, collaboratorData: Omit<Collaborator, 'id' | 'joinedAt'>) => {
    const newCollab: Collaborator = {
      id: `collab-${Date.now()}`,
      joinedAt: new Date().toISOString(),
      ...collaboratorData,
    };
    setTrips((prev) => {
      const updated = prev.map((t) => (t.id === tripId ? { ...t, collaborators: [...t.collaborators, newCollab] } : t));
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  const addSuggestion = (tripId: string, sugData: Partial<Suggestion>) => {
    const newSug: Suggestion = {
      id: `sug-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      author: sugData.authorName || user.name,
      authorName: sugData.authorName || user.name,
      authorAvatar: sugData.authorAvatar || user.avatar,
      title: sugData.title || 'New Stop Suggestion',
      content: sugData.description || sugData.content || '',
      description: sugData.description || '',
      dayNumber: sugData.dayNumber || 1,
      estCost: sugData.estCost || 25,
      ...sugData,
    };
    setTrips((prev) => {
      const updated = prev.map((t) => (t.id === tripId ? { ...t, suggestions: [newSug, ...t.suggestions] } : t));
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  const approveSuggestion = (tripId: string, sugId: string) => {
    setTrips((prev) => {
      const targetTrip = prev.find((t) => t.id === tripId);
      if (!targetTrip) return prev;

      const sug = targetTrip.suggestions.find((s) => s.id === sugId);
      if (!sug) return prev;

      let newDays = [...targetTrip.days];
      const targetDay = newDays.find((d) => d.dayNumber === sug.dayNumber) || newDays[0];

      if (targetDay) {
        const newAct: Activity = {
          id: `act-${Date.now()}`,
          dayId: targetDay.id,
          orderIndex: targetDay.activities.length,
          timeBlock: 'afternoon',
          time: '02:30 PM',
          name: sug.title || sug.content || 'Suggested Activity',
          location: targetDay.destination,
          category: 'sightseeing',
          estCost: sug.estCost || 25,
          reason: `Approved suggestion from ${sug.authorName || 'Travel Companion'}: ${sug.description || ''}`,
          notes: sug.description,
        };
        newDays = newDays.map((d) => (d.id === targetDay.id ? { ...d, activities: [...d.activities, newAct] } : d));
      }

      const updated = prev.map((t) => {
        if (t.id !== tripId) return t;
        return {
          ...t,
          days: newDays,
          suggestions: t.suggestions.map((s) => (s.id === sugId ? { ...s, status: 'approved' as const } : s)),
        };
      });
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  const rejectSuggestion = (tripId: string, sugId: string) => {
    setTrips((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== tripId) return t;
        return {
          ...t,
          suggestions: t.suggestions.map((s) => (s.id === sugId ? { ...s, status: 'declined' as const } : s)),
        };
      });
      syncServer(updated, user, packingTemplates);
      return updated;
    });
  };

  // --------------------------------------------------------------------------
  // AI Endpoints
  // --------------------------------------------------------------------------

  const generateFullItinerary = async (wizardInput: {
    title: string;
    destinations: { city: string; country: string; days?: number }[];
    startDate: string;
    endDate: string;
    travelerCount: number;
    budget: number;
    styleTags: any[];
    customNotes?: string;
  }): Promise<Trip> => {
    setIsLoading(true);
    setAiLoadingMessage('Connecting to Gemini 3.7 Flash: Curating fresh stops and checking visited places...');

    try {
      const res = await fetch('/api/gemini/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...wizardInput,
          visitedPlaces: user.visitedPlaces,
        }),
      });

      const json = await res.json();
      if (!json.success || !json.data || !json.data.days) {
        throw new Error(json.error || 'Invalid itinerary structure returned by AI');
      }

      setAiLoadingMessage('Structuring day-by-day blocks and calculating route times...');

      const generatedDays = json.data.days.map((dayItem: any, dayIdx: number) => {
        const dayId = `day-${Date.now()}-${dayIdx + 1}`;
        const activities: Activity[] = (dayItem.activities || []).map((act: any, actIdx: number) => ({
          id: `act-${Date.now()}-${dayIdx}-${actIdx}`,
          dayId,
          timeBlock: act.timeBlock || (actIdx === 0 ? 'morning' : actIdx === 1 ? 'afternoon' : 'evening'),
          time: act.time || (actIdx === 0 ? '09:30 AM' : actIdx === 1 ? '02:00 PM' : '07:00 PM'),
          name: act.name || 'Local Landmark',
          location: act.location || dayItem.destination || wizardInput.destinations[0]?.city,
          category: (act.category?.toLowerCase() as any) || 'sightseeing',
          estCost: typeof act.estCost === 'number' ? act.estCost : 25,
          reason: act.reason || 'Curated match for your travel style',
          travelTimeToNext: act.travelTimeToNext || '15 min walk',
          distanceToNext: act.distanceToNext || '1.0 km',
          notes: act.notes || '',
          lat: act.lat || (wizardInput.destinations[0]?.city === 'Tokyo' ? 35.6762 : 48.8566),
          lng: act.lng || (wizardInput.destinations[0]?.city === 'Tokyo' ? 139.6503 : 2.3522),
          orderIndex: actIdx,
        }));

        return {
          id: dayId,
          tripId: '',
          dayNumber: dayItem.dayNumber || dayIdx + 1,
          date: dayItem.date || wizardInput.startDate,
          title: dayItem.title || `Day ${dayIdx + 1}: Exploration`,
          destination: dayItem.destination || `${wizardInput.destinations[0]?.city}, ${wizardInput.destinations[0]?.country}`,
          activities,
        };
      });

      const paletteIndex = trips.length % TRIP_PALETTE.length;
      const assignedColor = TRIP_PALETTE[paletteIndex];

      const newTrip: Trip = {
        id: `trip-${Date.now()}`,
        userId: user.id,
        ownerId: user.id,
        title: wizardInput.title || `${wizardInput.destinations.map((d) => d.city).join(' & ')} Journey`,
        destinations: wizardInput.destinations,
        startDate: wizardInput.startDate,
        endDate: wizardInput.endDate,
        budget: wizardInput.budget,
        styleTags: wizardInput.styleTags,
        status: 'upcoming',
        color: assignedColor,
        coverImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
        collaborators: [
          {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: 'owner',
            joinedAt: new Date().toISOString(),
          },
        ],
        suggestions: [],
        days: generatedDays.map((d) => ({ ...d, tripId: `trip-${Date.now()}` })),
        documents: [],
        packingList: [],
        expenses: [],
        journalSummary: '',
        isShared: false,
        shareToken: `trip-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTrips((prev) => {
        const updated = [newTrip, ...prev];
        syncServer(updated, user, packingTemplates);
        return updated;
      });

      return newTrip;
    } catch (err: any) {
      console.error('Gemini itinerary generation failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
      setAiLoadingMessage(null);
    }
  };

  const regenerateDayAI = async (tripId: string, dayNumber: number, focusPrompt?: string) => {
    setIsLoading(true);
    setAiLoadingMessage(`Regenerating Day ${dayNumber} with Gemini 3.7 Flash in context of surrounding days...`);

    try {
      const targetTrip = trips.find((t) => t.id === tripId);
      if (!targetTrip) throw new Error('Trip not found');

      const targetDayIndex = targetTrip.days.findIndex((d) => d.dayNumber === dayNumber);
      if (targetDayIndex === -1) throw new Error('Day not found');

      const targetDay = targetTrip.days[targetDayIndex];
      const previousDay = targetDayIndex > 0 ? targetTrip.days[targetDayIndex - 1] : null;
      const nextDay = targetDayIndex < targetTrip.days.length - 1 ? targetTrip.days[targetDayIndex + 1] : null;

      const res = await fetch('/api/gemini/regenerate-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripTitle: targetTrip.title,
          destination: targetDay.destination,
          dayNumber: targetDay.dayNumber,
          date: targetDay.date,
          styleTags: targetTrip.styleTags,
          previousDaySummary: previousDay ? `${previousDay.title}: ${previousDay.activities.map((a) => a.name).join(', ')}` : 'None',
          nextDaySummary: nextDay ? `${nextDay.title}: ${nextDay.activities.map((a) => a.name).join(', ')}` : 'None',
          visitedPlaces: user.visitedPlaces,
          focusPrompt,
        }),
      });

      const json = await res.json();
      if (!json.success || !json.data || !json.data.activities) {
        throw new Error(json.error || 'Failed to regenerate day');
      }

      const refreshedActivities: Activity[] = json.data.activities.map((act: any, idx: number) => ({
        id: `act-${Date.now()}-${idx}`,
        dayId: targetDay.id,
        timeBlock: act.timeBlock || (idx === 0 ? 'morning' : actIdxFallback(idx)),
        time: act.time || (idx === 0 ? '09:30 AM' : idx === 1 ? '02:00 PM' : '07:30 PM'),
        name: act.name || 'Exciting Venue',
        location: act.location || targetDay.destination,
        category: (act.category?.toLowerCase() as any) || 'sightseeing',
        estCost: typeof act.estCost === 'number' ? act.estCost : 30,
        reason: act.reason || 'Harmonized with adjacent day schedule',
        travelTimeToNext: act.travelTimeToNext || '15 min walk',
        distanceToNext: act.distanceToNext || '1.1 km',
        notes: act.notes || '',
        lat: act.lat || targetDay.activities[0]?.lat || 35.6762,
        lng: act.lng || targetDay.activities[0]?.lng || 139.6503,
        orderIndex: idx,
      }));

      setTrips((prev) => {
        const updated = prev.map((t) => {
          if (t.id !== tripId) return t;
          const newDays = t.days.map((d) => {
            if (d.id !== targetDay.id) return d;
            return {
              ...d,
              title: json.data.title || d.title,
              activities: refreshedActivities,
            };
          });
          return { ...t, days: newDays, updatedAt: new Date().toISOString() };
        });
        syncServer(updated, user, packingTemplates);
        return updated;
      });
    } catch (err: any) {
      console.error('Failed to regenerate day with AI:', err);
      throw err;
    } finally {
      setIsLoading(false);
      setAiLoadingMessage(null);
    }
  };

  const actIdxFallback = (idx: number) => (idx === 1 ? 'afternoon' : 'evening');

  const generatePackingListAI = async (tripId: string) => {
    setIsLoading(true);
    setAiLoadingMessage('Gemini AI analyzing destination climate, season, and travel style...');

    try {
      const targetTrip = trips.find((t) => t.id === tripId);
      if (!targetTrip) throw new Error('Trip not found');

      const durationDays = targetTrip.days.length || 5;

      const res = await fetch('/api/gemini/generate-packing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinations: targetTrip.destinations,
          startDate: targetTrip.startDate,
          durationDays,
          styleTags: targetTrip.styleTags,
        }),
      });

      const json = await res.json();
      if (!json.success || !json.data || !json.data.items) {
        throw new Error(json.error || 'Failed to generate packing list');
      }

      const newPackingItems: PackingItem[] = json.data.items.map((item: any) => ({
        id: `pack-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: item.name,
        category: (item.category?.toLowerCase() as any) || 'essentials',
        packed: false,
        quantity: item.quantity || 1,
      }));

      setTrips((prev) => {
        const updated = prev.map((t) => (t.id === tripId ? { ...t, packingList: newPackingItems, updatedAt: new Date().toISOString() } : t));
        syncServer(updated, user, packingTemplates);
        return updated;
      });
    } catch (err: any) {
      console.error('Error generating packing list with AI:', err);
      throw err;
    } finally {
      setIsLoading(false);
      setAiLoadingMessage(null);
    }
  };

  const summarizeJournalAI = async (tripId: string, customNotes?: string): Promise<string> => {
    setIsLoading(true);
    setAiLoadingMessage('Gemini crafting editorial travel summary from your ratings & memories...');

    try {
      const targetTrip = trips.find((t) => t.id === tripId);
      if (!targetTrip) throw new Error('Trip not found');

      const visitedPlacesWithMemories: any[] = [];
      targetTrip.days.forEach((d) => {
        d.activities.forEach((a) => {
          if (a.completed || a.rating || a.memoryNote) {
            visitedPlacesWithMemories.push({
              name: a.name,
              city: d.destination,
              rating: a.rating || 5,
              memory: a.memoryNote || a.reason,
            });
          }
        });
      });

      const res = await fetch('/api/gemini/summarize-journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripTitle: targetTrip.title,
          destinations: targetTrip.destinations,
          visitedPlacesWithMemories,
          userNotes: customNotes || targetTrip.notes,
        }),
      });

      const json = await res.json();
      if (!json.success || !json.data || !json.data.summaryParagraph) {
        throw new Error(json.error || 'Failed to craft journal summary');
      }

      const summaryText = json.data.summaryParagraph;

      setTrips((prev) => {
        const updated = prev.map((t) => (t.id === tripId ? { ...t, journalSummary: summaryText, updatedAt: new Date().toISOString() } : t));
        syncServer(updated, user, packingTemplates);
        return updated;
      });

      return summaryText;
    } catch (err: any) {
      console.error('Error in journal summary AI:', err);
      throw err;
    } finally {
      setIsLoading(false);
      setAiLoadingMessage(null);
    }
  };

  // --------------------------------------------------------------------------
  // Currency & Google Drive Sync
  // --------------------------------------------------------------------------

  const baseCurrency = user.currency || 'USD';

  const setBaseCurrency = (currency: string) => {
    setUser((prev) => {
      const updated = { ...prev, currency };
      syncServer(trips, updated, packingTemplates);
      return updated;
    });
  };

  const connectGoogleUser = (googleUser: any) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        googleUser,
        googleDriveConnected: true,
        driveFolderId: `trip-vault-${Date.now()}`,
        name: googleUser.name || prev.name,
        email: googleUser.email || prev.email,
        avatar: googleUser.picture || prev.avatar,
      };
      syncServer(trips, updated, packingTemplates);
      return updated;
    });
  };

  const disconnectGoogleUser = () => {
    setUser((prev) => {
      const updated = {
        ...prev,
        googleUser: null,
        googleDriveConnected: false,
        driveFolderId: undefined,
      };
      syncServer(trips, updated, packingTemplates);
      return updated;
    });
  };

  const toggleGoogleDriveSync = (enabled: boolean) => {
    setUser((prev) => {
      const updated = { ...prev, googleDriveConnected: enabled, autoSyncPhotosToDrive: enabled };
      syncServer(trips, updated, packingTemplates);
      return updated;
    });
  };

  // --------------------------------------------------------------------------
  // Instant Natural Prompt to Full Journey (Gemini 3.7 Flash)
  // --------------------------------------------------------------------------
  const promptToJourneyAI = async (promptText: string): Promise<Trip> => {
    setIsLoading(true);
    setAiLoadingMessage('Gemini AI parsing your travel prompt, finding destinations, and planning days...');

    try {
      const res = await fetch('/api/gemini/prompt-to-journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          currency: baseCurrency,
          visitedPlaces: user.visitedPlaces,
        }),
      });

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Failed to generate journey from prompt');
      }

      const generatedData = json.data;
      const paletteIndex = trips.length % TRIP_PALETTE.length;
      const assignedColor = TRIP_PALETTE[paletteIndex];
      const tripId = `trip-${Date.now()}`;

      const generatedDays = (generatedData.days || []).map((dayItem: any, dayIdx: number) => {
        const dayId = `day-${Date.now()}-${dayIdx + 1}`;
        const activities: Activity[] = (dayItem.activities || []).map((act: any, actIdx: number) => ({
          id: `act-${Date.now()}-${dayIdx}-${actIdx}`,
          dayId,
          timeBlock: act.timeBlock || (actIdx === 0 ? 'morning' : actIdx === 1 ? 'afternoon' : 'evening'),
          time: act.time || (actIdx === 0 ? '09:30 AM' : actIdx === 1 ? '02:00 PM' : '07:30 PM'),
          name: act.name || 'Top Recommendation',
          location: act.location || dayItem.destination || 'City Center',
          category: (act.category?.toLowerCase() as any) || 'sightseeing',
          estCost: typeof act.estCost === 'number' ? act.estCost : 30,
          reason: act.reason || 'Curated match for your prompt',
          travelTimeToNext: act.travelTimeToNext || '15 min',
          distanceToNext: act.distanceToNext || '1.0 km',
          notes: act.notes || '',
          lat: act.lat || 35.6762,
          lng: act.lng || 139.6503,
          orderIndex: actIdx,
        }));

        return {
          id: dayId,
          tripId,
          dayNumber: dayItem.dayNumber || dayIdx + 1,
          date: dayItem.date || generatedData.startDate,
          title: dayItem.title || `Day ${dayIdx + 1}: Adventure`,
          destination: dayItem.destination || generatedData.destinations?.[0]?.city || 'Explore',
          activities,
        };
      });

      const newTrip: Trip = {
        id: tripId,
        userId: user.id,
        ownerId: user.id,
        title: generatedData.title || 'AI Curated Journey',
        destinations: generatedData.destinations || [{ city: 'Tokyo', country: 'Japan' }],
        startDate: generatedData.startDate || new Date().toISOString().split('T')[0],
        endDate: generatedData.endDate || new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
        budget: generatedData.budget || 2500,
        styleTags: generatedData.styleTags || ['adventure', 'cultural'],
        status: 'upcoming',
        color: assignedColor,
        coverImage:
          generatedData.coverImage ||
          'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
        collaborators: [
          {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: 'owner',
            joinedAt: new Date().toISOString(),
          },
        ],
        suggestions: [],
        days: generatedDays,
        documents: [],
        packingList: [],
        expenses: [],
        journalSummary: generatedData.summary || '',
        isShared: false,
        shareToken: `trip-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTrips((prev) => {
        const updated = [newTrip, ...prev];
        syncServer(updated, user, packingTemplates);
        return updated;
      });

      return newTrip;
    } catch (err: any) {
      console.error('Prompt to journey failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
      setAiLoadingMessage(null);
    }
  };

  // --------------------------------------------------------------------------
  // Multimodal Booking Screenshot Analyzer
  // --------------------------------------------------------------------------
  const scanBookingScreenshotAI = async (
    imageBase64: string,
    targetTripId?: string,
    autoRecordExpense: boolean = true
  ): Promise<BookingDocument> => {
    setIsLoading(true);
    setAiLoadingMessage('Gemini Multimodal AI analyzing booking screenshot, extracting ticket PNR & dates...');

    try {
      const res = await fetch('/api/gemini/analyze-booking-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Failed to parse booking screenshot');
      }

      const extracted = json.data;
      const tripToUse = targetTripId || activeTripId || trips[0]?.id;

      const newDoc: BookingDocument = {
        id: `doc-${Date.now()}`,
        tripId: tripToUse,
        type: (extracted.type as any) || 'flight',
        provider: extracted.provider || 'MakeMyTrip',
        title: extracted.title || 'Travel Booking',
        confirmationCode: extracted.confirmationCode || 'CONFIRMED',
        date: extracted.date || new Date().toISOString().split('T')[0],
        time: extracted.time || '',
        location: extracted.location || '',
        seatOrRoom: extracted.seatOrRoom || '',
        cost: extracted.cost || 0,
        notes: extracted.notes || '',
        attachmentName: 'Screenshot Scan',
        fileUrl: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
      };

      // Add to documents of the target trip
      if (tripToUse) {
        setTrips((prev) => {
          const updated = prev.map((t) => {
            if (t.id !== tripToUse) return t;

            let updatedExpenses = t.expenses;
            if (autoRecordExpense && extracted.cost && extracted.cost > 0) {
              const newExp: Expense = {
                id: `exp-${Date.now()}`,
                tripId: tripToUse,
                category: (extracted.expenseCategory as any) || 'flights',
                amount: extracted.cost,
                description: `${extracted.provider || 'Booking'}: ${extracted.title}`,
                note: `Auto-extracted from booking confirmation (${extracted.confirmationCode})`,
                date: extracted.date || new Date().toISOString().split('T')[0],
                paymentMethod: 'Prepaid Booking',
              };
              updatedExpenses = [newExp, ...t.expenses];
            }

            return {
              ...t,
              documents: [...t.documents, newDoc],
              expenses: updatedExpenses,
              updatedAt: new Date().toISOString(),
            };
          });

          syncServer(updated, user, packingTemplates);
          return updated;
        });
      }

      return newDoc;
    } catch (err: any) {
      console.error('Failed to scan booking screenshot:', err);
      throw err;
    } finally {
      setIsLoading(false);
      setAiLoadingMessage(null);
    }
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        user,
        activeScreen,
        activeTripId,
        activeTrip,
        activeTab,
        activeTripTab: activeTab,
        isLoading,
        aiLoadingMessage,
        baseCurrency,
        setBaseCurrency,
        connectGoogleUser,
        disconnectGoogleUser,
        toggleGoogleDriveSync,
        setActiveScreen,
        setActiveTripId,
        setActiveTab,
        setActiveTripTab: setActiveTab,
        openTrip,
        createTrip,
        updateTrip,
        updateTripDetails: updateTrip,
        deleteTrip,
        addActivity,
        updateActivity,
        deleteActivity,
        reorderActivities,
        moveActivity,
        addExpense,
        deleteExpense,
        addDocument,
        deleteDocument,
        togglePackingItem,
        addPackingItem,
        deletePackingItem,
        packingTemplates,
        savePackingTemplate,
        saveAsPackingTemplate,
        applyPackingTemplate,
        addVisitedPlace,
        recordVisitedPlace: addVisitedPlace,
        removeVisitedPlace,
        deleteVisitedPlace: removeVisitedPlace,
        completeTripAndSaveMemories,
        addCollaborator,
        addSuggestion,
        approveSuggestion,
        rejectSuggestion,
        declineSuggestion: rejectSuggestion,
        generateFullItinerary,
        promptToJourneyAI,
        scanBookingScreenshotAI,
        regenerateDayAI,
        generatePackingListAI,
        summarizeJournalAI,
        generateJournalSummaryAI: summarizeJournalAI,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
