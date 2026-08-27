# TripLink - Connected Multi-Trip Journey Intelligence

TripLink is a travel planning platform that unites itinerary design, cross-trip memory deduplication, live device GPS geofencing, real-time multi-currency exchange rates, 1-click calendar sync, and offline persistence.

---

## 🌟 Key Features

### 1. 🤖 Gemini AI Journey Architect (`gemini-3.7-flash`)
* **Prompt-to-Journey Generator**: Turn any natural language prompt (e.g., *"7-day cultural immersion in Kyoto and Tokyo for $3,500"*) into a structured, day-by-day itinerary with verified coordinates, timing, category tags, and estimated expenses.
* **Visited Memory Deduplication**: TripLink queries your personal **Visited Memory Vault** before generating new plans, ensuring places you've already experienced are never redundantly suggested.
* **Single-Day AI Regenerator**: Reroll individual morning, afternoon, or evening blocks with customizable themes without disrupting surrounding days.
* **Multimodal Booking & Receipt Scanner**: Upload flight tickets, boarding passes, train bookings (e.g. JR Pass, IRCTC), or hotel reservations (MakeMyTrip, Booking.com, Airbnb). Gemini extracts confirmation codes, flight numbers, check-in times, and costs automatically.
* **Editorial Journal Narrator**: Generates magazine-quality travel stories and reflections from your rated spots, captured memories, and notes.

---

### 2. 📡 Real-Time GPS Radar & Geofencing Proximity Engine
* **Device GPS Tracking**: Uses `navigator.geolocation` with high-accuracy position streaming.
* **Haversine Proximity Calculation**: Dynamically measures the exact distance in meters and kilometers from your live position to upcoming itinerary stops.
* **Smart Proximity Alerts**: Automatically triggers visual badges and notifications when you are within **500 meters** of your next scheduled stop or activity.
* **Interactive Geolocation Simulator**: Test geofence triggers directly in development or web previews by simulating your location near Tokyo Tower, Senso-ji, or custom coordinates.

---

### 3. 💾 Offline Mode & IndexedDB Storage Vault
* **Complete Offline Availability**: Every trip, packing checklist, route coordinate, and expense entry is automatically mirrored into a client-side **IndexedDB database** (`TripLink_OfflineDB`).
* **Instant Fallback**: If network connectivity drops (`window.addEventListener('offline')`), the app seamlessly serves cached data without disruption.
* **Backup & Restore Engine**: Export entire trip collections to portable `.json` backup files and restore them anytime with single-click validation.

---

### 4. 💱 Live Forex Exchange Rates & Multi-Currency Engine
* **Real-Time FX Rates**: Connects to global foreign exchange rates (with offline fallback cache) supporting major currencies: `USD`, `EUR`, `GBP`, `JPY`, `INR`, `AUD`, `CAD`, `CHF`, `SGD`, `AED`, `THB`, and more.
* **Instant Currency Switching**: Seamlessly re-denominate your trip budgets, expenses, and analytics with real-time conversion across the whole app.
* **Built-In Currency Converter Tool**: Quick interactive calculator in the navigation bar to convert amounts on the fly while traveling.

---

### 5. 📅 1-Click Calendar Synchronization
* **Universal `.ics` Export (RFC 5545)**: Export your entire trip or selected day activities into a standardized iCalendar file compatible with **Apple Calendar**, **Microsoft Outlook**, and other calendar clients.
* **Direct Google Calendar Deep Linking**: Generate direct Google Calendar event creation links with pre-filled event titles, start/end timestamps, exact venue addresses, and activity descriptions.

---

### 6. 🗺️ Interactive Route Mapping
* **Leaflet Vector Maps**: Clean interactive maps displaying day-by-day sequenced route paths, pin clusters, category badges, and transit route arcs between destinations.

---

### 7. 💰 Expense Tracking & Split-Bill Engine
* **Categorized Expenses**: Log flights, lodging, food, transit, activities, and shopping with multi-currency conversion.
* **Expense Breakdown Analytics**: Visual category percentages, budget consumption progress bars, and over-budget warnings.
* **Split-Bill Settlement Calculator**: Calculate who owes whom across travel party members to settle shared expenses.

---

### 8. 🧳 Smart Packing Library & Templates
* **Climate & Activity Aware Checklist**: Categorized by clothing, toiletries, electronics, documents, essentials, and gear.
* **Reusable Templates**: Save custom packing templates (e.g. *Tropical Beach*, *Winter Alpine*, *Backpacking Trek*) and apply them across multiple trips.

---

### 9. 👥 Travel Party Collaboration
* **Collaborator Roles**: Manage travel companions with `owner`, `editor`, and `viewer` permission levels.
* **Invite Codes**: Share 6-character trip join codes with friends and family.

---

### 10. 📱 Mobile & PWA Ready
* Fully responsive layout optimized for mobile screens (touch targets ≥44px, sticky action sheets, collapsible navigation).
* PWA web manifest support and Android APK build configurations via Capacitor.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Motion |
| **Icons & Maps** | Lucide React, Leaflet, Canvas Confetti |
| **Backend & API** | Node.js, Express, Vite Middleware Mode |
| **AI Model** | Google Gemini 3.7 Flash (`@google/genai` SDK) |
| **Storage** | Server-side JSON persistence (`/.data/store.json`) + Client-side IndexedDB |
| **Build Tool** | Vite, esbuild, TypeScript compiler (`tsc`) |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or later
* **npm** or **bun** / **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/triplink.git
cd triplink
```

### 2. Configure Environment Variables
Create a local `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Add your Gemini API key to `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> 🔒 **Security Notice**: Never commit `.env` or any secret keys to GitHub. The `.gitignore` file is pre-configured to exclude all `.env*` files except `.env.example`.

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 📦 Production Build

To build the application and compile the backend server bundle:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

---

## 📁 Project Structure

```
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules for node_modules, dist, and secrets
├── metadata.json             # AI Studio applet metadata & permissions
├── package.json              # Project dependencies and build scripts
├── server.ts                 # Express backend with Gemini AI endpoints & Vite integration
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration with Tailwind CSS v4 plugin
├── public/                   # Static assets & PWA manifest
└── src/
    ├── main.tsx              # React entry point
    ├── App.tsx               # Root application router & view switcher
    ├── index.css             # Global Tailwind CSS styles
    ├── types.ts              # Global TypeScript interfaces and models
    ├── context/
    │   └── TripContext.tsx   # Global state management with storage sync
    ├── data/
    │   ├── currencies.ts     # Multi-currency definitions & formatting helpers
    │   └── initialData.ts   # Sample itineraries, packing templates, and default state
    ├── utils/
    │   ├── offlineStorage.ts # IndexedDB engine for offline storage & backup export
    │   ├── geofencing.ts     # Device GPS tracking, Haversine math, & simulator
    │   ├── exchangeRates.ts  # Real-time Forex rates fetching & conversion
    │   └── calendarSync.ts   # RFC 5545 .ics generator & Google Calendar links
    └── components/
        ├── Navbar.tsx                   # Top navigation with currency & offline controls
        ├── Dashboard.tsx                # Main trip overview, filter tabs, & quick tools
        ├── TripDetailView.tsx           # Comprehensive trip manager with tab navigation
        ├── ItineraryEditor.tsx          # Interactive day-by-day planner & AI regenerator
        ├── MapView.tsx                  # Leaflet vector map with route visualization
        ├── GeofenceProximityBanner.tsx  # Live GPS radar & distance alerts
        ├── OfflineManagerModal.tsx      # IndexedDB vault status & JSON backup exporter
        ├── LiveCurrencyConverterModal.tsx # Multi-currency exchange rate calculator
        ├── CalendarSyncModal.tsx        # iCal (.ics) export & Google Calendar sync
        ├── BudgetTracker.tsx            # Expense manager & split-bill calculator
        ├── PackingList.tsx              # Dynamic checklist with AI packing assistant
        ├── PackingTemplatesHub.tsx      # Library of reusable packing checklists
        ├── VisitedMemoryHub.tsx         # Visited places vault for AI deduplication
        ├── CrossTripAnalytics.tsx       # Multi-trip spending and destination statistics
        ├── DocumentsBookings.tsx        # Ticket vault & AI document screenshot OCR
        ├── Collaboration.tsx            # Travel party permissions & invite codes
        ├── TripJournal.tsx              # Rated highlights & AI travel narrative writer
        ├── NewTripWizard.tsx            # AI prompt-to-journey & manual trip builder
        ├── VibeDiscoverySwipe.tsx       # Destination discovery swipe cards
        ├── GoogleAuthModal.tsx          # Account settings & cloud sync modal
        └── ApkInstallModal.tsx          # PWA & Android app installation instructions
```

---

## 🔒 Security & Privacy

* **Zero Hardcoded Secrets**: All AI interactions communicate through server-side endpoints in `server.ts`, keeping the `GEMINI_API_KEY` hidden from client browsers.
* **Local-First Privacy**: User trip plans, journal entries, and financial records remain stored in your local storage and private container database without external tracking.
* **Permissions**: Geolocation permissions (`navigator.geolocation`) are requested strictly on-demand for proximity radar features.

---

## 📄 License

This project is licensed under the MIT License.
