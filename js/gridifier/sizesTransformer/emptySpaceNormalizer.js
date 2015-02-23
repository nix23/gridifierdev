Gridifier.SizesTransformer.EmptySpaceNormalizer = function(connections, connectors, settings) {
    var me = this;

    this._connections = null;
    this._connectors = null;
    this._settings = null;

    this._css = {
    };

    this._construct = function() {
        me._connections = connections;
        me._connectors = connectors;
        me._settings = settings;
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

    // @TODO -> WARNING!!! THIS SHOULD BE USED WHEN !NO_INTERSECTIONS STRATEGY TO FIX PREPENDED TRANSFORMS
    //  (FIX THIS!!!!)
    // @todo -> Check if this fix should be made always
    // @todo -> Also this should be applied somewhere in the end of the queue
    // if(this._settings.isNoIntersectionsStrategy()) {

    // }

Gridifier.SizesTransformer.EmptySpaceNormalizer.prototype.normalizeFreeSpace = function() {
    if(this._settings.isVerticalGrid())
        this._applyNoIntersectionsStrategyTopFreeSpaceFixOnPrependedItemTransform();
    else if(this._settings.isHorizontalGrid())
        this._applyNoIntersectionsStrategyLeftFreeSpaceFixOnPrependedItemTransform();
}

Gridifier.SizesTransformer.EmptySpaceNormalizer.prototype._applyNoIntersectionsStrategyTopFreeSpaceFixOnPrependedItemTransform = function() {
    var connections = this._connections.get();

    for(var i = 0; i < connections.length; i++) {
        if(connections[i].y1 == 0)
            return;
    }

    var minY1 = null;
    for(var i = 0; i < connections.length; i++) {
        if(minY1 == null)
            minY1 = connections[i].y1;
        else {
            if(connections[i].y1 < minY1)
                minY1 = connections[i].y1;
        }
    }

    var verticalDecrease = minY1;
    for(var i = 0; i < connections.length; i++) {
        connections[i].y1 -= verticalDecrease;
        connections[i].y2 -= verticalDecrease;
    }
    /* @system-log-start */
    Logger.log(
        "applyNoIntersectionsStrategyTopFreeSpaceFixOnPrependedItemTransform",
        "sizesTransformer subcall",
        this._connectors.get(),
        this._connections.get()
    );
    /* @system-log-end */
}

Gridifier.SizesTransformer.EmptySpaceNormalizer.prototype._applyNoIntersectionsStrategyLeftFreeSpaceFixOnPrependedItemTransform = function() {
    // @todo -> Implement horizontal fix here
}