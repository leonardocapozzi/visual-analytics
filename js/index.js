import { dataSetFilter } from "./dataset/dataset-filter.js";
import { dataSetFactory } from "./dataset/dataset.js";
import { PCAScatterPlotBuilder } from "./pca/pca-script.js";
import { BubbleMapBuilder } from "./map.js";

document.getElementById("time-wrapper").addEventListener('change', function(event) {
    
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

