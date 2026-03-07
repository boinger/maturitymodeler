# Admin Config Upload System - Implementation Plan

## Steps

- [x] **Step 1**: PHP backend (`api/auth.php`, `api/validate.php`, `api/config.php`, `api/.htaccess`)
- [x] **Step 2**: Config storage setup (`configs/.htaccess`, `configs/_registry.json`)
- [x] **Step 3**: Admin page (`admin.html`)
- [x] **Step 4**: Extend `js/utils/dataLoader.js` with remote config fetching
- [x] **Step 5**: Extend `settingsPanel.js` and `setup-ui.js` for remote sources
- [x] **Step 6**: Tests (`remoteDataLoader.test.js`, update `dataSourceSwitching.test.js`)
- [x] **Step 7**: Verification (build, test suite, manual checks)

## Modified Files
- `api/auth.php` — NEW
- `api/validate.php` — NEW
- `api/config.php` — NEW
- `api/.htaccess` — NEW
- `configs/.htaccess` — NEW
- `configs/_registry.json` — NEW
- `admin.html` — NEW
- `js/utils/dataLoader.js` — Modified
- `js/spider/settingsPanel.js` — Modified
- `js/spider/setup-ui.js` — Modified
- `tests/unit/remoteDataLoader.test.js` — NEW
- `tests/unit/dataSourceSwitching.test.js` — Modified
