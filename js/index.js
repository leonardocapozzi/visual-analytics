import { dataSetFilter } from "./dataset/dataset-filter.js";
import { dataSetFactory } from "./dataset/dataset.js";
import { PCAScatterPlotBuilder } from "./pca/pca-script.js";
import { BubbleMapBuilder } from "./map.js";
import { ParallelBuilder } from "./parallel.js"


//document.writeln("<script type='text/javascript' src='parallel.js'></script>");



var computeFilter = (function() {
    function computeSeasonFilter(data) {
        //Get checkboxs
        var checkboxs = document.getElementsByName("season-checkbox");
    
        var seasons = new Array();
    
        var k = 0;
    
        for(var i = 0; i < checkboxs.length; i ++) {
            if(checkboxs[i].checked) {
                seasons[k] = checkboxs[i].value;
                k ++;
            }
        }
    
        return dataSetFilter.filterBySeasons(data, seasons);
    }
    
    function computeYearFilter(data) {
        //Get checkboxs
        var checkboxs = document.getElementsByName("year-checkbox");
    
        var years = new Array();
    
        var k = 0;
    
        for(var i = 0; i < checkboxs.length; i ++) {
            if(checkboxs[i].checked) {
                years[k] = checkboxs[i].value;
                k ++;
            }
        }
    
        return dataSetFilter.filterByYears(data, years);
    }
    
    function computeTimeFilter(data) {
        //Get checkboxs
        var dayCheck = document.getElementById("day-checkbox");
        var nightCheck = document.getElementById("night-checkbox");
    
        //Define data filtered to redraw scatter plot
        if(!dayCheck.checked && !nightCheck.checked) {
            return [];
        }
        else if(dayCheck.checked && !nightCheck.checked) {
            return dataSetFilter.filterByPropertyEqualTo(data, 'Sunrise_Sunset', 'Day');
        }
        else if(!dayCheck.checked && nightCheck.checked) {
            return dataSetFilter.filterByPropertyEqualTo(data, 'Sunrise_Sunset', 'Night');
        }
    
        return data;
    }

    function computeSeverityFilter(data) {
        //Get checkboxs
       
        var checkboxs = document.getElementsByName("severity-checkbox");
    
        var grades = new Array();
    
        var k = 0;
    
        for(var i = 0; i < checkboxs.length; i ++) {
            if(checkboxs[i].checked) {
                grades[k] = checkboxs[i].value;
                k ++;
            }
        }
    
        return dataSetFilter.filterBySeverities(data, grades);
    }

    function computeAllFilters() {
        var data = dataSetFactory.getInstance().data;

        return computeSeverityFilter(computeTimeFilter(computeSeasonFilter(computeYearFilter(data))));
    }

    return {
        compute: computeAllFilters
    };

})();

document.getElementById("filter-container").addEventListener('change', function(event) {
    
    var data = computeFilter.compute();

    PCAScatterPlotBuilder.redraw(data);
    BubbleMapBuilder.redraw(data);
   // ParallelBuilder.redraw(data);
    
});

