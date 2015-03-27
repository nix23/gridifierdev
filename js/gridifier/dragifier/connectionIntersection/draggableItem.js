Gridifier.Dragifier.ConnectionIntersectionDraggableItem = function(gridifier,
                                                                   appender,
                                                                   reversedAppender,
                                                                   collector,
                                                                   connections,
                                                                   connectors,
                                                                   guid,
                                                                   settings,
                                                                   sizesResolverManager,
                                                                   eventEmitter) {
    var me = this;

    this._gridifier = null;
    this._appender = null;
    this._reversedAppender = null;
    this._collector = null;
    this._connections = null;
    this._connectors = null;
    this._connectionsIntersector = null;
    this._guid = null;
    this._settings = null;
    this._sizesResolverManager = null;
    this._eventEmitter = null;

    this._dragifierCore = null;
    this._dragifierRenderer = null;

    this._dragIdentifiers = [];
    this._draggableItem = null;
    this._draggableItemClone = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._collector = collector;
        me._connections = connections;
        me._connectors = connectors;
        me._guid = guid;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;
        me._eventEmitter = eventEmitter;

        me._dragIdentifiers = [];

        me._connectionsIntersector = new Gridifier.ConnectionsIntersector(
            me._connections
        );

        me._dragifierRenderer = new Gridifier.Dragifier.Renderer(
            me._settings
        );
        me._dragifierCore = new Gridifier.Dragifier.Core(
            me._gridifier, 
            me._appender, 
            me._reversedAppender, 
            me._collector,
            me._connectors, 
            me._connections,
            me._settings,
            me._guid,
            me._dragifierRenderer, 
            me._sizesResolverManager,
            me._eventEmitter
        );

        me._bindEvents();
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

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype.bindDraggableItem = function(item,
                                                                                               cursorX,
                                                                                               cursorY) {
    this._initDraggableItem(item);

    this._dragifierCore.determineGridOffsets();
    this._dragifierCore.determineInitialCursorOffsetsFromDraggableItemCenter(
        this._draggableItem, cursorX, cursorY
    );

    this._draggableItemClone = this._dragifierCore.createDraggableItemClone(this._draggableItem);
    this._hideDraggableItem();
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype.getDraggableItem = function() {
    return this._draggableItem;
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype.addDragIdentifier = function(identifier) {
    this._dragIdentifiers.push(identifier);
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype.hasDragIdentifier = function(identifier) {
    for(var i = 0; i < this._dragIdentifiers.length; i++) {
        if(this._dragIdentifiers[i] == identifier)
            return true;
    }

    return false;
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype.removeDragIdentifier = function(identifier) {
    for(var i = 0; i < this._dragIdentifiers.length; i++) {
        if(this._dragIdentifiers[i] == identifier) {
            this._dragIdentifiers.splice(i, 1);
            break;
        }
    }
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype.getDragIdentifiersCount = function() {
    return this._dragIdentifiers.length;
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype._initDraggableItem = function(item) {
    this._draggableItem = item;
    if(Dom.isBrowserSupportingTransitions())
        Dom.css3.transitionProperty(this._draggableItem, "Visibility 0ms ease");
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype._hideDraggableItem = function() {
    this._draggableItem.style.visibility = "hidden";
    this._draggableItem.setAttribute(Gridifier.Dragifier.IS_DRAGGABLE_ITEM_DATA_ATTR, "yes");

    var itemClonesManager = this._gridifier.getItemClonesManager();
    if(itemClonesManager.hasBindedClone(this._draggableItem)) {
        var draggableItemRendererClone = itemClonesManager.getBindedClone(this._draggableItem);
        draggableItemRendererClone.style.visibility = "hidden";
    }
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype.processDragMove = function(cursorX, cursorY) {
    var draggableItemCloneNewDocumentPosition = this._dragifierCore.calculateDraggableItemCloneNewDocumentPosition(
        this._draggableItem, cursorX, cursorY
    )

    this._dragifierRenderer.render(
        this._draggableItemClone,
        draggableItemCloneNewDocumentPosition.x,
        draggableItemCloneNewDocumentPosition.y
    );

    var draggableItemCloneNewGridPosition = this._dragifierCore.calculateDraggableItemCloneNewGridPosition(
        this._draggableItem, draggableItemCloneNewDocumentPosition
    );

    var newIntersectedConnections = this._getNewIntersectedConnections(draggableItemCloneNewGridPosition);
    if(newIntersectedConnections.length == 0)
        return;

    if(this._settings.isDisabledSortDispersion() || this._settings.isCustomSortDispersion()) {
        this._swapItemGUIDS(newIntersectedConnections);
        this._dragifierCore.reappendGridItems();
    }
    else if(this._settings.isCustomAllEmptySpaceSortDispersion()) {
        if(this._swapItemPositions(newIntersectedConnections))
            this._dragifierCore.reappendGridItems();
    }
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype._getNewIntersectedConnections = function(draggableItemCloneNewGridPosition) {
    var draggableItemGUID = this._guid.getItemGUID(this._draggableItem);
    var allConnectionsWithIntersectedCenter = this._connectionsIntersector.getAllConnectionsWithIntersectedCenter(
        draggableItemCloneNewGridPosition
    );

    var newIntersectedConnections = [];
    for(var i = 0; i < allConnectionsWithIntersectedCenter.length; i++) {
        if(allConnectionsWithIntersectedCenter[i].itemGUID != draggableItemGUID) {
            newIntersectedConnections.push(allConnectionsWithIntersectedCenter[i]);
        }
    }

    return newIntersectedConnections;
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype._swapItemGUIDS = function(newIntersectedConnections) {
    var draggableItemGUID = this._guid.getItemGUID(this._draggableItem);

    var intersectedConnectionWithSmallestGUID = newIntersectedConnections[0];
    for(var i = 0; i < newIntersectedConnections.length; i++) {
        if(newIntersectedConnections[i].itemGUID < intersectedConnectionWithSmallestGUID)
            intersectedConnectionWithSmallestGUID = newIntersectedConnections[i];
    }

    this._guid.setItemGUID(this._draggableItem, intersectedConnectionWithSmallestGUID.itemGUID);
    this._guid.setItemGUID(this._draggableItemClone, intersectedConnectionWithSmallestGUID.itemGUID);
    this._guid.setItemGUID(intersectedConnectionWithSmallestGUID.item, draggableItemGUID);
}

/*
    Connection could be still deleted on fast dragging, so we should perform drag in this mode
    only if the connection was reappended through reappend queue. On Grid Discretization algorithm
    connection is marked as RESTRICTED_TO_COLLECT, so no such check is required.
 */
Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype._swapItemPositions = function(newIntersectedConnections) {
    var draggableItemConnection = this._connections.findConnectionByItem(this._draggableItem, true);
    if(draggableItemConnection == null)
        return false;

    if(this._settings.isVerticalGrid()) {
        var connectionsSorter = new Gridifier.VerticalGrid.ConnectionsSorter(
            this._connections, this._settings, this._guid
        );
        newIntersectedConnections = connectionsSorter.sortConnectionsPerReappend(newIntersectedConnections);
    }
    else if(this._settings.isHorizontalGrid()) {
        var connectionsSorter = new Gridifier.HorizontalGrid.ConnectionsSorter(
           this._connections, this._settings, this._guid
        );
        newIntersectedConnections = connectionsSorter.sortConnectionsPerReappend(newIntersectedConnections);
    }

    var intersectedConnectionWithSmallestPosition = newIntersectedConnections[0];

    var draggableItemGUID = this._guid.getItemGUID(this._draggableItem);
    var intersectedConnectionWithSmallestPositionGUID = this._guid.getItemGUID(intersectedConnectionWithSmallestPosition.item);

    this._guid.setItemGUID(this._draggableItem, intersectedConnectionWithSmallestPositionGUID);
    this._guid.setItemGUID(intersectedConnectionWithSmallestPosition.item, draggableItemGUID);

    var tempItem = draggableItemConnection.item;
    draggableItemConnection.item = intersectedConnectionWithSmallestPosition.item;
    intersectedConnectionWithSmallestPosition.item = tempItem;

    var tempGUID = draggableItemConnection.itemGUID;
    draggableItemConnection.itemGUID = intersectedConnectionWithSmallestPositionGUID;
    intersectedConnectionWithSmallestPosition.itemGUID = tempGUID;

    return true;
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype.unbindDraggableItem = function() {
    document.body.removeChild(this._draggableItemClone);

    this._showDraggableItem();
    this._draggableItem = null;
    this._draggableItem = null;
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype._showDraggableItem = function() {
    this._draggableItem.removeAttribute(Gridifier.Dragifier.IS_DRAGGABLE_ITEM_DATA_ATTR);
    this._draggableItem.style.visibility = "visible";
}