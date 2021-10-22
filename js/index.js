import { dataSetFilter } from "./dataset/dataset-filter.js";
import { dataSetFactory } from "./dataset/dataset.js";
import { PCAScatterPlotBuilder } from "./pca/pca-script.js";
import { BubbleMapBuilder } from "./map.js";

document.getElementById("time-filter-container").addEventListener('change', function(event) {
    
    //Get checkboxs
    var dayCheck = document.getElementById("day-checkbox");
    var nightCheck = document.getElementById("night-checkbox");

    var data = null;

    //Define data filtered to redraw scatter plot
    if(!dayCheck.checked && !nightCheck.checked) {
        data = [];
    }
    else if(dayCheck.checked && !nightCheck.checked) {
        data =  dataSetFilter.filterByPropertyEqualTo('Sunrise_Sunset', 'Day');
    }
    else if(!dayCheck.checked && nightCheck.checked) {
        data =  dataSetFilter.filterByPropertyEqualTo('Sunrise_Sunset', 'Night');
    }
    else {
        data = dataSetFactory.getInstance().data;
    }

    PCAScatterPlotBuilder.redraw(data);
    BubbleMapBuilder.redraw(data);
});

document.getElementById("calendar-filter-container").addEventListener('change', function(event) {
    
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

    console.log("Values to filter by year(s) => ", years);

    var data = dataSetFilter.filterByYears(years);

    console.log("Data post calendar filter: ", data);

    PCAScatterPlotBuilder.redraw(data);
    BubbleMapBuilder.redraw(data);
});

document.getElementById("season-filter-container").addEventListener('change', function(event) {
    
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

    console.log("Values to filter by season(s) => ", seasons);

    var data = dataSetFilter.filterBySeasons(seasons);

    console.log("Data post calendar filter: ", data);

    PCAScatterPlotBuilder.redraw(data);
    BubbleMapBuilder.redraw(data);
});

