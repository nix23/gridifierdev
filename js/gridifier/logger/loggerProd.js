var Logger = {
    isEnabled: function() {
        return false;
    },

    setGrid: function() {
        return false;
    },
    
    startLoggingOperation: function() { return false; },
    stopLoggingOperation: function() { return false; },
    startLoggingSubaction: function() { return false; },
    stopLoggingSubaction: function() { return false; },
    log: function() { return false; },
    startFindCnCoordsLog: function() { return false; },
    stopFindCnCoordsLog: function() { return false; },
    logInspectConnector: function() { return false; },
    logOutOfLayoutBounds: function() { return false; },
    logIntFound: function() { return false; },
    logWrongSorting: function() { return false; },
    logIntersectionsError: function() { return false; },
    logCnCoordsFound: function() { return false; }
}

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
    FOUND: "found"
};
Logger.EVENT_NEW_OPERATION = "Logger.newOperationAdded";