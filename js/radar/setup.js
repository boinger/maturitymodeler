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
// D3 library needs to be loaded as UMD, import will be resolved by bundler
import '../d3/d3.js';
import transform from './transform.js';
import radar from './radar.js';

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

        // Get color scale from radar module or create fallback
        try {
            colorScale = radar.getColorScale();
        } catch (e) {
            console.error("Failed to get color scale from radar module:", e);
            colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        }

        //Tracks checkboxes
        checkboxes = [];
        
        // Update color indicators based on selected checkboxes
        function updateColorIndicators() {
            var allCheckboxes = document.getElementsByClassName("appCheckbox");
            for (var i = 0; i < allCheckboxes.length; i++) {
                var checkbox = allCheckboxes[i];
                var colorIndicator = document.getElementById("color-" + checkbox.data);
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

        //Options for the Radar chart, responsive to screen size
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
                radar.draw("#chart", transform.getSelectedData(checkboxes), config);
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
            
            // Create color indicator
            colorIndicator = document.createElement("span");
            colorIndicator.className = "color-indicator";
            colorIndicator.style.display = "inline-block";
            colorIndicator.style.width = "12px";
            colorIndicator.style.height = "12px";
            colorIndicator.style.backgroundColor = colorScale(i);
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
                radar.draw("#chart", transform.getSelectedData(checkboxes), config);
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
                radar.draw("#chart", transform.getSelectedData(checkboxes), config);
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
            var newImg = document.createElement("img");
            newImg.setAttribute("src", "images/maturity-model-placeholder.svg");
            newImg.setAttribute("alt", "Continuous Delivery Maturity Model Diagram");
            newImg.style.cursor = "pointer";
            newImg.style.width = 921;
            newImg.style.height = 466;
            newImg.style.maxWidth = "100%";
            newImg.style.height = "auto";
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
                radar.draw("#chart", transform.getCategoryAvgs(), config);
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

        initializePage = async function() {
            try {
                // Load data with error handling and fallbacks
                const dataRadar = await dataLoader.loadDataWithFallback();
                
                // Store globally for reference functions
                window.currentDataRadar = dataRadar;
                
                // Update transform module with loaded data
                transform.setDataSource(dataRadar);
                
                // Initialize the page with loaded data
                document.getElementById("title").innerHTML = dataRadar.pageTitle;
                radar.draw("#chart", transform.getCategoryAvgs(), config);
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
