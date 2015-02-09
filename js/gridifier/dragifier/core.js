Gridifier.Dragifier.Core = function(gridifier,
                                    appender,
                                    reversedAppender,
                                    connectors,
                                    settings,
                                    dragifierRenderer) {
    var me = this;

    this._gridifier = null;
    this._appender = null;
    this._reversedAppender = null;
    this._connectors = null;
    this._settings = null;
    this._dragifierRenderer = null;

    this._cursorOffsetXFromDraggableItemCenter = null;
    this._cursorOffsetYFromDraggableItemCenter = null;

    this._gridOffsetLeft = null;
    this._gridOffsetTop = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._connectors = connectors;
        me._settings = settings;
        me._dragifierRenderer = dragifierRenderer;

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

Gridifier.Dragifier.Core.prototype.determineInitialCursorOffsetsFromDraggableItemCenter = function(draggableItem,
                                                                                                   cursorX, 
                                                                                                   cursorY) {
    var draggableItemOffsetLeft = SizesResolverManager.offsetLeft(draggableItem);
    var draggableItemOffsetTop = SizesResolverManager.offsetTop(draggableItem);

    var draggableItemWidth = SizesResolverManager.outerWidth(draggableItem, true);
    var draggableItemHeight = SizesResolverManager.outerHeight(draggableItem, true);

    var draggableItemCenterX = draggableItemOffsetLeft + (draggableItemWidth / 2);
    var draggableItemCenterY = draggableItemOffsetTop + (draggableItemHeight / 2);

    this._cursorOffsetXFromDraggableItemCenter = draggableItemCenterX - cursorX;
    this._cursorOffsetYFromDraggableItemCenter = draggableItemCenterY - cursorY;
}

Gridifier.Dragifier.Core.prototype.determineGridOffsets = function() {
    this._gridOffsetLeft = SizesResolverManager.offsetLeft(this._gridifier.getGrid());
    this._gridOffsetTop = SizesResolverManager.offsetTop(this._gridifier.getGrid());
}

Gridifier.Dragifier.Core.prototype.createDraggableItemClone = function(draggableItem) {
    var draggableItemClone = draggableItem.cloneNode(true);

    // @todo -> Replace this, tmp solution
    draggableItemClone.style.setProperty("background", "rgb(235,235,235)", "important");
    Dom.css3.transition(draggableItemClone, "All 0ms ease");
    draggableItemClone.style.zIndex = 10; // @endtodo

    var cloneWidth = SizesResolverManager.outerWidth(draggableItem);
    var cloneHeight = SizesResolverManager.outerHeight(draggableItem);
    draggableItemClone.style.width = cloneWidth + "px";
    draggableItemClone.style.height = cloneHeight + "px";
    draggableItemClone.style.margin = "0px";

    document.body.appendChild(draggableItemClone);

    var draggableItemOffsetLeft = SizesResolverManager.offsetLeft(draggableItem);
    var draggableItemOffsetTop = SizesResolverManager.offsetTop(draggableItem);

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
    var draggableItemOffsetLeft = SizesResolverManager.offsetLeft(draggableItem, true);
    var draggableItemOffsetTop = SizesResolverManager.offsetTop(draggableItem, true);

    // @todo -> Add mixed options
    var draggableItemPointer = document.createElement("div");
    Dom.css.set(draggableItemPointer, {
        width: SizesResolverManager.outerWidth(draggableItem, true) + "px",
        height: SizesResolverManager.outerHeight(draggableItem, true) + "px",
        position: "absolute",
        left: (draggableItemOffsetLeft - this._gridOffsetLeft) + "px",
        top: (draggableItemOffsetTop - this._gridOffsetTop) + "px",
        background: "red" // @todo -> Replace with real color, add styling
    });
    this._gridifier.getGrid().appendChild(draggableItemPointer);

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
    var itemSideWidth = SizesResolverManager.outerWidth(draggableItem, true) / 2;
    var itemSideHeight = SizesResolverManager.outerHeight(draggableItem, true) / 2;

    return {
        x: cursorX - itemSideWidth - (this._cursorOffsetXFromDraggableItemCenter * -1),
        y: cursorY - itemSideHeight - (this._cursorOffsetYFromDraggableItemCenter * -1)
    };
}

Gridifier.Dragifier.Core.prototype.calculateDraggableItemCloneNewGridPosition = function(draggableItem,
                                                                                         newDocumentPosition) {
    var draggableItemCloneNewGridPosition = {
        x1: newDocumentPosition.x,
        x2: newDocumentPosition.x + SizesResolverManager.outerWidth(draggableItem, true) - 1,
        y1: newDocumentPosition.y,
        y2: newDocumentPosition.y + SizesResolverManager.outerHeight(draggableItem, true) - 1
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

    this._gridifier.retransformAllSizes();
}