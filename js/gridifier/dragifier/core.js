Gridifier.Dragifier.Core = function(gridifier,
                                    appender,
                                    reversedAppender,
                                    collector,
                                    connectors,
                                    connections,
                                    settings,
                                    guid,
                                    dragifierRenderer,
                                    sizesResolverManager,
                                    eventEmitter) {
    var me = this;

    this._gridifier = null;
    this._appender = null;
    this._reversedAppender = null;
    this._collector = null;
    this._connectors = null;
    this._connections = null;
    this._settings = null;
    this._guid = null;
    this._dragifierRenderer = null;
    this._sizesResolverManager = null;
    this._eventEmitter = null;
    this._connectionsSorter = null;

    this._cursorOffsetXFromDraggableItemCenter = null;
    this._cursorOffsetYFromDraggableItemCenter = null;

    this._gridOffsetLeft = null;
    this._gridOffsetTop = null;

    this._executeGridRetransformTimeout = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._collector = collector;
        me._connectors = connectors;
        me._connections = connections;
        me._settings = settings;
        me._guid = guid;
        me._dragifierRenderer = dragifierRenderer;
        me._sizesResolverManager = sizesResolverManager;
        me._eventEmitter = eventEmitter;

        if(me._settings.isVerticalGrid()) {
            me._connectionsSorter = new Gridifier.VerticalGrid.ConnectionsSorter(
                me._connections, me._settings, me._guid
            );
        }
        else if(me._settings.isHorizontalGrid()) {
            me._connectionsSorter = new Gridifier.HorizontalGrid.ConnectionsSorter(
                me._connections, me._settings, me._guid
            );
        }

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

Gridifier.Dragifier.Core.prototype.determineGridOffsets = function() {
    this._gridOffsetLeft = this._sizesResolverManager.offsetLeft(this._gridifier.getGrid());
    this._gridOffsetTop = this._sizesResolverManager.offsetTop(this._gridifier.getGrid());
}

Gridifier.Dragifier.Core.prototype._getDraggableItemOffsetLeft = function(draggableItem, substractMargins) {
    var substractMargins = substractMargins || false;
    var draggableItemConnection = this._connections.findConnectionByItem(draggableItem);

    if(this._settings.isNoIntersectionsStrategy() && this._settings.isHorizontalGrid())
        var horizontalOffset = draggableItemConnection.horizontalOffset;
    else
        var horizontalOffset = 0;

    if(substractMargins) {
        var elemWidth = this._sizesResolverManager.outerWidth(draggableItem);
        var elemWidthWithMargins = this._sizesResolverManager.outerWidth(draggableItem, true);
        var marginWidth = elemWidthWithMargins - elemWidth;
        var halfOfMarginWidth = marginWidth / 2;
        
        return this._gridOffsetLeft + draggableItemConnection.x1 - halfOfMarginWidth + horizontalOffset;
    }
    else {
        return this._gridOffsetLeft + draggableItemConnection.x1 + horizontalOffset;
    }
}

Gridifier.Dragifier.Core.prototype._getDraggableItemOffsetTop = function(draggableItem, substractMargins) {
    var substractMargins = substractMargins || false;
    var draggableItemConnection = this._connections.findConnectionByItem(draggableItem);

    if(this._settings.isNoIntersectionsStrategy() && this._settings.isVerticalGrid())
        var verticalOffset = draggableItemConnection.verticalOffset;
    else
        var verticalOffset = 0;

    if(substractMargins) {
        var elemHeight = this._sizesResolverManager.outerHeight(draggableItem);
        var elemHeightWithMargins = this._sizesResolverManager.outerHeight(draggableItem, true);
        var marginHeight = elemHeightWithMargins - elemHeight;
        var halfOfMarginHeight = marginHeight / 2;

        return this._gridOffsetTop + draggableItemConnection.y1 - halfOfMarginHeight + verticalOffset;
    }
    else {
        return this._gridOffsetTop + draggableItemConnection.y1 + verticalOffset;
    }
}

Gridifier.Dragifier.Core.prototype.determineInitialCursorOffsetsFromDraggableItemCenter = function(draggableItem,
                                                                                                   cursorX, 
                                                                                                   cursorY) {
    var draggableItemOffsetLeft = this._getDraggableItemOffsetLeft(draggableItem);
    var draggableItemOffsetTop = this._getDraggableItemOffsetTop(draggableItem);

    var draggableItemWidth = this._sizesResolverManager.outerWidth(draggableItem, true);
    var draggableItemHeight = this._sizesResolverManager.outerHeight(draggableItem, true);

    var draggableItemCenterX = draggableItemOffsetLeft + (draggableItemWidth / 2);
    var draggableItemCenterY = draggableItemOffsetTop + (draggableItemHeight / 2);

    this._cursorOffsetXFromDraggableItemCenter = draggableItemCenterX - cursorX;
    this._cursorOffsetYFromDraggableItemCenter = draggableItemCenterY - cursorY;
}

Gridifier.Dragifier.Core.prototype._getMaxConnectionItemZIndex = function() {
    var maxZIndex = null;
    var connections = this._connections.get();

    for(var i = 0; i < connections.length; i++) {
        if(maxZIndex == null) {
            maxZIndex = Dom.toInt(connections[i].item.style.zIndex);
        }
        else {
            if(Dom.toInt(connections[i].item.style.zIndex) > maxZIndex)
                maxZIndex = Dom.toInt(connections[i].item.style.zIndex);
        }
    }

    return Dom.toInt(maxZIndex);
}

Gridifier.Dragifier.Core.prototype.createDraggableItemClone = function(draggableItem) {
    var draggableItemClone = draggableItem.cloneNode(true);
    this._collector.markItemAsRestrictedToCollect(draggableItemClone);

    var draggableItemDecorator = this._settings.getDraggableItemDecorator();
    draggableItemDecorator(draggableItemClone, draggableItem, this._sizesResolverManager);

    if(Dom.isBrowserSupportingTransitions()) {
        Dom.css3.transform(draggableItemClone, "");
        Dom.css3.transition(draggableItemClone, "none");
    }
    draggableItemClone.style.zIndex = this._getMaxConnectionItemZIndex() + 1;

    var cloneWidth = this._sizesResolverManager.outerWidth(draggableItem);
    var cloneHeight = this._sizesResolverManager.outerHeight(draggableItem);
    draggableItemClone.style.width = cloneWidth + "px";
    draggableItemClone.style.height = cloneHeight + "px";
    //draggableItemClone.style.margin = "0px";

    var draggableItemComputedCSS = SizesResolver.getComputedCSS(draggableItem);
    draggableItemClone.style.marginLeft = draggableItemComputedCSS.marginLeft;
    draggableItemClone.style.marginTop = draggableItemComputedCSS.marginTop;
    draggableItemClone.style.marginRight = draggableItemComputedCSS.marginRight;
    draggableItemClone.style.marginBottom = draggableItemComputedCSS.marginBottom;

    document.body.appendChild(draggableItemClone);

    var draggableItemOffsetLeft = this._getDraggableItemOffsetLeft(draggableItem);
    var draggableItemOffsetTop = this._getDraggableItemOffsetTop(draggableItem);

    draggableItemClone.style.left = draggableItemOffsetLeft +"px";
    draggableItemClone.style.top = draggableItemOffsetTop + "px";

    this._dragifierRenderer.render(
        draggableItemClone,
        draggableItemOffsetLeft,
        draggableItemOffsetTop
    );

    return draggableItemClone;
}

Gridifier.Dragifier.Core.prototype.createDraggableItemPointer = function(draggableItem) {
    var draggableItemOffsetLeft = this._getDraggableItemOffsetLeft(draggableItem, true);
    var draggableItemOffsetTop = this._getDraggableItemOffsetTop(draggableItem, true);

    var draggableItemPointer = document.createElement("div");
    Dom.css.set(draggableItemPointer, {
        width: this._sizesResolverManager.outerWidth(draggableItem, true) + "px",
        height: this._sizesResolverManager.outerHeight(draggableItem, true) + "px",
        position: "absolute",
        left: (draggableItemOffsetLeft - this._gridOffsetLeft) + "px",
        top: (draggableItemOffsetTop - this._gridOffsetTop) + "px"
    });

    this._gridifier.getGrid().appendChild(draggableItemPointer);

    var draggableItemPointerDecorator = this._settings.getDraggableItemPointerDecorator();
    draggableItemPointerDecorator(draggableItemPointer);

    this._dragifierRenderer.render(
        draggableItemPointer,
        (draggableItemOffsetLeft - this._gridOffsetLeft),
        (draggableItemOffsetTop - this._gridOffsetTop)
    );

    return draggableItemPointer;
}

Gridifier.Dragifier.Core.prototype.calculateDraggableItemCloneNewDocumentPosition = function(draggableItem,
                                                                                             cursorX,
                                                                                             cursorY) {
    var itemSideWidth = this._sizesResolverManager.outerWidth(draggableItem, true) / 2;
    var itemSideHeight = this._sizesResolverManager.outerHeight(draggableItem, true) / 2;

    return {
        x: cursorX - itemSideWidth - (this._cursorOffsetXFromDraggableItemCenter * -1),
        y: cursorY - itemSideHeight - (this._cursorOffsetYFromDraggableItemCenter * -1)
    };
}

Gridifier.Dragifier.Core.prototype.calculateDraggableItemCloneNewGridPosition = function(draggableItem,
                                                                                         newDocumentPosition) {
    var draggableItemCloneNewGridPosition = {
        x1: newDocumentPosition.x,
        x2: newDocumentPosition.x + this._sizesResolverManager.outerWidth(draggableItem, true) - 1,
        y1: newDocumentPosition.y,
        y2: newDocumentPosition.y + this._sizesResolverManager.outerHeight(draggableItem, true) - 1
    };

    draggableItemCloneNewGridPosition.x1 -= this._gridOffsetLeft;
    draggableItemCloneNewGridPosition.x2 -= this._gridOffsetLeft;
    draggableItemCloneNewGridPosition.y1 -= this._gridOffsetTop;
    draggableItemCloneNewGridPosition.y2 -= this._gridOffsetTop;

    return draggableItemCloneNewGridPosition;
}

Gridifier.Dragifier.Core.prototype.reappendGridItems = function() {
    var me = this;
    
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

    this._eventEmitter.onItemsReappendExecutionEndPerDragifier(function() {
        var sortedConnections = me._connectionsSorter.sortConnectionsPerReappend(me._connections.get());
        var sortedItems = [];

        for(var i = 0; i < sortedConnections.length; i++) {
            sortedItems.push(sortedConnections[i].item);
        }

        me._eventEmitter.emitDragEndEvent(sortedItems);
    });

    this._executeGridRetransform();
}

Gridifier.Dragifier.Core.EXECUTE_GRID_RETRANSFORM_MS_TIMEOUT = 20;

Gridifier.Dragifier.Core.prototype._executeGridRetransform = function() {
    var me = this;

    if(!Dom.browsers.isAndroidFirefox() && !Dom.browsers.isAndroidUCBrowser()) {
        this._gridifier.retransformAllSizes();
        return;
    }

    if(typeof this._executeGridRetransformTimeout != null) {
        clearTimeout(this._executeGridRetransformTimeout);
        this._executeGridRetransformTimeout = null;
    }

    this._executeGridRetransformTimeout = setTimeout(function() {
        me._gridifier.retransformAllSizes();
    }, Gridifier.Dragifier.Core.EXECUTE_GRID_RETRANSFORM_MS_TIMEOUT);
}