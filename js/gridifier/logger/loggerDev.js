var Logger = {
    _operations: [],
    _currentOperationType: null,
    _currentOperationSubheading: "",
    _currentOperationActions: [],

    _currentActionData: {},
    _currentActionSubactions: [],
    _isLoggingSubaction: false,

    _findItemConnectionCoordsData: [],

    _grid: null,

    init: function() {
        this._operations = [];
    },

    isEnabled: function() {
        return true;
    },

    setGrid: function(grid) {
        this._grid = grid;
    },

    startLoggingOperation: function(operationType, operationSubheading) {
        this._currentOperationType = operationType;
        this._currentOperationSubheading = operationSubheading || "";
        this._currentOperationActions = [];
    },

    stopLoggingOperation: function() {
        var lastOperation = {
            type: this._currentOperationType,
            actions: this._currentOperationActions,
            subheading: this._currentOperationSubheading
        };
        $(this).trigger(Logger.EVENT_NEW_OPERATION, [lastOperation]); // @todo replace with real event system

        this._operations.push(lastOperation);
    },

    startLoggingSubaction: function(heading, subheading) {
        var subheading = subheading || null;

        this._isLoggingSubaction = true;
        this._currentActionSubactions = [];
        this._currentActionData = {};
        this._currentActionData.actionType = Logger.ACTION_TYPES.SUBACTION_ROOT;
        this._currentActionData.heading = heading;
        this._currentActionData.subheading = subheading;
    },

    stopLoggingSubaction: function() {
        this._isLoggingSubaction = false;
        this._currentActionData.subactions = this._currentActionSubactions;
        this._currentOperationActions.push(this._currentActionData);
    },

    _cloneConnectors: function(connectors) {
        var connectorsClone = [];

        for(var i = 0; i < connectors.length; i++) {
            var connectorClone = {};

            for(var prop in connectors[i])
                connectorClone[prop] = connectors[i][prop];

            connectorsClone.push(connectorClone);
        }

        return connectorsClone;
    },

    _cloneConnections: function(connections) {
        var connectionsClone = [];

        for(var i = 0; i < connections.length; i++) {
            var connectionClone = {};

            for(var prop in connections[i]) {
                if(prop == "item")
                    connectionClone[prop] = connections[i][prop].cloneNode(true);
                else
                    connectionClone[prop] = connections[i][prop];
            }

            connectionsClone.push(connectionClone);
        }

        return connectionsClone;
    },

    _cloneObject: function(objectToClone) {
        var objectClone = {};

        for(var prop in objectToClone)
            objectClone[prop] = objectToClone[prop];

        return objectClone;
    },

    // @todo -> Remove isSizesResolverSubcall logic(Deprecated function)
    log: function(heading, subheading, connectors, connections, isSizesResolverSubcall) {
        var subheading = subheading || "";
        var connectors = connectors || null;
        var connections = connections || null;
        var isSizesResolverSubcall = isSizesResolverSubcall || false;

        var logData = {
            heading: heading,
            subheading: subheading,
            connectors: this._cloneConnectors(connectors),
            connections: this._cloneConnections(connections),
            subactions: null,
            actionType: Logger.ACTION_TYPES.ACTION,
            isSizesResolverSubcall: isSizesResolverSubcall,
            gridWidth: SizesResolver.outerWidth(this._grid),
            gridHeight: SizesResolver.outerHeight(this._grid)
        };

        if(this._isLoggingSubaction)
            this._currentActionSubactions.push(logData);
        else
            this._currentOperationActions.push(logData);
    },

    startLoggingFindItemConnectionCoords: function() {
        this._findItemConnectionCoordsData = [];
    },

    stopLoggingFindItemConnectionCoords: function() {
        var logData = {
            heading: "findItemConnectionCoords per item",
            subheading: "",
            connectors: null,
            connections: null,
            steps: this._findItemConnectionCoordsData,
            actionType: Logger.ACTION_TYPES.FIND_ITEM_CONNECTION_COORDS_ROOT,
            gridWidth: SizesResolver.outerWidth(this._grid),
            gridHeight: SizesResolver.outerHeight(this._grid)
        };

        if(this._isLoggingSubaction)
            this._currentActionSubactions.push(logData);
        else
            this._currentOperationActions.push(logData);
    },

    _getConnectorLabel: function(connector) {
        var subheading = "Connector: ";

        subheading += "x: " + connector.x + " y: " + connector.y + " ";
        subheading += "side: " + connector.side + " type: " + connector.type + " ";
        subheading += "itemGUID: " + connector.itemGUID;

        return subheading;
    },

    _getItemCoordsLabel: function(itemCoords) {
        var subheading = "ItemCoords: ";

        subheading += "x1: " + itemCoords.x1 + " y1: " + itemCoords.y1 + " ";
        subheading += "x2: " + itemCoords.x2 + " y2: " + itemCoords.y2;

        return subheading;
    },

    logFindItemConnectionCoordsInspectConnector: function(connectorToInspect, connections) {
        var logData = {
            heading: "Inspecting connector",
            subheading: this._getConnectorLabel(connectorToInspect),
            connector: this._cloneObject(connectorToInspect),
            connections: this._cloneConnections(connections),
            actionType: Logger.FIND_ITEM_CONNECTION_COORDS_ACTION_TYPES.INSPECT_CONNECTOR,
            gridWidth: SizesResolver.outerWidth(this._grid),
            gridHeight: SizesResolver.outerHeight(this._grid)
        };
        this._findItemConnectionCoordsData.push(logData);
    },

    logFindItemConnectionCoordsOutOfLayoutBounds: function(connector, itemCoords, connections) {
        var logData = {
            heading: "Item coords are out of the layout bounds",
            subheading: this._getConnectorLabel(connector) + "<br>" +
                        this._getItemCoordsLabel(itemCoords),
            connector: this._cloneObject(connector),
            itemCoords: this._cloneObject(itemCoords),
            connections: this._cloneConnections(connections),
            actionType: Logger.FIND_ITEM_CONNECTION_COORDS_ACTION_TYPES.OUT_OF_LAYOUT_BOUNDS,
            gridWidth: SizesResolver.outerWidth(this._grid),
            gridHeight: SizesResolver.outerHeight(this._grid)
        };
        this._findItemConnectionCoordsData.push(logData); 
    },

    logFindItemConnectionCoordsIntersectionFound: function(connector, 
                                                           itemCoords, 
                                                           maybeIntersectableConnections, 
                                                           connections) {
        var logData = {
            heading: "Item coords are intersection other connections",
            subheading: this._getConnectorLabel(connector) + "<br>" +
                        this._getItemCoordsLabel(itemCoords),
            connector: this._cloneObject(connector),
            itemCoords: this._cloneObject(itemCoords),
            maybeIntersectableConnections: this._cloneConnections(maybeIntersectableConnections),
            connections: this._cloneConnections(connections),
            actionType: Logger.FIND_ITEM_CONNECTION_COORDS_ACTION_TYPES.INTERSECTION_FOUND,
            gridWidth: SizesResolver.outerWidth(this._grid),
            gridHeight: SizesResolver.outerHeight(this._grid)
        };
        this._findItemConnectionCoordsData.push(logData);
    },

    logFindItemConnectionCoordsWrongSorting: function(connector,
                                                      itemCoords, 
                                                      connectionsBelowCurrent, 
                                                      connections) {
        var logData = {
            heading: "Item sorting is wrong at this coords",
            subheading: this._getConnectorLabel(connector) + "<br>" +
                        this._getItemCoordsLabel(itemCoords),
            connector: this._cloneObject(connector),
            itemCoords: this._cloneObject(itemCoords),
            connectionsBelowCurrent: this._cloneConnections(connectionsBelowCurrent),
            connections: this._cloneConnections(connections),
            actionType: Logger.FIND_ITEM_CONNECTION_COORDS_ACTION_TYPES.WRONG_SORTING,
            gridWidth: SizesResolver.outerWidth(this._grid),
            gridHeight: SizesResolver.outerHeight(this._grid)
        };
        this._findItemConnectionCoordsData.push(logData);
    },

    logFindItemConnectionCoordsVerticalIntersectionsError: function(connector, itemCoords, connections) {
        var logData = {
            heading: "noIntersectionsStrategy more than 1 vertical intersection",
            subheading: this._getConnectorLabel(connector) + "<br>" +
                        this._getItemCoordsLabel(itemCoords),
            connector: this._cloneObject(connector),
            itemCoords: this._cloneObject(itemCoords),
            connections: this._cloneConnections(connections),
            actionType: Logger.FIND_ITEM_CONNECTION_COORDS_ACTION_TYPES.VERTICAL_INTERSECTIONS_ERROR,
            gridWidth: SizesResolver.outerWidth(this._grid),
            gridHeight: SizesResolver.outerHeight(this._grid)
        };
        this._findItemConnectionCoordsData.push(logData);
    },

    logFindItemConnectionCoordsHorizontalIntersectionsError: function(connector, itemCoords, connections) {
        var logData = {
            heading: "noIntersectionsStrategy more than 1 horizontal intersection",
            subheading: this._getConnectorLabel(connector) + "<br>" +
                        this._getItemCoordsLabel(itemCoords),
            connector: this._cloneObject(connector),
            itemCoords: this._cloneObject(itemCoords),
            connections: this._cloneConnections(connections),
            actionType: Logger.FIND_ITEM_CONNECTION_COORDS_ACTION_TYPES.HORIZONTAL_INTERSECTIONS_ERROR,
            gridWidth: SizesResolver.outerWidth(this._grid),
            gridHeight: SizesResolver.outerHeight(this._grid)
        };
        this._findItemConnectionCoordsData.push(logData);
    },

    logFindItemConnectionCoordsFound: function(connector, itemConnectionCoords, item, connections) {
        var logData = {
            heading: "Item coords found",
            subheading: this._getItemCoordsLabel(itemConnectionCoords),
            connector: this._cloneObject(connector),
            itemCoords: this._cloneObject(itemConnectionCoords),
            connections: this._cloneConnections(connections),
            item: item,
            actionType: Logger.FIND_ITEM_CONNECTION_COORDS_ACTION_TYPES.FOUND,
            gridWidth: SizesResolver.outerWidth(this._grid),
            gridHeight: SizesResolver.outerHeight(this._grid)
        };
        this._findItemConnectionCoordsData.push(logData);
    }
}

// @todo sizesTransformer -> Recursive subcall is not used anymore
Logger.OPERATION_TYPES = {
    APPEND: "append", REVERSED_APPEND: "reversedAppend", PREPEND: "prepend",
    REVERSED_PREPEND: "reversedPrepend", MIRRORED_PREPEND: "mirroredPrepend", 
    TRANSFORM_SIZES: "transformSizes", TOGGLE_SIZES: "toggleSizes"
};
Logger.ACTION_TYPES = {
    ACTION: "action", SUBACTION_ROOT: "subactionRoot", 
    FIND_ITEM_CONNECTION_COORDS_ROOT: "findItemConnectionCoordsRoot"
};
Logger.FIND_ITEM_CONNECTION_COORDS_ACTION_TYPES = {
    INSPECT_CONNECTOR: "inspectConnector",
    OUT_OF_LAYOUT_BOUNDS: "outOfLayoutBounds",
    INTERSECTION_FOUND: "intersectionFound",
    WRONG_SORTING: "wrongSorting",
    VERTICAL_INTERSECTIONS_ERROR: "verticalIntersectionsError",
    HORIZONTAL_INTERSECTIONS_ERROR: "horizontalIntersectionsError",
    FOUND: "found"
};
Logger.EVENT_NEW_OPERATION = "Logger.newOperationAdded";

Logger.init();