Gridifier.SizesTransformer.ItemNewRawSizesFinder = function() {
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

Gridifier.SizesTransformer.ItemNewRawSizesFinder.TOGGLE_SIZES_TOGGLED_ITEM_SIZES_DATA_ATTR = "data-toggle-sizes-item-sizes-are-toggled";
Gridifier.SizesTransformer.ItemNewRawSizesFinder.TOGGLE_SIZES_ORIGINAL_WIDTH_DATA_ATTR = "data-toggle-sizes-original-width";
Gridifier.SizesTransformer.ItemNewRawSizesFinder.TOGGLE_SIZES_ORIGINAL_HEIGHT_DATA_ATTR = "data-toggle-sizes-original-height";
Gridifier.SizesTransformer.ItemNewRawSizesFinder.EMPTY_DATA_ATTR_VALUE = "gridifier-data";

Gridifier.SizesTransformer.ItemNewRawSizesFinder.prototype.initConnectionTransform = function(connection, 
                                                                                              newWidth, 
                                                                                              newHeight) {
    var targetSizes = {};

    var targetSizeTypes = {width: 0, height: 1};
    var me = this;

    var getTargetSize = function(newSize, targetSizeType) {
        var targetValueWithMultiplicationExpressionRegexp = new RegExp(/^\*(\d*\.?\d*)$/);
        var targetValueWithDivisionExpressionRegexp = new RegExp(/^\/(\d*\.?\d*)$/);
        var targetValueWithPostfixRegexp = new RegExp(/(^\d*\.?\d*)(px|%)$/);
        var targetValueRegexp = new RegExp(/^\d*\.?\d*$/);
        
        if(typeof newSize != "undefined" && typeof newSize != "boolean" && typeof newSize != null) {
            if(targetValueWithMultiplicationExpressionRegexp.test(newSize)) {
                var itemRawSize = me._getItemRawSize(connection.item, targetSizeType, targetSizeTypes);
                var itemSizeParts = targetValueWithPostfixRegexp.exec(itemRawSize);
                var multipleBy = targetValueWithMultiplicationExpressionRegexp.exec(newSize)[1];

                return (itemSizeParts[1] * multipleBy) + itemSizeParts[2];
            }

            if(targetValueWithDivisionExpressionRegexp.test(newSize)) {
                var itemRawSize = me._getItemRawSize(connection.item, targetSizeType, targetSizeTypes);
                var itemSizeParts = targetValueWithPostfixRegexp.exec(itemRawSize);
                var divideBy = targetValueWithDivisionExpressionRegexp.exec(newSize)[1];

                return (itemSizeParts[1] / divideBy) + itemSizeParts[2];
            }

            if(targetValueWithPostfixRegexp.test(newSize))
                return newSize;

            if(targetValueRegexp.test(newSize))
                return newSize + "px";

            new Gridifier.Error(
                Gridifier.Error.ERROR_TYPES.SIZES_TRANSFORMER.WRONG_TARGET_TRANSFORMATION_SIZES,
                newSize
            );
        }
        
        return me._getItemRawSize(connection.item, targetSizeType, targetSizeTypes);
    }

    targetSizes.targetWidth = getTargetSize(newWidth, targetSizeTypes.width);
    targetSizes.targetHeight = getTargetSize(newHeight, targetSizeTypes.height);

    return targetSizes;
}

Gridifier.SizesTransformer.ItemNewRawSizesFinder.prototype._getItemRawSize = function(item, sizeType, sizeTypes) {
    var itemComputedCSS = SizesResolver.getComputedCSSWithMaybePercentageSizes(item);

    if(sizeType == sizeTypes.width) {
        if(SizesResolver.hasPercentageCSSValue("width", item, itemComputedCSS))
            return SizesResolver.getPercentageCSSValue("width", item, itemComputedCSS);
        else 
            return SizesResolverManager.outerWidth(item) + "px";
    }
    else if(sizeType == sizeTypes.height) {
        if(SizesResolver.hasPercentageCSSValue("height", item, itemComputedCSS))
            return SizesResolver.getPercentageCSSValue("height", item, itemComputedCSS);
        else
            return SizesResolverManager.outerHeight(item) + "px";
    }
}

Gridifier.SizesTransformer.ItemNewRawSizesFinder.prototype.areConnectionSizesToggled = function(connection) {
    var itemNewRawSizesFinder = Gridifier.SizesTransformer.ItemNewRawSizesFinder;

    if(Dom.hasAttribute(connection.item, itemNewRawSizesFinder.TOGGLE_SIZES_TOGGLED_ITEM_SIZES_DATA_ATTR))
        return true;

    return false;
}

Gridifier.SizesTransformer.ItemNewRawSizesFinder.prototype.getConnectionSizesPerUntoggle = function(connection) {
    var itemNewRawSizesFinder = Gridifier.SizesTransformer.ItemNewRawSizesFinder;
    var originalSizes = {};

    originalSizes.targetWidth = connection.item.getAttribute(itemNewRawSizesFinder.TOGGLE_SIZES_ORIGINAL_WIDTH_DATA_ATTR);
    originalSizes.targetHeight = connection.item.getAttribute(itemNewRawSizesFinder.TOGGLE_SIZES_ORIGINAL_HEIGHT_DATA_ATTR);

    return originalSizes;
}

Gridifier.SizesTransformer.ItemNewRawSizesFinder.prototype.markConnectionPerToggle = function(connection) {
    var itemNewRawSizesFinder = Gridifier.SizesTransformer.ItemNewRawSizesFinder;
    connection.item.setAttribute(
        itemNewRawSizesFinder.TOGGLE_SIZES_TOGGLED_ITEM_SIZES_DATA_ATTR,
        itemNewRawSizesFinder.EMPTY_DATA_ATTR_VALUE
    );

    var targetSizeTypes = {width: 0, height: 1};
    var originalItemWidth = this._getItemRawSize(connection.item, targetSizeTypes.width, targetSizeTypes);
    var originalItemHeight = this._getItemRawSize(connection.item, targetSizeTypes.height, targetSizeTypes);

    connection.item.setAttribute(
        itemNewRawSizesFinder.TOGGLE_SIZES_ORIGINAL_WIDTH_DATA_ATTR,
        originalItemWidth
    );
    connection.item.setAttribute(
        itemNewRawSizesFinder.TOGGLE_SIZES_ORIGINAL_HEIGHT_DATA_ATTR,
        originalItemHeight
    );
}

Gridifier.SizesTransformer.ItemNewRawSizesFinder.prototype.unmarkConnectionPerToggle = function(connection) {
    var itemNewSizesFinder = Gridifier.SizesTransformer.ItemNewRawSizesFinder;
    connection.item.removeAttribute(itemNewSizesFinder.TOGGLE_SIZES_TOGGLED_ITEM_SIZES_DATA_ATTR);
    connection.item.removeAttribute(itemNewSizesFinder.TOGGLE_SIZES_ORIGINAL_WIDTH_DATA_ATTR);
    connection.item.removeAttribute(itemNewSizesFinder.TOGGLE_SIZES_ORIGINAL_HEIGHT_DATA_ATTR);
}