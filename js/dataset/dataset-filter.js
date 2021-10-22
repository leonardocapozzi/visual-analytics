import { dataSetFactory } from "./dataset.js";

var dataSetFilter = (function() {
    //Global variables
    var data = dataSetFactory.getInstance().data;    

    function filterByPropertyEqualTo(propertyName, propertyValue) {

        if(propertyName == "Start_Time") {
            return data.filter(item => {
                var date = new Date(item[propertyName]);
                var year = date.getFullYear();

                return propertyValue == year ? true : false;
            });
        }

        console.log("PropertyName is different to Start_Time");

        return data.filter(item => item[propertyName] == propertyValue);
    }

    function filterByPropertiesAtMostOneEqualTo(propertyName, values) {

        if(propertyName == "Start_Time") {
            return data.filter(item => {
                var date = new Date(item[propertyName]);
                var year = date.getFullYear();

                for(var i = 0; i < values.length; i ++) {
                    if(values[i] == year) {
                        return true;
                    }
                }
    
                return false;
            });
        }

        return data.filter(item => {

            for(var i = 0; i < values.length; i ++) {
                if(values[i] == item[propertyName]) {
                    return true;
                }
            }

            return false;
        });
    }

    return {
        filterByPropertyEqualTo: filterByPropertyEqualTo,
        filterByPropertiesAtMostOneEqualTo: filterByPropertiesAtMostOneEqualTo
    };

})();

export { dataSetFilter }