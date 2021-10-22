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

    var values = new Array();

    var k = 0;

    for(var i = 0; i < checkboxs.length; i ++) {
        if(checkboxs[i].checked) {
            values[k] = checkboxs[i].value;
            k ++;
        }
    }

    console.log("Values to filter by year(s) => ", values);

    var data = dataSetFilter.filterByPropertiesAtMostOneEqualTo("Start_Time", values);

    console.log("Data post calendar filter: ", data);

    PCAScatterPlotBuilder.redraw(data);
    BubbleMapBuilder.redraw(data);
});

