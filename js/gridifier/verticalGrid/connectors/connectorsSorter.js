Gridifier.VerticalGrid.ConnectorsSorter = function() {
    var me = this;

    this._connectors = null;

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

Gridifier.VerticalGrid.ConnectorsSorter.prototype.attachConnectors = function(connectors) {
    this._connectors = connectors;
}

Gridifier.VerticalGrid.ConnectorsSorter.prototype.getConnectors = function() {
    return this._connectors;
}

Gridifier.VerticalGrid.ConnectorsSorter.prototype.sortConnectorsForPrepend = function(prependType) {
    var me = this;
    this._connectors.sort(function(firstConnector, secondConnector) {
         if(Dom.areRoundedOrCeiledValuesEqual(firstConnector.y, secondConnector.y)) {
            if(prependType == Gridifier.PREPEND_TYPES.DEFAULT_PREPEND) {
                if(firstConnector.x > secondConnector.x)
                    return 1;
                else
                    return -1;
            }
            else if(prependType == Gridifier.PREPEND_TYPES.REVERSED_PREPEND) {
                if(firstConnector.x < secondConnector.x)
                    return 1;
                else
                    return -1;
            }
        }
        else {
            if(firstConnector.y < secondConnector.y)
                return 1;
            else
                return -1;
        }
    });
}

Gridifier.VerticalGrid.ConnectorsSorter.prototype.sortConnectorsForAppend = function(appendType) {
    var me = this;
    this._connectors.sort(function(firstConnector, secondConnector) {
        if(Dom.areRoundedOrFlooredValuesEqual(firstConnector.y, secondConnector.y)) {
            if(appendType == Gridifier.APPEND_TYPES.DEFAULT_APPEND) {
                if(firstConnector.x > secondConnector.x)
                    return -1;
                else
                    return 1;
            }
            else if(appendType == Gridifier.APPEND_TYPES.REVERSED_APPEND) {
                if(firstConnector.x < secondConnector.x)
                    return -1;
                else
                    return 1;
            }
        }
        else {
            if(firstConnector.y < secondConnector.y)
                return -1;
            else
                return 1;
        }
    });
}