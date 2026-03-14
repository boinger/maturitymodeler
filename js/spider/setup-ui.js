/**
 * Created by Gary A. Stafford on 1/29/15
 * Modified by Jeff Vier beginning 7 Dec 2020
 * https://github.com/boinger/maturitymodeler
 *
 * Source code based project by Nadieh Bremer:
 * http://www.visualcinnamon.com/2013/09/making-d3-radar-chart-look-bit-better.html
 * His source code comes from https://github.com/alangrafu/radar-chart-d3
 * For a bit of extra information check the blog about it:
 * http:nbremer.blogspot.nl/2013/09/making-d3-radar-chart-look-bit-better.html
 */

/*properties
 ExtraWidthX, addEventListener, app, append, appendChild, attr, checked,
 category10, className, createElement, createTextNode, currentTarget, cursor,
 data, draw, enter, getAppNames, getCategoryAvgs, getElementById,
 getElementsByClassName, getLegendNames, getSelectedData, getSingleDataSet, h,
 height, htmlFor, id, idAverageCategories, indexOf, innerHTML, legendTitle, length,
 levels, maxValue, name, onclick, pageTitle, push, referenceLinkTitle1,
 referenceLinkTitle2, referenceLink1, referenceLink2, scale, select, selectAll,
 setAttribute, splice, style, text, type, value, w, width
 */

/*global document, d3 */
/*jslint browser: true, plusplus: true, unparam: true */
import dataLoader from '../utils/dataLoader.js';
import memoryManager from '../utils/memoryManager.js';
import browserCompat from '../utils/browserCompat.js';
import imageOptimizer from '../utils/imageOptimizer.js';
import serviceWorker from '../utils/serviceWorker.js';
import performanceMonitor from '../utils/performanceMonitor.js';
// Use tree-shaken D3 for webpack bundle
import d3 from '../utils/d3-tree-shaken.js';
import transform from './transform.js';
import spider from './spider.js';
import { debugLog } from '../utils/debug.js';
import { fromLegacyFormat } from '../config/configSchema.js';
import { createSettingsPanel, getPersistedSettings } from './settingsPanel.js';

"use strict";
        // Active scale config derived from loaded data
        let activeScaleConfig = { min: -1, max: 4, levels: [] };

        let colorScale,
            checkboxes,
            config,
            drawLegend,
            createCheckbox,
            createLabel,
            createAppDiv,
            createCatAvgsDiv,
            createAllAppsDiv,
            createNoAppsDiv,
            createTitleDiv,
            attachDivs,
            createModelPopup,
            createModelImg,
            createRefLink,
            initializePage;

        // Get color scale from spider module or create fallback
        try {
            colorScale = spider.getColorScale();
        } catch (e) {
            console.error("Failed to get color scale from spider module:", e);
            colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        }

        //Tracks checkboxes
        checkboxes = [];
        
        // Update color indicators based on selected checkboxes
        function updateColorIndicators() {
            const allCheckboxes = document.getElementsByClassName("appCheckbox");
            for (let i = 0; i < allCheckboxes.length; i++) {
                const checkbox = allCheckboxes[i];
                const colorIndicator = document.getElementById("color-" + checkbox.data);
                if (colorIndicator) {
                    if (checkbox.checked) {
                        // Use the item's original index for consistent color assignment
                        colorIndicator.style.backgroundColor = colorScale(checkbox.data);
                        colorIndicator.style.visibility = "visible";
                    } else {
                        colorIndicator.style.visibility = "hidden";
                    }
                }
            }
        }

        // Calculate responsive dimensions based on screen size
        function getResponsiveConfig() {
            const screenWidth = window.innerWidth || document.documentElement.clientWidth;
            const screenHeight = window.innerHeight || document.documentElement.clientHeight;
            let chartSize, extraWidth;
            
            if (screenWidth <= 767) {
                // Mobile: smaller chart that fits in viewport
                chartSize = Math.min(screenWidth - 40, screenHeight - 200, 400);
                extraWidth = 50;
            } else if (screenWidth <= 1023) {
                // Tablet: medium chart
                chartSize = Math.min(screenWidth - 300, screenHeight - 100, 500);
                extraWidth = 100;
            } else if (screenWidth <= 1439) {
                // Desktop: standard chart
                chartSize = 600;
                extraWidth = 150;
            } else {
                // Large desktop: bigger chart
                chartSize = 700;
                extraWidth = 200;
            }
            
            // Ring count: number of scale levels minus 1 (center level has no ring)
            const ringCount = activeScaleConfig.levels.length > 1
                ? activeScaleConfig.levels.length - 1
                : activeScaleConfig.max - activeScaleConfig.min;

            return {
                w: chartSize,
                h: chartSize,
                maxValue: activeScaleConfig.max,
                minValue: activeScaleConfig.min,
                levels: ringCount,
                scaleLevels: activeScaleConfig.levels,
                ExtraWidthX: extraWidth,
                ExtraWidthY: extraWidth
            };
        }

        //Options for the Radar chart, responsive to screen size
        config = getResponsiveConfig();


        createCheckbox = function(app, i) {
            const newCheckbox = document.createElement("input");
            newCheckbox.type = "checkbox";
            newCheckbox.name = "app";
            newCheckbox.value = app;
            newCheckbox.id = "app" + i;
            newCheckbox.data = i;
            newCheckbox.className = "appCheckbox";
            newCheckbox.onclick = function(event) {
                const startTime = performance.now();
                
                // Track user interaction
                performanceMonitor.trackUserInteraction('checkbox-toggle', event.currentTarget.id, {
                    checked: event.currentTarget.checked,
                    app: app
                });
                
                if (event.currentTarget.checked) {
                    checkboxes.push(event.currentTarget.data);
                } else {
                    const index = checkboxes.indexOf(event.currentTarget.data);
                    if (index > -1) {
                        checkboxes.splice(index, 1);
                    }
                }
                // Use current responsive config
                config = getResponsiveConfig();
                spider.draw("#chart", transform.getRawSelectedData(checkboxes), config);
                
                // Track chart re-render performance
                performanceMonitor.trackChartRender('interaction-chart', startTime);
            };
            return newCheckbox;
        };

        createLabel = function(app, i) {
            const newLabel = document.createElement("label");
            newLabel.htmlFor = "app" + i;
            newLabel.style.display = "inline-block";
            newLabel.style.marginLeft = "5px";
            newLabel.appendChild(document.createTextNode(app));
            return newLabel;
        };

        createAppDiv = function(app, i) {
            const newDiv = document.createElement("div");
            const tempDataSet = transform.getSingleDataSet(app);
            if (tempDataSet === undefined) { // No data available
                return newDiv;
            }
            
            // Create color indicator
            const colorIndicator = document.createElement("span");
            colorIndicator.className = "color-indicator";
            colorIndicator.style.display = "inline-block";
            colorIndicator.style.width = "12px";
            colorIndicator.style.height = "12px";
            colorIndicator.style.backgroundColor = colorScale(i);
            colorIndicator.style.border = "1px solid #999";
            colorIndicator.style.visibility = "hidden"; // Initially hidden
            colorIndicator.id = "color-" + i;
            
            const checkbox = createCheckbox(app, i);
            
            // Update checkbox onclick to show/hide color
            const originalOnclick = checkbox.onclick;
            checkbox.onclick = function(event) {
                originalOnclick(event);
                updateColorIndicators();
            };
            
            newDiv.appendChild(colorIndicator);
            newDiv.appendChild(checkbox);
            newDiv.appendChild(createLabel(app, i));
            newDiv.style.cursor = "pointer";
            newDiv.className = "appDiv";
            
            // Add hover handlers for chart highlighting
            memoryManager.addManagedEventListener(newDiv, "mouseover", function() {
                // Only highlight if checkbox is checked
                debugLog('Menu item hover:', {app: app, index: i, checked: checkbox.checked, hasSpider: !!window.spider});
                if (checkbox.checked && window.spider) {
                    window.spider.highlightPolygon(i);
                }
            });
            
            memoryManager.addManagedEventListener(newDiv, "mouseout", function() {
                // Clear highlighting
                if (window.spider) {
                    window.spider.clearPolygonHighlight();
                }
            });
            
            return newDiv;
        };

        createCatAvgsDiv = function(dataRadar) {
            const newDiv = document.createElement("div");
            const tempDataSet = transform.getCategoryAvgs();
            if (tempDataSet[0] === undefined) { // No data available
                return newDiv;
            }
            const app = tempDataSet[0][0].app;
            
            // Create color indicator for average
            const colorIndicator = document.createElement("span");
            colorIndicator.className = "color-indicator";
            colorIndicator.style.display = "inline-block";
            colorIndicator.style.width = "12px";
            colorIndicator.style.height = "12px";
            colorIndicator.style.backgroundColor = colorScale(dataRadar?.idAverageCategories || 100);
            colorIndicator.style.border = "1px solid #999";
            colorIndicator.style.visibility = "hidden";
            colorIndicator.id = "color-" + (dataRadar?.idAverageCategories || 100);
            
            const checkbox = createCheckbox(app, dataRadar?.idAverageCategories || 100);
            
            // Update checkbox onclick to show/hide color
            const originalOnclick = checkbox.onclick;
            checkbox.onclick = function(event) {
                originalOnclick(event);
                updateColorIndicators();
            };
            
            newDiv.appendChild(colorIndicator);
            newDiv.appendChild(checkbox);
            newDiv.appendChild(createLabel(app, dataRadar?.idAverageCategories || 100));
            newDiv.style.cursor = "pointer";
            newDiv.className = "appDiv";
            return newDiv;
        };

        function checkAll() {
            const cbs = document.getElementsByClassName("appCheckbox");
            for (let i = 0; i < cbs.length; i++) {
                cbs[i].checked = true;
                checkboxes.push(cbs[i].data);
            }
            updateColorIndicators();
        }

        function checkNone() {
            checkboxes.length = 0;
            const cbs = document.getElementsByClassName("appCheckbox");
            for (let i = 0; i < cbs.length; i++) {
                cbs[i].checked = false;
            }
            updateColorIndicators();
        }

        createAllAppsDiv = function() {
            const newDiv = document.createElement("div");
            newDiv.textContent = "Check All";
            newDiv.style.cursor = "pointer";
            newDiv.className = "specialDiv";
            memoryManager.addManagedEventListener(newDiv, "click", function() {
                checkboxes = [];
                checkAll();
                // Use current responsive config
                config = getResponsiveConfig();
                spider.draw("#chart", transform.getRawSelectedData(checkboxes), config);
            });
            return newDiv;
        };
        createNoAppsDiv = function() {
            const newDiv = document.createElement("div");
            newDiv.textContent = "Check None";
            newDiv.style.cursor = "pointer";
            newDiv.className = "specialDiv";
            memoryManager.addManagedEventListener(newDiv, "click", function() {
                checkboxes = [];
                checkNone();
                // Use current responsive config
                config = getResponsiveConfig();
                spider.draw("#chart", transform.getRawSelectedData(checkboxes), config);
            });
            return newDiv;
        };

        createTitleDiv = function(dataRadar) {
            const newDiv = document.createElement("div");
            newDiv.textContent = dataRadar?.legendTitle || 'Application Platforms';
            newDiv.className = "titleDiv";
            return newDiv;
        };

        attachDivs = function(dataRadar) {
            const appNames = transform.getAppNames();
            const arrayLength = appNames.length;
            document.getElementById("apps")
                .appendChild(createTitleDiv(dataRadar));
            for (let i = 0; i < arrayLength; i++) {
                // Find the original index of this app name in the unsorted applications array
                const originalIndex = window.currentDataRadar?.applications?.indexOf(appNames[i]) ?? i;
                document.getElementById("apps")
                    .appendChild(createAppDiv(appNames[i], originalIndex));
            }
            document.getElementById("apps")
                .appendChild(createCatAvgsDiv(dataRadar));
            document.getElementById("apps")
                .appendChild(createAllAppsDiv());
            document.getElementById("apps")
                .appendChild(createNoAppsDiv());
        };

        createModelPopup = function() {
            const newPara = document.createElement("p");
            newPara.textContent = window.currentDataRadar?.referenceLinkTitle1 || 'Model Info';
            newPara.className = "footerLinks";
            memoryManager.addManagedEventListener(newPara, "click", function() {
                if (document.getElementById("model").className === "showModel") {
                    document.getElementById("model").className = "hideModel";
                } else {
                    document.getElementById("model").className = "showModel";
                }
            });
            document.getElementById("footer")
                .appendChild(newPara);
        };

        createModelImg = function() {
            // Use image optimizer for better performance
            const newImg = imageOptimizer.createOptimizedImage(
                "images/maturity-model-placeholder.svg",
                "Continuous Delivery Maturity Model Diagram",
                {
                    width: 921,
                    height: 466,
                    maxWidth: "100%",
                    lazy: false, // Don't lazy load this critical image
                    style: { cursor: "pointer" }
                }
            );
            
            memoryManager.addManagedEventListener(newImg, "click", function() {
                document.getElementById("model").className = "hideModel";
            });
            document.getElementById("model").className = "hideModel";
            document.getElementById("model").appendChild(newImg);
        };

        createRefLink = function() {
            const newLink = document.createElement("a");
            newLink.className = "footerLinks";
            const rawHref = window.currentDataRadar?.referenceLink2 || '#';
            try {
                const parsedUrl = new URL(rawHref, window.location.origin);
                newLink.setAttribute("href", (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') ? rawHref : '#');
            } catch (e) {
                newLink.setAttribute("href", '#');
            }
            newLink.textContent = window.currentDataRadar?.referenceLinkTitle2 || 'Reference';
            document.getElementById("footer")
                .appendChild(newLink);
        };

        /**
         * Reinitialize the app with a different data source or settings.
         * Clears chart, menu, and footer, then rebuilds everything.
         */
        async function reinitializeApp(settings) {
            try {
                // Determine data source
                const sourceName = settings?.dataSource;
                let newData;

                if (sourceName && sourceName.startsWith('remote:')) {
                    // Load remote config by slug
                    const slug = sourceName.slice(7);
                    newData = await dataLoader.loadRemoteDataSource(slug);
                } else if (sourceName) {
                    newData = dataLoader.loadDataSource(sourceName);
                } else {
                    newData = await dataLoader.loadDataWithFallback();
                }

                window.currentDataRadar = newData;

                // Derive scale
                const parsedConfig = fromLegacyFormat(newData);
                if (parsedConfig.scale) {
                    activeScaleConfig = parsedConfig.scale;
                }

                // Update transform
                transform.setDataSource(newData);

                // Clear existing UI
                const appsEl = document.getElementById("apps");
                if (appsEl) appsEl.textContent = '';
                const footerEl = document.getElementById("footer");
                if (footerEl) footerEl.textContent = '';

                // Reset checkboxes
                checkboxes = [];

                // Recalculate config with new scale
                config = getResponsiveConfig();

                // Apply color preset if specified
                if (settings?.colorPreset) {
                    config.colorPreset = settings.colorPreset;
                }

                // Set page title
                const pageTitle = settings?.pageTitle || newData.pageTitle;
                const titleEl = document.getElementById("title");
                if (titleEl) {
                    // Preserve child elements (dark mode toggle, gear) by only setting first text node
                    const textNode = titleEl.firstChild;
                    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                        textNode.nodeValue = pageTitle;
                    } else {
                        titleEl.insertBefore(document.createTextNode(pageTitle), titleEl.firstChild);
                    }
                }

                // Redraw chart
                spider.draw("#chart", transform.getRawCategoryAvgs(), config);

                // Override legend title if specified
                const legendOverride = settings?.legendTitle;

                // Rebuild menu
                attachDivs(newData);

                // Apply legend title override after attachDivs creates the titleDiv
                if (legendOverride) {
                    const legendEl = document.querySelector('.titleDiv');
                    if (legendEl) legendEl.textContent = legendOverride;
                }

                // Check category averages by default
                const avgId = newData.idAverageCategories || 100;
                const avgCheckbox = document.getElementById("app" + avgId);
                if (avgCheckbox) {
                    avgCheckbox.checked = true;
                    checkboxes.push(avgId);
                }
                updateColorIndicators();

                // Re-derive color scale from the freshly drawn chart
                try {
                    colorScale = spider.getColorScale();
                } catch (e) {
                    // keep existing colorScale
                }

                // Rebuild footer
                createModelPopup();
                createModelImg();
                createRefLink();

            } catch (error) {
                console.error('reinitializeApp failed:', error);
            }
        }

        // Handle window resize for responsive chart
        function handleResize() {
            // Recalculate responsive configuration
            config = getResponsiveConfig();
            
            // Redraw chart with new dimensions if data is available
            if (window.currentDataRadar) {
                // Clean up existing chart first
                memoryManager.cleanupChart("#chart");

                // Redraw with current selection (not just category averages)
                const data = checkboxes.length > 0
                    ? transform.getRawSelectedData(checkboxes)
                    : transform.getRawCategoryAvgs();
                spider.draw("#chart", data, config);
            }
        }
        
        // Debounced resize handler to avoid excessive redraws
        let resizeTimeout;
        function debouncedResize() {
            if (resizeTimeout) {
                memoryManager.clearManagedTimer(resizeTimeout);
            }
            resizeTimeout = memoryManager.addManagedTimeout(handleResize, 250);
        }

        // Dark mode toggle functionality
        function createDarkModeToggle() {
            // Resolve theme: saved > system preference > light
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

            // Apply theme via data-theme attribute (single source of truth for CSS)
            function applyTheme(dark) {
                document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
            }
            applyTheme(isDark);

            // Create toggle container
            const toggleContainer = document.createElement('div');
            toggleContainer.id = 'dark-mode-toggle';
            toggleContainer.setAttribute('role', 'button');
            toggleContainer.setAttribute('aria-label', 'Toggle dark mode');
            toggleContainer.setAttribute('tabindex', '0');

            const sunSpan = document.createElement('span');
            sunSpan.className = 'toggle-icon sun-icon';
            sunSpan.textContent = '\u2600\uFE0F';
            const moonSpan = document.createElement('span');
            moonSpan.className = 'toggle-icon moon-icon';
            moonSpan.textContent = '\uD83C\uDF19';
            const slider = document.createElement('div');
            slider.className = 'toggle-slider';
            toggleContainer.appendChild(sunSpan);
            toggleContainer.appendChild(moonSpan);
            toggleContainer.appendChild(slider);

            if (isDark) toggleContainer.classList.add('dark');

            // Add to title bar
            const titleElement = document.getElementById('title');
            titleElement.style.position = 'relative';
            titleElement.appendChild(toggleContainer);

            // Toggle handler
            function toggleDarkMode() {
                const currentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
                const newDark = !currentlyDark;
                applyTheme(newDark);
                toggleContainer.classList.toggle('dark', newDark);
                localStorage.setItem('theme', newDark ? 'dark' : 'light');
                debugLog('Theme toggled to:', newDark ? 'dark' : 'light');
            }

            // Event listeners
            toggleContainer.addEventListener('click', toggleDarkMode);
            toggleContainer.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleDarkMode();
                }
            });
        }

        initializePage = async function() {
            try {
                // Start performance monitoring
                performanceMonitor.setupPerformanceMonitoring();
                const initStartTime = performance.now();
                
                // Initialize performance optimizations early
                imageOptimizer.initializeImageOptimization();
                serviceWorker.initializeServiceWorker();
                
                // Check browser compatibility and show warning if needed
                browserCompat.checkBrowserCompatibility();
                
                // Load data with error handling and fallbacks
                const dataLoadStart = performance.now();
                const dataRadar = await dataLoader.loadDataWithFallback();
                performanceMonitor.trackDataLoad('primary', dataLoadStart, true);
                
                // Store globally for reference functions
                window.currentDataRadar = dataRadar;

                // Derive scale config from loaded data
                const parsedConfig = fromLegacyFormat(dataRadar);
                if (parsedConfig.scale) {
                    activeScaleConfig = parsedConfig.scale;
                }

                // Update transform module with loaded data
                transform.setDataSource(dataRadar);
                
                // Initialize the page with loaded data
                document.getElementById("title").textContent = dataRadar.pageTitle;
                
                // Add dark mode toggle
                createDarkModeToggle();
                
                // Recalculate config now that scale is loaded
                config = getResponsiveConfig();

                // Track chart rendering performance
                const chartRenderStart = performance.now();
                spider.draw("#chart", transform.getRawCategoryAvgs(), config);
                performanceMonitor.trackChartRender('main-chart', chartRenderStart);
                attachDivs(dataRadar);
                document.getElementById("app100").checked = true;
                checkboxes.push(dataRadar.idAverageCategories);
                updateColorIndicators(); // Show initial color
                createModelPopup();
                createModelImg();
                createRefLink();

                // Apply any persisted settings from previous session
                const persisted = getPersistedSettings();
                if (persisted.colorPreset || persisted.pageTitle || persisted.legendTitle) {
                    // Apply non-data-source settings without full reinit
                    if (persisted.pageTitle) {
                        const titleNode = document.getElementById("title")?.firstChild;
                        if (titleNode && titleNode.nodeType === Node.TEXT_NODE) {
                            titleNode.nodeValue = persisted.pageTitle;
                        }
                    }
                    if (persisted.legendTitle) {
                        const legendEl = document.querySelector('.titleDiv');
                        if (legendEl) legendEl.textContent = persisted.legendTitle;
                    }
                }

                // Create settings panel
                createSettingsPanel({
                    onApply: function(settings) {
                        reinitializeApp(settings);
                    },
                    onReset: function() {
                        // Full reload to clear everything
                        reinitializeApp({});
                    }
                });

                // Add resize listener for responsive behavior
                memoryManager.addManagedEventListener(window, 'resize', debouncedResize);
                
                // Setup memory management and monitoring
                memoryManager.setupPageUnloadCleanup();
                memoryManager.startMemoryMonitoring({
                    checkInterval: 60000, // Check every minute
                    memoryThreshold: 50 * 1024 * 1024, // 50MB threshold
                    d3CleanupAge: 300000 // Clean D3 selections older than 5 minutes
                });
                
                // Show warning if using fallback data
                const loadingState = dataLoader.getLoadingState();
                if (loadingState.usingFallback) {
                    console.warn('Application loaded with demo data due to loading errors');
                }
                
            } catch (error) {
                console.error('Critical initialization error:', error);
                // Error UI is already shown by dataLoader
            }
        };

        // Initialize asynchronously
        initializePage().catch(error => {
            console.error('Failed to initialize application:', error);
        });

// ES Module exports (setup module initializes on import)
export default { initializePage };
