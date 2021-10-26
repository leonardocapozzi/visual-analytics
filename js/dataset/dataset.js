var dataSetFactory = (function(){
	var instance;

    function getDataSet() {
        var data;
    
        //Ajax call to obtain csv file from local directory 
        $.ajax({
            type: "GET",
            url: "../resources/nwaccs.csv",
            dataType: "text",
            async: false,
            success: function(dataset) {
                data = dataset;
            },
            error: function() {
                alert('Error occured');
            }
         });
    
         return data
    }

    function removeBadValue(data) {
        var map = new Map();
    
        _.map(_.where(data), function(acc) {       
             
            if (!isNaN(parseFloat( acc["Severity"])) &&
                !isNaN(parseFloat(acc["Precipitation"]))&&
                !isNaN(parseFloat( acc["Pressure"])) &&
                !isNaN(parseFloat( acc["Visibility"])) &&
                !isNaN(parseFloat (acc["Humidity"])) &&
                !isNaN(parseFloat(acc["Wind_Speed"])) &&
                !isNaN(parseFloat( acc["Temperature"])) &&
                acc.Sunrise_Sunset !== ""){
                    map.set(acc["ID"], acc); 
                }
        });
    
        return map;
      }
    
    
    function getObjectsFromCSV(csv, delimiter = ",") {
    
        //Getting headers from csv file
        const headers = csv.slice(0, csv.indexOf("\n")).split(delimiter);
    
        //Getting rows from csv file
        const rows = csv.slice(csv.indexOf("\n") + 1).split("\n");
    
        //Building data array by map all rows with headers
        const data = rows.map(function (row) {
            const values = row.split(delimiter);
            const elem = headers.reduce(function (object, header, index) {
                object[header] = values[index];
                return object;
            }, {});
    
            return elem;
        });
    
        return data.slice(0, data.length -1);
    }

	return {
		getInstance: function() {
			if (!instance) {
                var csvFile = getDataSet();
                var csvArray = getObjectsFromCSV(csvFile);
                var data =  Array.from(removeBadValue(csvArray).values());

				instance = {
                    csv: csvFile,
                    data: data
                };
			}
			return instance;
		}
	};
})();

export { dataSetFactory }