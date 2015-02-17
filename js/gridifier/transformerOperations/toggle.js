Gridifier.TransformerOperations.Toggle = function(collector,
                                                  connections,
                                                  guid,
                                                  sizesTransformer) {
    var me = this;

    this._collector = null;
    this._connections = null;
    this._guid = null;
    this._sizesTransformer = null;
    this._optionsParser = null;
    this._loggerLegend = null; // @system-log

    this._css = {
    };

    this._construct = function() {
        me._collector = collector;
        me._connections = connections;
        me._guid = guid;
        me._sizesTransformer = sizesTransformer;

        me._optionsParser = new Gridifier.TransformerOperations.OptionsParser(
            me._collector
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

// @todo -> Apply check that item is < than grid
// @todo -> Update grid sizes after toggle and transform
Gridifier.TransformerOperations.Toggle.prototype.execute = function(maybeItem, newWidth, newHeight) {
    var itemsToTransform = this._optionsParser.parseItemsToTransform(maybeItem);
    var sizesToTransform = this._optionsParser.parseSizesToTransform(maybeItem, newWidth, newHeight);
    var transformationData = this._parseTransformationData(itemsToTransform, sizesToTransform);

    Logger.startLoggingOperation(   // @system-log-start
        Logger.OPERATION_TYPES.TOGGLE_SIZES,
        this._loggerLegend
    );                              // @system-log-end
    this._sizesTransformer.transformConnectionSizes(transformationData);
    // @todo -> will it work(SizesTransfomer has async action inside)
    SizesResolverManager.stopCachingTransaction();
    // @todo -> Should update here sizes too? -> Happens in renderTransformedGrid
}

Gridifier.TransformerOperations.Toggle.prototype._parseTransformationData = function(itemsToTransform,
                                                                                     sizesToTransform) {
    var itemNewRawSizesFinder = new Gridifier.SizesTransformer.ItemNewRawSizesFinder();
    var transformationData = [];
    this._loggerLegend = ""; // @system-log

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
            itemNewRawSizesFinder.markConnectionPerToggle(connectionToTransform);
            targetSizesToTransform = itemNewRawSizesFinder.initConnectionTransform(
                connectionToTransform, sizesToTransform[i][0], sizesToTransform[i][1]
            );
        }
        this._loggerLegend += "Item GUID: " + this._guid.getItemGUID(connectionToTransform.item); // @system-log-start
        this._loggerLegend += " new width: " + sizesToTransform[i][0] + " new height: " + sizesToTransform[i][1];
        this._loggerLegend += " targetWidth: " + targetSizesToTransform.targetWidth;
        this._loggerLegend += " targetHeight: " + targetSizesToTransform.targetHeight;
        this._loggerLegend += "<br><br>";                                                         // @system-log-end

        transformationData.push({
            connectionToTransform: connectionToTransform,
            widthToTransform: targetSizesToTransform.targetWidth,
            heightToTransform: targetSizesToTransform.targetHeight
        });
    }

    return transformationData;
}