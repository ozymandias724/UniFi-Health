# University Financial Explorer

A React and TypeScript application for exploring 2023 financial information
reported by U.S. universities. It combines an institution search, a financial
overview, and an interactive map. The figures are reported data, not a
complete assessment of an institution's financial health.

## Getting started

Install dependencies and start the Vite development server:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Vite requires Node.js 20.19+ in the 20.x
series or 22.12+ in newer supported releases. The TypeScript data-generation
scripts require Node.js 22.18+ or Node.js 24.

Other useful commands:

```sh
npm run build                         # Type-check and create dist/
npm run preview                       # Serve the production build locally
npm run lint                          # Run Oxlint
node --test scripts/generate-finances.test.ts  # Test the finance generator
```

## Pages and interaction

- **Financial Explorer (`/`)**: search for a university and view its revenue
  coverage, reported figures, and revenue and expenditure charts. A `unitid`
  query parameter, such as `/?unitid=166027`, selects an institution from the
  directory; map popups use this to link to a financial profile.
- **Map View (`/map-view`)**: search for an institution or explore clustered
  markers. Selecting a search result moves the map to it when coordinates are
  available. Individual marker colors reflect revenue divided by expenses;
  cluster colors reflect the share of institutions with expenses above revenue,
  considering only records with a valid ratio.
- **Kitchen Sink (`/kitchen-sink`)**: a small reference page for shared buttons.

The shared `UniversitySearch` component uses Fuse.js and reports selections to
its parent; each page decides what to do with a selection. The header uses a
native modal dialog: full-screen on mobile and a sliding panel on wider screens.

## Data sources and refreshes

The application uses IPEDS data provided by the Urban Institute's
[Education Data Portal](https://educationdata.urban.org/), under the
[ODC Attribution License](https://opendatacommons.org/licenses/by/1-0/).
The directory and finance data currently use the **2023** reporting year.

| Source | Used for |
| --- | --- |
| `public/data/universities.json` | Search and map locations for active, degree-granting, four-year institutions. |
| `public/data/variables.json` | Labels and metadata for financial fields. |
| `public/data/finances.json` | Revenue and expense summaries used by map markers and clusters. |
| Education Data Portal finance API | Live, detailed finance record for the selected institution on the Explorer page. |
| OpenStreetMap tile server | Map tiles, with attribution displayed on the map. |

The JSON files are served with the app; loading detailed Explorer finances and
map tiles also requires network access. The Explorer fetch is made by the
browser, so verify the API works from the deployed site's origin. Fetch failures
are currently logged to the browser console rather than shown in a dedicated
error message.

To regenerate the local data, run these from the project root:

```sh
node scripts/generate-directory.ts
node scripts/generate-variables.ts
npm run generate:finances
```

Run the finance generator after updating the directory: it reads the university
IDs from that file, fetches finance data in batches, and writes the map
summaries. Missing or suppressed values in those summaries are stored as
`null`. Generation requires access to the Education Data Portal; it is not part
of normal development or builds.

The Explorer's donut compares **expenses / revenue**, while the map's
revenue-to-expense ratio is **revenue / expenses**. They answer different
questions and should not be read as interchangeable percentages.

## Project structure

- `src/App.tsx`: router, shared header and footer, and lazy-loaded pages.
- `src/pages/`: the Explorer, map, and component reference pages.
- `src/components/`: reusable search and header, financial charts, and map
  markers and popups. `UniversityFinances` is a detailed view that exists but
  is currently commented out on the Explorer page.
- `src/services/ipeds.ts`: data types and functions for the local JSON files
  and live finance API.
- `src/utils/` and `src/config/`: formatting, finance calculations, and map
  settings.
- `src/styles/`: plain CSS organized into shared and component styles.
- `scripts/` and `public/data/`: data generators, their tests, and generated
  JSON consumed by the application.

## Styling

`src/main.tsx` loads `modern-normalize` before `src/index.css`. The latter loads
the self-hosted fonts, reset, theme and layout styles, then component styles.
The Explorer also imports `src/App.css`, which currently contains no rules.

`src/styles/global.css` defines semantic color, spacing, radius, shadow, and
font tokens. The default palette is light; `prefers-color-scheme: dark`
overrides the colors automatically. Dark panels are translucent charcoal.
Use semantic UI colors for surfaces and text, chart tokens for charts, and
status colors for assessments. Lato headings and Open Sans body text are
self-hosted through Fontsource; both use the SIL Open Font License 1.1.

`layout.css` sets the centered page width and spacing between direct sections.
Pages generally group section content inside a `.container`; individual
components own their internal layout. Component styles are split among
`header.css`, `elements.css`, `financial.css`, `financial-overview/`,
`university-search/`, and `mapview/`. Check both themes and narrow screens when
changing shared styles.

## Deployment

`npm run build` writes a static Vite build to `dist/`; `npm run preview` can
check it locally. Configure the host to serve `index.html` for client-side
routes such as `/map-view` on direct visits and refreshes.

For deployment under a subpath, build with the appropriate Vite base, for
example `npm run build -- --base=/portfolio/`. The router and local data URLs
use Vite's `BASE_URL`. The hosting platform must also rewrite routes under that
base to the app's `index.html`. Test direct links, API access, and map tiles on
the actual host; OpenStreetMap's public tile service has a
[usage policy](https://operations.osmfoundation.org/policies/tiles/).
