// @todo -> important drag items from one Gridifier instance to another!!!!!

Gridifier.VerticalGrid.Dragifier = function(gridifier, connections, connectors, guid) {
    var me = this;

    this._gridifier = null;
    this._connections = null;
    this._connectors = null;
    this._guid = null;
    this._connectionsIntersector = null;
    this._dragifierConnectors = null;

    this._isDragging = false;
    this._draggableItem = null;
    this._draggableItemConnection = null;
    this._draggableItemClone = null;
    this._draggableItemPointer = null;

    this._cursorOffsetXFromDraggableItemCenter = null;
    this._cursorOffsetYFromDraggableItemCenter = null;

    this._gridOffsetLeft = null;
    this._gridOffsetTop = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._connections = connections;
        me._connectors = connectors;
        me._guid = guid;
        me._connectionsIntersector = new Gridifier.VerticalGrid.ConnectionsIntersector(
            me._connections
        );

        me._dragifierConnectors = new Gridifier.VerticalGrid.DragifierConnectors(
            me._connections, me._guid
        );

        me._bindEvents();
    };

    this._bindEvents = function() {
        // @todo -> Replace with gridifier events
        $("body").on("mousedown", ".gridItem", function(event) {
            // @todo Check if this is required
            // SizesResolverManager.startCachingTransaction();

            me._isDragging = true;
            me._draggableItem = $(this).get(0);
            me._draggableItemConnection = me._gridifier.findConnectionByItem(me._draggableItem);

            me._determineInitialCursorOffsetsFromDraggableItemCenter(
                event.pageX, event.pageY
            );
            me._determineGridOffsets();
            me._createDraggableItemClone();
            me._createDraggableItemPointer();
            me._dragifierConnectors.initConnectors(
                me._draggableItem
            );

            me._draggableItem.style.visibility = "hidden";
            // @todo -> Replace with real hidder
            Dom.css.addClass(document.body, "disableSelect");
        });

        $(document).on("mousemove.gridifier.dragifier", function(event) {
            if(!me._isDragging)
                return;

            var draggableItemNewPosition = me._calculateDraggableItemNewPosition(
                event.pageX, event.pageY
            );
            me._processDragStep(draggableItemNewPosition);
        });

        $(document).on("mouseup.gridifier.dragifier", function() {
            if(me._isDragging) {
                var grid = me._gridifier.getGrid();
                //grid.removeChild(me._draggableItemClone);
                document.body.removeChild(me._draggableItemClone);
                grid.removeChild(me._draggableItemPointer);

                me._draggableItem.style.visibility = "visible";
                me._isDragging = false;
                me._draggableItem = null;

                // @todo -> Replace with real hidder
                Dom.css.removeClass(document.body, "disableSelect");

                // @todo Check if this is required
                // SizesResolverManager.stopCachingTransaction();
            }
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

Gridifier.VerticalGrid.Dragifier.prototype._determineInitialCursorOffsetsFromDraggableItemCenter = function(cursorX, cursorY) {
    var draggableItemOffsetLeft = SizesResolverManager.offsetLeft(this._draggableItem);
    var draggableItemOffsetTop = SizesResolverManager.offsetTop(this._draggableItem);

    var draggableItemWidth = SizesResolverManager.outerWidth(this._draggableItem, true);
    var draggableItemHeight = SizesResolverManager.outerHeight(this._draggableItem, true);

    var draggableItemCenterX = draggableItemOffsetLeft + (draggableItemWidth / 2);
    var draggableItemCenterY = draggableItemOffsetTop + (draggableItemHeight / 2);

    this._cursorOffsetXFromDraggableItemCenter = draggableItemCenterX - cursorX;
    this._cursorOffsetYFromDraggableItemCenter = draggableItemCenterY - cursorY;
}

Gridifier.VerticalGrid.Dragifier.prototype._determineGridOffsets = function() {
    this._gridOffsetLeft = SizesResolverManager.offsetLeft(this._gridifier.getGrid());
    this._gridOffsetTop = SizesResolverManager.offsetTop(this._gridifier.getGrid());
}

Gridifier.VerticalGrid.Dragifier.prototype._createDraggableItemClone = function() {
    this._draggableItemClone = this._draggableItem.cloneNode(true);
    //this._gridifier.getGrid().appendChild(this._draggableItemClone);
    document.body.appendChild(this._draggableItemClone);

    var draggableItemOffsetLeft = SizesResolverManager.offsetLeft(this._draggableItem);
    var draggableItemOffsetTop = SizesResolverManager.offsetTop(this._draggableItem);

    this._draggableItemClone.style.left = draggableItemOffsetLeft + "px";
    this._draggableItemClone.style.top = draggableItemOffsetTop + "px";
    // @todo -> Replace this, tmp solution
    this._draggableItemClone.style.setProperty("background", "rgb(235,235,235)", "important");
    Dom.css3.transition(this._draggableItemClone, "All 0ms ease");
    this._draggableItemClone.style.zIndex = 10;
}

Gridifier.VerticalGrid.Dragifier.prototype._createDraggableItemPointer = function() {
    var draggableItemOffsetLeft = SizesResolverManager.offsetLeft(this._draggableItem);
    var draggableItemOffsetTop = SizesResolverManager.offsetTop(this._draggableItem);

    this._draggableItemPointer = document.createElement("div");
    Dom.css.set(this._draggableItemPointer, {
        width: SizesResolverManager.outerWidth(this._draggableItem, true) + "px",
        height: SizesResolverManager.outerHeight(this._draggableItem, true) + "px",
        position: "absolute",
        left: (draggableItemOffsetLeft - this._gridOffsetLeft) + "px",
        top: (draggableItemOffsetTop - this._gridOffsetTop) + "px",
        background: "red" // @todo -> Replace with real color,
    });
    this._gridifier.getGrid().appendChild(this._draggableItemPointer);
}

Gridifier.VerticalGrid.Dragifier.prototype._calculateDraggableItemNewPosition = function(cursorX, cursorY) {
    var itemSideWidth = SizesResolverManager.outerWidth(this._draggableItem, true) / 2;
    var itemSideHeight = SizesResolverManager.outerHeight(this._draggableItem, true) / 2;

    return {
        x: cursorX - itemSideWidth - (this._cursorOffsetXFromDraggableItemCenter * -1),
        y: cursorY - itemSideHeight - (this._cursorOffsetYFromDraggableItemCenter * -1)
    };
}

// Gridifier.VerticalGrid.Dragifier.prototype._calculateDraggableItemNewPosition = function(cursorX, cursorY) {
//     var newCenterPointX = cursorX - this._gridOffsetLeft;
//     var newCenterPointY = cursorY - this._gridOffsetTop;

//     var itemSideWidth = SizesResolverManager.outerWidth(this._draggableItem, true) / 2;
//     var itemSideHeight = SizesResolverManager.outerHeight(this._draggableItem, true) / 2;

//     if(newCenterPointX - itemSideWidth < 0) 
//         newCenterPointX = itemSideWidth;
//     if(newCenterPointY - itemSideHeight < 0) 
//         newCenterPointY = itemSideHeight;

//     if(newCenterPointX + itemSideWidth > this._gridifier.getGridX2())
//         newCenterPointX = this._gridifier.getGridX2() - itemSideWidth;
//     if(newCenterPointY + itemSideHeight > this._gridifier.getGridY2())
//         newCenterPointY = this._gridifier.getGridY2() - itemSideHeight;

//     return {
//         x: newCenterPointX - itemSideWidth,
//         y: newCenterPointY - itemSideHeight
//     };
// }

// @todo -> Sozdavatj konnektori toljko dlja blizkix randgej???
//       -> (Ili najti vse rendzi v kotorie popadajet perekrivaemij element, polu4itj vse connectioni s nix,
//       ->  i toljko dlja dannix elementov perestoitj connection-i???)
Gridifier.VerticalGrid.Dragifier.prototype._processDragStep = function(draggableItemNewPosition) {
    this._draggableItemClone.style.left = draggableItemNewPosition.x + "px";
    this._draggableItemClone.style.top = draggableItemNewPosition.y + "px";

    var draggableItemCloneNewGridPosition = {
        x1: draggableItemNewPosition.x,
        x2: draggableItemNewPosition.x + (SizesResolverManager.outerWidth(this._draggableItem, true)) - 1,
        y1: draggableItemNewPosition.y,
        y2: draggableItemNewPosition.y + (SizesResolverManager.outerHeight(this._draggableItem, true)) - 1
    };

    draggableItemCloneNewGridPosition.x1 -= this._gridOffsetLeft;
    draggableItemCloneNewGridPosition.x2 -= this._gridOffsetLeft;
    draggableItemCloneNewGridPosition.y1 -= this._gridOffsetTop;
    draggableItemCloneNewGridPosition.y2 -= this._gridOffsetTop;

    var maybeIntersectableConnections = this._getAllMaybeIntersectableConnectionsOnDragStep();
    var intersectableConnectionsByDraggableItem = [];
    for(var i = 0; i < maybeIntersectableConnections.length; i++) {
        if(this._connectionsIntersector.isIntersectingAnyConnection(
            [maybeIntersectableConnections[i]], draggableItemCloneNewGridPosition
        )) {
            intersectableConnectionsByDraggableItem.push(maybeIntersectableConnections[i]);
        }
    }

    var snappedConnections = this._getAllSnappedToIntersectableConnectionsToIntersectionSide(
        intersectableConnectionsByDraggableItem
    );
}

// @todo -> Get only from specific ranges(You can even share them before next range is reached)
Gridifier.VerticalGrid.Dragifier.prototype._getAllMaybeIntersectableConnectionsOnDragStep = function() {
    var connections = this._connections.get();
    var maybeIntersectableConnections = [];

    for(var i = 0; i < connections.length; i++) {
        if(this._guid.getItemGUID(connections[i].item) == this._guid.getItemGUID(this._draggableItem))
            continue;

        maybeIntersectableConnections.push(connections[i]);
    }

    return maybeIntersectableConnections;
}

Gridifier.VerticalGrid.Dragifier.prototype._getAllSnappedToIntersectableConnectionsToIntersectionSide = function(intersectableConnections) {
    var me = this;
    var intersectionSides = {TOP: 0, LEFT: 1, BOTTOM: 2, RIGHT: 3};
    var getIntersectionSide = function(intersectableConnection) {
        if(me._draggableItemConnection.y1 < intersectableConnection.y1 &&
           me._draggableItemConnection.y2 < intersectableConnection.y1) {
            var intersectionSide = intersectionSides.TOP;
        }
        else if(me._draggableItemConnection.y1 > intersectableConnection.y2 &&
                me._draggableItemConnection.y2 > intersectableConnection.y2) {
            var intersectionSide = intersectionSides.BOTTOM;
        }
        else if(me._draggableItemConnection.x1 < intersectableConnection.x1 &&
                me._draggableItemConnection.x2 < intersectableConnection.x1) {
            var intersectionSide = intersectionSides.LEFT;
        }
        else if(me._draggableItemConnection.x1 > intersectableConnection.x2 &&
                me._draggableItemConnection.x2 > intersectableConnection.x2) {
            var intersectionSide = intersectionSides.RIGHT;
        }

        return intersectionSide;
    }

    var isAlreadyIntersectedConnection = function(connection, intersectableConnections, snappedConnections) {
        if(me._guid.getItemGUID(connection.item) == me._guid.getItemGUID(me._draggableItem))
            return true;

        for(var i = 0; i < intersectableConnections.length; i++) {
            if(me._guid.getItemGUID(connection.item) == me._guid.getItemGUID(intersectableConnections[i].item))
                return true;
        }

        for(var i = 0; i < snappedConnections.length; i++) {
            if(me._guid.getItemGUID(connection.item) == me._guid.getItemGUID(snappedConnections[i].item))
                return true;
        }

        return false;
    }

    var getSnappedConnections = function(intersectableConnection, intersectionSide) {
        var snappedConnection = [];
        if(intersectionSide == intersectionSides.TOP) {
            
        }
        else if(intersectionSide == intersectionSides.LEFT) {

        }
        else if(intersectionSide == intersectionSides.RIGHT) {

        }
        else if(intersectionSide == intersectionSides.BOTTOM) {

        }
    }

    var snappedConnections = [];
    for(var i = 0; i < intersectableConnections.length; i++) {
        var intersectionSide = getIntersectionSide(intersectableConnections[i]);
    }
}