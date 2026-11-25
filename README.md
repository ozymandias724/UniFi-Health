# Uni Fi Health (University Financial Health)

A React and TypeScript application for exploring historical financial information
reported by U.S. universities. It combines an institution search, a financial
overview, and an interactive map. The figures are reported data, not a
complete assessment of an institution's financial health. Currently supported
reporting years are 2022 and 2023, with 2023 as the default.

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
node --test scripts/*.test.ts         # Run data pipeline tests
```

## Pages and interaction

- **Financial Explorer (`/`)**: search for a university and view its revenue
  coverage, reported figures, and revenue and expenditure charts. A `unitid`
  query parameter, such as `/?unitid=166027&year=2022`, selects an institution from the
  directory; map popups link to a financial profile with both UNITID and year.
  Detailed financial fields are displayed alongside the overview.
- **Map View (`/map-view`)**: search for an institution or explore clustered
  markers. Selecting a search result moves the map to it when coordinates are
  available. Individual marker colors reflect revenue divided by expenses;
  cluster colors reflect the share of institutions with expenses above revenue,
  considering only records with a valid ratio.
- **Kitchen Sink (`/kitchen-sink`)**: a small reference page for shared buttons.

Both data views use the shared `YearSelector` and `useReportingYear` hook.
The `year` query parameter is the source of truth; missing or unsupported years
resolve to the configured default. Explorer preserves the selected UNITID when
changing years, including when an institution is absent from a dataset. Map
selection stores the UNITID and resolves it against the current directory.

The shared `UniversitySearch` component uses Fuse.js and reports selections to
its parent; each page decides what to do with a selection. The header uses a
native modal dialog: full-screen on mobile and a sliding panel on wider screens.

## Data sources and refreshes

The application uses IPEDS data provided by the Urban Institute's
[Education Data Portal](https://educationdata.urban.org/), under the
[ODC Attribution License](https://opendatacommons.org/licenses/by/1-0/).
The directory and finance summaries are published separately for each reporting
year. Supported years and the default are defined in
`src/config/reportingYears.ts`.

| Source | Used for |
| --- | --- |
| `public/data/<year>/universities.json` | Search and map locations for active, degree-granting, four-year institutions. |
| `public/data/variables.json` | Labels and metadata for financial fields. |
| `public/data/<year>/finances.json` | Revenue and expense summaries used by map markers and clusters. |
| Education Data Portal finance API | Live, detailed finance record for the selected institution on the Explorer page. |
| OpenStreetMap tile server | Map tiles, with attribution displayed on the map. |

The JSON files are served with the app; loading detailed Explorer finances and
map tiles also requires network access. The Explorer fetch is made by the
browser, so verify the API works from the deployed site's origin. Explorer distinguishes loading, unavailable institutions, and missing finance
records. Map loading and popup transitions remain areas for future refinement.

## Data pipeline

Run these commands from the project root, using the same reporting year for
all annual stages (2022 is used here as an example):

```sh
node scripts/generate-directory.ts --year 2022
node scripts/generate-finances.ts --year 2022
node scripts/build-data.ts --year 2022
node scripts/build-data.ts --year 2022 --publish
node scripts/audit-finances.ts --year 2022
```

The directory generator writes `data/raw/directory-2022.json`. The finance
generator reads that directory and writes `data/raw/finances-2022.json`.
`build-data.ts` validates and reconciles the inputs, reporting unmatched or
incomplete records and eligible institutions. Without `--publish` it performs
a dry run; with that flag it writes the matching annual directory and finance
summaries to `public/data/2022/`. The audit script reports coverage of the
published finance summaries without modifying them.

Omitting `--year` uses the configured default. Refresh shared field metadata
separately when needed:

```sh
node scripts/generate-variables.ts
```

Missing or suppressed summary values are represented as `null`. Published
coverage can differ between years because of directory and financial eligibility
criteria; absence from a dataset is not proof that an institution closed.
Generation requires access to the Education Data Portal and is not part of
normal development or builds.

To add a reporting year, generate, validate, publish and audit its datasets,
then add the year to `SUPPORTED_YEARS` in chronological order. Change
`DEFAULT_YEAR` only if the application's default should change.

The Explorer's donut compares **expenses / revenue**, while the map's
revenue-to-expense ratio is **revenue / expenses**. They answer different
questions and should not be read as interchangeable percentages.

## Project structure

- `src/App.tsx`: router, shared header and footer, and lazy-loaded pages.
- `src/pages/`: the Explorer, map, and component reference pages.
- `src/components/`: reusable search and header, financial charts, and map
  markers and popups, the shared year selector, and detailed financial views.
- `src/services/ipeds.ts`: data types and functions for the local JSON files
  and live finance API.
- `src/hooks/`: reusable hooks, including URL-driven reporting year selection.
- `src/utils/` and `src/config/`: formatting, finance calculations, map
  settings, and reporting year configuration.
- `src/styles/`: plain CSS organized into shared and component styles.
- `scripts/`: data generators, build and audit scripts, and tests.
- `data/raw/`: intermediate annual datasets.
- `public/data/`: shared metadata and published annual JSON datasets.

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
