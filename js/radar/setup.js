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

/*global d3, dataRadar, transform, document, radar, define */
/*jslint browser: true, plusplus: true, unparam: true */
define(["dataRadar", "d3", "./transform", "./radar"],
    function(dataRadar, d3, transform, radar) {
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

        //Options for the Radar chart, other than default
        config = {
            w: 600,
            h: 600,
            maxValue: 100,
            levels: 5,
            ExtraWidthX: 650
        };


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
            colorIndicator.style.display = "inline-block";
            colorIndicator.style.width = "12px";
            colorIndicator.style.height = "12px";
            colorIndicator.style.backgroundColor = colorScale(i);
            colorIndicator.style.marginRight = "5px";
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

        createCatAvgsDiv = function() {
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
            colorIndicator.style.display = "inline-block";
            colorIndicator.style.width = "12px";
            colorIndicator.style.height = "12px";
            colorIndicator.style.backgroundColor = colorScale(dataRadar.idAverageCategories);
            colorIndicator.style.marginRight = "5px";
            colorIndicator.style.border = "1px solid #999";
            colorIndicator.style.visibility = "hidden";
            colorIndicator.id = "color-" + dataRadar.idAverageCategories;
            
            checkbox = createCheckbox(app, dataRadar.idAverageCategories);
            
            // Update checkbox onclick to show/hide color
            var originalOnclick = checkbox.onclick;
            checkbox.onclick = function(event) {
                originalOnclick(event);
                updateColorIndicators();
            };
            
            newDiv.appendChild(colorIndicator);
            newDiv.appendChild(checkbox);
            newDiv.appendChild(createLabel(app, dataRadar.idAverageCategories));
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
            newDiv.addEventListener("click", function() {
                checkboxes = [];
                checkAll();
                radar.draw("#chart", transform.getSelectedData(checkboxes), config);
            });
            return newDiv;
        };
        createNoAppsDiv = function() {
            var newDiv = document.createElement("div");
            newDiv.innerHTML = "Check None";
            newDiv.style.cursor = "pointer";
            newDiv.className = "specialDiv";
            newDiv.addEventListener("click", function() {
                checkboxes = [];
                checkNone();
                radar.draw("#chart", transform.getSelectedData(checkboxes), config);
            });
            return newDiv;
        };

        createTitleDiv = function() {
            var newDiv = document.createElement("div");
            newDiv.innerHTML = dataRadar.legendTitle;
            newDiv.className = "titleDiv";
            return newDiv;
        };

        attachDivs = function() {
            var appNames,
                arrayLength,
                i;

            appNames = transform.getAppNames();
            arrayLength = appNames.length;
            document.getElementById("apps")
                .appendChild(createTitleDiv());
            for (i = 0; i < arrayLength; i++) {
                document.getElementById("apps")
                    .appendChild(createAppDiv(appNames[i], i));
            }
            document.getElementById("apps")
                .appendChild(createCatAvgsDiv());
            document.getElementById("apps")
                .appendChild(createAllAppsDiv());
            document.getElementById("apps")
                .appendChild(createNoAppsDiv());
        };

        createModelPopup = function() {
            var newPara = document.createElement("p");
            newPara.innerHTML = dataRadar.referenceLinkTitle1;
            newPara.className = "footerLinks";
            newPara.addEventListener("click", function() {
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
            newImg.setAttribute("src",
                "https://secure.surveymonkey.com/_resources/28183/23008183/bf361750-7418-458f-85a6-6c07333e4986.png");
            newImg.style.cursor = "pointer";
            newImg.style.width = 921;
            newImg.style.height = 466;
            newImg.addEventListener("click", function() {
                document.getElementById("model").className = "hideModel";
            });
            document.getElementById("model").className = "hideModel";
            document.getElementById("model").appendChild(newImg);
        };

        createRefLink = function() {
            var newLink = document.createElement("a");
            newLink.className = "footerLinks";
            newLink.setAttribute("href", dataRadar.referenceLink2);
            newLink.innerHTML = dataRadar.referenceLinkTitle2;
            document.getElementById("footer")
                .appendChild(newLink);
        };

        initializePage = function() {
            document.getElementById("title").innerHTML = dataRadar.pageTitle;
            radar.draw("#chart", transform.getCategoryAvgs(), config);
            attachDivs();
            document.getElementById("app100").checked = true;
            checkboxes.push(dataRadar.idAverageCategories);
            updateColorIndicators(); // Show initial color
            createModelPopup();
            createModelImg();
            createRefLink();
        };

        initializePage();
    });
