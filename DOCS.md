## Startup Map of India – Project Documentation

This document explains every major feature, component, and function in the project in a beginner‑friendly way. If you are new to React or front‑end development, read this top‑to‑bottom and you should be able to understand how the app works and how to extend it.

### What this app does

- Shows an interactive SVG map of India where each state is clickable.
- When you select a state, it shows startup information and simple analytics.
- Provides a search box to quickly jump to a state or a startup by name.
- Has a right panel with multiple “tabs” (menu items) that display different insights.
- Uses a theme context to support dark/light mode (currently dark by default with Tailwind via CDN).

### Tech stack

- React 19 (Vite + Fast Refresh)
- TailwindCSS via CDN in `index.html`
- Icons from `lucide-react`
- App bootstrapped by Vite

### How to run

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open the shown URL (usually `http://localhost:5173`)

---

## Project Structure (important files)

- `index.html`: HTML shell. Loads Tailwind CDN and the React bundle.
- `src/main.jsx`: Mounts React app into the page and wraps it with `ThemeProvider`.
- `src/App.jsx`: The main app component. Search box, map, and right panel live here.
- `src/components/IndiaMap.jsx`: Loads and renders the SVG map, handles hover and click, highlights selected state.
- `src/components/RightPanel.jsx`: Displays metrics/insights about the selected state.
- `src/components/RightPanelMenu.jsx`: The menu that switches between right‑panel views.
- `src/contexts/ThemeContext.jsx`: Dark/light theme state shared via React context.
- `src/data/startups.json`: App demo dataset keyed by state name with startups and metadata.
- `src/data/database.json`: A richer, tabular dataset (currently not wired to UI but useful for future analytics).

---

## Data Schemas

### `src/data/startups.json`

The app uses this file directly. It is an object keyed by state name. Each state looks like:

```json
{
  "Maharashtra": {
    "state": "Maharashtra",
    "capital": "Mumbai",
    "totalStartups": 5,
    "notableSectors": ["FinTech", "EdTech", "E-commerce"],
    "startups": [
      { "name": "QuickPay", "sector": "FinTech", "founded": 2019, "employees": 120 }
    ]
  }
}
```

Required/expected fields per state:
- `state`: string
- `capital`: string (optional in UI)
- `totalStartups`: number (fallback is `startups.length`)
- `notableSectors`: string[] (optional in UI)
- `startups`: array of startup objects with `name`, `sector`, `founded`, `employees`

### `src/data/database.json`

An array of records with many fields like “Total Startups (DPIIT-Registered)”, “Deals in Last 12M”, etc. This is not yet displayed, but intended for future charts. You can map these fields into new visualizations in the right panel.

---

## Application Flow and Components

### Entry point: `src/main.jsx`

- Imports global styles, wraps the app with `ThemeProvider`, and renders `<App />` into `#root`.

Key code:

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
```

### Theme context: `src/contexts/ThemeContext.jsx`

- Provides two values via context: `isDark` (boolean) and `toggleTheme()`.
- On load, it checks `localStorage` for a saved theme. If none, it uses system preference.
- Applies the `dark` class on `<html>` to enable dark styles.

Functions and what they do:
- `ThemeProvider({ children })`: Holds theme state and exposes it via `ThemeContext.Provider`.
- `useTheme()`: Custom hook that returns `{ isDark, toggleTheme }`. It throws if used outside the provider (helps catch wrong usage early).

How to use in a component:

```jsx
import { useTheme } from '../contexts/ThemeContext'
const { isDark, toggleTheme } = useTheme()
```

### Main app: `src/App.jsx`

State variables:
- `selectedState`: The full data object for the selected state (from `startups.json`).
- `selectedMeta`: Metadata about the selected SVG path: `{ id, name }`.
- `query`: Text in the search input.
- `isFocused`: Whether the suggestion list should be visible.
- `activeIndex`: Keyboard‑highlighted suggestion item index.

Derived values (computed with `useMemo`):
- `normalizedData`: A `Map` keyed by lower‑cased state names for robust lookups.
- `allStates`: Array of state names from the dataset.
- `searchIndex`: Flat array of suggestion items of two types:
  - `{ type: 'state', label: stateName, state }`
  - `{ type: 'startup', label: startupName + ' — ' + stateName, state, startup }`
- `suggestions`: The top matching items (max 8) filtered by the current `query`.

Important functions:
- `handleSelect(stateMeta)`: Accepts `{ id?, name }` from the map click and finds the matching state details from `normalizedData`. It updates `selectedMeta` and `selectedState`.
- `selectStateByName(name)`: Helper to select a state by name (used by search).
- `handleKeyDown(e)`: Keyboard navigation for the search suggestions: ArrowDown/ArrowUp move the active index, Enter selects, Escape closes.

Rendered UI:
- Header with title and search input (shows suggestions on focus/typing).
- Grid with `IndiaMap` (left) and `RightPanel` (right).
- When a state is selected, a table lists that state’s startups.

### Interactive map: `src/components/IndiaMap.jsx`

Key elements:
- `useSvg(url)`: A small hook that fetches the SVG text and returns `{ svgContent, error }`.
- `processedSvg` (memo): Post‑processes the raw SVG string to add responsive classes to the root `<svg>` and consistent styling/interaction attributes to each `<path>` (state shape).
- Selection highlighting effect: Watches `selected` and directly styles the matching SVG `<path>` so it looks distinct from hover.
- Event listeners (added to the container `div`):
  - `mouseover/mouseout`: Track which state name is hovered and show tooltip.
  - `mousemove`: Position tooltip near the cursor.
  - `click`: Read state `name` attribute or `id` from the `<path>` and call `onSelect({ id, name })`.

Props:
- `src` (string): URL to the SVG file. Defaults to `/india-states.svg`.
- `onSelect(stateMeta)`: Callback when a state is clicked. Typically points to `App.handleSelect`.
- `selected` (object): `{ id?, name? }` used to highlight the selected path.

Notes for beginners:
- The map is injected with `dangerouslySetInnerHTML`. This is safe here because the SVG is a trusted static asset. It allows us to keep the original SVG structure and enrich it on the fly.
- The `name` attribute in the SVG paths is crucial. If your SVG does not include it, the code falls back to the `id` attribute.

### Right panel: `src/components/RightPanel.jsx`

Purpose: Display metrics and visual summaries for the selected state.

Internal logic (computed with `useMemo` when `selectedState` changes):
- `startups`: Array of startups for the state.
- `total`: `selectedState.totalStartups` if available, otherwise `startups.length`.
- `totalEmployees`: Sum of `employees` across all startups.
- `avgEmployees`: Average employees per startup (rounded, with safe divide by at least 1).
- `sectors`: Top 5 sectors with counts, computed by scanning startups and building a frequency map.
- `maxSector`: Maximum sector count (used to calculate bar width percentages).

UI states:
- Shows the right panel header (state name or “Overview”).
- Renders the `RightPanelMenu` to switch between views.
- If no state is selected: shows a helpful message.
- Views:
  - `startup-activity`: Displays two `Metric` cards (Total startups, Avg employees).
  - `funding-deals`, `unicorns-pipeline`, `founder-demographics`: Placeholder cards for future charts.
  - `top-sectors`: A horizontal bar list of the top sectors with proportional widths.

Child component:
- `Metric({ label, value })`: A compact statistic card.

### Menu component: `src/components/RightPanelMenu.jsx`

Purpose: Lets the user switch the active right‑panel view.

How it works:
- Holds `activeId` in local state (default comes from parent via `defaultActive`).
- When a button is clicked, it sets `activeId` and calls `onSelect(id)` so the parent can respond.
- Uses `lucide-react` icons and Tailwind classes for animated hover/focus/active styling.

Menu items:
- `startup-activity` (BarChart)
- `funding-deals` (DollarSign)
- `unicorns-pipeline` (Star)
- `founder-demographics` (Users)
- `top-sectors` (Layers)

---

## Features (list and where they live)

- Search with suggestions: `src/App.jsx` (`query`, `suggestions`, `handleKeyDown`, click selection)
- Interactive SVG map (hover tooltip, click select): `src/components/IndiaMap.jsx`
- Selected state highlighting on the map: `IndiaMap` effect watching `selected`
- Right panel insights and metrics: `src/components/RightPanel.jsx`
- Right panel tabbed menu: `src/components/RightPanelMenu.jsx`
- Theme management (dark/light): `src/contexts/ThemeContext.jsx` (toggle not yet exposed in UI)

---

## Extending the app

1. Add more states or startups
   - Update `src/data/startups.json` with new entries. Keep the same shape.
   - Ensure your SVG has a matching `name` or `id` so clicks map correctly to your data.

2. Connect `database.json` to new charts
   - Parse `src/data/database.json` in `RightPanel.jsx` and derive new metrics (e.g., total funding, deals, unicorns).
   - Display as charts in `funding-deals` or other tabs.

3. Add a theme toggle button
   - Import `useTheme` from `ThemeContext` and render a button that calls `toggleTheme()`.

4. Improve accessibility
   - The SVG paths have `tabindex="0"` and hover/focus styles. You can add keyboard handlers (Enter/Space) to trigger selection for keyboard users.
   - Ensure ARIA labels are present where useful (tooltips, buttons already have labels).

5. Replace Tailwind CDN with a build setup (optional)
   - Install Tailwind and configure PostCSS for production builds if you need purge/treeshaking and custom themes.

---

## Important functions and how to read them (beginner notes)

- `useMemo(fn, [deps])`: Runs `fn` and caches the result until any dependency in `[deps]` changes. Used for expensive or derived computations.
- `useEffect(fn, [deps])`: Runs `fn` after render; use it for side‑effects (DOM events, fetching, subscriptions). Clean up by returning a function from `fn`.
- Event handling pattern in `IndiaMap`:
  - Add listeners in an effect on mount, remove them in the cleanup function.
  - Read attributes from the event target to know which path (state) was interacted with.
- Controlled inputs (`<input value={query} onChange=...>`): The state (`query`) is the single source of truth.

---

## Performance considerations

- `useMemo` is used to avoid recomputing indexes and metrics on every render.
- The SVG is processed as a string once and then injected; this keeps React’s reconciliation lightweight.
- Limiting suggestions to 8 items keeps the dropdown snappy.

---

## Troubleshooting

- Map does not load: Check the path to `india-states.svg` in `public/` and that `index.html` serves `/india-states.svg` correctly.
- Clicking a state does nothing: Ensure the SVG `<path>`s have a `name` or `id` attribute matching your dataset.
- No startups shown: Verify your `startups.json` structure and that state names match (case‑insensitive matching is supported).

---

## NPM scripts

- `npm run dev`: Starts Vite dev server with HMR.
- `npm run build`: Builds the app for production.
- `npm run preview`: Serves the production build locally.
- `npm run lint`: Runs ESLint.

---

## License and attribution

This project was created for educational/demo purposes. Icons by `lucide-react`. Built with React and Vite.


