Gridifier.TransformerOperations.OptionsParser = function(collector, sizesResolverManager) {
    var me = this;

    this._collector = null;
    this._sizesResolverManager = null;

    this._css = {
    };

    this._construct = function() {
        me._collector = collector;
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

Gridifier.TransformerOperations.OptionsParser.prototype.parseItemsToTransform = function(maybeItem) {
    var itemsToTransform = [];

    if(Dom.isArray(maybeItem)) {
        for(var i = 0; i < maybeItem.length; i++) {
            itemsToTransform.push(maybeItem[i][0]);
        }
    }
    else {
        itemsToTransform.push(maybeItem);
    }

    itemsToTransform = this._collector.toDOMCollection(itemsToTransform);
    this._sizesResolverManager.startCachingTransaction();

    this._collector.ensureAllItemsAreAttachedToGrid(itemsToTransform);
    this._collector.ensureAllItemsCanBeAttachedToGrid(itemsToTransform);

    return itemsToTransform;
}

Gridifier.TransformerOperations.OptionsParser.prototype.parseSizesToTransform = function(maybeItem,
                                                                                         newWidth,
                                                                                         newHeight) {
    var sizesToTransform = [];

    if(Dom.isArray(maybeItem)) {
        for(var i = 0; i < maybeItem.length; i++) {
            sizesToTransform.push([maybeItem[i][1], maybeItem[i][2]]);
        }
    }
    else {
        sizesToTransform.push([newWidth, newHeight]);
    }

    return sizesToTransform;
}