/**
 * Tests for settingsPanel module
 * Tests persistence logic (localStorage) and settings API.
 * DOM-dependent tests (createSettingsPanel) are limited since jsdom has constraints.
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { loadSettings, saveSettings, clearSettings, getPersistedSettings } from '../../js/spider/settingsPanel.js';

describe('settingsPanel', () => {

    beforeEach(() => {
        // Clear localStorage before each test
        if (typeof localStorage !== 'undefined') {
            localStorage.clear();
        }
    });

    afterEach(() => {
        if (typeof localStorage !== 'undefined') {
            localStorage.clear();
        }
    });

    describe('saveSettings / loadSettings', () => {
        test('should persist and retrieve settings', () => {
            const settings = { colorPreset: 'colorblind', pageTitle: 'Test' };
            saveSettings(settings);
            const loaded = loadSettings();
            expect(loaded.colorPreset).toBe('colorblind');
            expect(loaded.pageTitle).toBe('Test');
        });

        test('should return empty object when nothing saved', () => {
            const loaded = loadSettings();
            expect(loaded).toEqual({});
        });

        test('should overwrite previous settings', () => {
            saveSettings({ colorPreset: 'default' });
            saveSettings({ colorPreset: 'vivid' });
            const loaded = loadSettings();
            expect(loaded.colorPreset).toBe('vivid');
        });
    });

    describe('clearSettings', () => {
        test('should remove persisted settings', () => {
            saveSettings({ colorPreset: 'pastel' });
            clearSettings();
            const loaded = loadSettings();
            expect(loaded).toEqual({});
        });
    });

    describe('getPersistedSettings', () => {
        test('should return same as loadSettings', () => {
            saveSettings({ dataSource: 'iac_radar' });
            const persisted = getPersistedSettings();
            expect(persisted.dataSource).toBe('iac_radar');
        });
    });
});
