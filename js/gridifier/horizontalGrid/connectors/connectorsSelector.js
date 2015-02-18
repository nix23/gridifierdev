Gridifier.HorizontalGrid.ConnectorsSelector = function(guid) {
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

Gridifier.HorizontalGrid.ConnectorsSelector.prototype.attachConnectors = function(connectors) {
    this._connectors = connectors;
}

Gridifier.HorizontalGrid.ConnectorsSelector.prototype.getSelectedConnectors = function() {
    return this._connectors;
}

// @todo -> Refactor this 2 methods in 1??? (Dynamic conds)
Gridifier.HorizontalGrid.ConnectorsSelector.prototype.selectOnlyMostRightConnectorFromSide = function(side) {
    var mostRightConnectorItemGUID = null;
    var mostRightConnectorX = null;

    var i = this._connectors.length;
    while(i--) {
        if(this._connectors[i].side == side) {
            if(mostRightConnectorItemGUID == null || this._connectors[i].x > mostRightConnectorX) {
                mostRightConnectorItemGUID = this._connectors[i].itemGUID;
                mostRightConnectorX = this._connectors[i].x;
            }
        }
    }

    if(mostRightConnectorItemGUID == null)
        return;

    var i = this._connectors.length;
    while(i--) {
        if(this._connectors[i].side == side && this._connectors[i].itemGUID != mostRightConnectorItemGUID)
            this._connectors.splice(i, 1);
    }
}

Gridifier.HorizontalGrid.ConnectorsSelector.prototype.selectOnlyMostLeftConnectorFromSide = function(side) {
    var mostLeftConnectorItemGUID = null;
    var mostLeftConnectorX = null;

    var i = this._connectors.length;
    while(i--) {
        if(this._connectors[i].side == side) {
            if(mostLeftConnectorItemGUID == null || this._connectors[i].x < mostLeftConnectorX) {
                mostLeftConnectorItemGUID = this._connectors[i].itemGUID;
                mostLeftConnectorX = this._connectors[i].x;
            }
        }
    }

    if(mostLeftConnectorItemGUID == null)
        return;

    var i = this._connectors.length;
    while(i--) {
        if(this._connectors[i].side == side && this._connectors[i].itemGUID != mostLeftConnectorItemGUID) 
            this._connectors.splice(i, 1);
    }
}