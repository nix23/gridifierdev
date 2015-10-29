DiscrDraggableItem = function() {
    this._dragIds = [];
    this._item = null;
    this._itemCn = null;
    this._clone = null;
    this._pointer = null;
    this._discretizer = new Discretizer();
}

proto(DiscrDraggableItem, {
    get: function() { return this._item; },
    addDragId: function(id) { this._dragIds.push(id); },
    hasDragId: function(id) { return dragifierCore.hasDragId(id, this._dragIds); },
    rmDragId: function(id) { dragifierCore.rmDragId(id, this._dragIds); },
    getDragIdsCount: function() { return this._dragIds.length; },

    bind: function(item, cursorX, cursorY) {
        this._item = item;
        dragifierCore.initItem(item);
        this._initCn();

        dragifierCore.calcGridOffsets();
        dragifierCore.findItemCenterCursorOffsets(item, cursorX, cursorY);

        this._clone = dragifierCore.createClone(item);
        this._pointer = dragifierCore.createPointer(item);

        this._discretizer.discretize();
        this._discretizer.markIntCellsBy(this._itemCn);
        /* @system-log-start */
        discretizerDebug.create(this._discretizer.cells());
        /* @system-log-end */

        dragifierCore.hideItem(item);
    },

    _initCn: function() {
        this._itemCn = cnsCore.find(this._item);
        this._itemCn.restrictCollect = true;
    },

    unbind: function() {
        document.body.removeChild(this._clone);
        grid.get().removeChild(this._pointer);

        dragifierCore.showItem(this._item);
        this._item = null;
        this._itemCn.restrictCollect = false;
        /* @system-log-start */
        discretizerDebug.rm();
        /* @system-log-end */
    },

    dragMove: function(cursorX, cursorY) {
        var newDocPos = dragifierCore.calcCloneNewDocPosition(this._item, cursorX, cursorY);
        var newGridPos = dragifierCore.calcCloneNewGridPosition(this._item, newDocPos);
        dragifier.render(this._clone, newDocPos.x, newDocPos.y);

        var itemIntCellsData = dragifierCells.getIntCellsData(
            this._discretizer.getAllCellsWithIntCenter(this._itemCn)
        );
        var cloneIntCellsData = this._discretizer.getAllCellsWithIntCenter(newGridPos);

        if(!dragifierCells.isAnyIntCellEmpty(cloneIntCellsData)) return;
        if(!dragifierCells.isIntEnoughRowsAndCols(itemIntCellsData, cloneIntCellsData)) return;
        
        this._repositionGrid(dragifierCells.normalizeOverflowedCells(
            cloneIntCellsData.intCells, itemIntCellsData, cloneIntCellsData
        ));
        /* @system-log-start */
        discretizerDebug.update(this._discretizer.cells());
        /* @system-log-end */
    },

    _repositionGrid: function(intCells) {
        var cnCoords = this._discretizer.intCellsToCoords(intCells); 
        cnCoords = discretizerCore.normalizeCnXCoords(this._item, cnCoords); 
        cnCoords = discretizerCore.normalizeCnYCoords(this._item, cnCoords); 

        this._adjustPosition(cnCoords);
        this._discretizer.markIntCellsBy(cnCoords);
        setTimeout(function() { dragifierCore.repositionItems(); }, C.DRAGIFIER_DISCR_REPOS_DELAY);
    },

    _adjustPosition: function(newCoords) {
        var coords = ["x1", "x2", "y1", "y2"];
        for(var i = 0; i < coords.length; i++)
            this._itemCn[coords[i]] = newCoords[coords[i]];

        var getS = bind("get", settings);
        settings.getApi("coordsChanger")(
            this._item, newCoords.x1 + "px", newCoords.y1 + "px",
            getS("coordsChangeTime"), getS("coordsChangeTiming"),
            Dom, Prefixer, getS
        );

        dragifier.render(this._pointer, newCoords.x1, newCoords.y1);
    }
});