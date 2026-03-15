# Plan: Codebase Audit — Findings and Remediation

All six phases complete.

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

- [x] 4A. Deleted 9 fake test files, rewrote dataValidation + colorScale to test real production code
- [x] 4B. Un-skipped SpiderChart.test.js (17 tests) and esModules.test.js (7 tests) via D3 mock
- [x] 4C. Fixed async assertion anti-pattern in errorScenarios.test.js
- [x] 4E. Fixed global console mock — spy-with-forwarding instead of silencing

## Phase 5 — Architecture Refactoring (P3 remainder) ✓

- [x] 3A. SpiderChart no longer reads window.currentDataRadar — receives applications/categories/averageTitle via config
- [x] 3B. setup-ui.js is side-effect-free on import — new js/app.js entry point calls initializePage()
- [x] 3E. Moved static inline .style() calls to CSS classes
- [x] 3F. Legacy wrappers assessed — spider.js and transform.js are load-bearing; elimination deferred

## Phase 6 — Build & Hardening (P5) ✓

- [x] 5A. Webpack supports development mode — NODE_ENV=development enables source maps and skips minification
- [x] 5B. browserCompat.js rewritten to use structural feature detection — CSP-safe, no code evaluation
- [x] 5C. Content Security Policy added to index.html, index-legacy.html, and admin.html
- [x] 5D. Rate limiting now proxy-aware — getClientIp() checks X-Forwarded-For from TRUSTED_PROXIES
