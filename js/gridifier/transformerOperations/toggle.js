Gridifier.TransformerOperations.Toggle = function(gridifier,
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

Gridifier.TransformerOperations.Toggle.prototype.prepare = function(maybeItem,
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
        Logger.OPERATION_TYPES.TOGGLE_SIZES,
        this._loggerLegend
    );
    /* @system-log-end */
    return transformationData;
}

Gridifier.TransformerOperations.Toggle.prototype._parseTransformationData = function(itemsToTransform,
                                                                                     sizesToTransform,
                                                                                     usePaddingBottomInsteadHeight) {
    var itemNewRawSizesFinder = new Gridifier.SizesTransformer.ItemNewRawSizesFinder(this._sizesResolverManager);
    var transformationData = [];
    /* @system-log-start */
    this._loggerLegend = ""; 
    /* @system-log-end */

    for(var i = 0; i < itemsToTransform.length; i++) {
        var connectionToTransform = this._connections.findConnectionByItem(itemsToTransform[i]);
        var targetSizesToTransform = null;

        if(itemNewRawSizesFinder.areConnectionSizesToggled(connectionToTransform)) {
            targetSizesToTransform = itemNewRawSizesFinder.getConnectionSizesPerUntoggle(
                connectionToTransform
            );
            itemNewRawSizesFinder.unmarkConnectionPerToggle(connectionToTransform);
        }
        else {
            itemNewRawSizesFinder.markConnectionPerToggle(connectionToTransform, usePaddingBottomInsteadHeight);
            targetSizesToTransform = itemNewRawSizesFinder.initConnectionTransform(
                connectionToTransform, sizesToTransform[i][0], sizesToTransform[i][1], usePaddingBottomInsteadHeight
            );
        }
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