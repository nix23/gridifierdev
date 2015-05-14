Gridifier.TransformerOperations.Transform = function(gridifier,
                                                     collector,
                                                     connections,
                                                     guid,
                                                     sizesTransformer,
                                                     sizesResolverManager) {
    var me = this;

    this._gridifier = null;
    this._collector = null;
    this._connections = null;
    this._guid = null;
    this._sizesTransformer = null;
    this._sizesResolverManager = null;

    this._optionsParser = null;
    /* @system-log-start */
    this._loggerLegend = null;
    /* @system-log-end */

    this._transformationData = [];
    this._executeTransformOperationTimeout = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._collector = collector;
        me._connections = connections;
        me._guid = guid;
        me._sizesTransformer = sizesTransformer;
        me._sizesResolverManager = sizesResolverManager;

        me._optionsParser = new Gridifier.TransformerOperations.OptionsParser(
            me._collector, me._sizesResolverManager
        );
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

Gridifier.TransformerOperations.Transform.prototype.prepare = function(maybeItem,
                                                                       newWidth, 
                                                                       newHeight, 
                                                                       usePaddingBottomInsteadHeight) {
    var itemsToTransform = this._optionsParser.parseItemsToTransform(maybeItem);
    var sizesToTransform = this._optionsParser.parseSizesToTransform(maybeItem, newWidth, newHeight);
    var transformationData = this._parseTransformationData(
        itemsToTransform, sizesToTransform, usePaddingBottomInsteadHeight
    );
    if(transformationData.length == 0)
        return [];

    /* @system-log-start */
    Logger.startLoggingOperation(
        Logger.OPERATION_TYPES.TRANSFORM_SIZES,
        this._loggerLegend
    );
    /* @system-log-end */
    return transformationData;
}

Gridifier.TransformerOperations.Transform.prototype._parseTransformationData = function(itemsToTransform,
                                                                                        sizesToTransform,
                                                                                        usePaddingBottomInsteadHeight) {
    var itemNewRawSizesFinder = new Gridifier.SizesTransformer.ItemNewRawSizesFinder(this._sizesResolverManager);
    var transformationData = [];
    /* @system-log-start */
    this._loggerLegend = "";
    /* @system-log-end */

    for(var i = 0; i < itemsToTransform.length; i++) {
        if(this._gridifier.isItemClone(itemsToTransform[i]))
            continue;

        var connectionToTransform = this._connections.findConnectionByItem(itemsToTransform[i]);
        var targetSizesToTransform = null;

        targetSizesToTransform = itemNewRawSizesFinder.initConnectionTransform(
            connectionToTransform, sizesToTransform[i][0], sizesToTransform[i][1], usePaddingBottomInsteadHeight
        );
        /* @system-log-start */
        this._loggerLegend += "Item GUID: " + this._guid.getItemGUID(connectionToTransform.item);
        this._loggerLegend += " new width: " + sizesToTransform[i][0] + " new height: " + sizesToTransform[i][1];
        this._loggerLegend += " targetWidth: " + targetSizesToTransform.targetWidth;
        this._loggerLegend += " targetHeight: " + targetSizesToTransform.targetHeight;
        this._loggerLegend += "<br><br>";
        /* @system-log-end */

        transformationData.push({
            connectionToTransform: connectionToTransform,
            widthToTransform: targetSizesToTransform.targetWidth,
            heightToTransform: targetSizesToTransform.targetHeight,
            usePaddingBottomInsteadHeight: usePaddingBottomInsteadHeight
        });
    }

    return transformationData;
}

Gridifier.TransformerOperations.Transform.prototype.schedule = function(transformationData) {
    if(transformationData.length == 0)
        return;

    if(this._executeTransformOperationTimeout == null) {
        this._transformationData = transformationData;
    }
    else {
        clearTimeout(this._executeTransformOperationTimeout);
        this._executeTransformOperationTimeout = null;

        for(var i = 0; i < transformationData.length; i++) {
            var wasReplaced = false;

            for(var j = 0; j < this._transformationData.length; j++) {
                if(this._transformationData[j].connectionToTransform.itemGUID ==
                    transformationData[i].connectionToTransform.itemGUID) {
                    this._transformationData[j] = transformationData[i];
                    wasReplaced = true;
                    break;;
                }
            }

            if(!wasReplaced)
                this._transformationData.push(transformationData[i]);
        }
    }

    var me = this;
    this._executeTransformOperationTimeout = setTimeout(function() {
        me._execute.call(me, me._transformationData);
        me._transformationData = [];
    }, 40);
}

Gridifier.TransformerOperations.Transform.prototype._execute = function(transformationData) {
    this._sizesResolverManager.startCachingTransaction();
    this._sizesTransformer.transformConnectionSizes(transformationData);
    this._sizesResolverManager.stopCachingTransaction();
}

Gridifier.TransformerOperations.Transform.prototype.executeRetransformAllSizes = function() {
    /* @system-log-start */
    Logger.startLoggingOperation(
        Logger.OPERATION_TYPES.TRANSFORM_SIZES,
        "retransformAllSizes"
    );
    /* @system-log-end */
    this._sizesResolverManager.startCachingTransaction();
    this._sizesTransformer.retransformAllConnections();
    this._sizesResolverManager.stopCachingTransaction();
}

Gridifier.TransformerOperations.Transform.prototype.executeRetransformFromFirstSortedConnection = function(items) {
    /* @system-log-start */
    Logger.startLoggingOperation(
        Logger.OPERATION_TYPES.TRANSFORM_SIZES,
        "retransformFromFirstSortedConnection"
    );
    /* @system-log-end */
    this._sizesResolverManager.startCachingTransaction();
    this._sizesTransformer.retransformFromFirstSortedConnection(items);
    this._sizesResolverManager.stopCachingTransaction();
}