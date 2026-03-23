# FIFO FOOD TRACKER — PWA BUILD INSTRUCTIONS

## What This Is

A Progressive Web App (PWA) that serves as an offline-capable food inventory tracker using FIFO (First In, First Out) logic. It lives at `microprepared.com/fifo` and is gated behind a one-time access code delivered post-purchase via ThriveCart.

This replaces a Google Sheets spreadsheet product. The app must be simpler and faster than a spreadsheet, not more complex.

---

## Target Audience

American preppers and preparedness-minded families, age 35–60. Not developers. Not tech-savvy by default. The app must feel immediately obvious — zero learning curve. If it feels like "software," you've failed.

---

## Deployment

- **URL:** `microprepared.com/fifo`
- **Hosting:** Static files uploaded to existing web hosting (no Vercel, no Netlify, no server-side framework)
- **Output:** A self-contained folder of static files (HTML, CSS, JS, manifest, service worker, icons) that can be uploaded via FTP or file manager to the `/fifo` directory on the server
- **No build tools required in production** — if you use a build step (e.g. Vite), output a `/dist` folder that contains everything needed. The owner will upload the contents of `/dist` to their server.

---

## Tech Stack

- **Frontend:** HTML, CSS, vanilla JS or lightweight React (preact is fine). No heavy frameworks. Keep the bundle small — this needs to load fast on rural connections.
- **Data storage:** IndexedDB via a wrapper like `idb` or `Dexie.js`. All data stays on the user's device. No server, no database, no API calls after initial load.
- **Offline:** Service worker that caches all app assets on first visit. App must work fully offline after initial load. This is a core selling point — "works when the grid is down."
- **No backend.** No Node server. No database. No user accounts. No analytics. Pure static frontend.

---

## Access Gating

- On first visit to `/fifo`, user sees a simple access screen: a heading, one sentence of explanation, a text input for the access code, and a submit button.
- Valid access codes are hardcoded in the JS (the owner will update these periodically). Use a simple hash comparison — don't store codes in plaintext in the source. SHA-256 hash of the code compared against a list of valid hashes.
- Once a valid code is entered, store a flag in localStorage. User never sees the gate again on that device.
- If someone clears their browser data, they just re-enter the code. Not a problem.
- The gate screen should match the app's visual style — not look like a separate page.
- **Initial access codes to hash:** `FIFO2026`, `PREPREADY`, `FIRSTINFIRSTOUT`

---

## Visual Design

### Brand Alignment
This is part of the Micro Survival Series (MSS) brand. The visual style is:

- **Background:** White or off-white
- **Primary text:** Dark charcoal (#333333), not pure black
- **Accent colors used sparingly:**
  - Headers and primary actions: deep blue (#2C3E50)
  - Urgency/expiring soon: warm red (#C0392B)
  - Warning/expiring this month: amber (#E67E22)
  - Success/completed: green (#27AE60)
- **Typography:** Clean sans-serif (system font stack is fine: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`). Bold condensed for headers. Generous line height for readability.
- **Iconography:** Simple, flat, outline-style icons. No emoji in the UI (except sparingly in empty states). Use something lightweight like Lucide icons if needed.
- **Overall feel:** Serious, trusted, competent. Not playful. Not corporate. Think "well-organized neighbor who has their shit together."

### Layout
- Mobile-first design. Must work perfectly on a phone screen — users will add items from the pantry while standing in front of shelves.
- Desktop should look good but phone is the primary use case.
- No hamburger menus if avoidable. Use bottom tab navigation on mobile (Inventory / Eat This Week / Eat This Month).
- Large tap targets. Minimum 44px touch targets on all interactive elements.

---

## Core Features

### 1. Add Item (the main interaction)

This is the single most important screen. It must be fast and frictionless.

- A prominent "Add Item" button (always visible, floating action button on mobile)
- Tapping it opens a **modal/popup form** with these fields:
  - **Item Name** — text input, autofocus, required
  - **Category** — dropdown/select with these options: Canned Goods, Dry Goods, Grains & Pasta, Freeze-Dried, Water, Medical, Snacks & Bars, Condiments, Dairy, Frozen, Beverages, Other
  - **Quantity** — number input, default 1
  - **Date Stored** — date input, default today
  - **Expiration Date** — date input, required
- Display dates as **YY/MM/DD** throughout the entire app
- Two buttons at bottom of form:
  - **"Add Item"** — saves and clears form for next entry (form stays open)
  - **"Add & Close"** — saves and closes the modal
- After adding, show a brief toast notification: "✓ [Item name] added"
- Form stays open after "Add Item" for rapid-fire entry. Cursor returns to Item Name field.
- Enter key on the last field should trigger "Add Item"

### 2. Food Inventory (main tab)

- Full scrollable list of all food items, sorted by expiration date (soonest first)
- Each row shows: Item name, Category (small/subtle), Qty, Expiration date, Days until expiration
- **Color coding per row:**
  - Red/pink background: expires within 7 days
  - Yellow/amber background: expires within 30 days
  - No color: 30+ days out
  - Green background + gray text + strikethrough: marked as eaten
- Each row has a **checkbox** on the right side. Tapping it marks the item as eaten.
  - Eaten items move to the bottom of the list (or fade/collapse with a brief animation)
  - A "Show eaten items" / "Hide eaten items" toggle at the bottom
- Tapping a row (not the checkbox) opens an **edit modal** — same fields as Add, pre-filled with current values. Save or Delete buttons.
- A count at the top: "47 items · 6 expiring this week"

### 3. Eat This Week (second tab)

- Filtered view: only items expiring within 7 days, not marked as eaten
- Sorted by expiration date ascending (most urgent first)
- Each row shows: Item name, Category, Qty, Expiration date, Days left, Urgency label
- **Urgency labels:**
  - 0–1 days: "EAT NOW" (red, bold)
  - 2–3 days: "SOON" (orange)
  - 4–7 days: "THIS WEEK" (yellow)
- Checkbox to mark eaten directly from this view (updates the main inventory)
- If empty: friendly message like "Nothing expiring this week — you're in good shape."

### 4. Eat This Month (third tab)

- Filtered view: items expiring within 30 days, not marked as eaten
- Same layout as Eat This Week
- **Priority labels:**
  - 1–7 days: "THIS WEEK" (red)
  - 8–14 days: "NEXT 2 WEEKS" (orange)
  - 15–30 days: "THIS MONTH" (yellow)
- If empty: "Nothing expiring this month — well stocked."

### 5. Data Management

- **Export:** A button somewhere in settings/menu to export all data as CSV. Safety net in case they want a backup or switch devices.
- **Import:** Ability to import a CSV with the same column format. This lets people migrate from the spreadsheet version.
- **Clear All Data:** Behind a confirmation dialog ("This will permanently delete all items. Type DELETE to confirm."). Nuclear option, but people want to know it exists.

---

## Data Model

Each food item stored in IndexedDB:

```
{
  id: string (uuid),
  name: string,
  category: string,
  quantity: number,
  dateStored: string (ISO date),
  expirationDate: string (ISO date),
  eaten: boolean,
  eatenDate: string | null (ISO date, set when marked eaten),
  createdAt: string (ISO timestamp),
  updatedAt: string (ISO timestamp)
}
```

---

## Service Worker / Offline

- Cache all app assets (HTML, CSS, JS, icons, manifest) on first load
- Cache-first strategy for all app assets
- App must function 100% offline after first visit — adding items, marking eaten, switching tabs, everything
- On reconnect, no sync needed (all data is local only)

---

## PWA Manifest

```json
{
  "name": "FIFO Food Tracker",
  "short_name": "FIFO",
  "description": "Track your food storage. Eat what expires first.",
  "start_url": "/fifo/",
  "scope": "/fifo/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#2C3E50",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Generate simple, clean app icons — the letters "FIFO" in bold white on a #2C3E50 background. Or a simple pantry/shelf outline icon. Keep it minimal.

---

## What NOT to Build

- No user accounts or authentication (the access code is the only gate)
- No server-side anything
- No cloud sync
- No push notifications
- No sharing features
- No recipe suggestions
- No barcode scanning (future maybe, not v1)
- No complex reporting or charts
- No multi-language support (English only for now)

---

## File Structure (expected output)

```
/fifo
  index.html
  app.js (or bundled equivalent)
  styles.css (or bundled)
  sw.js (service worker)
  manifest.json
  icon-192.png
  icon-512.png
  offline.html (fallback, shouldn't be needed)
```

The entire app should be contained in this folder. Upload the folder contents to the `/fifo` directory on the web server and it works.

---

## Testing Checklist

Before considering the build complete:

- [ ] Access gate works — rejects bad codes, accepts valid codes, remembers on refresh
- [ ] Can add an item via the popup form
- [ ] Item appears in inventory sorted by expiration
- [ ] Can mark item as eaten via checkbox
- [ ] Eaten item disappears from Week/Month views
- [ ] Eat This Week only shows items expiring within 7 days
- [ ] Eat This Month only shows items expiring within 30 days
- [ ] Urgency/priority labels display correctly per row
- [ ] Color coding works (red, yellow, green, default)
- [ ] Can edit an existing item
- [ ] Can delete an item
- [ ] Dates display as YY/MM/DD everywhere
- [ ] Date stored defaults to today
- [ ] Quantity defaults to 1
- [ ] Add Item keeps form open, Add & Close closes it
- [ ] Works fully offline after first load
- [ ] Installable as PWA (Add to Home Screen prompt works)
- [ ] Mobile layout is usable and good-looking
- [ ] Desktop layout is clean
- [ ] Export CSV works
- [ ] Import CSV works
- [ ] Clear All Data works with confirmation
- [ ] Data persists across browser sessions (IndexedDB)
- [ ] No console errors
- [ ] Lighthouse PWA audit passes
