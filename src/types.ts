export type TripStatus = 'draft' | 'upcoming' | 'active' | 'completed';

export type TripStyleTag =
  | 'relaxed'
  | 'packed'
  | 'adventure'
  | 'food-focused'
  | 'family'
  | 'cultural'
  | 'nature'
  | 'budget'
  | 'luxury'
  | 'romantic';

export type ActivityCategory =
  | 'food'
  | 'sightseeing'
  | 'adventure'
  | 'relaxation'
  | 'culture'
  | 'transport'
  | 'shopping'
  | 'nature'
  | 'nightlife';

export type TimeBlock = 'morning' | 'afternoon' | 'evening' | 'night';

export interface VisitedPlace {
  id: string;
  name: string;
  city: string;
  country: string;
  tripId?: string;
  tripTitle?: string;
  rating: number;
  memory?: string;
  userNotes?: string;
  photoUrl?: string;
  visitDate?: string;
  dateVisited?: string;
  category?: ActivityCategory;
  lat?: number;
  lng?: number;
}

export interface Activity {
  id: string;
  dayId: string;
  timeBlock: TimeBlock;
  time?: string;
  name: string;
  location: string;
  category: ActivityCategory;
  estCost: number;
  reason: string;
  travelTimeToNext?: string;
  distanceToNext?: string;
  notes?: string;
  lat?: number;
  lng?: number;
  orderIndex: number;
  completed?: boolean;
  memoryNote?: string;
  rating?: number;
}

export interface ItineraryDay {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  title: string;
  destination: string;
  activities: Activity[];
}

export interface Destination {
  city: string;
  country: string;
  days?: number;
  lat?: number;
  lng?: number;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt?: string;
}

export interface Suggestion {
  id: string;
  author?: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  type?: 'add_activity' | 'edit_activity' | 'general';
  title?: string;
  description?: string;
  content?: string;
  dayNumber?: number;
  estCost?: number;
  category?: string;
  status: 'pending' | 'approved' | 'declined' | 'rejected';
  createdAt: string;
  targetDayId?: string;
  targetActivityId?: string;
  activityData?: Partial<Activity>;
}

export type CollaboratorSuggestion = Suggestion;

export type BookingDocType =
  | 'flight'
  | 'hotel'
  | 'train'
  | 'car'
  | 'rental'
  | 'ticket'
  | 'activity'
  | 'insurance'
  | 'other';

export type DocumentType = BookingDocType;

export interface BookingDocument {
  id: string;
  tripId: string;
  dayId?: string;
  type: BookingDocType;
  provider: string;
  title: string;
  confirmationCode: string;
  date: string;
  time?: string;
  location?: string;
  seatOrRoom?: string;
  cost?: number;
  notes?: string;
  attachmentName?: string;
  fileUrl?: string;
}

export type DocumentItem = BookingDocument;

export type PackingCategory =
  | 'clothing'
  | 'toiletries'
  | 'electronics'
  | 'tech'
  | 'documents'
  | 'essentials'
  | 'gear';

export interface PackingItem {
  id: string;
  name: string;
  category: PackingCategory;
  packed: boolean;
  custom?: boolean;
  quantity?: number;
  isEssential?: boolean;
}

export interface PackingTemplate {
  id: string;
  userId?: string;
  name?: string;
  title?: string;
  style?: string;
  category?: string;
  items: { id?: string; name: string; category: PackingCategory; quantity?: number; packed?: boolean; isEssential?: boolean }[];
  createdAt: string;
}

export type ExpenseCategory =
  | 'stay'
  | 'lodging'
  | 'food'
  | 'transport'
  | 'transit'
  | 'flights'
  | 'activities'
  | 'shopping'
  | 'other';

export interface Expense {
  id: string;
  tripId: string;
  dayId?: string;
  category: ExpenseCategory;
  amount: number;
  note?: string;
  description?: string;
  date: string;
  paymentMethod?: string;
}

export interface Trip {
  id: string;
  userId: string;
  ownerId?: string;
  title: string;
  destinations: Destination[];
  startDate: string;
  endDate: string;
  budget: number;
  styleTags: TripStyleTag[];
  status: TripStatus;
  color: string;
  coverImage?: string;
  collaborators: Collaborator[];
  suggestions: Suggestion[];
  days: ItineraryDay[];
  documents: BookingDocument[];
  packingList: PackingItem[];
  expenses: Expense[];
  journalSummary?: string;
  notes?: string;
  isShared?: boolean;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'INR'
  | 'JPY'
  | 'AUD'
  | 'CAD'
  | 'SGD'
  | 'AED'
  | 'CHF'
  | 'THB';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToUSD: number; // 1 USD = rate units of this currency
}

export interface GoogleAuthUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  accessToken?: string;
  connectedAt?: string;
  driveFolderId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  homeBase: string;
  currency: CurrencyCode | string;
  avatar: string;
  visitedPlaces: VisitedPlace[];
  savedPackingTemplates: PackingTemplate[];
  googleUser?: GoogleAuthUser | null;
  googleDriveConnected?: boolean;
  driveFolderId?: string;
  autoSyncPhotosToDrive?: boolean;
}

export type ActiveScreen =
  | 'dashboard'
  | 'trip-detail'
  | 'new-trip-wizard'
  | 'cross-trip-analytics'
  | 'visited-memory-hub'
  | 'packing-templates'
  | 'vibe-discovery';

export type TripTab =
  | 'itinerary'
  | 'map'
  | 'discover'
  | 'budget'
  | 'packing'
  | 'documents'
  | 'collaborators'
  | 'collaboration'
  | 'journal';

export type TripScreenTab = TripTab;
