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

"use strict";
        var colorScale,
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
        
        // Cross-highlighting functions for chart-menu interaction
        function highlightChartElement(targetOriginalIndex) {
            // Use D3 to properly highlight/dim polygons based on originalIndex
            const chartContainer = document.querySelector('#chart');
            if (chartContainer) {
                const svg = d3.select(chartContainer).select('svg');
                const polygons = svg.selectAll('polygon');
                
                // Dim all polygons first
                polygons.transition()
                    .duration(200)
                    .style('fill-opacity', 0.1);
                
                // Highlight the matching polygon
                polygons.filter(function(d) {
                    return d && d[0] && d[0].originalIndex === targetOriginalIndex;
                })
                .transition()
                .duration(200)
                .style('fill-opacity', 0.7);
            }
        }
        
        function clearChartHighlight() {
            // Use D3 to restore all polygons to default state
            const chartContainer = document.querySelector('#chart');
            if (chartContainer) {
                const svg = d3.select(chartContainer).select('svg');
                const polygons = svg.selectAll('polygon');
                
                polygons.transition()
                    .duration(200)
                    .style('fill-opacity', config.opacityArea || 0.5);
            }
        }

        // Update color indicators based on selected checkboxes
        function updateColorIndicators() {
            var allCheckboxes = document.getElementsByClassName("appCheckbox");
            for (var i = 0; i < allCheckboxes.length; i++) {
                var checkbox = allCheckboxes[i];
                var colorIndicator = document.getElementById("color-" + checkbox.data);
                if (colorIndicator) {
                    if (checkbox.checked) {
                        // Don't change the color - it was set correctly during menu creation
                        // colorIndicator.style.backgroundColor = colorScale(checkbox.data); // REMOVED - this was the bug!
                        colorIndicator.style.visibility = "visible";
                    } else {
                        colorIndicator.style.visibility = "hidden";
                    }
                }
            }
        }

        // Calculate responsive dimensions based on screen size
        function getResponsiveConfig() {
            var screenWidth = window.innerWidth || document.documentElement.clientWidth;
            var screenHeight = window.innerHeight || document.documentElement.clientHeight;
            var chartSize, extraWidth;
            
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
            
            return {
                w: chartSize,
                h: chartSize,
                maxValue: 100,
                levels: 5,
                ExtraWidthX: extraWidth,
                ExtraWidthY: extraWidth
            };
        }

        //Options for the Spider chart, responsive to screen size
        config = getResponsiveConfig();


        createCheckbox = function(app, i) {
            var newCheckbox = document.createElement("input");
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
                    var index = checkboxes.indexOf(event.currentTarget.data);
                    if (index > -1) {
                        checkboxes.splice(index, 1);
                    }
                }
                // Use current responsive config
                config = getResponsiveConfig();
                spider.draw("#chart", transform.getSelectedData(checkboxes), config);
                
                // If a checkbox was just checked, highlight the newly added polygon
                if (event.currentTarget.checked) {
                    // Get the originalIndex for highlighting
                    var tempDataSet = transform.getSingleDataSet(app);
                    var originalIndex = tempDataSet && tempDataSet[0] ? tempDataSet[0].originalIndex : event.currentTarget.data;
                    
                    // Highlight the newly added polygon briefly
                    setTimeout(function() {
                        highlightChartElement(originalIndex);
                        
                        // Clear the highlight after 2 seconds
                        setTimeout(function() {
                            clearChartHighlight();
                        }, 2000);
                    }, 50); // Small delay to ensure chart is rendered
                }
                
                // Track chart re-render performance
                performanceMonitor.trackChartRender('interaction-chart', startTime);
            };
            return newCheckbox;
        };

        createLabel = function(app, i) {
            var newLabel = document.createElement("label");
            newLabel.htmlFor = "app" + i;
            newLabel.style.display = "inline-block";
            newLabel.style.marginLeft = "5px";
            newLabel.appendChild(document.createTextNode(app));
            return newLabel;
        };

        createAppDiv = function(app, i) {
            var newDiv,
                tempDataSet,
                colorIndicator,
                checkbox;

            newDiv = document.createElement("div");
            tempDataSet = transform.getSingleDataSet(app);
            if (tempDataSet === undefined) { // No data available
                return newDiv;
            }
            
            // Create color indicator - need to get the originalIndex from the actual data
            colorIndicator = document.createElement("span");
            colorIndicator.className = "color-indicator";
            colorIndicator.style.display = "inline-block";
            colorIndicator.style.width = "12px";
            colorIndicator.style.height = "12px";
            
            // Get the originalIndex from the actual data point to match chart colors
            var actualOriginalIndex = tempDataSet && tempDataSet[0] ? tempDataSet[0].originalIndex : i;
            
            // Color assignment using originalIndex for consistency with chart
            
            colorIndicator.style.backgroundColor = colorScale(actualOriginalIndex);
            colorIndicator.style.border = "1px solid #999";
            colorIndicator.style.visibility = "hidden"; // Initially hidden
            colorIndicator.id = "color-" + i;
            
            checkbox = createCheckbox(app, i);
            
            // Update checkbox onclick to show/hide color
            var originalOnclick = checkbox.onclick;
            checkbox.onclick = function(event) {
                originalOnclick(event);
                updateColorIndicators();
            };
            
            newDiv.appendChild(colorIndicator);
            newDiv.appendChild(checkbox);
            newDiv.appendChild(createLabel(app, i));
            newDiv.style.cursor = "pointer";
            newDiv.className = "appDiv";
            
            // Add cross-highlighting interaction for chart-menu connection  
            (function(originalIndex) {
                newDiv.addEventListener('mouseenter', function() {
                    // Only highlight if this checkbox is checked
                    if (checkbox.checked) {
                        highlightChartElement(originalIndex);
                    }
                });
                newDiv.addEventListener('mouseleave', function() {
                    // Only clear highlight if this checkbox is checked
                    if (checkbox.checked) {
                        clearChartHighlight();
                    }
                });
            })(actualOriginalIndex);
            
            return newDiv;
        };

        createCatAvgsDiv = function(dataRadar) {
            var newDiv,
                tempDataSet,
                app,
                colorIndicator,
                checkbox;

            newDiv = document.createElement("div");
            tempDataSet = transform.getCategoryAvgs();
            if (tempDataSet[0] === undefined) { // No data available
                return newDiv;
            }
            app = tempDataSet[0][0].app;
            
            // Create color indicator for average
            colorIndicator = document.createElement("span");
            colorIndicator.className = "color-indicator";
            colorIndicator.style.display = "inline-block";
            colorIndicator.style.width = "12px";
            colorIndicator.style.height = "12px";
            colorIndicator.style.backgroundColor = colorScale(dataRadar?.idAverageCategories || 100);
            colorIndicator.style.border = "1px solid #999";
            colorIndicator.style.visibility = "hidden";
            colorIndicator.id = "color-" + (dataRadar?.idAverageCategories || 100);
            
            checkbox = createCheckbox(app, dataRadar?.idAverageCategories || 100);
            
            // Update checkbox onclick to show/hide color
            var originalOnclick = checkbox.onclick;
            checkbox.onclick = function(event) {
                originalOnclick(event);
                updateColorIndicators();
            };
            
            newDiv.appendChild(colorIndicator);
            newDiv.appendChild(checkbox);
            newDiv.appendChild(createLabel(app, dataRadar?.idAverageCategories || 100));
            newDiv.style.cursor = "pointer";
            newDiv.className = "appDiv";
            
            // Add cross-highlighting interaction for chart-menu connection
            var averageId = dataRadar?.idAverageCategories || 100;
            newDiv.addEventListener('mouseenter', function() {
                // Only highlight if this checkbox is checked
                if (checkbox.checked) {
                    highlightChartElement(averageId);
                }
            });
            newDiv.addEventListener('mouseleave', function() {
                // Only clear highlight if this checkbox is checked
                if (checkbox.checked) {
                    clearChartHighlight();
                }
            });
            
            return newDiv;
        };

        function checkAll() {
            var cbs,
                i;

            cbs = document.getElementsByClassName("appCheckbox");
            for (i = 0; i < cbs.length; i++) {
                cbs[i].checked = true;
                checkboxes.push(cbs[i].data);
            }
            updateColorIndicators();
        }

        function checkNone() {
            var cbs,
                i;

            cbs = document.getElementsByClassName("appCheckbox");
            for (i = 0; i < cbs.length; i++) {
                cbs[i].checked = false;
            }
            updateColorIndicators();
        }

        createAllAppsDiv = function() {
            var newDiv = document.createElement("div");
            newDiv.innerHTML = "Check All";
            newDiv.style.cursor = "pointer";
            newDiv.className = "specialDiv";
            memoryManager.addManagedEventListener(newDiv, "click", function() {
                checkboxes = [];
                checkAll();
                // Use current responsive config
                config = getResponsiveConfig();
                spider.draw("#chart", transform.getSelectedData(checkboxes), config);
            });
            return newDiv;
        };
        createNoAppsDiv = function() {
            var newDiv = document.createElement("div");
            newDiv.innerHTML = "Check None";
            newDiv.style.cursor = "pointer";
            newDiv.className = "specialDiv";
            memoryManager.addManagedEventListener(newDiv, "click", function() {
                checkboxes = [];
                checkNone();
                // Use current responsive config
                config = getResponsiveConfig();
                spider.draw("#chart", transform.getSelectedData(checkboxes), config);
            });
            return newDiv;
        };

        createTitleDiv = function(dataRadar) {
            var newDiv = document.createElement("div");
            newDiv.innerHTML = dataRadar?.legendTitle || 'Application Platforms';
            newDiv.className = "titleDiv";
            return newDiv;
        };

        attachDivs = function(dataRadar) {
            var appNames,
                arrayLength,
                i;

            appNames = transform.getAppNames();
            arrayLength = appNames.length;
            document.getElementById("apps")
                .appendChild(createTitleDiv(dataRadar));
            for (i = 0; i < arrayLength; i++) {
                document.getElementById("apps")
                    .appendChild(createAppDiv(appNames[i], i));
            }
            document.getElementById("apps")
                .appendChild(createCatAvgsDiv(dataRadar));
            document.getElementById("apps")
                .appendChild(createAllAppsDiv());
            document.getElementById("apps")
                .appendChild(createNoAppsDiv());
        };

        createModelPopup = function() {
            var newPara = document.createElement("p");
            newPara.innerHTML = window.currentDataRadar?.referenceLinkTitle1 || 'Model Info';
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
            var newImg = imageOptimizer.createOptimizedImage(
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
            var newLink = document.createElement("a");
            newLink.className = "footerLinks";
            newLink.setAttribute("href", window.currentDataRadar?.referenceLink2 || '#');
            newLink.innerHTML = window.currentDataRadar?.referenceLinkTitle2 || 'Reference';
            document.getElementById("footer")
                .appendChild(newLink);
        };

        // Handle window resize for responsive chart
        function handleResize() {
            // Recalculate responsive configuration
            config = getResponsiveConfig();
            
            // Redraw chart with new dimensions if data is available
            if (window.currentDataRadar && transform.getCategoryAvgs) {
                // Clean up existing chart first
                memoryManager.cleanupChart("#chart");
                
                // Redraw with new config
                spider.draw("#chart", transform.getCategoryAvgs(), config);
            }
        }
        
        // Debounced resize handler to avoid excessive redraws
        var resizeTimeout;
        function debouncedResize() {
            if (resizeTimeout) {
                memoryManager.clearManagedTimer(resizeTimeout);
            }
            resizeTimeout = memoryManager.addManagedTimeout(handleResize, 250);
        }

        // Dark mode toggle functionality
        function createDarkModeToggle() {
            // Check for saved preference or default to system preference
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
            
            // Create toggle container
            const toggleContainer = document.createElement('div');
            toggleContainer.id = 'dark-mode-toggle';
            toggleContainer.setAttribute('role', 'button');
            toggleContainer.setAttribute('aria-label', 'Toggle dark mode');
            toggleContainer.setAttribute('tabindex', '0');
            toggleContainer.innerHTML = `
                <span class="toggle-icon sun-icon">☀️</span>
                <span class="toggle-icon moon-icon">🌙</span>
                <div class="toggle-slider"></div>
            `;
            
            // Add to title bar
            const titleElement = document.getElementById('title');
            titleElement.style.position = 'relative';
            titleElement.appendChild(toggleContainer);
            
            // Apply initial theme
            if (isDark) {
                document.documentElement.classList.add('dark-mode');
                toggleContainer.classList.add('dark');
            }
            
            // Toggle handler
            function toggleDarkMode() {
                const isDarkMode = document.documentElement.classList.toggle('dark-mode');
                toggleContainer.classList.toggle('dark');
                localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
                
                // Trigger any chart redraws if needed for better dark mode support
                if (window.currentChart) {
                    // Chart will automatically use CSS variables for colors
                }
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
                
                // Update transform module with loaded data
                transform.setDataSource(dataRadar);
                
                // Initialize the page with loaded data
                document.getElementById("title").innerHTML = dataRadar.pageTitle;
                
                // Add dark mode toggle
                createDarkModeToggle();
                
                // Track chart rendering performance
                const chartRenderStart = performance.now();
                spider.draw("#chart", transform.getCategoryAvgs(), config);
                performanceMonitor.trackChartRender('main-chart', chartRenderStart);
                attachDivs(dataRadar);
                document.getElementById("app100").checked = true;
                checkboxes.push(dataRadar.idAverageCategories);
                updateColorIndicators(); // Show initial color
                createModelPopup();
                createModelImg();
                createRefLink();
                
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
