# Greenship NB 1.3 — LPD Calculator: Web App Documentation

> **Status:** Built & deployment-ready
> **Based on:** `Worksheet_Energy_EEC_1B_-_LPD_NB_1_3.xlsx` (sheets: Panduan + NB 1.3 - LPD)
> **Standard:** SNI 03-6197-2020, method: room-by-room (ruang demi ruang)
> **Design system:** GBC Indonesia identity, see `DESIGN.md`
> **Last updated:** November 2026

---

## 1. Excel Logic Reverse-Engineering

### 1.1 Three-Section Architecture

| Section | Excel Columns | Web App Equivalent |
|---|---|---|
| **A. Lighting Database** | B–F (rows 8–107) | Tab A — lamp CRUD table, auto L-codes |
| **B. Room & System Table** | H–X (rows 8–107) | Tab B — room rows with cascading dropdowns + unlimited lamp slots |
| **C. Results** | H–K (rows 112–116) | Tab C — live-computed metric cards + progress ring |

Hidden Excel columns AH–AU (intermediate watt calculations) are re-implemented as derived state computed on every render inside the calculation engine.

---

### 1.2 Section A — Lighting Database

**Columns:** `Code | Name | Manufacturer | Type | Power (watt) | Actions`

- Codes are auto-assigned sequentially: **L1, L2, L3 … Ln**
- Excel had 30 visible rows with hidden rows for more; the web app has no row cap — codes auto-increment
- Deleting a lamp resequences all codes and remaps room lamp references to the surviving codes
- If the lamp is currently selected in one or more rooms, deletion first opens a warning dialog that names the lamp and the number of room rows using it. The user can delete anyway or cancel.
- A lamp is considered **complete** when it has both a name and a power value greater than zero. Incomplete lamps stay visible in Table A but cannot be newly assigned to a room.

---

### 1.3 Section B — Room & Lighting System Table

**Columns:** `No | Room Name | Typology | Room Type | Area (m²) | Lamp Slots (unlimited) | Std LPD | Design LPD | Actions`

#### Cascading Dropdown Logic
- **Typology** filters the **Room Type** dropdown — selecting a new typology clears the room type
- **Room Type** is the whitelist-validated lookup key against the SNI database
- Both fields are validated against the embedded SNI constant on import

#### Lamp Slots (unlimited per room)
- Each slot: **Code** (dropdown from Section A) + **Points** (integer)
- The Excel allowed 6 lamps per room (columns A–F) with a duplicate-row workaround
- The web app natively supports **unlimited lamp slots** per room via dynamic add/remove
- Slot labels cycle A → B → C → … → L → 13, 14 …
- Only complete lamps can be newly selected. A lamp that is already assigned to the room remains selectable even if it later becomes incomplete, and is marked `(incomplete)` in the dropdown.

#### Per-room Derived Values (replaces hidden columns AH–AU)

| Derived | Formula | Where Shown |
|---|---|---|
| Std LPD | `SNI_DATABASE[typology].rooms.find(roomType).lpd` | Inline table column |
| Design LPD | `Σ(lamp_watts × points) / area` | Inline table column, amber if over baseline |
| Row highlight | `designLPD > stdLPD` | Amber background on over-baseline rows |

---

### 1.4 Section C — Results Formulas

```
Total Area (m²)  = Σ area_i   (complete rooms only)

LPD Baseline     = Σ(SNI_LPD_i × area_i) / Total_Area
                 → Area-weighted average of SNI standard LPDs

LPD Design       = Σ(Σ(watt_lamp_j × points_j) per room_i) / Total_Area
                 → Actual watts across all complete rooms divided by total area

% LPD Reduction  = (LPD_Baseline − LPD_Design) / LPD_Baseline × 100
```

A positive value means the design is more efficient than the SNI baseline. Negative means it exceeds the baseline (shown in amber).

#### Completeness rule

A room is **complete** only when the user has filled in all of:

1. room name,
2. typology,
3. room type,
4. area greater than zero, and
5. at least one selected lighting system.

Each room row shows a status marker beside its duplicate/remove controls: a red warning icon with an incomplete-data tooltip, or a green checkmark with a complete-data tooltip once all five fields are filled.

Section C does not show any calculated values while at least one room row is incomplete. Instead it shows a warning message stating how many rows must still be completed. When the last row is completed, the metrics and progress ring appear and the warning disappears.

---

### 1.5 SNI 03-6197-2020 Embedded Database

**10 typologies, 93 room entries — hardcoded as `Object.freeze()` constant in `/src/data/sniDatabase.js`.**

| Typology Key | Example Rooms & LPD (W/m²) |
|---|---|
| `Rumah_Tinggal` | Teras 1.08, Ruang tamu 4.41, Kamar tidur 6.35, Dapur 7.53 |
| `Perkantoran` | Resepsionis 7.97, Ruang kerja 7.53, Parkir 1.40, Ruang gambar 15.00 |
| `Lembaga_Pendidikan` | Ruang kelas 11.95, Laboratorium 12.16, Ruang olahraga 10.66 |
| `Restaurant` | Cepat saji 4.63, Fine Dining 9.26, Cafetaria 4.31, Dapur 7.53 |
| `Hotel` | Kamar tidur 6.35, Lobi 5.49, Ruang rapat 7.53, Koridor 4.41 |
| `Rumah_Sakit` | Ruang operasi 24.33, Apotik 17.76, Rawat inap 7.32 |
| `Bandara` | Gate waiting 2.69, Ticket counters 5.49, Imigrasi 5.49 |
| `Pertokoan` | Toko pakaian 10.76, Swalayan 10.76, Area kasir 8.83 |
| `Industri` | Low bay <7.62m: 9.26, High bay 7.62–15.24m: 13.35, Extra high bay ≥15.24m: 15.28 |
| `Rumah_Ibadah` | Rumah ibadah 7.53, Gudang 3.55, Kantor 7.53 |

The values are the ones supplied with the project. They have not been independently re-checked against the published standard.

---

## 2. Finalized Decisions

All project decisions locked before development began.

| # | Topic | Decision |
|---|---|---|
| 1 | Language | English-only interface. `STRINGS` is a single `en` map; there is no language toggle. |
| 2 | Data persistence | `localStorage` — survives page refresh, no backend |
| 3 | Export format | JSON only; PDF/print export removed |
| 4 | Greenship scoring threshold | Not implemented — show % reduction only |
| 5 | Lamps per room | Unlimited (native, no 6-lamp cap) |
| 6 | Multi-system buildings | One calculation set per session |
| 7 | Favicon | Lamp/lightbulb SVG on evergreen |
| 8 | Footer text | `Copyright © 2026 GREEN BUILDING COUNCIL INDONESIA. All Rights Reserved.` (static) |
| 9 | Import/Export formats | JSON only, both directions |
| 10 | Deployment target | Netlify (`netlify.toml`) and Vercel (`vercel.json`); both configurations are kept in sync |
| 11 | Framework | React 18 + Vite 8, no external state library |
| 12 | App branding | LPD Calculator wordmark under the GBC Indonesia logo in the sidebar |

Deliberately **not** implemented: bilingual UI, CSV import/export, and a CSV template. They were considered during design and dropped; no code or UI references them.

---

## 3. Application Layout & Navigation

### 3.1 Layout Structure

The app uses a CSS Grid shell with behaviour that switches at 1024px.

#### Desktop (≥1025px) — sidebar always visible

```
┌──────────────┬───────────────────────────────────────┐
│   SIDEBAR    │              TOP BAR (76px)           │
│  (250px)     ├───────────────────────────────────────┤
│              │                                       │
│  GBC logo    │          MAIN CONTENT                 │
│  LPD         │          (centred, max 1440px)        │
│  Calculator  │                                       │
│              │   Lighting power calculator           │
│  ─ A         │   [1 Lighting DB][2 Room Data][3 ...] │
│  ─ B         │   [ Active section panel A / B / C ]  │
│  ─ C         │                                       │
│              ├───────────────────────────────────────┤
│  [New Calc]  │              FOOTER                   │
└──────────────┴───────────────────────────────────────┘
```

- Grid: `grid-template-columns: 250px 1fr`, rows `76px 1fr 44px`
- Sidebar: `position: fixed`, `transform: translateX(0)` — always on screen
- Topbar, main, footer live in grid column 2; no explicit `margin-left` is required
- Hamburger button: **hidden** (`display: none`)

#### Tablet & Mobile (≤1024px) — sidebar is an overlay drawer

```
┌─────────────────────────────────────────┐
│  ☰  TOP BAR                [Data] [PDF] │
├─────────────────────────────────────────┤
│                                         │
│           MAIN CONTENT                  │
│           (full width)                  │
│                                         │
│   [1 Lighting DB][2 Room Data][3 Res]   │
│                                         │
├─────────────────────────────────────────┤
│              FOOTER                     │
└─────────────────────────────────────────┘

   [Sidebar slides in from left on ☰ tap]
```

- Grid: `grid-template-columns: 1fr`
- Sidebar: `transform: translateX(-100%)` by default; `.open` → `translateX(0)` with a 200ms transition
- Overlay backdrop rendered when open; click closes the drawer
- Focus moves into the drawer on open, is trapped while open, and returns to the hamburger on close
- Escape closes the drawer

---

### 3.2 Sidebar Navigation

The sidebar contains exactly **three navigation items** — one per calculator section. There is no Dashboard, Guide, or Reports tab.

```
┌──────────────────────────┐
│  [GBC Indonesia logo]    │
│  LPD Calculator          │
├──────────────────────────┤
│ 💡  A · Lighting DB      │  ← active item highlighted
│ 🚪  B · Room Data        │
│ 📊  C · Results          │
├──────────────────────────┤
│  [+ New Calculation]     │  ← CTA
└──────────────────────────┘
```

- Active tab: light-green background with dark green text
- Clicking any item sets `activeTab` and closes the drawer on mobile
- "New Calculation" → confirm dialog → clears `localStorage` → resets state → returns to Tab A

---

### 3.3 Top Bar Contents

| Element | Desktop (≥1025px) | Tablet (769–1024px) | Mobile (≤768px) |
|---|---|---|---|
| Hamburger `☰` | Hidden | Always visible | Always visible |
| Project name input | Editable inline | Same | Same |
| Section breadcrumb pill | Visible (icon + section label) | Visible | Hidden |
| SNI badge | Visible | Visible | Hidden |
| Data dropdown (import/export) | Visible | Visible | Visible |
| Export PDF button | Removed | Removed | Removed |

The Data dropdown closes on Escape and exposes `aria-haspopup`, `aria-expanded`, and `role="menu"` / `role="menuitem"`.

---

### 3.4 Section Panels (Main Content Area)

There is **no horizontal tab bar in the main content area**. Navigation is through the sidebar, and a compact three-step strip above the panels mirrors it. The `activeTab` state (`'A' | 'B' | 'C'`) lives in `App.jsx` and is passed to `SideNavBar`.

Each panel is a `role="region"` element linked to its sidebar button with `aria-labelledby`. The HTML `hidden` attribute toggles visibility:

```jsx
<div id="tabpanel-A" role="region" aria-labelledby="tab-A" hidden={activeTab !== 'A'} className="tab-panel">
  <SectionA />
</div>
<div id="tabpanel-B" role="region" aria-labelledby="tab-B" hidden={activeTab !== 'B'} className="tab-panel">
  <SectionB />
</div>
<div id="tabpanel-C" role="region" aria-labelledby="tab-C" hidden={activeTab !== 'C'} className="tab-panel">
  <SectionC />
</div>
```

`.tab-panel` uses `display: contents`, so the section card renders as a direct child of the centred content wrapper and no extra wrapper affects layout or border radius. Content is centred inside `.content-center` (`max-width: 1440px`).

---

## 4. Component Architecture

### 4.1 Actual File Structure

```
lpd-calculator/
├── public/
│   ├── favicon.svg                    ← Lamp SVG favicon
│   └── gbci-logo.webp                 ← GBC Indonesia logo, bundled locally
├── index.html                         ← Entry, Google Fonts + Material Symbols
├── vite.config.js                     ← React plugin, ES2020 build target
├── netlify.toml                       ← Netlify build, redirects, headers, cache
├── vercel.json                        ← Vercel rewrites, headers, cache
├── package.json                       ← React 18 + Vite 8 + node --test scripts
├── test/
│   ├── calculator.test.js             ← formulas, sanitisation, completeness rule
│   ├── import.test.js                 ← JSON import schema, IDs, code remapping
│   └── storage.test.js                ← hydration validation and persistence
└── src/
    ├── main.jsx                       ← createRoot, AppProvider wrapper
    ├── App.jsx                        ← activeTab state, dialogs, shell layout
    ├── index.css                      ← All styles: tokens + components + responsive
    │
    ├── engine/                        ← Pure JS — zero React dependency
    │   ├── calculator.js              ← computeResults(), sanitizeNum(), getSNILPD()
    │   ├── validator.js               ← validateLamp(), validateRoom(), schema checks
    │   ├── importParser.js            ← parseJSONImport()
    │   ├── exportSerializer.js        ← exportToJSON()
    │   ├── id.js                      ← createId() with a non-secure-context fallback
    │   └── download.js                ← triggerDownload() blob utility
    │
    ├── data/                          ← Static frozen constants
    │   ├── sniDatabase.js             ← Object.freeze() SNI DB (10 typologies, 93 rooms)
    │   └── i18n.js                    ← Single English STRINGS map
    │
    ├── store/
    │   ├── AppContext.jsx             ← useReducer + Context, 13 action types
    │   └── localStorage.js            ← persist() / hydrate() with validation
    │
    └── components/
        ├── layout/
        │   ├── SideNavBar.jsx         ← A/B/C nav items, CTA, overlay
        │   ├── TopNavBar.jsx          ← Hamburger, project input, breadcrumb, import/export
        │   └── Footer.jsx             ← Static copyright text
        ├── calculator/
        │   ├── SectionA.jsx           ← Lighting database CRUD table
        │   ├── SectionB.jsx           ← Desktop table + mobile card dual layout
        │   └── SectionC.jsx           ← Results grid + MetricCard + ProgressRing
        └── shared/
            ├── ProgressRing.jsx       ← SVG circular gauge
            ├── ConfirmDialog.jsx      ← Modal with confirm / cancel and focus return
            └── Toast.jsx              ← Notification stack (success / error / default)
```

---

### 4.2 State Management

State is managed with `useReducer` + React Context — no external library.

```javascript
// Full app state shape
{
  projectName: string,
  lightingDB: [
    { code: string, name: string, manufacturer: string, type: string, watts: number }
  ],
  rooms: [
    {
      id:       string,     // createId(): randomUUID when available, random fallback otherwise
      roomName: string,
      typology: string,     // e.g. "Perkantoran"
      roomType: string,     // e.g. "ruang_kerja_pk"
      area:     number,
      lamps: [
        { id: string, code: string, points: number }
      ]
    }
  ]
}

// Derived — computed on render, never stored
computed: {
  totalArea, lpdBaseline, lpdDesign, reductionPct,
  incompleteRoomCount, incompleteArea
}

// Not state, exposed by context
storageIssue: string | null   // why stored data was rejected, if it was
```

**Action types:** `SET_PROJECT_NAME`, `RESET`, `IMPORT`, `ADD_LAMP`, `UPDATE_LAMP`, `DELETE_LAMP`, `DUPLICATE_LAMP`, `ADD_ROOM`, `UPDATE_ROOM`, `DELETE_ROOM`, `DUPLICATE_ROOM`, `ADD_ROOM_LAMP`, `UPDATE_ROOM_LAMP`, `DELETE_ROOM_LAMP`

Notable behaviours:
- `DELETE_LAMP` — resequences all L-codes, remaps surviving room lamp references to the new codes, and removes references to the deleted lamp
- `UPDATE_ROOM` with `field: 'typology'` — also clears `roomType` to prevent stale references
- `DUPLICATE_ROOM` — duplicates lamp slots with fresh IDs
- `RESET` — returns the initial state; the reset flow clears persisted storage before dispatching
- Hydration runs once, lazily, inside a ref. If stored data is rejected, the first persist is skipped so a refresh cannot destroy recoverable data; a toast explains why nothing was loaded.
- `nextLampCode()` is max-based, so deleting a middle row cannot cause a code collision.

---

### 4.3 Calculation Engine (`/src/engine/calculator.js`)

Pure JavaScript, framework-agnostic, unit-testable without a DOM.

```javascript
computeResults(lightingDB, rooms)
  → { totalArea, lpdBaseline, lpdDesign, reductionPct,
      incompleteRoomCount, incompleteArea }

// Only rooms passing isRoomComplete() contribute; incomplete rooms are counted

isRoomComplete(room)                    // name, typology, room type, area, selected lamp
getRoomDesignWatts(room, lightingDB)   // total watts for one room
getRoomDesignLPD(room, lightingDB)     // W/m² for one room (for inline column)
getSNILPD(typologyKey, roomId)         // baseline LPD from SNI database
getLampWatts(code, lightingDB)         // wattage for a lamp code
countLampUsage(rooms, code)            // room rows referencing a lamp code
sanitizeNum(v, min, max)               // parseFloat + clamp, non-finite → 0
sanitizeStr(s, maxLen)                 // trim + length cap; no HTML escaping
```

Strings are rendered as React text nodes and are never injected with `innerHTML`, so escaping inside `sanitizeStr` was removed. It used to double-encode values such as `R & D` into `R &amp; D`.

---

## 5. UI/UX Design Specs

### 5.1 Color Palette — GBC Indonesia

| Token | Hex | Usage |
|---|---|---|
| `--mint-glow` | `#d8f1dd` | Active nav text, progress ring fill, soft accents |
| `--deep-teal` | `#354f45` | Sidebar bg, headings, footer, progress ring track |
| `--teal-700` | `#3b664b` | Secondary text on light surfaces |
| `--teal-400` | `#5fb25c` | Accent lines and progress indicator |
| `--jet-gray` | `#263a30` | Body text and dark headings |
| `--amber` | `#a45d0b` | Over-baseline warnings, negative reduction |
| `--slate-50` | `#f6f8f4` | Page background |
| `--slate-200` | `#d8e5d9` | Card borders, table dividers |
| `--red-500` | `#ef4444` | Error toasts, delete hover |
| `--green-600` | `#16a34a` | Success toasts |

Primary actions use the darker action green (`#397c42`) with white text; brighter green is reserved for non-text accents.

### 5.2 Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Page heading | Parkinsans | `clamp(25px, 2.5vw, 34px)` | 700 |
| Section title | Onest | 16px | 700 |
| Body / table | Onest | 14–16px | 400 |
| Label / nav | Onest | 12–13px | 600 |

Tabular numbers (`font-variant-numeric: tabular-nums`) are enabled on numeric columns and metric values.

### 5.3 Interaction Design

- **Section navigation** — sidebar items and the three-step strip set `activeTab`; the drawer closes on mobile after selection
- **Cascading dropdowns** — Typology → Room Type; changing Typology clears Room Type
- **Live calculation** — Section C updates on every keystroke; no calculate button needed
- **Results gate** — metrics stay hidden until every room row is complete; a status message replaces them otherwise
- **Row status markers** — red warning / green checkmark beside room actions, with a hover tooltip explaining the row state
- **Over-baseline indicator** — amber row background + amber Design LPD when `designLPD > stdLPD`
- **Row entrance animation** — new table rows fade in (180ms `rowFadeIn`)
- **Duplicate room** — copies all lamp assignments with new IDs, inserts below the source row
- **Delete lamp cleanup** — orphaned room lamp references removed automatically; a destructive confirmation appears first when the lamp is still in use
- **Confirm dialogs** — Reset, Import, and deleting an in-use lamp require confirmation; focus is restored to the triggering control
- **Toast notifications** — 3.5s auto-dismiss, stacked bottom-right, typed (success/error/default), announced through `aria-live`

### 5.4 Component Specs

| Component | Spec |
|---|---|
| Section cards | `border-radius: 16px`, `border: 1px solid --slate-200`, no shadow |
| Buttons | `border-radius: 10px`, 200ms ease-in-out transitions |
| Inputs/selects | `border-radius: 6px`, focus: 2px `rgba(53,79,69,0.12)` ring |
| Progress ring | 140px default diameter, deep teal track, green fill |
| Active nav item | pale green background, dark green text |
| Footer | `#354f45` background, 11px, pale-green text |

---

## 6. Branding & Footer

### Favicon
- File: `/public/favicon.svg`
- Referenced in `index.html` as `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`

### Logo (Sidebar top-left)
- GBC Indonesia logo (`public/gbci-logo.webp`, 190×48 intrinsic size)
- Wordmark: "LPD Calculator" in the sidebar

### Footer
Static, full-width, always rendered.

```
Copyright © 2026 GREEN BUILDING COUNCIL INDONESIA. All Rights Reserved.
```

---

## 7. Import & Export

### 7.1 Trigger Points

All data actions are in the **Data** dropdown in the top bar.

| Action | Trigger | Result |
|---|---|---|
| Import JSON | Data → Import JSON | File picker (`.json`) → parse → confirm → replace state |
| Export JSON | Data → Export JSON | Downloads `{project-name}.json` |

The export filename is sanitised: characters that are illegal in Windows/macOS filenames and control characters are replaced with `_`, whitespace becomes `_`, leading/trailing dots are removed, and the name is capped at 120 characters.

### 7.2 Import Flow

1. File picker opens (`.json` only; the extension check is case-insensitive)
2. File read via `file.text()` — client-side only, never uploaded
3. A UTF-8 BOM is stripped before `JSON.parse`
4. Full schema validation with whitelist checks
5. Confirm dialog: "This will replace your current data"
6. On confirm: state replaced, `localStorage` updated, success toast
7. On validation error: red toast naming the failing row or field

### 7.3 JSON Format

```json
{
  "version": 1,
  "meta": {
    "projectName": "Gedung A - Lt 3",
    "exportedAt": "2026-11-14T08:00:00Z",
    "standard": "SNI 03-6197-2020",
    "tool": "Greenship NB 1.3 LPD Calculator"
  },
  "lightingDatabase": [
    { "code": "L1", "name": "LED Panel 10W", "manufacturer": "Philips", "type": "LED", "watts": 10 }
  ],
  "rooms": [
    {
      "roomName": "Ruang Kerja A",
      "typology": "Perkantoran",
      "roomType": "ruang_kerja_pk",
      "area": 120,
      "lamps": [
        { "code": "L1", "points": 20 },
        { "code": "L2", "points": 5 }
      ]
    }
  ]
}
```

**Import rules:**

- `version` may be omitted or must equal `1`
- `lightingDatabase` and `rooms` must be arrays
- Lamp codes are used as source references, then remapped to sequential in-app codes `L1…Ln`
- Room lamp references must resolve to a lamp declared in the same payload
- Room types must match SNI database IDs exactly
- Unknown typologies, room types, and lamp codes are rejected with a row-level error
- Every imported room and lamp slot receives a fresh ID

---

## 8. Security & Safety

Fully client-side for user-entered calculation data — no backend, no authentication, and no data upload. The page loads Google-hosted fonts from `fonts.googleapis.com` / `fonts.gstatic.com`; calculation data stays in the browser.

| Threat | Mitigation |
|---|---|
| XSS via imported file | Values are parsed into typed primitives and rendered as React text nodes. No `eval()`, no `innerHTML`. |
| Prototype pollution | JSON import checks for `__proto__`, `constructor`, and `prototype` keys before processing |
| localStorage tampering | `hydrate()` validates lamp codes, typology, room type, and stored lamp references; IDs are regenerated when missing or duplicated; invalid state is not loaded and the original payload is preserved |
| Malformed imports | Field-level whitelist validation for typology, room type, and room lamp references |
| Clickjacking | `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'` |
| Script injection through base URLs | CSP `base-uri 'self'`, `script-src 'self'`, `object-src 'none'` |
| Dependency chain | Runtime deps: React only. No analytics or tracking scripts. |
| SQL injection | N/A — no database, no server |
| Data breach | N/A — all data stays in the user's browser tab |

### Input Sanitization (`/src/engine/validator.js`)

- `watts`, `area`, `points` → `parseFloat`, clamped `[0, 1e9]`, non-finite → 0
- Strings → `trim()`, capped at 200 characters
- `typology` → must be one of the 10 known SNI keys (whitelist)
- `roomType` → must exist in `SNI_DATABASE[typology].rooms` (whitelist)

---

## 9. localStorage Schema

```javascript
// Key: "lpd_calculator_state"
{
  version: 1,
  projectName: string,
  lightingDB: [ { code, name, manufacturer, type, watts } ],
  rooms: [ { id, roomName, typology, roomType, area, lamps: [ { id, code, points } ] } ]
}
```

- Auto-saved via `useEffect` on every state change
- Hydrated on page load before first render; invalid payloads fall back to the empty state and surface a toast
- Hydration normalises stored lamp codes to `L1…Ln` and remaps room references, regenerates missing or duplicate room and slot IDs, and clamps numbers
- Invalid payloads are **not** overwritten until the user takes an action, so data can still be recovered manually
- Cleared by the "New Calculation" flow

---

## 10. Deployment

```bash
npm install
npm test
npm run build      # outputs to /dist
```

Node `>=20.19.0` is required (Vite 8). Netlify pins `NODE_VERSION = "22"` in `netlify.toml`.

### Netlify

`netlify.toml` provides the SPA redirect, security headers, and cache rules.

### Vercel

`vercel.json` mirrors the same rewrites, headers, and cache rules. Both files must be updated together.

### Headers

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- `Content-Security-Policy` with `default-src 'self'`, Google Fonts allowances, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'none'`
- `/assets/*` → `Cache-Control: public, max-age=31536000, immutable`
- `/favicon.svg` → `Cache-Control: public, max-age=86400`

### Build Output Reference (current build)

| File | Raw | Gzipped |
|---|---|---|
| `index.html` | 1.10 kB | 0.56 kB |
| `index-[hash].css` | 24.62 kB | 5.39 kB |
| `index-[hash].js` | 189.99 kB | 58.97 kB |

The project ships a single application bundle; hashes change on every build. No environment variables are required.

---

## 11. Responsive Design

### Breakpoints

| Name | Width | Sidebar | Hamburger | Grid |
|---|---|---|---|---|
| Desktop | ≥1025px | Always visible (250px) | Hidden | `250px 1fr` |
| Tablet | ≤1024px | Overlay drawer | Visible | `1fr` |
| Large mobile | ≤768px | Overlay drawer | Visible | `1fr`, compact |
| Small mobile | ≤480px | Overlay drawer | Visible | `1fr`, minimal |

### Key CSS Mechanics

On desktop the grid (`250px 1fr`) places topbar, main, and footer in column 2 automatically.

```css
/* Desktop ≥1025px */
.app-shell          { grid-template-columns: var(--sidebar-w) 1fr; }
.sidebar            { transform: translateX(0); box-shadow: none; }
.topbar             { margin-left: 0; }
.main-content       { margin-left: 0; }
.footer             { margin-left: 0; }
.hamburger          { display: none; }

/* Tablet/Mobile ≤1024px */
@media (max-width: 1024px) {
  .app-shell        { grid-template-columns: 1fr; }
  .sidebar          { transform: translateX(-100%); }
  .sidebar.open     { transform: translateX(0); }
  .hamburger        { display: flex; }
}
```

### Section B — Dual Layout

| Screen | Layout | Class |
|---|---|---|
| ≥769px | Full horizontal data table | `.room-table-desktop` |
| ≤768px | Stacked room cards (one per room) | `.room-cards` |

Both DOM structures are always rendered; CSS toggles visibility. Each mobile room card contains the same fields as the desktop row.

### Section C — Results Grid

| Screen | Columns |
|---|---|
| ≥769px | 3 metric cards + 1 progress ring (4-col) |
| ≤768px | 2 × 2 metric grid; ring below full-width |
| ≤480px | 1 column stacked |

---

## 12. Print / PDF Export

**Removed.** There is no PDF or print button in the UI; JSON export is the only exchange format. The `@media print` rules in `index.css` and the `.print-project` heading element are retained but are inert — no control triggers `window.print()`. Users can still print the page from the browser's own print menu if needed.

---

## 13. Dependencies & Tests

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.2.1",
    "vite": "^8.3.5"
  }
}
```

No state library, component library, CSS framework, analytics, or tracking scripts.

Tests use Node's built-in runner — no Vitest or extra dependency:

```bash
npm test           # node --test
```

The suite covers:

- Formula output, sanitisation, the shared row-completeness rule, and the calculation gate
- JSON import: code normalisation, lamp-reference remapping, generated IDs, BOM handling, and rejection of bad versions, typologies, lamp codes, and duplicates
- localStorage hydration: empty storage, round-trip, unsupported version, unknown room types, code/ID normalisation, and duplicate-ID regeneration

---

## 14. Known Limitations

- One calculation set per browser; no multi-project management
- No Excel import — the JSON schema is the only supported exchange format
- No GREENSHIP score output, only the percentage reduction
- SNI values are the supplied dataset and have not been independently verified against the published standard

## 15. Future Roadmap (Phase 2)

| Feature | Notes |
|---|---|
| Multi-project management | Project list / switching, persist multiple projects |
| Excel import | Parse existing Greenship `.xlsx` worksheets directly |
| EEC 1B full calculator | Integrate the HVAC calculator from the original workbook |
| Greenship scoring dashboard | Point totals for all NB 1.3 criteria |
| Pass/fail threshold | Once LPD reduction thresholds are confirmed by GBC Indonesia |
| Cloud sync | Optional backend for cross-device access |
