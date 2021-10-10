import { dataSetFactory } from "../dataset.js";
import { matrixOperations } from "./utils/matrix-operations.js";

var PCA = (function() {

    function getPCAMatrix() {
        console.log("Call 'getPCAMatrix function");

        //var data = dataSetFactory.getInstance().data;
        //var map = buildMapForPCAAlgorithm(data);

        //console.log("default matrix");
        //console.log(Array.from(map.values()));

        var testArray = [
            [-0.8, 0, 1.6],
            [-1.8, 0, -0.4],
            [0.2, 1, -0.4],
            [2.2, -1, -1.4],
            [0.2, 0, 0.6]
        ]

        var covarianceMatrix = matrixOperations.covarianceMatrix(testArray);

        console.log("covariance matrix");
        console.log(covarianceMatrix);
    }

    function buildMapForPCAAlgorithm(data) {
        var map = new Map();

        _.map(_.where(data), function(acc) {
            var array = new Array();

            array[0] = acc["Severity"];
            array[1] = acc["Precipitation"];
            array[2] = acc["Pressure"];
            array[3] = acc["Visibility"];
            array[4] = acc["Humidity"];
            array[5] = acc["Wind_Chill"];

            map.set(acc["ID"], array); 
        });

        return map;
    }

    return {
        data: getPCAMatrix
    }
})();

export { PCA }