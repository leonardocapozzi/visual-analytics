var UtilsModule = (function() {
    function buildMapFromArray(array) {
        var map = new Map();

        _.map(_.where(array), function(elem) {
            map.set(elem["ID"], elem); 
        });

        return map;
    }

    return {
        buildMapFromArray: buildMapFromArray
    }
})();

export { UtilsModule }