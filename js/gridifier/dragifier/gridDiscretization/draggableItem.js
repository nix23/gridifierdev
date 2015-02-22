Gridifier.Dragifier.GridDiscretizationDraggableItem = function(gridifier,
                                                               appender,
                                                               reversedAppender,
                                                               connections,
                                                               connectors,
                                                               guid,
                                                               settings,
                                                               sizesResolverManager) {
    var me = this;

    this._gridifier = null;
    this._appender = null;
    this._reversedAppender = null;
    this._connections = null;
    this._connectors = null;
    this._guid = null;
    this._settings = null;
    this._sizesResolverManager = null;

    this._dragifierCore = null;
    this._discretizer = null;
    this._dragifierCells = null;
    this._dragifierRenderer = null;

    this._dragIdentifiers = [];
    this._draggableItem = null;
    this._draggableItemConnection = null;
    this._draggableItemClone = null;
    this._draggableItemPointer = null;

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
        me._sizesResolverManager = sizesResolverManager;

        me._dragIdentifiers = [];
        me._dragifierRenderer = new Gridifier.Dragifier.Renderer(
            me._settings
        );
        me._dragifierCore = new Gridifier.Dragifier.Core(
            me._gridifier, me._appender, me._reversedAppender, me._connectors, me._settings, me._dragifierRenderer, me._sizesResolverManager
        );
        me._discretizer = new Gridifier.Discretizer(
            me._gridifier, me._connections, me._settings, me._sizesResolverManager
        );
        me._dragifierCells = new Gridifier.Dragifier.Cells(
            me._discretizer
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

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype.bindDraggableItem = function(item,
                                                                                           cursorX,
                                                                                           cursorY) {
    this._initDraggableItem(item);
    this._initDraggableItemConnection();

    this._dragifierCore.determineInitialCursorOffsetsFromDraggableItemCenter(
        this._draggableItem, cursorX, cursorY
    );
    this._dragifierCore.determineGridOffsets();

    this._draggableItemClone = this._dragifierCore.createDraggableItemClone(this._draggableItem);
    this._draggableItemPointer = this._dragifierCore.createDraggableItemPointer(this._draggableItem);

    this._discretizer.discretizeGrid();
    this._discretizer.markCellsIntersectedByItem(
        this._draggableItem, this._draggableItemConnection
    );
    this._discretizer.createDemonstrator();

    this._hideDraggableItem();
}

// @todo -> Move to composed class
Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype.getDraggableItem = function() {
    return this._draggableItem;
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype.addDragIdentifier = function(identifier) {
    this._dragIdentifiers.push(identifier);
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype.hasDragIdentifier = function(identifier) {
    for(var i = 0; i < this._dragIdentifiers.length; i++) {
        if(this._dragIdentifiers[i] == identifier)
            return true;
    }

    return false;
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype.removeDragIdentifier = function(identifier) {
    for(var i = 0; i < this._dragIdentifiers.length; i++) {
        if(this._dragIdentifiers[i] == identifier) {
            this._dragIdentifiers.splice(i, 1);
            break;
        }
    }
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype.getDragIdentifiersCount = function() {
    return this._dragIdentifiers.length;
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype._initDraggableItem = function(item) {
    this._draggableItem = item;
    // @todo -> Fix this(visibility uses transition timeout, Replace global from all???)
    Dom.css3.transitionProperty(this._draggableItem, "Visibility 0ms ease");
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype._initDraggableItemConnection = function() {
    this._draggableItemConnection = this._connections.findConnectionByItem(this._draggableItem);
    this._draggableItemConnection[Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT] = true;
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype._hideDraggableItem = function() {
    this._draggableItem.style.visibility = "hidden";
    // @todo -> Replace with real hidder
    Dom.css.addClass(document.body, "disableSelect");
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype.processDragMove = function(cursorX, cursorY) {
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
    var intersectedByDraggableItemCellCentersData = this._dragifierCells.getIntersectedByDraggableItemCellCentersData(
        this._draggableItemConnection
    );
    var intersectedByDraggableItemCloneCellCentersData = this._discretizer.getAllCellsWithIntersectedCenterData(
        draggableItemCloneNewGridPosition
    );

    if(!this._dragifierCells.isAtLeastOneOfIntersectedCellCentersEmpty(
            intersectedByDraggableItemCloneCellCentersData))
        return;

    if(!this._dragifierCells.isIntersectingEnoughRowsAndCols(
            intersectedByDraggableItemCellCentersData, intersectedByDraggableItemCloneCellCentersData)) 
        return;

    this._transformGrid(this._dragifierCells.normalizeCellsWithMaybeIntersectionOverflows(
        intersectedByDraggableItemCloneCellCentersData.cellsWithIntersectedCenter,
        intersectedByDraggableItemCellCentersData,
        intersectedByDraggableItemCloneCellCentersData
    ));

    this._discretizer.updateDemonstrator();
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype._transformGrid = function(newIntersectedCells) {
    var draggableItemNewConnectionCoords = this._discretizer.intersectedCellsToCoords(newIntersectedCells);
    draggableItemNewConnectionCoords = this._discretizer.normalizeItemNewConnectionHorizontalCoords(
        this._draggableItem, draggableItemNewConnectionCoords
    );
    draggableItemNewConnectionCoords = this._discretizer.normalizeItemNewConnectionVerticalCoords(
        this._draggableItem, draggableItemNewConnectionCoords
    );

    this._adjustDraggableItemPositions(draggableItemNewConnectionCoords);
    this._discretizer.markCellsIntersectedByItem(
        this._draggableItem, draggableItemNewConnectionCoords
    );

    var me = this;
    setTimeout(function() {
        me._dragifierCore.reappendGridItems();
    }, 100); // @todo -> Move 100 to const
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype._adjustDraggableItemPositions = function(draggableItemNewCoords) {
    this._draggableItemConnection.x1 = draggableItemNewCoords.x1;
    this._draggableItemConnection.x2 = draggableItemNewCoords.x2;
    this._draggableItemConnection.y1 = draggableItemNewCoords.y1;
    this._draggableItemConnection.y2 = draggableItemNewCoords.y2;

    var rendererCoordsChanger = this._settings.getCoordsChanger();
    rendererCoordsChanger(this._draggableItem, draggableItemNewCoords.x1, draggableItemNewCoords.y1);

    this._dragifierRenderer.render(
        this._draggableItemPointer,
        draggableItemNewCoords.x1,
        draggableItemNewCoords.y1
    );
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype.unbindDraggableItem = function() {
    document.body.removeChild(this._draggableItemClone);
    this._gridifier.getGrid().removeChild(this._draggableItemPointer);
    this._draggableItemConnection[Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT] = false;

    this._draggableItem.style.visibility = "visible";
    this._draggableItem = null;
    this._discretizer.deleteDemonstrator();

    // @todo -> Replace with real hidder
    Dom.css.removeClass(document.body, "disableSelect");
}