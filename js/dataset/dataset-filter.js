import { dataSetFactory } from "./dataset.js";

var dataSetFilter = (function() {
    //Global variables
    var data = dataSetFactory.getInstance().data;    

    function filterByPropertyEqualTo(propertyName, propertyValue) {
        return data.filter(item => item[propertyName] == propertyValue);
    }

    function filterByYears(years) {
        return data.filter(item => {
            var date = new Date(item["Start_Time"]);
            var year = date.getFullYear();

            for(var i = 0; i < years.length; i ++) {
                if(years[i] == year) {
                    return true;
                }
            }

            return false;
        });
    }

    function filterBySeasons(seasons) {
        return data.filter(item => {
            var date = new Date(item["Start_Time"]);
            var day = date.getDay();
            var month = date.getMonth();

            var currentSeason = computeSeason(day, month);

            console.log("season => ", currentSeason);

            for(var i = 0; i < seasons.length; i ++) {
                if(currentSeason == seasons[i]) {
                    return true;
                }
            }

            return false;            
        });
    }

    function computeSeason(day, month){
        if(month == 3 && day >=21 || month == 4 || month == 5 || month == 6 && day <= 21 ) return "Spring";
        else if(month == 6 && day >=22 || month == 7 || month == 8 || month == 9 && day <= 22 ) return "Summer";
        else if(month == 9 && day >=23 || month == 10 || month == 11 || month == 12 && day <= 21 ) return "Autumn";
        else return "Winter";
    }

    return {
        filterByPropertyEqualTo: filterByPropertyEqualTo,
        filterByYears: filterByYears,
        filterBySeasons: filterBySeasons
    };

})();

export { dataSetFilter }