// @todo -> important drag items from one Gridifier instance to another!!!!!
// @todo -> Multitouch -> multiple dragged items cannot intersect each other

Gridifier.VerticalGrid.Dragifier = function(gridifier, 
                                            appender,
                                            reversedAppender,
                                            connections, 
                                            connectionsSorter,
                                            connectors, 
                                            guid, 
                                            settings, 
                                            normalizer) {
    var me = this;

    this._gridifier = null;
    this._appender = null;
    this._reversedAppender = null;
    this._connections = null;
    this._connectionsSorter = null;
    this._connectors = null;
    this._guid = null;
    this._settings = null;
    this._normalizer = null;
    this._connectionsIntersector = null;
    this._dragifierDiscretizator = null;

    this._isDragging = false;
    this._draggableItem = null;
    this._draggableItemConnection = null;
    this._draggableItemClone = null;
    this._draggableItemPointer = null;

    this._cursorOffsetXFromDraggableItemCenter = null;
    this._cursorOffsetYFromDraggableItemCenter = null;

    this._gridOffsetLeft = null;
    this._gridOffsetTop = null;

    this._reappendGridItemsAfterDragTimeout = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._connections = connections;
        me._connectionsSorter = connectionsSorter;
        me._connectors = connectors;
        me._guid = guid;
        me._settings = settings;
        me._normalizer = normalizer;
        me._connectionsIntersector = new Gridifier.VerticalGrid.ConnectionsIntersector(
            me._connections
        );

        me._dragifierDiscretizator = new Gridifier.VerticalGrid.DragifierDiscretizator(
            me._gridifier, me._connections, me._guid, me._settings
        );

        me._bindEvents();
    };

    this._bindEvents = function() {
        // @todo -> Replace with gridifier events
        $("body").on("mousedown", ".gridItem", function(event) {
            // @todo Check if this is required
            SizesResolverManager.startCachingTransaction();

            me._isDragging = true;
            me._draggableItem = $(this).get(0);
            // @todo -> Fix this(visibility uses transition timeout, Replace global from all???)
            Dom.css3.transition(me._draggableItem, "Visibility 0ms ease");
            me._draggableItemConnection = me._gridifier.findConnectionByItem(me._draggableItem);
            me._draggableItemConnection.isDragged = true;

            me._determineInitialCursorOffsetsFromDraggableItemCenter(
                event.pageX, event.pageY
            );
            me._determineGridOffsets();
            me._createDraggableItemClone();
            me._createDraggableItemPointer();
            me._dragifierDiscretizator.discretizeGrid(
                me._draggableItem, me._draggableItemConnection
            );

            me._draggableItem.style.visibility = "hidden";
            // @todo -> Replace with real hidder
            Dom.css.addClass(document.body, "disableSelect");
        });
        
        $(document).on("mousemove.gridifier.dragifier", function(event) {
            setTimeout(function() {
                if(!me._isDragging)
                    return;
                
                var draggableItemNewPosition = me._calculateDraggableItemNewPosition(
                    event.pageX, event.pageY
                );
                me._processDragStep.call(me, draggableItemNewPosition);
            }, 0);
        });

        $(document).on("mouseup.gridifier.dragifier", function() {
            setTimeout(function() {
                if(me._isDragging) {
                    var grid = me._gridifier.getGrid();
                    //grid.removeChild(me._draggableItemClone);
                    document.body.removeChild(me._draggableItemClone);
                    grid.removeChild(me._draggableItemPointer);

                    me._draggableItem.style.visibility = "visible";
                    me._isDragging = false;
                    me._draggableItem = null;
                    me._draggableItemConnection.isDragged = false;

                    // @todo -> Replace with real hidder
                    Dom.css.removeClass(document.body, "disableSelect");

                    // @todo Check if this is required
                    SizesResolverManager.stopCachingTransaction();
                }
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

    // @todo -> Replace this, tmp solution
    this._draggableItemClone.style.setProperty("background", "rgb(235,235,235)", "important");
    Dom.css3.transition(this._draggableItemClone, "All 0ms ease");
    this._draggableItemClone.style.zIndex = 10; // end @todo

    //this._gridifier.getGrid().appendChild(this._draggableItemClone);

    var cloneWidth = SizesResolverManager.outerWidth(this._draggableItem);
    var cloneHeight = SizesResolverManager.outerHeight(this._draggableItem);
    this._draggableItemClone.style.width = cloneWidth + "px";
    this._draggableItemClone.style.height = cloneHeight + "px";
    this._draggableItemClone.style.margin = "0px";

    // if(this._settings.isNoIntersectionsStrategy()) {
    //     var draggableItemCloneTmp = this._draggableItemClone;
    //     var cloneExpandedHeight = this._draggableItemConnection.y2 - this._draggableItemConnection.y1 + 1;
    //     console.log("clone expanded height = " + cloneExpandedHeight);
    //     this._draggableItemClone = document.createElement("div");
    //     console.log("draggableItemCloneTmp = ", draggableItemCloneTmp);
    //     Dom.css.set(this._draggableItemClone, {
    //         position: 'absolute',
    //         width: cloneWidth + "px",
    //         height: cloneExpandedHeight + "px",
    //         background: 'blue'
    //     });
    //     this._draggableItemClone.appendChild(draggableItemCloneTmp);
    // }

    document.body.appendChild(this._draggableItemClone);

    var draggableItemOffsetLeft = SizesResolverManager.offsetLeft(this._draggableItem);
    var draggableItemOffsetTop = SizesResolverManager.offsetTop(this._draggableItem);

    this._draggableItemClone.style.left = draggableItemOffsetLeft + "px";
    this._draggableItemClone.style.top = draggableItemOffsetTop + "px";
}

Gridifier.VerticalGrid.Dragifier.prototype._createDraggableItemPointer = function() {
    var draggableItemOffsetLeft = SizesResolverManager.offsetLeft(this._draggableItem, true);
    var draggableItemOffsetTop = SizesResolverManager.offsetTop(this._draggableItem, true);

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

    var intersectedByDraggableItemCellCentersData = this._dragifierDiscretizator.getAllCellsWithIntersectedCenterData(
        this._draggableItemConnection
    );
    // If we have started drag from not covered by discretizator corner,
    // we can get into situation, when dragged item isn't intersecting any discretizator cell center,
    // so we should fix it. (In this situation item should cover 1 cell center).
    if(intersectedByDraggableItemCellCentersData.intersectedColsCount == 0 &&
        intersectedByDraggableItemCellCentersData.intersectedRowsCount == 0) {
        intersectedByDraggableItemCellCentersData.intersectedRowsCount = 1;
        intersectedByDraggableItemCellCentersData.intersectedColsCount = 1;
    }

    var intersectedByDraggableItemCloneCellCentersData = this._dragifierDiscretizator.getAllCellsWithIntersectedCenterData(
        draggableItemCloneNewGridPosition
    );
    var intersectedByDraggableItemCloneCellCenters = intersectedByDraggableItemCloneCellCentersData.cellsWithIntersectedCenter;
    var intersectedByDraggableItemCloneCellCentersCount = {
        intersectedRowsCount: intersectedByDraggableItemCloneCellCentersData.intersectedRowsCount,
        intersectedColsCount: intersectedByDraggableItemCloneCellCentersData.intersectedColsCount
    };

    var isAtLeastOneOfIntersectedCellCentersEmpty = false;
    for(var row = 0; row < intersectedByDraggableItemCloneCellCenters.length; row++) {
        for(var col = 0; col < intersectedByDraggableItemCloneCellCenters[row].length; col++) {
            if(!intersectedByDraggableItemCloneCellCenters[row][col].isIntersectedByDraggableItem) 
                isAtLeastOneOfIntersectedCellCentersEmpty = true;
        }
    }

    if(!isAtLeastOneOfIntersectedCellCentersEmpty)
        return;

    var originalCellsCount = intersectedByDraggableItemCellCentersData;
    var newCellsCount = intersectedByDraggableItemCloneCellCentersCount;
    if(newCellsCount.intersectedRowsCount < originalCellsCount.intersectedRowsCount ||
        newCellsCount.intersectedColsCount < originalCellsCount.intersectedColsCount) {
        return;
    }

    this._transformGridOnDrag(this._normalizeCellsWithMaybeIntersectionOverflows(
        intersectedByDraggableItemCloneCellCenters, newCellsCount, originalCellsCount
    ));
    this._dragifierDiscretizator.updateDiscretizationDemonstrator();
}

/*
    Sometimes on the start of the drag dragged item can cover fractional count of cells,
    for example 3 full cells and 1/4 of fourth cell.(Center is not intersected) After draggable item clone
    movement it can intersect 4 cell centers, but we should still cover only 3 full cells. Later we will align
    the item to the most left or most right(most bottom or top vertically) side of all cells and depending on
    insertion type(Reversed or Default append) and will ensure, that draggable item is not out of grid bounds.
*/
Gridifier.VerticalGrid.Dragifier.prototype._normalizeCellsWithMaybeIntersectionOverflows = function(intersectedByDraggableItemCloneCellCenters,
                                                                                                    newCellsCount,
                                                                                                    originalCellsCount) {
    if(newCellsCount.intersectedRowsCount > originalCellsCount.intersectedRowsCount) {
        var rowsDifference = newCellsCount.intersectedRowsCount - originalCellsCount.intersectedRowsCount;
        for(var i = 0; i < rowsDifference; i++) {
            intersectedByDraggableItemCloneCellCenters.pop();
        }
    }

    if(newCellsCount.intersectedColsCount > originalCellsCount.intersectedColsCount) {
        var colsDifference = newCellsCount.intersectedColsCount - originalCellsCount.intersectedColsCount;
        for(var row = 0; row < intersectedByDraggableItemCloneCellCenters.length; row++) {
            for(var i = 0; i < colsDifference; i++) {
                intersectedByDraggableItemCloneCellCenters[row].pop();
            }
        }
    }

    var mergedIntersectedByDraggableItemCloneCellCenters = [];
    for(var row = 0; row < intersectedByDraggableItemCloneCellCenters.length; row++) {
        for(var col = 0; col < intersectedByDraggableItemCloneCellCenters[row].length; col++) {
            mergedIntersectedByDraggableItemCloneCellCenters.push(
                intersectedByDraggableItemCloneCellCenters[row][col]
            );
        }
    }

    return mergedIntersectedByDraggableItemCloneCellCenters;
}

Gridifier.VerticalGrid.Dragifier.prototype._transformGridOnDrag = function(newIntersectedCells) {
    var draggableItemNewConnectionCoords = this._getDraggableItemNewConnectionCoords(newIntersectedCells);
    draggableItemNewConnectionCoords = this._normalizeDraggableItemNewConnectionCoords(draggableItemNewConnectionCoords);
    this._adjustItemPositionsAfterDrag(draggableItemNewConnectionCoords);

    this._dragifierDiscretizator.markCellsIntersectedByDraggableItem(
        this._draggableItem, draggableItemNewConnectionCoords
    );

    if(this._reappendGridItemsAfterDragTimeout != null) {
        clearTimeout(this._reappendGridItemsAfterDragTimeout);
        this._reappendGridItemsAfterDragTimeout = null;
    }
    
    var me = this;
    this._reappendGridItemsAfterDragTimeout = setTimeout(function() {
        me._reappendGridItems(draggableItemNewConnectionCoords);
    }, 100); // @todo -> Move 100 to const
    //this._reappendGridItems(draggableItemNewConnectionCoords);
}

Gridifier.VerticalGrid.Dragifier.prototype._getDraggableItemNewConnectionCoords = function(newIntersectedCells) {
    var draggableItemNewConnectionCoords = {
        x1: newIntersectedCells[0].x1,
        x2: newIntersectedCells[0].x2,
        y1: newIntersectedCells[0].y1,
        y2: newIntersectedCells[0].y2
    };

    for(var i = 1; i < newIntersectedCells.length; i++) {
        if(newIntersectedCells[i].x1 < draggableItemNewConnectionCoords.x1)
            draggableItemNewConnectionCoords.x1 = newIntersectedCells[i].x1;

        if(newIntersectedCells[i].x2 > draggableItemNewConnectionCoords.x2)
            draggableItemNewConnectionCoords.x2 = newIntersectedCells[i].x2;

        if(newIntersectedCells[i].y1 < draggableItemNewConnectionCoords.y1)
            draggableItemNewConnectionCoords.y1 = newIntersectedCells[i].y1;

        if(newIntersectedCells[i].y2 > draggableItemNewConnectionCoords.y2)
            draggableItemNewConnectionCoords.y2 = newIntersectedCells[i].y2;
    }

    return draggableItemNewConnectionCoords;
}

Gridifier.VerticalGrid.Dragifier.prototype._normalizeDraggableItemNewConnectionCoords = function(newConnectionCoords) {
    var newConnectionWidth = newConnectionCoords.x2 - newConnectionCoords.x1 + 1;
    var newConnectionHeight = newConnectionCoords.y2 - newConnectionCoords.y1 + 1;

    var draggableItemWidth = SizesResolverManager.outerWidth(this._draggableItem, true);
    var draggableItemHeight = SizesResolverManager.outerHeight(this._draggableItem, true);

    if(newConnectionWidth < draggableItemWidth) {
        if(this._settings.isDefaultAppend()) {
            newConnectionCoords.x1 = newConnectionCoords.x2 - draggableItemWidth + 1;
        }
        else if(this._settings.isReversedApppend()) {
            newConnectionCoords.x2 = newConnectionCoords.x1 + draggableItemWidth - 1;
        }
    }

    if(newConnectionHeight < draggableItemHeight) {
        newConnectionCoords.y2 = newConnectionCoords.y1 + draggableItemHeight - 1;
    }

    if(draggableItemWidth < newConnectionWidth) {
        if(this._settings.isDefaultAppend()) {
            newConnectionCoords.x1 = newConnectionCoords.x2 - draggableItemWidth + 1;
        }
        else if(this._settings.isReversedAppend()) {
            newConnectionCoords.x2 = newConnectionCoords.x1 + draggableItemWidth - 1;
        }
    }

    if(draggableItemHeight < newConnectionHeight) {
        newConnectionCoords.y2 = newConnectionCoords.y1 + draggableItemHeight - 1;
    }

    if(newConnectionCoords.x1 < 0) {
        newConnectionCoords.x1 = 0;
        newConnectionCoords.x2 = draggableItemWidth - 1;
    }

    if(newConnectionCoords.x2 > this._gridifier.getGridX2()) {
        newConnectionCoords.x2 = this._gridifier.getGridX2();
        newConnectionCoords.x1 = newConnectionCoords.x2 - draggableItemWidth + 1;
    }

    if(newConnectionCoords.y1 < 0) {
        newConnectionCoords.y1 = 0;
        newConnectionCoords.y2 = draggableItemHeight - 1;
    }

    if(newConnectionCoords.y2 > this._gridifier.getGridY2()) {
        newConnectionCoords.y2 = this._gridifier.getGridY2();
        newConnectionCoords.y1 = newConnectionCoords.y2 - draggableItemHeight + 1;
    }

    return newConnectionCoords;
}

Gridifier.VerticalGrid.Dragifier.prototype._adjustItemPositionsAfterDrag = function(draggableItemNewCoords) {
    this._draggableItemConnection.x1 = draggableItemNewCoords.x1;
    this._draggableItemConnection.x2 = draggableItemNewCoords.x2;
    this._draggableItemConnection.y1 = draggableItemNewCoords.y1;
    this._draggableItemConnection.y2 = draggableItemNewCoords.y2;
    //this._draggableItemConnection.isDragged = true;

    var left = draggableItemNewCoords.x1 / (this._gridifier.getGridX2() + 1) * 100;
    left = this._normalizer.normalizeFractionalValueForRender(left) + "%";

    Dom.css.set(this._draggableItem, {
        left: left,
        top: draggableItemNewCoords.y1 + "px"
    });

    Dom.css.set(this._draggableItemPointer, {
        left: draggableItemNewCoords.x1 + "px",
        top: draggableItemNewCoords.y1 + "px"
    });
}

Gridifier.VerticalGrid.Dragifier.prototype._reappendGridItems = function(draggableItemNewConnectionCoords) {
    var me = this;
    var firstItemToReappend = this._findFirstItemToReappend();
    
    if(this._settings.isDefaultAppend()) {
        this._connectors.setNextFlushCallback(function() { 
            me._appender.createInitialConnector(); 
        });
    }
    else if(this._settings.isReversedAppend()) {
        this._connectors.setNextFlushCallback(function() { 
            me._reversedAppender.createInitialConnector(); 
        });
    }

    this._gridifier.transformSizes(firstItemToReappend);
}

// @todo -> Move logic to divide Disabled SD/Custom SD in separate class,
//          and share it with SizesTransformer class???
Gridifier.VerticalGrid.Dragifier.prototype._findFirstItemToReappend = function() {
    var connections = this._connections.get();
    connections = this._connectionsSorter.sortConnectionsPerReappend(connections);

    var firstConnection = null;
    for(var i = 0; i < connections.length; i++) {
        if(this._draggableItemConnection.itemGUID != connections[i].itemGUID) {
            firstConnection = connections[i];
            break;
        }
    }
    
    return firstConnection.item;
}