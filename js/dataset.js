var DataSetFactory = (function(){
	var instance;

	return {
		getInstance: function() {
			if (!instance) {
				instance = {
                    data: getDataSet()
                };
			}
			return instance;
		}
	};
})();

function getDataSet() {
    var data;

    //Ajax call to obtain csv file from local directory 
    $.ajax({
        type: "GET",
        url: "../resources/nwaccs.csv",
        dataType: "text",
        async: false,
        success: function(dataset) {
            data = getObjectsFromCSV(dataset);
        },
        error: function() {
            alert('Error occured');
        }
     });

     return data
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

    // return data array
    return data;
}