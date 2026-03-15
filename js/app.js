/**
 * Application entry point.
 * Imports setup-ui and triggers initialization.
 */
import setupUi from './spider/setup-ui.js';

setupUi.initializePage().catch(error => {
    console.error('Failed to initialize application:', error);
});
