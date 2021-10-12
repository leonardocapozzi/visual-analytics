var matrixOperations = (function() {

    function normalize(matrix) {
        //console.log("call 'normalize' function");

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
        //console.log("call 'trasposedMatrix' function");

        var trasposedMatrix = new Array(matrix[0].length);

        for(var i = 0; i < matrix[0].length; i ++) {
            var row = new Array(matrix.length);
            for(var j = 0; j < matrix.length; j ++) {
                row[j] = matrix[j][i];
            }

            trasposedMatrix[i] = row;
        }

        return trasposedMatrix;
    }

    function multiplyTrasposedMatrixForMatrix(a, b) {
        //console.log("Call 'multiplyTrasposedMatrixForMatrix' function");

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

        return result;
    }

    function divideByConstant(matrix, a) {
        for(var i = 0; i < matrix.length; i ++) {
            for(var j = 0; j < matrix[0].length; j ++) {
                matrix[i][j] = matrix[i][j] / a;
            }
        }
    }

    function clone(object) {
        return JSON.parse(JSON.stringify(object));
    }

    function multiply(a, b) {
        var aNumRows = a.length, aNumCols = a[0].length,
            bNumCols = b[0].length, m = new Array(aNumRows);

        for (var r = 0; r < aNumRows; ++r) {
            m[r] = new Array(bNumCols); // initialize the current row
            for (var c = 0; c < bNumCols; ++c) {
                m[r][c] = 0;             // initialize the current cell
                for (var i = 0; i < aNumCols; ++i) {
                    if(isNaN(a[r][i])) {
                        console.log("a is nan", r, i);
                    }
                    if(isNaN(b[i][c])) {
                        console.log("b is Nan", i, c);
                    }
                    m[r][c] += a[r][i] * b[i][c];
                }
            }
        }
        return m;
    }

    function covarianceMatrix(matrix) {

        var tMatrix = trasposedMatrix(matrix);

        var covMatrix = multiplyTrasposedMatrixForMatrix(tMatrix, matrix);

        divideByConstant(covMatrix, matrix.length - 1);

        return covMatrix;
    }

    function findEigenvaluesAndEigenvectors(squareMatrix) {
        return math.eigs(squareMatrix);
    }

    function getPCAMatrix(datasetMatrix) {

        var matrix = clone(datasetMatrix);

        normalize(matrix);

        var tMatrix = trasposedMatrix(matrix);

        var covMatrix = covarianceMatrix(matrix);

        var valuesAndVector = findEigenvaluesAndEigenvectors(covMatrix);

        var W = new Array(2);  
        
        W[0] = valuesAndVector.vectors[valuesAndVector.vectors.length - 1];
        W[1] = valuesAndVector.vectors[valuesAndVector.vectors.length - 2];

        return trasposedMatrix(multiply(W, tMatrix));
    }

    return {
        pcaMatrix: getPCAMatrix
    }

})();

export { matrixOperations };