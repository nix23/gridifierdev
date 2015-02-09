Gridifier.Dragifier.ConnectionIntersectionDragifier = function(gridifier,
                                                               appender,
                                                               reversedAppender,
                                                               connections,
                                                               connectors,
                                                               guid,
                                                               settings) {
    var me = this;

    this._gridifier = null;
    this._appender = null;
    this._reversedAppender = null;
    this._connections = null;
    this._connectors = null;
    this._connectionsIntersector = null;
    this._guid = null;
    this._settings = null;

    this._dragifierCore = null;
    this._dragifierRenderer = null;

    this._isDragging = false;
    this._draggableItem = null;
    this._draggableItemClone = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._connections = connections;
        me._connectors = connectors;
        me._guid = guid;
        me._settings = settings;

        // @todo -> Check settings, or merge intersections logic
        me._connectionsIntersector = new Gridifier.VerticalGrid.ConnectionsIntersector(
            me._connections
        );

        me._dragifierRenderer = new Gridifier.Dragifier.Renderer(
            me._settings
        );
        me._dragifierCore = new Gridifier.Dragifier.Core(
            me._gridifier, me._appender, me._reversedAppender, me._connectors, me._settings, me._dragifierRenderer
        );

        me._bindEvents();
    };

    this._bindEvents = function() {
        // @todo -> Replace with gridifier events
        $("body").on("mousedown", ".gridItem", function(event) {
            me._initDragInteraction();
            me._initDraggableItems($(this).get(0));

            me._dragifierCore.determineInitialCursorOffsetsFromDraggableItemCenter(
                me._draggableItem, event.pageX, event.pageY
            );
            me._dragifierCore.determineGridOffsets();

            me._draggableItemClone = me._dragifierCore.createDraggableItemClone(me._draggableItem);
            me._hideDraggableItems();
        });

        $(document).on("mouseup.gridifier.dragifier", function() {
            setTimeout(function() {
                if(!me._isDragging) return;
                me._stopDragInteraction.call(me);
            }, 0);
        });

        $(document).on("mousemove.gridifier.dragifier", function(event) {
            setTimeout(function() {
                if(!me._isDragging) return;
                me._processDragMove.call(me, me._dragifierCore.calculateDraggableItemCloneNewDocumentPosition(
                    me._draggableItem, event.pageX, event.pageY
                ));
            }, 0);
        });
    };

    this._unbindEvents = function() {
    };

    this.destruct = function() {
       me._unbindEvents();
    };

    this._construct();
    return this;
}

Gridifier.Dragifier.ConnectionIntersectionDragifier.prototype._initDragInteraction = function() {
    SizesResolverManager.startCachingTransaction();
    this._isDragging = true;
}

Gridifier.Dragifier.ConnectionIntersectionDragifier.prototype._initDraggableItems = function(item) {
    this._draggableItem = item;
    // @todo -> Fix this(visibility uses transition timeout, Replace global from all???)
    Dom.css3.transition(this._draggableItem, "Visibility 0ms ease");
}

Gridifier.Dragifier.ConnectionIntersectionDragifier.prototype._hideDraggableItems = function() {
    this._draggableItem.style.visibility = "hidden";
    // @todo -> Replace with real hidder
    Dom.css.addClass(document.body, "disableSelect");
}

Gridifier.Dragifier.ConnectionIntersectionDragifier.prototype._stopDragInteraction = function() {
    document.body.removeChild(this._draggableItemClone);

    this._draggableItem.style.visibility = "visible";
    this._isDragging = false;
    this._draggableItem = null;

    // @todo -> Replace with real hidder
    Dom.css.removeClass(document.body, "disableSelect");
    SizesResolverManager.stopCachingTransaction();
}

Gridifier.Dragifier.ConnectionIntersectionDragifier.prototype._processDragMove = function(draggableItemCloneNewDocumentPosition) {
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

Gridifier.Dragifier.ConnectionIntersectionDragifier.prototype._getNewIntersectedConnections = function(draggableItemCloneNewGridPosition) {
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

Gridifier.Dragifier.ConnectionIntersectionDragifier.prototype._swapItemGUIDS = function(newIntersectedConnections) {
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