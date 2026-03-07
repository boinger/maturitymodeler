/**
 * Tests for remote config loading functionality in dataLoader
 * Uses mock fetch to simulate API responses
 */

import { describe, test, expect, beforeEach, jest, afterEach } from '@jest/globals';
import {
    fetchRemoteConfigList,
    fetchRemoteConfig,
    fetchActiveConfig,
    loadRemoteDataSource,
    getAvailableDataSources,
    resetLoadingState,
    getLoadingState,
    validateDataStructure
} from '../../js/utils/dataLoader.js';

// Valid config in new-schema format for testing
const VALID_REMOTE_CONFIG = {
    meta: {
        pageTitle: 'Remote Test Model',
        legendTitle: 'Test Apps',
        averageTitle: 'Average',
        references: []
    },
    scale: {
        min: 0,
        max: 3,
        levels: [
            { score: 0, label: 'None' },
            { score: 1, label: 'Basic' },
            { score: 2, label: 'Good' },
            { score: 3, label: 'Expert' }
        ]
    },
    categories: ['Security', 'Testing', 'Deployment'],
    applications: ['App Alpha', 'App Beta'],
    maturityData: [
        [
            { app: 'App Alpha', axis: 'Security', value: 1 },
            { app: 'App Alpha', axis: 'Testing', value: 2 },
            { app: 'App Alpha', axis: 'Deployment', value: 3 }
        ],
        [
            { app: 'App Beta', axis: 'Security', value: 2 },
            { app: 'App Beta', axis: 'Testing', value: 1 },
            { app: 'App Beta', axis: 'Deployment', value: 2 }
        ]
    ],
    theme: {}
};

describe('Remote Data Loader', () => {
    let originalFetch;

    beforeEach(() => {
        resetLoadingState();
        originalFetch = global.fetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    function mockFetch(responseData, ok = true, status = 200) {
        global.fetch = jest.fn(() => Promise.resolve({
            ok,
            status,
            json: () => Promise.resolve(responseData)
        }));
    }

    describe('fetchRemoteConfigList', () => {
        test('should return list of configs from API', async () => {
            const mockList = [
                { slug: 'test-model', name: 'Test Model', created: '2026-01-01', updated: '2026-03-01', active: false },
                { slug: 'prod-model', name: 'Prod Model', created: '2026-02-01', updated: '2026-03-05', active: true }
            ];
            mockFetch({ success: true, data: mockList });

            const result = await fetchRemoteConfigList();
            expect(result).toHaveLength(2);
            expect(result[0].slug).toBe('test-model');
            expect(result[1].active).toBe(true);
        });

        test('should throw on API error', async () => {
            mockFetch({ success: false, error: 'Server error' });
            await expect(fetchRemoteConfigList()).rejects.toThrow('Server error');
        });

        test('should return empty array when data is null', async () => {
            mockFetch({ success: true, data: null });
            const result = await fetchRemoteConfigList();
            expect(result).toEqual([]);
        });
    });

    describe('fetchRemoteConfig', () => {
        test('should fetch a specific config by slug', async () => {
            mockFetch({ success: true, data: VALID_REMOTE_CONFIG });

            const result = await fetchRemoteConfig('test-model');
            expect(result.categories).toEqual(['Security', 'Testing', 'Deployment']);
            expect(result.applications).toHaveLength(2);
        });

        test('should throw on not found', async () => {
            mockFetch({ success: false, error: 'Config not found' });
            await expect(fetchRemoteConfig('nonexistent')).rejects.toThrow('Config not found');
        });

        test('should encode slug in URL', async () => {
            mockFetch({ success: true, data: VALID_REMOTE_CONFIG });
            await fetchRemoteConfig('my model');
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('name=my%20model'),
                expect.any(Object)
            );
        });
    });

    describe('fetchActiveConfig', () => {
        test('should return active config when one is set', async () => {
            mockFetch({
                success: true,
                data: { slug: 'prod-model', name: 'Prod', config: VALID_REMOTE_CONFIG }
            });

            const result = await fetchActiveConfig();
            expect(result.slug).toBe('prod-model');
            expect(result.config.categories).toHaveLength(3);
        });

        test('should return null when no active config', async () => {
            mockFetch({ success: true, data: null });
            const result = await fetchActiveConfig();
            expect(result).toBeNull();
        });

        test('should return null on network failure (graceful degradation)', async () => {
            global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
            const result = await fetchActiveConfig();
            expect(result).toBeNull();
        });

        test('should return null on non-success response', async () => {
            mockFetch({ success: false, error: 'Unauthorized' });
            const result = await fetchActiveConfig();
            expect(result).toBeNull();
        });
    });

    describe('loadRemoteDataSource', () => {
        test('should fetch, validate, and convert to legacy format', async () => {
            mockFetch({ success: true, data: VALID_REMOTE_CONFIG });

            const legacyData = await loadRemoteDataSource('test-model');

            // Should be in legacy format
            expect(legacyData.pageTitle).toBe('Remote Test Model');
            expect(legacyData.categoryCount).toBe(3);
            expect(legacyData.idAverageCategories).toBeDefined();
            expect(legacyData.maturityLevels).toHaveLength(4);
            expect(legacyData.emptyDataSet).toBeDefined();

            // Should pass legacy validation
            expect(validateDataStructure(legacyData)).toBe(true);
        });

        test('should update loading state to remote source', async () => {
            mockFetch({ success: true, data: VALID_REMOTE_CONFIG });

            await loadRemoteDataSource('test-model');
            const state = getLoadingState();
            expect(state.currentSource).toBe('remote:test-model');
        });

        test('should throw on invalid config', async () => {
            const invalidConfig = { ...VALID_REMOTE_CONFIG, categories: [] };
            mockFetch({ success: true, data: invalidConfig });

            await expect(loadRemoteDataSource('bad-model')).rejects.toThrow();
        });

        test('should throw on fetch failure', async () => {
            mockFetch({ success: false, error: 'Not found' });
            await expect(loadRemoteDataSource('missing')).rejects.toThrow('Not found');
        });
    });

    describe('getAvailableDataSources with remote configs', () => {
        test('should include remote configs in the list', async () => {
            const mockList = [
                { slug: 'uploaded-1', name: 'Uploaded Model', active: false }
            ];
            mockFetch({ success: true, data: mockList });

            const sources = await getAvailableDataSources();
            const uploaded = sources.filter(s => s.group === 'uploaded');
            expect(uploaded).toHaveLength(1);
            expect(uploaded[0].key).toBe('remote:uploaded-1');
            expect(uploaded[0].label).toBe('Uploaded Model');
        });

        test('should still return built-in sources when API fails', async () => {
            global.fetch = jest.fn(() => Promise.reject(new Error('API down')));

            const sources = await getAvailableDataSources();
            const builtIn = sources.filter(s => s.group === 'built-in');
            expect(builtIn.length).toBeGreaterThanOrEqual(2);
            const uploaded = sources.filter(s => s.group === 'uploaded');
            expect(uploaded).toHaveLength(0);
        });

        test('remote sources should have correct group label', async () => {
            const mockList = [
                { slug: 'test', name: 'Test', active: false }
            ];
            mockFetch({ success: true, data: mockList });

            const sources = await getAvailableDataSources();
            const remote = sources.find(s => s.key === 'remote:test');
            expect(remote.group).toBe('uploaded');
        });
    });
});
