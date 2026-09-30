# AI Smart Parking App — Mobile Client (Phase 2)

An Expo / React Native mobile application for autonomous smart urban parking, featuring AI-assisted predictive spot availability, contactless bay reservations, digital gate access passes, and real-time occupancy monitoring.

---

## 🚀 Phase 2 Deliverables Overview

### 1. Onboarding & Welcome Flow
- **Interactive Value-Prop Slider**: Visual showcase of AI Predictive Availability, One-Tap Quick Reservations, and Contactless Gate Entry.
- **Key Metrics Display**: Highlights 85% search time saved, 94% AI accuracy score, and instant frictionless barrier clearance.
- **Flexible Navigation Paths**: Direct access to Sign Up, Log In, and a 1-tap "Explore as Guest" option.

### 2. Parking Locations & Live Availability (Phase 3)
- **Parking Locations Hub (`/(tabs)/search`)**:
  - Filter chips: `All`, `High Availability`, `Nearest (≤ 0.6 mi)`, `EV Charging`, `Covered`, and `Under $4/hr`.
  - Sorting toggles: `Distance`, `Price`, and `Available Slots`.
  - Location cards displaying: **Parking Name**, **Distance & Walk Time**, **Total Slots**, **Available Slots**, **Hourly Rate**, and dedicated **Availability Status** badges (`High Availability`, `Limited Slots`, `Nearly Full`).
- **Interactive Parking-Slot Layout (`SlotLayoutMap`)**:
  - Floor switcher with live available counts (`Level 1 (Ground)` and `Level 2 (Upper Deck)`).
  - Two-column visual layout with central driveway corridor, directional markers, and entrance guidance.
  - Visual status differentiation: Available (green free bay), Occupied (parked vehicle silhouette), Selected (electric blue with checkmark), EV Fast Charger, and Accessible stalls.
  - Interactive selection: Drivers can tap any open bay (e.g. `A-04`), inspect slot specifications, and lock that designated slot for reservation.
- **Parking Details Screen (`/reserve/[id]`)**:
  - Full facility amenities, 24/7 CCTV surveillance, gate entry rules, and AI availability confidence scoring.
  - Simulated navigation & turn-by-turn routing preview.
  - Quick reservation flow with exact slot assignment.

### 3. Slot Selection & Reservation Flow (Phase 4)
- **Interactive Slot Selection (`/reserve/[id]`)**:
  - Live visual parking-slot layout (`SlotLayoutMap`) showing multi-deck bays (`Level 1` & `Level 2`).
  - Clear visual status: **Available** (green free bay), **Occupied** (parked car silhouette), **Selected** (electric blue highlight with checkmark), **EV Charger**, and **Accessible** stalls.
  - Selected slot details card: Displays exact slot number (e.g. `A-03`), deck level, bay features, and hourly rate.
  - **Date, Time & Duration Scheduler**:
    - Arrival Date selector: *Today*, *Tomorrow*, *Upcoming Days*.
    - Arrival Time selector: *Now (Instant)*, *10:30 AM*, *01:00 PM*, *03:30 PM*, *05:30 PM*, etc.
    - Duration chips: *1 Hr*, *2 Hrs*, *3 Hrs*, *4 Hrs*, *All Day (8 Hrs)*.
    - Live estimated parking fee calculation (`hourlyRate x duration = $total`).
- **Reservation Summary Screen (`/booking/summary`)**:
  - Comprehensive review showing:
    - **Parking Location**: Facility name, address, distance, zone.
    - **Assigned Bay**: Slot number, deck level, bay type.
    - **Schedule**: Date, arrival time, duration, and complimentary 15-minute grace period.
    - **Recognized Vehicle**: License plate and vehicle model.
    - **Estimated Fee Breakdown**: Base parking rate, smart hold fee (`FREE Beta`), and total estimated price.
  - **"Confirm Reservation"** action button.
- **Booking Confirmation Screen (`/booking/confirmation`)**:
  - Celebratory confirmation screen displaying a unique **Booking ID** (e.g. `#BK-8924`).
  - **Digital Gate Access Pass**: High-resolution QR code pass with a **4-digit Gate Keypad PIN** (e.g. `4821`).
  - Interactive "Simulate Touchless Barrier Scan" trigger.
  - **Local Persistence**: Saves the reservation immediately into `AuthContext` state, making it viewable in My Bookings (`/(tabs)/bookings`) and on the Home dashboard.
  - Direct navigation to "View in My Bookings" and "Back to Home Dashboard".

### 4. Authentication Flow
- **Sign In (`/(auth)/login`)**: Email and password validation, password visibility toggles, and a dedicated **"Fill Demo Account"** button for fast testing.
- **Sign Up (`/(auth)/signup`)**: Comprehensive registration including driver name, email, vehicle license plate (for smart barrier recognition), and password confirmation.
- **Session State**: React Context-driven session handling via `AuthContext`, persisting the current driver profile across screens.

### 3. Home / Dashboard Screen (`/(tabs)/`)
- **App Header & Location**: Dynamic user greeting, current parking zone selector, and smart notification center.
- **Search & Filter Bar**: Instant text filter with quick chips for:
  - `Closest (≤ 0.5 mi)`
  - `EV Charging`
  - `Covered / Indoor`
  - `Under $4/hr`
- **Metrics Overview**: Real-time counter of available spaces across facilities, average hourly rate, and AI match percentage.
- **Active & Upcoming Bookings**: Live reservation cards displaying assigned slot (e.g. `B-14`), license plate, gate PIN, and direct digital QR pass inspection.
- **AI Parking Prediction Section**:
  - Neural availability probability score (e.g., 92% confidence)
  - Hourly availability bar forecast
  - Predictive reasoning and peak-hour surge warnings
- **Nearby Parking Facilities**: Detailed cards featuring live availability progress bars, pricing, walking time, distance, and AI occupancy trends.
- **Quick Reservation Sheet**: Allows 1-tap spot reservation with customizable duration (1h, 2h, 4h, Full Day), fee computation, and instant slot assignment.

### 4. Supporting Tabs & Navigation
- **Explore / Find Spots (`/(tabs)/search`)**: Simulated radar map pins and categorized facility listings.
- **Bookings Management (`/(tabs)/bookings`)**: Tabbed view of Active, Upcoming, and Historical sessions with cancellation capabilities.
- **Profile & Settings (`/(tabs)/profile`)**: Driver vehicle management, license plate info, AI automation toggles, and sign out flow.
- **Facility Details (`/reserve/[id]`)**: Deep-dive spot view with comprehensive amenities, security ratings, rules, and full reservation flow.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Expo SDK 57 / React Native 0.86 / React 19
- **Navigation**: Expo Router (File-based routing in `src/app/`)
- **State Management**: `AuthContext` (`src/context/AuthContext.tsx`)
- **Theme & Design Tokens**: `src/constants/theme.ts`
- **Typography & Icons**: `@expo/vector-icons` (Ionicons) and `expo-font`
- **Data Model**: Strict TypeScript interfaces in `src/types/parking.ts` and local mock feeds in `src/data/mockData.ts`

> **Note on Prototype Scope**: All AI predictions, sensor telemetry, and gate passes run on local mock data feeds to model user interactions. Real hardware (IoT barriers, camera feeds, GPS, and payment processing) will be linked in subsequent phases.

---

## 💻 Commands

```bash
# Start development server
npx expo start

# Type check
npx tsc --noEmit

# Diagnose Expo configuration & dependencies
npx expo-doctor
```