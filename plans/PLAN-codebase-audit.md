# Plan: Codebase Audit — Findings and Remediation

## Phase 1 — Security (P1) ✓

- [x] 1A. XSS via innerHTML in setup-ui.js — replaced with textContent (4 locations)
- [x] 1B. Unvalidated href from data config — validate URL scheme (http/https only)
- [x] 1C. error.message interpolated into innerHTML in spider.js — built error UI with DOM APIs
- [x] 1D. secrets.php — ALREADY DONE (in .gitignore, not tracked)
- [x] 1E. sanitizeConfigStrings double-encodes — made function identity (pass-through)

## Phase 2 — Active Bugs (P2) ✓

- [x] 2A. handleResize loses checkbox selections — uses getRawSelectedData(checkboxes) when selections exist
- [x] 2B. memoryManager.cleanupChart references undefined d3 — rewritten to vanilla DOM (textContent = '')
- [x] 2C. Tooltip elements accumulate on re-render — select-or-create pattern
- [x] 2D. Grid level labels accumulate on re-render — remove existing before loop
- [x] 2E. Color scale mismatch after palette change — re-derive colorScale after reinitializeApp
- [x] 2F. checkNone() doesn't clear checkboxes array — added checkboxes.length = 0
- [x] 2G. Unmanaged setInterval in performanceMonitor — stored interval ID, added cleanup() export
- [x] 2H. Fire-and-forget async in settingsPanel — disable Apply until dropdown populated

## Phase 3 — CSS/Architecture Quick Wins (P3 subset) ✓

- [x] 3C. CSS undefined custom property references — fixed --spacing-sm/md, --transition-duration, --border-radius, --z-index-tooltip
- [x] 3D. Dark mode CSS deduplicated — single [data-theme="dark"] block, removed all !important, JS sets data-theme attribute
- [x] 3G. var → const/let throughout setup-ui.js

## Phase 4 — Test Suite Overhaul (P4) ✓

- [x] 4A. Deleted 9 fake test files (basic, textWrapping, responsive, imageReplacement.disabled, radar, tooltip, checkbox, SpiderChart-mocked, performanceOptimizations)
- [x] 4A. Rewrote dataValidation.test.js to import real validateConfig/fromLegacyFormat/deepMerge/resolveColorPalette
- [x] 4A. Rewrote colorScale.test.js to import real DEFAULT_COLOR_PALETTE/COLOR_PRESETS/resolveColorPalette
- [x] 4B. Un-skipped SpiderChart.test.js (17 tests) — created D3 mock, fixed coordinate assertions
- [x] 4B. Un-skipped esModules.test.js (7 tests) — D3 mock resolved module linking
- [x] 4C. Fixed async assertion anti-pattern in errorScenarios.test.js
- [x] 4D. Coverage gaps partially addressed (configSchema now well-tested; SpiderChart class now tested)
- [x] 4E. Fixed global console mock — now spies with forwarding instead of silencing

## Phase 5 — Architecture Refactoring (P3 remainder)

- [ ] 3A, 3B, 3E, 3F. Deeper structural changes

## Phase 6 — Build & Hardening (P5)

- [ ] 5A-5D. Dev mode, CSP, feature detection, proxy-aware rate limiting
