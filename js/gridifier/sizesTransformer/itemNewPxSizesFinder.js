Gridifier.SizesTransformer.ItemNewPxSizesFinder = function(gridifier,
                                                           connections,
                                                           sizesResolverManager) {
    var me = this;

    me._gridifier = null;
    me._connections = null;
    me._sizesResolverManager = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._connections = connections;
        me._sizesResolverManager = sizesResolverManager;
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

Gridifier.SizesTransformer.ItemNewPxSizesFinder.prototype.calculateNewPxSizesPerAllTransformedItems = function(transformationData) {
    for(var i = 0; i < transformationData.length; i++) {
        var pxSizes = this._calculateNewPxSizesPerConnectionItem(
            transformationData[i].connectionToTransform.item,
            transformationData[i].widthToTransform,
            transformationData[i].heightToTransform
        );
        transformationData[i].pxWidthToTransform = pxSizes.width;
        transformationData[i].pxHeightToTransform = pxSizes.height;
    }

    return transformationData;
}

Gridifier.SizesTransformer.ItemNewPxSizesFinder.prototype._calculateNewPxSizesPerConnectionItem = function(transformedItem,
                                                                                                           widthToTransform,
                                                                                                           heightToTransform) {
    var transformedItemClone = transformedItem.cloneNode();
    this._sizesResolverManager.unmarkAsCached(transformedItemClone);

    Dom.css.set(transformedItemClone, {
        position: "absolute",
        top: "0px",
        left: "-90000px",
        visibility: "hidden",
        width: widthToTransform,
        height: heightToTransform
    });

    this._gridifier.getGrid().appendChild(transformedItemClone);
    var pxSizes = {
        width: this._sizesResolverManager.outerWidth(transformedItemClone, true),
        height: this._sizesResolverManager.outerHeight(transformedItemClone, true)
    };
    this._gridifier.getGrid().removeChild(transformedItemClone);

    return pxSizes;
}