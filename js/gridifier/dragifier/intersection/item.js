IntDraggableItem = function() {
    this._dragIds = [];
    this._item = null;
    this._clone = null;
}

proto(IntDraggableItem, {
    get: function() { return this._item; },
    addDragId: function(id) { this._dragIds.push(id); },
    hasDragId: function(id) { return dragifierCore.hasDragId(id, this._dragIds); },
    rmDragId: function(id) { dragifierCore.rmDragId(id, this._dragIds); },
    getDragIdsCount: function() { return this._dragIds.length; },

    bind: function(item, cursorX, cursorY) {
        this._item = item;
        dragifierCore.initItem(item);

        dragifierCore.calcGridOffsets();
        dragifierCore.findItemCenterCursorOffsets(item, cursorX, cursorY);

        this._clone = dragifierCore.createClone(item);
        dragifierCore.hideItem(item);
    },

    unbind: function() {
        document.body.removeChild(this._clone);
        dragifierCore.showItem(this._item);
        this._item = null;
    },

    dragMove: function(cursorX, cursorY) {
        var newDocPos = dragifierCore.calcCloneNewDocPosition(this._item, cursorX, cursorY);
        var newGridPos = dragifierCore.calcCloneNewGridPosition(this._item, newDocPos);
        dragifier.render(this._clone, newDocPos.x, newDocPos.y);

        var newIntCns = this._getNewIntCns(newGridPos);
        if(newIntCns.length == 0)
            return;

        if(settings.eq("sortDispersion", false)) {
            this._swapGUIDS(newIntCns);
            dragifierCore.repositionItems();
        }
        else {
            if(this._swapPositions(newIntCns))
                dragifierCore.repositionItems();
        }
    },

    _getNewIntCns: function(newGridPos) {
        var itemGUID = guid.get(this._item);
        var intCns = cnsIntersector.getAllWithIntersectedCenter(newGridPos);

        var newIntCns = [];
        for(var i = 0; i < intCns.length; i++) {
            if(intCns[i].itemGUID != itemGUID)
                newIntCns.push(intCns[i]);
        }

        return newIntCns;
    },

    _swapGUIDS: function(cns) {
        var itemGUID = guid.get(this._item);

        var cnWithSmallestGUID = cns[0];
        for(var i = 0; i < cns.length; i++) {
            if(cns[i].itemGUID < cnWithSmallestGUID.itemGUID)
                cnWithSmallestGUID = cns[i];
        }

        guid.set(this._item, cnWithSmallestGUID.itemGUID);
        guid.set(this._clone, cnWithSmallestGUID.itemGUID);
        guid.set(cnWithSmallestGUID.item, itemGUID);
    },

    // Connection could be still deleted on fast dragging, so we should perform drag in this mode
    // only if the connection was reappended through reappend queue. On Grid Discretization algorithm
    // connection is marked as restrictCollect = true, so no such check is required.
    _swapPositions: function(cns) {
        var itemCn = cnsCore.find(this._item, true);
        if(itemCn == null)
            return false;

        cns = cnsSorter.sortForReappend(cns);
        var cnWithSmallestPos = cns[0];

        var cnWithSmallestPosGUID = guid.get(cnWithSmallestPos.item);
        var itemGUID = guid.get(this._item);

        guid.set(this._item, cnWithSmallestPosGUID);
        guid.set(cnWithSmallestPos.item, itemGUID);

        this._swapCnData(itemCn, cnWithSmallestPos, cnWithSmallestPosGUID);

        return true;
    },

    _swapCnData: function(itemCn, cnWithSmallestPos, cnWithSmallestPosGUID) {
        var tmpItem = itemCn.item;
        itemCn.item = cnWithSmallestPos.item;
        cnWithSmallestPos.item = tmpItem;

        var tmpGUID = itemCn.itemGUID;
        itemCn.itemGUID = cnWithSmallestPosGUID;
        cnWithSmallestPos.itemGUID = tmpGUID;
    }
});