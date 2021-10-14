import { dataSetFactory } from "./dataset.js";

var dataSetFilter = (function() {
    //Global variables
    var data = dataSetFactory.getInstance().data;    

    function filterByPropertyEqualTo(propertyName, propertyValue) {
        return data.filter(item => item[propertyName] == propertyValue);
    }

    return {
        filterByPropertyEqualTo: filterByPropertyEqualTo
    };

})();

export { dataSetFilter }