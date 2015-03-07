Gridifier.Dragifier.ConnectionIntersectionDraggableItem = function(gridifier,
                                                                   appender,
                                                                   reversedAppender,
                                                                   collector,
                                                                   connections,
                                                                   connectors,
                                                                   guid,
                                                                   settings,
                                                                   sizesResolverManager) {
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

        me._dragIdentifiers = [];

        // @todo -> Check settings, or merge intersections logic
        me._connectionsIntersector = new Gridifier.VerticalGrid.ConnectionsIntersector(
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
            me._dragifierRenderer, 
            me._sizesResolverManager
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
    // @todo -> Fix this(visibility uses transition timeout, Replace global from all???)
    Dom.css3.transitionProperty(this._draggableItem, "Visibility 0ms ease");
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype._hideDraggableItem = function() {
    this._draggableItem.style.visibility = "hidden";

    var itemClonesManager = this._gridifier.getItemClonesManager();
    if(itemClonesManager.hasBindedClone(this._draggableItem)) {
        var draggableItemRendererClone = itemClonesManager.getBindedClone(this._draggableItem);
        draggableItemRendererClone.style.visibility = "hidden";
    }

    // @todo -> Replace with real hidder
    Dom.css.addClass(document.body, "disableSelect");
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

    this._swapItemGUIDS(newIntersectedConnections);
    this._dragifierCore.reappendGridItems();
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

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype.unbindDraggableItem = function() {
    document.body.removeChild(this._draggableItemClone);

    this._showDraggableItem();
    this._draggableItem = null;
    this._draggableItem = null;

    // @todo -> Replace with real hidder
    Dom.css.removeClass(document.body, "disableSelect");
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype._showDraggableItem = function() {
    this._draggableItem.style.visibility = "visible";
}