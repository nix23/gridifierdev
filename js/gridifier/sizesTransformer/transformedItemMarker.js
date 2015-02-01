Gridifier.SizesTransformer.TransformedItemMarker = function() {
    var me = this;

    this._css = {
    };

    this._construct = function() {
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

Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMED_ITEM_DATA_ATTR = "data-transformed-item";
Gridifier.SizesTransformer.TransformedItemMarker.DEPENDED_ITEM_DATA_ATTR = "data-depended-item";
Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMER_EMPTY_DATA_ATTR_VALUE = "gridifier-data";
Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMED_ITEM_RAW_TARGET_WIDTH_DATA_ATTR = "data-transformed-item-raw-target-width";
Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMED_ITEM_RAW_TARGET_HEIGHT_DATA_ATTR = "data-transformed-item-raw-target-height";
Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMED_ITEM_PX_TARGET_WIDTH_DATA_ATTR = "data-transformed-item-px-target-width";
Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMED_ITEM_PX_TARGET_HEIGHT_DATA_ATTR = "data-transformed-item-px-target-height";

Gridifier.SizesTransformer.TransformedItemMarker.prototype.markEachConnectionItemWithTransformData = function(transformationData) {
    var transformedItemMarker = Gridifier.SizesTransformer.TransformedItemMarker;

    for(var i = 0; i < transformationData.length; i++) {
        var transformedItem = transformationData[i].connectionToTransform.item;
        transformedItem.setAttribute(
            transformedItemMarker.TRANSFORMED_ITEM_DATA_ATTR,
            transformedItemMarker.TRANSFORMER_EMPTY_DATA_ATTR_VALUE
        );
        transformedItem.setAttribute(
            transformedItemMarker.TRANSFORMED_ITEM_RAW_TARGET_WIDTH_DATA_ATTR,
            transformationData[i].widthToTransform
        );
        transformedItem.setAttribute(
            transformedItemMarker.TRANSFORMED_ITEM_RAW_TARGET_HEIGHT_DATA_ATTR,
            transformationData[i].heightToTransform
        );
        transformedItem.setAttribute(
            transformedItemMarker.TRANSFORMED_ITEM_PX_TARGET_WIDTH_DATA_ATTR,
            transformationData[i].pxWidthToTransform
        );
        transformedItem.setAttribute(
            transformedItemMarker.TRANSFORMED_ITEM_PX_TARGET_HEIGHT_DATA_ATTR,
            transformationData[i].pxHeightToTransform
        );
    }
}

Gridifier.SizesTransformer.TransformedItemMarker.prototype.isTransformedItem = function(maybeTransformedItem) {
    return Dom.hasAttribute(maybeTransformedItem, Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMED_ITEM_DATA_ATTR);
}

Gridifier.SizesTransformer.TransformedItemMarker.prototype.getTransformedItemTargetPxSizes = function(transformedItem) {
    var transformedItemMarker = Gridifier.SizesTransformer.TransformedItemMarker;

    return {
        targetPxWidth: parseFloat(transformedItem.getAttribute(transformedItemMarker.TRANSFORMED_ITEM_PX_TARGET_WIDTH_DATA_ATTR)),
        targetPxHeight: parseFloat(transformedItem.getAttribute(transformedItemMarker.TRANSFORMED_ITEM_PX_TARGET_HEIGHT_DATA_ATTR))
    };
}

Gridifier.SizesTransformer.TransformedItemMarker.prototype.markAllTransformDependedItems = function(itemsToReappend) {
    for(var i = 0; i < itemsToReappend.length; i++) {
        if(this.isTransformedItem(itemsToReappend[i]))
            continue;

        itemsToReappend[i].setAttribute(
            Gridifier.SizesTransformer.TransformedItemMarker.DEPENDED_ITEM_DATA_ATTR,
            Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMER_EMPTY_DATA_ATTR_VALUE
        );
    }
}