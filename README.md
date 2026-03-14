# Maturity Modeler

Interactive spider chart visualization tool for maturity model gap analysis.

JavaScript-based tool that creates radar/spider chart visualizations using D3.js
to compare maturity levels across applications, business units, or functional
divisions. Ships with Continuous Delivery and Infrastructure as Code models;
bring your own via the admin panel or data files.

Purely client-side — no backend required for core functionality. An optional PHP
backend (`api/config.php`) enables remote configuration management via the admin
panel; see [Admin API](#admin-api-optional) below.

![CD Gap Analysis](images/CD_example_thumbnail.png)
![IaC Gap Analysis](images/IaC_example_thumbnail.png)

---

## Quick Start

```bash
git clone https://github.com/boinger/maturitymodeler.git
cd maturitymodeler
npm install
npm run build:legacy
```

Open `index.html` in a browser, or serve with any static file server.

### Docker

The Docker image serves the static app only. For admin panel functionality,
you'll need a PHP-capable server (see [Admin API](#admin-api-optional)).

```bash
docker build -t maturitymodeler .
docker run -d --name maturitymodeler -p 8082:80 maturitymodeler
# → http://localhost:8082/
```

### Static Hosting

After building, deploy to any static file server:

- `index.html`
- `dist/` directory

---

## Features

### Spider Chart Visualization
- D3.js v7 SVG rendering with interactive tooltips
- Toggle individual applications on/off via checkboxes
- Category averages across all visible applications
- Dynamic scale supporting any min/max range (e.g. -2→3, -1→4, 0→5)

### Runtime Settings Panel
Gear icon in the title bar opens a settings modal:
- **Color palette** — Default, Tableau 10, Colorblind Safe, Pastel, Vivid
- **Data source** — switch between built-in or uploaded maturity models
- **Page title / Legend title** — editable text
- **Persistence** — settings saved to `localStorage`, restored on reload
- **Reset to Defaults** — clears all overrides

### Multiple Data Sources
- **URL query parameter**: `?data=iac_radar` loads the IaC model
- **Settings panel dropdown**: switch at runtime with full re-render
- **Admin panel** (`admin.html`): upload custom JSON configurations via API
- **Fallback chain**: URL param → active remote config → default → demo data

### Responsive Design
- Mobile (portrait), tablet, desktop, and large desktop breakpoints
- 44px minimum touch targets on mobile
- Dark mode via system preference or manual toggle
- High contrast and reduced motion media query support
- Accessible: skip links, ARIA labels, keyboard navigation

### Browser Compatibility
- **Modern**: ES modules, served via `index.html`
- **Legacy**: Webpack + Babel transpiled bundle via `index-legacy.html`
- Automatic detection with a warning banner linking to the legacy version
- Target: last 3 browser versions, >1% usage, not IE ≤ 11

---

## Built-in Maturity Models

### Continuous Delivery (default)
8 categories, 10 sample applications, scale -1 → 4.
Categories: Culture & Organization, Continuous Integration, Build Automation,
Deployment Automation, Test Automation, Reporting, Provisioning Automation,
Design & Architecture.

### Infrastructure as Code
5 categories, 6 sample applications, scale -2 → 3.
Categories: Development, Continuous Integration, Provisioning, Management,
Observability.

---

## Creating a Custom Model

Data files live in `js/data/` and export a `config` object:

```javascript
export const config = {
  meta: {
    pageTitle: "My Maturity Model",
    legendTitle: "Applications",
    averageTitle: "Category Averages",
    references: []
  },
  scale: {
    min: 0,
    max: 5,
    levels: [
      { score: 0, label: "None" },
      { score: 1, label: "Initial" },
      { score: 2, label: "Managed" },
      { score: 3, label: "Defined" },
      { score: 4, label: "Measured" },
      { score: 5, label: "Optimizing" }
    ]
  },
  categories: ["Category A", "Category B", "Category C"],
  applications: ["App 1", "App 2"],
  maturityData: [
    [
      { app: "App 1", axis: "Category A", value: 3 },
      { app: "App 1", axis: "Category B", value: 2 },
      { app: "App 1", axis: "Category C", value: 4 }
    ],
    [
      { app: "App 2", axis: "Category A", value: 1 },
      { app: "App 2", axis: "Category B", value: 4 },
      { app: "App 2", axis: "Category C", value: 2 }
    ]
  ],
  theme: {
    colorPalette: null  // null = use default; or a preset name or array of hex colors
  }
};
```

To register the new model, import it in `js/utils/dataLoader.js` and add an
entry to `DATA_SOURCES`. Alternatively, upload it as JSON via the admin panel.

---

## Development

### Build Commands

| Command | Description |
|---------|-------------|
| `npm run build:legacy` | Production bundle (Webpack + Babel → `dist/main.bundle.js`) |
| `npm test` | Run full test suite (Jest 30 + jsdom) |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run analyze` | Bundle size analysis (webpack-bundle-analyzer) |

### Stack

- **Visualization**: D3.js v7 (tree-shaken imports)
- **Build**: Webpack 5 + Babel 7 (targets last 3 versions, >1%, not IE ≤ 11)
- **Tests**: Jest 30 with jsdom (ES module support via `--experimental-vm-modules`)
- **Minification**: Terser
- **Containerization**: Apache 2.4 (httpd) Docker image

### Admin API (optional)

The `api/config.php` backend enables remote configuration management.
Requires PHP. Not needed for static-only deployments.

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET ?action=list` | No | List uploaded configurations |
| `GET ?action=get&name=<slug>` | No | Fetch a specific configuration |
| `GET ?action=active` | No | Get the active configuration |
| `POST ?action=save` | Yes | Upload/update a configuration |
| `POST ?action=delete` | Yes | Delete a configuration |
| `POST ?action=setactive` | Yes | Set the default configuration |

---

## License

[Apache 2.0](LICENSE)

## Acknowledgments

Originally derived from [cd-maturity-model](https://github.com/garystafford/cd-maturity-model) by Gary Stafford.
