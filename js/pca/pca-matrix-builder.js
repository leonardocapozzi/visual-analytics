import { dataSetFactory } from "../dataset.js";
import { matrixOperations } from "./utils/matrix-operations.js";

var PCAMatrixBuilder = (function() {
  
    function getPCAMatrix() {
        var data = dataSetFactory.getInstance().data;
        var map = buildDataMapForPCAAlgorithm(data);

        var matrix = Array.from(map.values());

        /*
        var testArray = [
            [-0.8, 0, 1.6],
            [-1.8, 0, -0.4],
            [0.2, 1, -0.4],
            [2.2, -1, -1.4],
            [0.2, 0, 0.6]
        ];
        */

        var pcaMatrix = matrixOperations.pcaMatrix(matrix);

        addXandYPCAProperties(data, pcaMatrix);
    }

    function addXandYPCAProperties(data, pcaMatrix) {
        for(var i = 0; i < pcaMatrix.length; i ++) {
            var item = data[i];
            
            item["X"] = pcaMatrix[i][0] + '';
            item["Y"] = pcaMatrix[i][1] + '';
        }
    }

    function buildDataMapForPCAAlgorithm(data) {
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

    function drawScatterPlot() {
        buildScatterPlot(getPCAMatrix());
    }

    return {
        pcaMatrix: getPCAMatrix()
    }
})();

export { PCAMatrixBuilder }