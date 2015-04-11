Gridifier.ConnectorsNormalizer = function(connections, connectors, settings) {
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

Gridifier.ConnectorsNormalizer.prototype.applyConnectionRoundingPerConnector = function(connection, connector) {
    connection.originalX1 = connection.x1;
    connection.originalX2 = connection.x2;
    connection.originalY1 = connection.y1;
    connection.originalY2 = connection.y2;

    if(Gridifier.Connectors.isBottomLeftSideConnector(connector) || Gridifier.Connectors.isRightTopSideConnector(connector)) {
        connection.x1 = Math.floor(connection.x1);
        connection.y1 = Math.floor(connection.y1);
    }
    else if(Gridifier.Connectors.isLeftTopSideConnector(connector) || Gridifier.Connectors.isBottomRightSideConnector(connector)) {
        connection.x2 = Math.ceil(connection.x2);
        connection.y1 = Math.floor(connection.y1);
    }
    else if(Gridifier.Connectors.isLeftBottomSideConnector(connector) || Gridifier.Connectors.isTopRightSideConnector(connector)) {
        connection.x2 = Math.ceil(connection.x2);
        connection.y2 = Math.ceil(connection.y2);
    }
    else if(Gridifier.Connectors.isTopLeftSideConnector(connector) || Gridifier.Connectors.isRightBottomSideConnector(connector)) {
        connection.x1 = Math.floor(connection.x1);
        connection.y2 = Math.ceil(connection.y2);
    }
}

Gridifier.ConnectorsNormalizer.prototype.unapplyConnectionRoundingPerConnector = function(connection, connector) {
    connection.x1 = connection.originalX1;
    connection.y1 = connection.originalY1;
    connection.x2 = connection.originalX2;
    connection.y2 = connection.originalY2;
}