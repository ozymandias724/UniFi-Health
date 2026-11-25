# Uni Fi Health (University Financial Health)

Uni Fi Health is an interactive application for exploring historical financial information reported by U.S. universities. It combines institutional search, financial visualizations, and geographic exploration to make publicly available higher education financial data more accessible.

[Live Application](https://kylemarcy.com/financial-explorer-beta/)

## Features

- Fuzzy search by institution name.
- Detailed institutional financial profiles.
- Revenue and expenditure visualizations.
- Interactive map with financial color coding and marker clustering.
- Annual reporting year selection.
- Shareable institution and reporting year URLs.
- Responsive layouts with automatic light and dark themes.

Currently supported reporting years are **2021, 2022, and 2023**, with 2023 as the default.

## Getting Started

The application is built with React, TypeScript, and Vite, using React Leaflet for mapping, Recharts for financial visualizations, and Fuse.js for institutional search.

Node.js 24 is recommended for application development and the TypeScript data pipeline.

```sh
npm ci
npm run dev
```

### Development Commands

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start the development server             |
| `npm test`          | Run automated tests                      |
| `npm run lint`      | Run Oxlint                               |
| `npm run typecheck` | Validate TypeScript                      |
| `npm run build`     | Type-check and create a production build |
| `npm run preview`   | Preview the production build             |

## Application Architecture

### Financial Explorer (`/`)

Search for an institution and explore its reported financial information through summary figures, charts, and categorized financial records.

Institution directories and variable metadata are loaded from local JSON datasets. Detailed financial records are retrieved from the Education Data Portal API on demand.

### Map View (`/map-view`)

Explore institutions geographically using pre-generated annual financial summaries.

Individual marker colors represent the ratio of revenue to expenses. Cluster colors represent the percentage of institutions with expenses exceeding revenue, considering only institutions with valid ratios.

Institutions and clusters without valid ratios are displayed in a neutral color.

### Navigation

Both views share institutional search and reporting year selection. The `year` query parameter is the source of truth for the selected reporting year. Missing or unsupported years resolve to the configured default.

Institution selection uses the IPEDS UNITID, allowing users to navigate between views, change reporting years, and share institution-specific links.

A separate Kitchen Sink page (`/kitchen-sink`) provides a reference for shared UI elements.

## Data Sources

Institutional and financial data is provided by the Urban Institute's [Education Data Portal](https://educationdata.urban.org/), using data from the Integrated Postsecondary Education Data System (IPEDS).

The initial institutional directory is restricted to active, degree-granting, four-year institutions. The publication process further excludes institutions without matching financial records, with specified parent-child reporting classifications, or with missing revenue and expense totals.

| Source                                 | Purpose                                  |
| -------------------------------------- | ---------------------------------------- |
| `public/data/{year}/universities.json` | Published institutional directory        |
| `public/data/{year}/finances.json`     | Annual financial summaries               |
| `public/data/variables.json`           | Financial field labels and metadata      |
| Education Data Portal finance API      | Detailed institutional financial records |
| OpenStreetMap                          | Map tiles                                |

Education Data Portal data is provided under the [Open Data Commons Attribution License](https://opendatacommons.org/licenses/by/1-0/).

Detailed financial records and map tiles require network access.

### Data Interpretation

Reported financial figures are not a comprehensive assessment of institutional financial health.

The Explorer's revenue coverage visualization compares **expenses / revenue**, while the map compares **revenue / expenses**. These ratios answer different questions and should not be interpreted as interchangeable percentages.

Missing or suppressed summary values are represented as `null`. Institutional coverage may vary between reporting years, and absence from a dataset does not necessarily indicate institutional closure.

## Data Pipeline

The data pipeline maintains separate raw and published annual datasets. Data generation is independent of normal application development and production builds.

### Generate an Annual Dataset

Run the following commands from the project root, using the same reporting year throughout:

```sh
npm run generate:directory -- --year 2023
npm run generate:finances -- --year 2023
npm run data:build -- --year 2023
npm run data:build -- --year 2023 --publish
npm run data:audit -- --year 2023
```

The directory generator retrieves institutional records. The finance generator uses that directory to retrieve corresponding financial summaries.

The build script validates and reconciles both datasets. It performs a dry run by default; review the reported statistics before running it with `--publish`.

The audit script reports financial field coverage and reporting classifications without modifying the published datasets.

Omitting `--year` uses the configured default reporting year.

### Refresh Variable Metadata

Financial field labels and descriptions are maintained separately from annual datasets.

```sh
npm run generate:variables
```

### Add a Reporting Year

1. Generate the directory and financial summaries for the desired year.
2. Validate, publish, and audit the annual datasets.
3. Add the year to `SUPPORTED_YEARS` in `src/config/reportingYears.ts`, maintaining chronological order.
4. Update `DEFAULT_YEAR` if appropriate.
5. Verify both application views and run the automated tests.

### Pipeline Reliability

The data pipeline includes:

- Shared HTTP request handling with timeouts and retries.
- Batched financial data retrieval.
- Runtime validation of institutional and financial records.
- Duplicate UNITID detection.
- Reconciliation of directory and finance datasets.
- Protection against publishing empty datasets.
- Atomic writes for individual JSON files.

Raw datasets are retained for reproducibility. Published datasets contain the reconciled institutional directory and financial summaries consumed by the application.

## Project Structure

```text
src/
├── components/     # Reusable UI, financial charts, and map components
├── config/         # Financial fields, reporting years, and map settings
├── hooks/          # Reusable React hooks
├── pages/          # Application views
├── services/       # Local and remote data access
├── styles/         # Shared and component-specific CSS
├── types/          # Shared TypeScript data definitions
└── utils/          # Financial calculations, formatting, and helpers

scripts/
├── utils/
├── generate-directory.ts
├── generate-finances.ts
├── generate-variables.ts
├── build-data.ts
├── audit-finances.ts
└── *.test.ts

data/
└── raw/
    ├── directory-{year}.json
    └── finances-{year}.json

public/
└── data/
    ├── variables.json
    └── {year}/
        ├── universities.json
        └── finances.json
```

The application and data pipeline share financial summary definitions, data types, and reporting year configuration.

## Testing

Automated tests use the Node.js test runner and cover data validation, publication, HTTP requests, atomic file writes, institutional eligibility, financial calculations, formatting, categorization, and map cluster calculations.

Run the complete verification sequence before publishing changes:

```sh
npm test
npm run lint
npm run typecheck
npm run build
```

## Styling

The application uses plain CSS organized into shared and component-specific stylesheets. Semantic design tokens are defined in `src/styles/global.css`, with automatic light and dark themes based on system preferences. Lato and Open Sans are self-hosted through Fontsource.

## Deployment

Uni Fi Health is deployed as a static single-page application.

```sh
npm run build
```

The production build is generated in `dist/`, including the published JSON datasets.

The current deployment base is `/financial-explorer-beta/`, configured in `vite.config.ts`. To build for another deployment path:

```sh
npm run build -- --base=/another-path/
```

The router and local data services use Vite's configured base URL. The hosting environment must support client-side route fallback to the application's `index.html`.

After deployment, verify direct route navigation, reporting year selection, financial API access, and map tile loading.

Use of OpenStreetMap's public tile service is subject to its [tile usage policy](https://operations.osmfoundation.org/policies/tiles/).
