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
 ExtraWidthX, ExtraWidthY, PI, ToRight, TranslateX, TranslateY, append, attr,
 axis, categoryCount categories, category10, color, colorScale, cos, data, draw,
 enter, factor, factorLegend, forEach, format, h, hasOwnProperty, length, levels,
 map, max, maxValue, min, on, opacityArea, push, radians, radius, remove, scale, select,
 selectAll, sin, style, text, transformScaleReverse, transition, value, w
 */

/*global Math, parseFloat, d3 */
/*jslint plusplus: true, unparam: true */
import dataRadar from '../data/data_radar.js';
// D3 library needs to be loaded as UMD, import will be resolved by bundler
import '../d3/d3.js';
import transform from './transform.js';

"use strict";
        
        // Shared color scale instance for consistency across modules
        // Create custom color array with more distinct colors
        var customColors = [
            "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
            "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
            "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5",
            "#c49c94", "#f7b6d3", "#c7c7c7", "#dbdb8d", "#9edae5"
        ];
        
        // Initialize color scale when d3 is available
        var sharedColorScale;
        if (typeof d3 !== 'undefined' && d3.scaleOrdinal) {
            sharedColorScale = d3.scaleOrdinal(customColors);
        } else {
            // Fallback for testing environment
            sharedColorScale = function(index) {
                return customColors[index % customColors.length];
            };
        }
        
        var draw = function(id, d, options) {
            var cfg,
                series,
                axis,
                allAxis,
                total,
                radius,
                levelFactor,
                format,
                g,
                tooltip,
                dataValues,
                i,
                j,
                pti,
                z,
                newX,
                newY;

            // Input validation
            if (!id || !d) {
                console.error("D3 Radar Chart: Missing required parameters (id, data)");
                return;
            }

            if (!Array.isArray(d) || d.length === 0) {
                console.warn("D3 Radar Chart: Data must be a non-empty array");
                return;
            }

            // Validate container exists
            var container = d3.select(id);
            if (container.empty()) {
                console.error("D3 Radar Chart: Container element not found:", id);
                return;
            }

            // Values can be overridden from setup.config object passed to draw.options param
            cfg = {
                radius: 5,
                w: 800,
                h: 800,
                factor: 1,
                factorLegend: 0.85,
                levels: 3,
                maxValue: 100,
                radians: 2 * Math.PI,
                opacityArea: 0.5,
                ToRight: 5,
                TranslateX: 90,
                TranslateY: 30,
                ExtraWidthX: 100,
                ExtraWidthY: 100,
                color: sharedColorScale
            };

            // Functions used by this method
            function calcX(d) {
                return levelFactor * (1 - cfg.factor * Math.sin(0));
            }

            function calcY(d) {
                return levelFactor * (1 - cfg.factor * Math.cos(0));
            }

            function calcX1(d, i) {
                return levelFactor * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
            }

            function calcY1(d, i) {
                return levelFactor * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
            }

            function calcX2(d, i) {
                return levelFactor * (1 - cfg.factor * Math.sin((i + 1) * cfg.radians / total));
            }

            function calcY2(d, i) {
                return levelFactor * (1 - cfg.factor * Math.cos((i + 1) * cfg.radians / total));
            }

            // Calculate coordinates for data points
            function calculateDataCoordinates(dataPoint, index) {
                if (!dataPoint || typeof dataPoint.value === 'undefined') {
                    console.warn("D3 Radar Chart: Invalid data point, using 0");
                    return [cfg.w / 2, cfg.h / 2];
                }
                var value = Math.max(dataPoint.value, 0);
                var normalizedValue = parseFloat(value) / cfg.maxValue;
                if (isNaN(normalizedValue)) {
                    console.warn("D3 Radar Chart: Invalid numeric value, using 0");
                    normalizedValue = 0;
                }
                return [
                    cfg.w / 2 * (1 - normalizedValue * cfg.factor * Math.sin(index * cfg.radians / total)),
                    cfg.h / 2 * (1 - normalizedValue * cfg.factor * Math.cos(index * cfg.radians / total))
                ];
            }

            // Convert data series to polygon coordinates
            function getPolygonCoordinates(dataSeries) {
                var coordinates = dataSeries.map(calculateDataCoordinates);
                coordinates.push(coordinates[0]); // Close the polygon
                return coordinates;
            }

            // Override values from radar.cfg by setup.config object, passed to draw.options param
            if (options !== "undefined") {
                for (i in options) {
                    if (options.hasOwnProperty(i)) {
                        if ("undefined" !== options[i]) {
                            cfg[i] = options[i];
                        }
                    }
                }
            }

            cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i) {
                return d3.max(i.map(function(o) {
                    return o.value;
                }));
            }));

            if (d.length === 0) {
                return dataRadar.categories[0];
            }

            // Validate data structure
            if (!d[0] || !Array.isArray(d[0])) {
                console.error("D3 Radar Chart: Invalid data structure - expected array of arrays");
                return;
            }

            allAxis = (d[0].map(function(i, j) {
                if (!i || typeof i.axis === 'undefined') {
                    console.warn("D3 Radar Chart: Missing axis property in data point", j);
                    return "Unknown Axis " + j;
                }
                return i.axis;
            }));

            total = allAxis.length;
            radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
            format = d3.format("d"); // format axis labels as numbers not '%'
            
            // Implement proper enter/update/exit pattern for SVG
            var svg = d3.select(id).selectAll("svg")
                .data([null]); // Use single element array for SVG
            
            var svgEnter = svg.enter().append("svg");
            svg = svg.merge(svgEnter)
                .attr("width", cfg.w + cfg.ExtraWidthX)
                .attr("height", cfg.h + cfg.ExtraWidthY);

            var gEnter = svgEnter.append("g");
            g = svg.select("g").merge(gEnter)
                .attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");

            //Circular segments - create grid data
            var gridData = [];
            for (j = 0; j < cfg.levels; j++) {
                levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
                for (var k = 0; k < allAxis.length; k++) {
                    gridData.push({
                        level: j,
                        axis: k,
                        levelFactor: levelFactor,
                        x1: levelFactor * (1 - cfg.factor * Math.sin(k * cfg.radians / total)),
                        y1: levelFactor * (1 - cfg.factor * Math.cos(k * cfg.radians / total)),
                        x2: levelFactor * (1 - cfg.factor * Math.sin((k + 1) * cfg.radians / total)),
                        y2: levelFactor * (1 - cfg.factor * Math.cos((k + 1) * cfg.radians / total))
                    });
                }
            }

            // Proper enter/update/exit for grid lines
            var gridLines = g.selectAll(".grid-line")
                .data(gridData);
            
            gridLines.exit().remove();
            
            var gridLinesEnter = gridLines.enter().append("line")
                .attr("class", "grid-line");
                
            gridLines = gridLines.merge(gridLinesEnter)
                .attr("x1", function(d) { return d.x1; })
                .attr("y1", function(d) { return d.y1; })
                .attr("x2", function(d) { return d.x2; })
                .attr("y2", function(d) { return d.y2; })
                .style("stroke", "#999999")
                .style("stroke-opacity", "0.75")
                .style("stroke-width", ".5px")
                .attr("transform", function(d) {
                    return "translate(" + (cfg.w / 2 - d.levelFactor) + ", " + (cfg.h / 2 - d.levelFactor) + ")";
                });

            if (d[0].length > 0) { //Check if data was supplied
                //Text indicating at what # or % each level is - create level label data
                var levelLabelData = [];
                for (j = 0; j < cfg.levels; j++) {
                    levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
                    levelLabelData.push({
                        level: j,
                        levelFactor: levelFactor,
                        x: levelFactor * (1 - cfg.factor * Math.sin(0)),
                        y: levelFactor * (1 - cfg.factor * Math.cos(0)),
                        transform: "translate(" + (cfg.w / 2 - levelFactor + cfg.ToRight) + ", " + (cfg.h / 2 - levelFactor) + ")",
                        text: format(transform.transformScaleReverse(((j + 1) * cfg.maxValue / cfg.levels)))
                    });
                }

                // Proper enter/update/exit for level labels
                var levelLabels = g.selectAll(".level-label")
                    .data(levelLabelData);
                
                levelLabels.exit().remove();
                
                var levelLabelsEnter = levelLabels.enter().append("text")
                    .attr("class", "level-label");
                    
                levelLabels = levelLabels.merge(levelLabelsEnter)
                    .attr("x", function(d) { return d.x; })
                    .attr("y", function(d) { return d.y; })
                    .style("font-family", "sans-serif")
                    .style("font-size", "11px")
                    .attr("transform", function(d) { return d.transform; })
                    .attr("fill", "#999999")
                    .text(function(d) { return d.text; });

                series = 0;

                axis = g.selectAll(".axis")
                    .data(allAxis)
                    .enter()
                    .append("g")
                    .attr("class", "axis");

                axis.append("line")
                    .attr("x1", cfg.w / 2)
                    .attr("y1", cfg.h / 2)
                    .attr("x2", function(d, i) {
                        return cfg.w / 2 * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
                    })
                    .attr("y2", function(d, i) {
                        return cfg.h / 2 * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
                    })
                    .attr("class", "line")
                    .style("stroke", "#999999")
                    .style("stroke-width", ".75px");

                axis.append("text")
                    .attr("class", "legend")
                    .text(function(d) {
                        return d;
                    })
                    .style("font-family", "sans-serif")
                    .style("font-size", "11px")
                    .attr("text-anchor", "middle")
                    .attr("dy", "1.5em")
                    .attr("transform", function(d, i) {
                        return "translate(0, -10)";
                    })
                    .attr("x", function(d, i) {
                        return cfg.w / 2 * (1 - cfg.factorLegend * Math.sin(i * cfg.radians / total)) -
                            60 * Math.sin(i * cfg.radians / total);
                    })
                    .attr("y", function(d, i) {
                        return cfg.h / 2 * (1 - Math.cos(i * cfg.radians / total)) -
                            20 * Math.cos(i * cfg.radians / total);
                    });

                //Creates tooltips at vertices
                tooltip = g.append("text")
                    .style("opacity", 0)
                    .style("font-family", "sans-serif")
                    .style("font-size", "13px");

                // Remove all existing polygons first
                g.selectAll("polygon").remove();
                
                //Draws polygons
                d.forEach(function(y, x) {
                    var polygonCoordinates = getPolygonCoordinates(y);
                    var originalIndex = y[0] && y[0].originalIndex !== undefined ? y[0].originalIndex : series;
                    g.append("polygon")
                        .datum(polygonCoordinates)
                        .attr("class", "radar-chart-series" + series)
                        .style("stroke-width", "2px")
                        .style("stroke", cfg.color(originalIndex))
                        .attr("points", function(d) {
                            var str = "";
                            for (pti = 0; pti < d.length; pti++) {
                                str = str + d[pti][0] + "," + d[pti][1] + " ";
                            }
                            return str;
                        })
                        .style("fill", cfg.color(originalIndex))
                        .style("fill-opacity", cfg.opacityArea)
                        .on("mouseover", function(event, d) {
                            z = "polygon." + d3.select(this).attr("class");
                            g.selectAll("polygon")
                                .transition()
                                .duration(200)
                                .style("fill-opacity", 0.1);
                            g.selectAll(z)
                                .transition()
                                .duration(200)
                                .style("fill-opacity", 0.7);
                        })
                        .on("mouseout", function() {
                            g.selectAll("polygon")
                                .transition()
                                .duration(200)
                                .style("fill-opacity", cfg.opacityArea);
                        });
                    series++;
                });
                series = 0;
                // Remove all existing circles first
                g.selectAll("circle").remove();
                
                //Draws circles at each of the polygon's vertex (vertices)
                d.forEach(function(y, x) {
                    var originalIndex = y[0] && y[0].originalIndex !== undefined ? y[0].originalIndex : series;
                    g.selectAll(".data-points-" + series)
                        .data(y)
                        .enter()
                        .append("circle")
                        .attr("class", "radar-chart-series" + series)
                        .attr("r", cfg.radius)
                        .attr("alt", function(j) {
                            return Math.max(j.value, 0);
                        })
                        .attr("cx", function(j, i) {
                            var coords = calculateDataCoordinates(j, i);
                            return coords[0];
                        })
                        .attr("cy", function(j, i) {
                            var coords = calculateDataCoordinates(j, i);
                            return coords[1];
                        })
                        .attr("data-id", function(j) {
                            return j.axis;
                        })
                        .style("fill", cfg.color(originalIndex)).style("fill-opacity", 0.9)
                        .on("mouseover", function(event, d) {
                            newX = parseFloat(d3.select(this).attr("cx")) - 10;
                            newY = parseFloat(d3.select(this).attr("cy")) - 5;

                            tooltip
                                .attr("x", newX)
                                .attr("y", newY)
                                .text(transform.transformScaleReverse(d.value))
                                .transition()
                                .duration(200)
                                .style("opacity", 1);

                            z = "polygon." + d3.select(this).attr("class");
                            g.selectAll("polygon")
                                .transition()
                                .duration(200)
                                .style("fill-opacity", 0.1);
                            g.selectAll(z)
                                .transition()
                                .duration(200)
                                .style("fill-opacity", 0.7);
                        })
                        .on("mouseout", function() {
                            tooltip
                                .transition()
                                .duration(200)
                                .style("opacity", 0);
                            g.selectAll("polygon")
                                .transition()
                                .duration(200)
                                .style("fill-opacity", cfg.opacityArea);
                        });

                    series++;
                });
            }
        }

// ES Module exports
export { draw, sharedColorScale as getColorScale };

// Default export for compatibility
export default {
    draw: function(id, d, options) {
        return draw(id, d, options);
    },
    getColorScale: function() {
        return sharedColorScale;
    }
};
