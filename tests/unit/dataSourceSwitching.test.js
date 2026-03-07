/**
 * Tests for data source switching in dataLoader
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
    loadDataSource,
    getAvailableDataSources,
    getLoadingState,
    resetLoadingState,
    validateDataStructure
} from '../../js/utils/dataLoader.js';

describe('Data Source Switching', () => {

    beforeEach(() => {
        resetLoadingState();
    });

    describe('getAvailableDataSources', () => {
        test('should return at least 2 data sources', async () => {
            const sources = await getAvailableDataSources();
            expect(sources.length).toBeGreaterThanOrEqual(2);
        });

        test('should include data_radar and iac_radar', async () => {
            const sources = await getAvailableDataSources();
            const keys = sources.map(s => s.key);
            expect(keys).toContain('data_radar');
            expect(keys).toContain('iac_radar');
        });

        test('should have label, active, and group for each source', async () => {
            const sources = await getAvailableDataSources();
            for (const source of sources) {
                expect(typeof source.key).toBe('string');
                expect(typeof source.label).toBe('string');
                expect(typeof source.active).toBe('boolean');
                expect(typeof source.group).toBe('string');
            }
        });

        test('should mark data_radar as active by default', async () => {
            const sources = await getAvailableDataSources();
            const cdSource = sources.find(s => s.key === 'data_radar');
            expect(cdSource.active).toBe(true);
        });

        test('built-in sources should have group "built-in"', async () => {
            const sources = await getAvailableDataSources();
            const builtIn = sources.filter(s => s.group === 'built-in');
            expect(builtIn.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('loadDataSource', () => {
        test('should load data_radar successfully', () => {
            const data = loadDataSource('data_radar');
            expect(data.pageTitle).toContain('CI/CD');
            expect(data.categories.length).toBe(8);
            expect(data.applications.length).toBe(10);
        });

        test('should load iac_radar successfully', () => {
            const data = loadDataSource('iac_radar');
            expect(data.pageTitle).toContain('IaC');
            expect(data.categories.length).toBe(5);
            expect(data.applications.length).toBe(6);
        });

        test('should throw for unknown source', () => {
            expect(() => loadDataSource('nonexistent')).toThrow('Unknown data source');
        });

        test('should update loading state currentSource', () => {
            loadDataSource('iac_radar');
            const state = getLoadingState();
            expect(state.currentSource).toBe('iac_radar');
        });

        test('should update active status after switching', async () => {
            loadDataSource('iac_radar');
            const sources = await getAvailableDataSources();
            const iac = sources.find(s => s.key === 'iac_radar');
            const cd = sources.find(s => s.key === 'data_radar');
            expect(iac.active).toBe(true);
            expect(cd.active).toBe(false);
        });
    });

    describe('validateDataStructure with different models', () => {
        test('should validate CD model data', () => {
            const data = loadDataSource('data_radar');
            expect(validateDataStructure(data)).toBe(true);
        });

        test('should validate IaC model data', () => {
            const data = loadDataSource('iac_radar');
            expect(validateDataStructure(data)).toBe(true);
        });
    });

    describe('Cross-model data integrity', () => {
        test('CD and IaC models should have different scales', () => {
            const cd = loadDataSource('data_radar');
            const iac = loadDataSource('iac_radar');

            // CD: -1 to 4, IaC: -2 to 3
            const cdLevels = cd.maturityLevels;
            const iacLevels = iac.maturityLevels;

            const cdMin = Math.min(...cdLevels.map(l => l.score));
            const cdMax = Math.max(...cdLevels.map(l => l.score));
            const iacMin = Math.min(...iacLevels.map(l => l.score));
            const iacMax = Math.max(...iacLevels.map(l => l.score));

            expect(cdMin).toBe(-1);
            expect(cdMax).toBe(4);
            expect(iacMin).toBe(-2);
            expect(iacMax).toBe(3);
        });

        test('maturityData dimensions should match for each model', () => {
            const cd = loadDataSource('data_radar');
            expect(cd.maturityData.length).toBe(cd.applications.length);
            cd.maturityData.forEach(appData => {
                expect(appData.length).toBe(cd.categories.length);
            });

            const iac = loadDataSource('iac_radar');
            expect(iac.maturityData.length).toBe(iac.applications.length);
            iac.maturityData.forEach(appData => {
                expect(appData.length).toBe(iac.categories.length);
            });
        });
    });
});
