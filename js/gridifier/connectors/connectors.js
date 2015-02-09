Gridifier.Connectors = function(guid, connections) {
    var me = this;

    this._guid = null;
    this._connections = null;

    this._connectors = [];

    this._nextFlushCallback = null;

    this._css = {
    };

    this._construct = function() {
        me._guid = guid;
        me._connections = connections;
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

Gridifier.Connectors.INITIAL_CONNECTOR_ITEM_GUID = -1;

Gridifier.Connectors.TYPES = {
    APPEND: {
        DEFAULT: "appendDefault", REVERSED: "appendReversed"
    }, 
    PREPEND: {
        DEFAULT: "prependDefault", REVERSED: "prependReversed"
    }
};

Gridifier.Connectors.SIDES = {
    LEFT: {TOP: "leftTop", BOTTOM: "leftBottom"},
    BOTTOM: {RIGHT: "bottomRight", LEFT: "bottomLeft"},
    RIGHT: {TOP: "rightTop", BOTTOM: "rightBottom"},
    TOP: {LEFT: "topLeft", RIGHT: "topRight"}
};

Gridifier.Connectors.isLeftTopSideConnector = function(connector) {
    return connector.side == Gridifier.Connectors.SIDES.LEFT.TOP;
}

Gridifier.Connectors.isLeftBottomSideConnector = function(connector) {
    return connector.side == Gridifier.Connectors.SIDES.LEFT.BOTTOM;
}

Gridifier.Connectors.isBottomRightSideConnector = function(connector) {
    return connector.side == Gridifier.Connectors.SIDES.BOTTOM.RIGHT;
}

Gridifier.Connectors.isBottomLeftSideConnector = function(connector) {
    return connector.side == Gridifier.Connectors.SIDES.BOTTOM.LEFT;
}

Gridifier.Connectors.isRightTopSideConnector = function(connector) {
    return connector.side == Gridifier.Connectors.SIDES.RIGHT.TOP;
}

Gridifier.Connectors.isRightBottomSideConnector = function(connector) {
    return connector.side == Gridifier.Connectors.SIDES.RIGHT.BOTTOM;
}

Gridifier.Connectors.isTopLeftSideConnector = function(connector) {
    return connector.side == Gridifier.Connectors.SIDES.TOP.LEFT;
}

Gridifier.Connectors.isTopRightSideConnector = function(connector) {
    return connector.side == Gridifier.Connectors.SIDES.TOP.RIGHT;
}

Gridifier.Connectors.prototype._addConnector = function(type, side, x, y, itemGUID) {
    if(typeof itemGUID == "undefined")
        var itemGUID = Gridifier.Connectors.INITIAL_CONNECTOR_ITEM_GUID;

    this._connectors.push({
        type: type,
        side: side,
        x: x,
        y: y,
        itemGUID: itemGUID
    });
}

Gridifier.Connectors.prototype.addAppendConnector = function(side, x, y, itemGUID) {
    this._addConnector(Gridifier.Connectors.TYPES.APPEND.DEFAULT, side, x, y, itemGUID);
}

Gridifier.Connectors.prototype.addReversedAppendConnector = function(side, x, y, itemGUID) {
    this._addConnector(Gridifier.Connectors.TYPES.APPEND.REVERSED, side, x, y, itemGUID);
}

Gridifier.Connectors.prototype.addPrependConnector = function(side, x, y, itemGUID) {
    this._addConnector(Gridifier.Connectors.TYPES.PREPEND.DEFAULT, side, x, y, itemGUID);
}

Gridifier.Connectors.prototype.addReversedPrependConnector = function(side, x, y, itemGUID) {
    this._addConnector(Gridifier.Connectors.TYPES.PREPEND.REVERSED, side, x, y, itemGUID);
}

Gridifier.Connectors.prototype.count = function() {
    return this._connectors.length;
}

Gridifier.Connectors.prototype.setNextFlushCallback = function(callbackFn) {
    this._nextFlushCallback = callbackFn;
}

Gridifier.Connectors.prototype.flush = function() {
    this._connectors = [];

    if(typeof this._nextFlushCallback == "function") {
        this._nextFlushCallback();
        this._nextFlushCallback = null;
    }
}

Gridifier.Connectors.prototype.get = function() {
    return this._connectors;
}

Gridifier.Connectors.prototype.set = function(connectors) {
    this._connectors = connectors;
}

Gridifier.Connectors.prototype.getClone = function() {
    var connectorsClone = [];
    for(var i = 0; i < this._connectors.length; i++) {
        connectorsClone.push({
            type: this._connectors[i].type,
            side: this._connectors[i].side,
            x: this._connectors[i].x,
            y: this._connectors[i].y,
            itemGUID: this._connectors[i].itemGUID,
            connectorIndex: i
        });
    }

    return connectorsClone;
}

Gridifier.Connectors.prototype.deleteAllPrependedItemConnectorsExceptSide = function(side, keepFirstItemConnectors) {
    for(var i = 0; i < this._connectors.length; i++) {
        if(keepFirstItemConnectors)
            keepFirstPrependedItemConnectorsCond = !(this._guid.isFirstPrependedItem(this._connectors[i].itemGUID));
        else
            keepFirstPrependedItemConnectorsCond = true;

        if(this._guid.wasItemPrepended(this._connectors[i].itemGUID)
            && this._connectors[i].side != side 
            && keepFirstPrependedItemConnectorsCond) {
            this._connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.Connectors.prototype.deleteAllAppendedItemConnectorsExceptSide = function(side) {
    for(var i = 0; i < this._connectors.length; i++) {
        if(this._guid.wasItemAppended(this._connectors[i].itemGUID)
            && this._connectors[i].side != side) {
            this._connectors.splice(i, 1);
            i--;
        }
    }
}