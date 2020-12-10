/**
 * Created by Gary A. Stafford on 2/8/15
 * Modified by Jeff Vier beginning 7 Dec 2020
 * https://github.com/boinger/maturitymodeler
 */

/*properties
 baseUrl, config, d3, dataRadar, paths
 */

/*global requirejs */
requirejs.config({
    baseUrl: "js/radar",
    paths: {
        d3: "./../d3_4_11_0/d3.min",
        // dataRadar: "./../data/iac_radar"
        dataRadar: "./../data/data_radar"
    }
});
