Gridifier.SizesTransformer.TransformedConnectionsSorter = function(connectionsSorter) {
    var me = this;

    me._connectionsSorter = null;

    this._css = {
    };

    this._construct = function() {
        me._connectionsSorter = connectionsSorter;
    };

    this._bindEvents = function() {
    };

    this._unbindEvents = function() {
    };

    this.destruct = function() {
        me._unbindEvents();
    };

    this._construct();
    return this;
}

Gridifier.SizesTransformer.TransformedConnectionsSorter.prototype.sortTransformedConnections = function(transformationData) {
    var me = this;

    var connectionsToSort = [];
    for(var i = 0; i < transformationData.length; i++)
        connectionsToSort.push(transformationData[i].connectionToTransform);
    
    var transformedConnectionSortNumber = 1;
    var sortedConnectionsToTransform = this._connectionsSorter.sortConnectionsPerReappend(
        connectionsToSort
    );
    for(var i = 0; i < sortedConnectionsToTransform.length; i++) {
        for(var j = 0; j < transformationData.length; j++) {
            if(sortedConnectionsToTransform[i].itemGUID == 
               transformationData[j].connectionToTransform.itemGUID) {
               transformationData[j].sortNumber = transformedConnectionSortNumber;
               transformedConnectionSortNumber++;
               break;
            }
        }
    }

    transformationData.sort(function(firstTransformationData, secondTransformationData) {
        if(firstTransformationData.sortNumber > secondTransformationData.sortNumber)
            return 1;

        return -1;
    });

    return transformationData;
}