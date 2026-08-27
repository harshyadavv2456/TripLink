import { Trip, UserProfile, PackingTemplate, VisitedPlace } from '../types';

export const TRIP_PALETTE = [
  '#D4AF37', // Champagne Gold
  '#2A9D8F', // Mediterranean Teal
  '#3A86FF', // Aegean Blue
  '#E76F51', // Sunset Coral
  '#6B705C', // Olive Forest
  '#8338EC', // Alpine Violet
  '#C8963E', // Amber Ochre
  '#457B9D', // Deep Steel
];

// Clean initial state: users add their own trips and places
export const INITIAL_VISITED_PLACES: VisitedPlace[] = [];

export const INITIAL_PACKING_TEMPLATES: PackingTemplate[] = [];

export const INITIAL_USER: UserProfile = {
  id: 'user-default',
  name: 'Harsh Yadav',
  email: 'harshyadavv2456@gmail.com',
  homeBase: 'San Francisco, CA',
  currency: 'USD',
  avatar: '',
  visitedPlaces: [],
  savedPackingTemplates: [],
};

export const INITIAL_TRIPS: Trip[] = [];
