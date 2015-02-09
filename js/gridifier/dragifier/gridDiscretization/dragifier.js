Gridifier.Dragifier.GridDiscretizationDragifier = function(gridifier,
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
    this._guid = null;
    this._settings = null;

    this._dragifierCore = null;
    this._discretizer = null;
    this._dragifierCells = null;
    this._dragifierRenderer = null;

    this._isDragging = false;
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

        me._dragifierRenderer = new Gridifier.Dragifier.Renderer(
            me._settings
        );
        me._dragifierCore = new Gridifier.Dragifier.Core(
            me._gridifier, me._appender, me._reversedAppender, me._connectors, me._settings, me._dragifierRenderer
        );
        me._discretizer = new Gridifier.Discretizer(
            me._gridifier, me._connections, me._settings
        );
        me._dragifierCells = new Gridifier.Dragifier.GridDiscretizationDragifier.Cells(
            me._discretizer
        );

        me._bindEvents();
    };

    this._bindEvents = function() {
        // @todo -> Replace with gridifier events
        $("body").on("mousedown", ".gridItem", function(event) {
            me._initDragInteraction();
            me._initDraggableItems($(this).get(0));
            me._initDraggableItemConnection();

            me._dragifierCore.determineInitialCursorOffsetsFromDraggableItemCenter(
                me._draggableItem, event.pageX, event.pageY
            );
            me._dragifierCore.determineGridOffsets();

            me._draggableItemClone = me._dragifierCore.createDraggableItemClone(me._draggableItem);
            me._draggableItemPointer = me._dragifierCore.createDraggableItemPointer(me._draggableItem);

            me._discretizer.discretizeGrid();
            me._discretizer.markCellsIntersectedByItem(
                me._draggableItem, me._draggableItemConnection
            );
            me._discretizer.createDemonstrator();

            me._hideDraggableItems();
        });

        $(document).on("mouseup.gridifier.dragifier", function() {
            setTimeout(function() {
                if(!me._isDragging) return;

                me._discretizer.deleteDemonstrator();
                me._stopDragInteraction.call(me);
            }, 0);
        });

        $(document).on("mousemove.gridifier.dragifier", function(event) {
            setTimeout(function() {
                if(!me._isDragging) return;

                me._processDragMove.call(me, me._dragifierCore.calculateDraggableItemCloneNewDocumentPosition(
                    me._draggableItem, event.pageX, event.pageY
                ));
                me._discretizer.updateDemonstrator();
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

Gridifier.Dragifier.GridDiscretizationDragifier.prototype._initDragInteraction = function() {
    SizesResolverManager.startCachingTransaction();
    this._isDragging = true;
}

Gridifier.Dragifier.GridDiscretizationDragifier.prototype._initDraggableItems = function(item) {
    this._draggableItem = item;
    // @todo -> Fix this(visibility uses transition timeout, Replace global from all???)
    Dom.css3.transition(this._draggableItem, "Visibility 0ms ease");
}

Gridifier.Dragifier.GridDiscretizationDragifier.prototype._hideDraggableItems = function() {
    this._draggableItem.style.visibility = "hidden";
    // @todo -> Replace with real hidder
    Dom.css.addClass(document.body, "disableSelect");
}

Gridifier.Dragifier.GridDiscretizationDragifier.prototype._initDraggableItemConnection = function() {
    this._draggableItemConnection = this._gridifier.findConnectionByItem(this._draggableItem);
    this._draggableItemConnection[Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT] = true;
}

Gridifier.Dragifier.GridDiscretizationDragifier.prototype._stopDragInteraction = function() {
    document.body.removeChild(this._draggableItemClone);
    this._gridifier.getGrid().removeChild(this._draggableItemPointer);
    this._draggableItemConnection[Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT] = false;

    this._draggableItem.style.visibility = "visible";
    this._isDragging = false;
    this._draggableItem = null;

    // @todo -> Replace with real hidder
    Dom.css.removeClass(document.body, "disableSelect");
    SizesResolverManager.stopCachingTransaction();
}

Gridifier.Dragifier.GridDiscretizationDragifier.prototype._processDragMove = function(draggableItemCloneNewDocumentPosition) {
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
}

Gridifier.Dragifier.GridDiscretizationDragifier.prototype._transformGrid = function(newIntersectedCells) {
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

Gridifier.Dragifier.GridDiscretizationDragifier.prototype._adjustDraggableItemPositions = function(draggableItemNewCoords) {
    this._draggableItemConnection.x1 = draggableItemNewCoords.x1;
    this._draggableItemConnection.x2 = draggableItemNewCoords.x2;
    this._draggableItemConnection.y1 = draggableItemNewCoords.y1;
    this._draggableItemConnection.y2 = draggableItemNewCoords.y2;

    var rendererCoordsChanger = this._settings.getRendererCoordsChanger();
    rendererCoordsChanger(this._draggableItem, draggableItemNewCoords.x1, draggableItemNewCoords.y1);

    this._dragifierRenderer.render(
        this._draggableItemPointer,
        draggableItemNewCoords.x1,
        draggableItemNewCoords.y1
    );
}