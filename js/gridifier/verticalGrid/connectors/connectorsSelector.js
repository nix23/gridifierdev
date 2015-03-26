Gridifier.VerticalGrid.ConnectorsSelector = function(guid) {
    var me = this;

    this._connectors = null;

    this._guid = null;

    this._css = {
    };

    this._construct = function() {
        me._guid = guid;
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

Gridifier.VerticalGrid.ConnectorsSelector.prototype.attachConnectors = function(connectors) {
    this._connectors = connectors;
}

Gridifier.VerticalGrid.ConnectorsSelector.prototype.getSelectedConnectors = function() {
    return this._connectors;
}

Gridifier.VerticalGrid.ConnectorsSelector.prototype.selectOnlyMostBottomConnectorFromSide = function(side) {
    var mostBottomConnectorItemGUID = null;
    var mostBottomConnectorY = null;

    var i = this._connectors.length;
    while(i--) {
        if(this._connectors[i].side == side) {
            if(mostBottomConnectorItemGUID == null || this._connectors[i].y > mostBottomConnectorY) {
                mostBottomConnectorItemGUID = this._connectors[i].itemGUID;
                mostBottomConnectorY = this._connectors[i].y;
            }
        }
    }

    if(mostBottomConnectorItemGUID == null)
        return;

    var i = this._connectors.length;
    while(i--) {
        if(this._connectors[i].side == side && this._connectors[i].itemGUID != mostBottomConnectorItemGUID)
            this._connectors.splice(i, 1);
    }
}

Gridifier.VerticalGrid.ConnectorsSelector.prototype.selectOnlyMostTopConnectorFromSide = function(side) {
    var mostTopConnectorItemGUID = null;
    var mostTopConnectorY = null;

    var i = this._connectors.length;
    while(i--) {
        if(this._connectors[i].side == side) {
            if(mostTopConnectorItemGUID == null || this._connectors[i].y < mostTopConnectorY) {
                mostTopConnectorItemGUID = this._connectors[i].itemGUID;
                mostTopConnectorY = this._connectors[i].y;
            }
        }
    }

    if(mostTopConnectorItemGUID == null)
        return;

    var i = this._connectors.length;
    while(i--) {
        if(this._connectors[i].side == side && this._connectors[i].itemGUID != mostTopConnectorItemGUID) 
            this._connectors.splice(i, 1);
    }
}

Gridifier.VerticalGrid.ConnectorsSelector.prototype._isInitialConnector = function(connector) {
    return connector.itemGUID == Gridifier.Connectors.INITIAL_CONNECTOR_ITEM_GUID;
}

Gridifier.VerticalGrid.ConnectorsSelector.prototype.selectOnlySpecifiedSideConnectorsOnAppendedItems = function(side) {
    for(var i = 0; i < this._connectors.length; i++) {
        if(!this._isInitialConnector(this._connectors[i]) &&
            !this._guid.wasItemPrepended(this._connectors[i].itemGUID) && side != this._connectors[i].side) {
            this._connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.VerticalGrid.ConnectorsSelector.prototype.selectOnlySpecifiedSideConnectorsOnPrependedItems = function(side) {
    for(var i = 0; i < this._connectors.length; i++) {
        if(!this._isInitialConnector(this._connectors[i]) &&
            this._guid.wasItemPrepended(this._connectors[i].itemGUID) && side != this._connectors[i].side) {
            this._connectors.splice(i, 1);
            i--;
        }
    }
}