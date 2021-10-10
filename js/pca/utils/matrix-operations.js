var matrixOperations = (function() {

    function normalize(matrix) {
        console.log("call 'normalize' function");

        var columnsAverages = new Array();

        for(var i = 0; i < matrix[0].length; i ++) {
            var somma = 0;

            for(var j = 0; j < matrix.length; j ++) {
                var value = Number(matrix[j][i]);
                if(!isNaN(value)) 
                    somma = somma + Number(matrix[j][i]);
            }

            columnsAverages[i] = somma / matrix.length;
        }

        for(var i = 0; i < matrix[0].length; i ++) {
            for(var j = 0; j < matrix.length; j ++) {
                matrix[j][i] = matrix[j][i] - columnsAverages[i];
            }
        }

        console.log(matrix);
    }

    function trasposedMatrix(matrix) {
        console.log("call 'trasposedMatrix' function");

        var trasposedMatrix = new Array(matrix[0].length);

        for(var i = 0; i < matrix[0].length; i ++) {
            var row = new Array(matrix.length);
            for(var j = 0; j < matrix.length; j ++) {
                row[j] = matrix[j][i];
            }

            trasposedMatrix[i] = row;
        }

        console.log(trasposedMatrix);

        return trasposedMatrix;
    }

    function multiplyTrasposedMatrixForMatrix(a, b) {
        console.log("Call 'multiplyTrasposedMatrixForMatrix' function");

        var result = new Array(a.length);

        for(var k = 0; k < b[0].length; k ++) {
            var row = new Array(a.length);
            for(var i = 0; i < a.length; i ++) {
                row[i] = 0;
                for(var j = 0; j < a[0].length; j ++) {
                    row[i] += a[i][j] * b[j][k]; 
                }
            }
            result[k] = row;
        } 

        console.log(result);

        return result;
    }

    function divideByConstant(matrix, a) {
        for(var i = 0; i < matrix.length; i ++) {
            for(var j = 0; j < matrix[0].length; j ++) {
                matrix[i][j] = matrix[i][j] / a;
            }
        }
    }

    function covarianceMatrix(matrix) {
        normalize(matrix);
        var tMatrix = trasposedMatrix(matrix);

        var result = multiplyTrasposedMatrixForMatrix(tMatrix, matrix);

        console.log(result);

        var covMatrix = divideByConstant(result, matrix.length - 1);

        console.log("cov: ", covMatrix);

        return covMatrix;
    }

    return {
        covarianceMatrix: covarianceMatrix
    }

})();

export { matrixOperations };