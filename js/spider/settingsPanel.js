/**
 * Runtime Settings Panel
 *
 * Collapsible panel providing:
 * - Color palette selector (preset palettes)
 * - Data source selector (switch maturity models)
 * - Page title / Legend title editing
 * - Reference link editing
 * - Reset to defaults
 *
 * Settings persist to localStorage for the session.
 *
 * @module settingsPanel
 */

"use strict";

import { COLOR_PRESETS, resolveColorPalette, fromLegacyFormat } from '../config/configSchema.js';
import dataLoader from '../utils/dataLoader.js';
import memoryManager from '../utils/memoryManager.js';

const STORAGE_KEY = 'maturityModeler_settings';

/**
 * Load persisted settings from localStorage
 * @returns {Object} Saved settings or empty object
 */
function loadSettings() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        return {};
    }
}

/**
 * Save settings to localStorage
 * @param {Object} settings
 */
function saveSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        console.warn('settingsPanel: Could not save settings to localStorage');
    }
}

/**
 * Clear persisted settings
 */
function clearSettings() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        // ignore
    }
}

/**
 * Create the settings gear button
 * @returns {HTMLElement}
 */
function createGearButton() {
    const btn = document.createElement('button');
    btn.id = 'settings-gear';
    btn.setAttribute('aria-label', 'Open settings');
    btn.setAttribute('title', 'Settings');
    btn.type = 'button';
    // Gear icon via CSS content or text
    btn.textContent = '\u2699'; // Unicode gear
    return btn;
}

/**
 * Create a labeled select element
 * @param {string} id
 * @param {string} labelText
 * @param {Array<{value: string, text: string, selected?: boolean}>} options
 * @returns {HTMLElement} Container div
 */
function createSelect(id, labelText, options) {
    const group = document.createElement('div');
    group.className = 'settings-field';

    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = labelText;
    group.appendChild(label);

    const select = document.createElement('select');
    select.id = id;
    select.name = id;
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        if (opt.selected) option.selected = true;
        select.appendChild(option);
    });
    group.appendChild(select);

    return group;
}

/**
 * Create a labeled text input
 * @param {string} id
 * @param {string} labelText
 * @param {string} value
 * @returns {HTMLElement} Container div
 */
function createTextInput(id, labelText, value) {
    const group = document.createElement('div');
    group.className = 'settings-field';

    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = labelText;
    group.appendChild(label);

    const input = document.createElement('input');
    input.type = 'text';
    input.id = id;
    input.name = id;
    input.value = value || '';
    group.appendChild(input);

    return group;
}

/**
 * Build and attach the settings panel to the DOM.
 * @param {Object} options
 * @param {Function} options.onApply - Called with settings object when user applies changes
 * @param {Function} options.onReset - Called when user resets to defaults
 * @returns {Object} Panel API: { open, close, toggle, destroy }
 */
function createSettingsPanel({ onApply, onReset }) {
    const saved = loadSettings();

    // Gear button - appended to #title
    const gear = createGearButton();
    const titleEl = document.getElementById('title');
    if (titleEl) {
        titleEl.appendChild(gear);
    }

    // Panel overlay
    const overlay = document.createElement('div');
    overlay.id = 'settings-overlay';
    overlay.className = 'settings-overlay hidden';

    // Panel container
    const panel = document.createElement('div');
    panel.id = 'settings-panel';
    panel.className = 'settings-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Settings');

    // Header
    const header = document.createElement('div');
    header.className = 'settings-header';
    const headerTitle = document.createElement('h3');
    headerTitle.textContent = 'Settings';
    header.appendChild(headerTitle);
    const closeBtn = document.createElement('button');
    closeBtn.className = 'settings-close';
    closeBtn.setAttribute('aria-label', 'Close settings');
    closeBtn.textContent = '\u00D7'; // &times;
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'settings-body';

    // -- Color palette selector
    const paletteOptions = Object.entries(COLOR_PRESETS).map(([key, preset]) => ({
        value: key,
        text: preset.name,
        selected: (saved.colorPreset || 'default') === key
    }));
    body.appendChild(createSelect('settings-palette', 'Color Palette', paletteOptions));

    // -- Data source selector
    const dataSources = dataLoader.getAvailableDataSources();
    const dsOptions = dataSources.map(ds => ({
        value: ds.key,
        text: ds.label,
        selected: saved.dataSource ? ds.key === saved.dataSource : ds.active
    }));
    body.appendChild(createSelect('settings-datasource', 'Data Source', dsOptions));

    // -- Page title
    const currentTitle = document.getElementById('title');
    // Get just the text, not child elements
    const titleText = currentTitle ? (currentTitle.firstChild?.nodeValue || currentTitle.textContent || '') : '';
    body.appendChild(createTextInput('settings-page-title', 'Page Title', saved.pageTitle || titleText.trim()));

    // -- Legend title
    const legendDiv = document.querySelector('.titleDiv');
    body.appendChild(createTextInput('settings-legend-title', 'Legend Title', saved.legendTitle || (legendDiv ? legendDiv.textContent : '')));

    panel.appendChild(body);

    // Footer with buttons
    const footer = document.createElement('div');
    footer.className = 'settings-footer';

    const applyBtn = document.createElement('button');
    applyBtn.className = 'settings-btn settings-btn-primary';
    applyBtn.textContent = 'Apply';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'settings-btn settings-btn-secondary';
    resetBtn.textContent = 'Reset to Defaults';

    footer.appendChild(resetBtn);
    footer.appendChild(applyBtn);
    panel.appendChild(footer);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // -- Event handlers --
    function open() {
        overlay.classList.remove('hidden');
        panel.querySelector('select')?.focus();
    }

    function close() {
        overlay.classList.add('hidden');
    }

    function toggle() {
        if (overlay.classList.contains('hidden')) {
            open();
        } else {
            close();
        }
    }

    memoryManager.addManagedEventListener(gear, 'click', toggle);
    memoryManager.addManagedEventListener(closeBtn, 'click', close);
    memoryManager.addManagedEventListener(overlay, 'click', (e) => {
        if (e.target === overlay) close();
    });

    // Keyboard: Escape closes
    memoryManager.addManagedEventListener(panel, 'keydown', (e) => {
        if (e.key === 'Escape') close();
    });

    memoryManager.addManagedEventListener(applyBtn, 'click', () => {
        const settings = {
            colorPreset: document.getElementById('settings-palette').value,
            dataSource: document.getElementById('settings-datasource').value,
            pageTitle: document.getElementById('settings-page-title').value,
            legendTitle: document.getElementById('settings-legend-title').value,
        };
        saveSettings(settings);
        close();
        if (onApply) onApply(settings);
    });

    memoryManager.addManagedEventListener(resetBtn, 'click', () => {
        clearSettings();
        close();
        if (onReset) onReset();
    });

    return { open, close, toggle, destroy: () => { overlay.remove(); gear.remove(); } };
}

/**
 * Get the currently persisted settings (e.g. on page load)
 * @returns {Object}
 */
function getPersistedSettings() {
    return loadSettings();
}

export { createSettingsPanel, getPersistedSettings, loadSettings, saveSettings, clearSettings };

export default { createSettingsPanel, getPersistedSettings, loadSettings, saveSettings, clearSettings };
