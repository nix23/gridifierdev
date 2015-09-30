DragifierCore = function() {
    // Defines cursor offset from draggable item center
    this._itemCenterCursorOffset = {x: null, y: null};
    this._gridOffset = {left: null, top: null};
    this._repositionTimeout = null;
}

proto(DragifierCore, {
    calcGridOffsets: function() {
        this._gridOffset.left = srManager.offsetLeft(grid.get());
        this._gridOffset.top = srManager.offsetTop(grid.get());
    },

    _getOffset: function(item, noMargins, gridType, offset, side, size, c1) {
        var noMargins = noMargins || false;
        var cn = cnsCore.find(item);

        if(settings.eq("intersections", false) && settings.eq("grid", gridType))
            var vhOffset = cn[offset + "Offset"];
        else
            var vhOffset = 0;

        if(!noMargins)
            return this._gridOffset[side] + cn[c1] + vhOffset;

        var itemSize = srManager["outer" + size](item);
        var itemSizeWithMargins = srManager["outer" + size](item, true);
        var marginSize = itemSizeWithMargins - itemSize;
        var halfOfMargin = marginSize / 2;

        return this._gridOffset[side] + cn[c1] - halfOfMargin + vhOffset;
    },

    _getOffsetLeft: function(item, noMargins) {
        return this._getOffset(item, noMargins, "horizontal", "h", "left", "Width", "x1");
    },

    _getOffsetTop: function(item, noMargins) {
        return this._getOffset(item, noMargins, "vertical", "v", "top", "Height", "y1");
    },

    findItemCenterCursorOffsets: function(item, cursorX, cursorY) {
        var itemCenterX = this._getOffsetLeft(item) + (srManager.outerWidth(item, true) / 2);
        var itemCenterY = this._getOffsetTop(item) + (srManager.outerHeight(item, true) / 2);
        this._itemCenterCursorOffset = {x: itemCenterX - cursorX, y: itemCenterY - cursorY};
    },

    _getMaxCnItemZ: function() {
        var maxZ = null;
        var cns = connections.get();

        for(var i = 0; i < cns.length; i++) {
            if(maxZ == null)
                maxZ = Dom.int(cns[i].item.style.zIndex);
            else {
                if(Dom.int(cns[i].item.style.zIndex) > maxZ)
                    maxZ = Dom.int(cns[i].item.style.zIndex);
            }
        }

        return Dom.int(maxZ);
    },

    createClone: function(item) {
        var clone = item.cloneNode(true);
        var offset = {left: this._getOffsetLeft(item), top: this._getOffsetTop(item)};

        collector.markAsNotCollectable(item);
        settings.getApi("drag")(clone, item, srManager);

        if(Dom.hasTransitions()) {
            Dom.css3.transform(clone, "");
            Dom.css3.transition(clone, "none");
        }
        Dom.css.set(clone, {
            width: srManager.outerWidth(item) + "px",
            height: srManager.outerHeight(item) + "px",
            zIndex: this._getMaxCnItemZ() + 1,
            left: offset.left + "px", top: offset.top + "px" //, margin: "0px"
        });

        Dom.set4(clone, "margin", SizesResolver.getComputedCSS(item));
        document.body.appendChild(clone);
        dragifier.render(clone, offset.left, offset.top);

        return clone;
    },

    createPointer: function(item) {
        var offset = {left: this._getOffsetLeft(item, true), top: this._getOffsetTop(item, true)};
        var pointer = Dom.div();

        Dom.css.set(pointer, {
            width: srManager.outerWidth(item, true) + "px",
            height: srManager.outerHeight(item, true) + "px",
            position: "absolute",
            left: (offset.left - this._gridOffset.left) + "px",
            top: (offset.top - this._gridOffset.top) + "px"
        });

        var itemComputedCss = SizesResolver.getComputedCSS(item);
        grid.get().appendChild(pointer);
        dragifierApi.getPointerStyler()(pointer, Dom);
        dragifier.render(
            pointer,
            offset.left - this._gridOffset.left + parseFloat(itemComputedCss.marginLeft),
            offset.top - this._gridOffset.top + parseFloat(itemComputedCss.marginTop)
        );

        return pointer;
    },

    calcCloneNewDocPosition: function(item, cursorX, cursorY) {
        return {
            x: cursorX - (srManager.outerWidth(item, true) / 2) - (this._itemCenterCursorOffset.x * -1),
            y: cursorY - (srManager.outerHeight(item, true) / 2) - (this._itemCenterCursorOffset.y * -1)
        };
    },

    calcCloneNewGridPosition: function(item, newDocPos) {
        return {
            x1: newDocPos.x - this._gridOffset.left,
            x2: newDocPos.x + srManager.outerWidth(item, true) - 1 - this._gridOffset.left,
            y1: newDocPos.y - this._gridOffset.top,
            y2: newDocPos.y + srManager.outerHeight(item, true) - 1 - this._gridOffset.top
        };
    },

    hasDragId: function(id, ids) {
        for(var i = 0; i < ids.length; i++) {
            if(ids[i] == id)
                return true;
        }

        return false;
    },

    rmDragId: function(id, ids) {
        for(var i = 0; i < ids.length; i++) {
            if(ids[i] == id) {
                ids.splice(i, 1);
                break;
            }
        }
    },

    initItem: function(item) {
        if(Dom.hasTransitions())
            Dom.css3.transitionProperty(item, "Visibility 0ms ease");
    },

    hideItem: function(item) {
        item.style.visibility = "hidden";
        Dom.set(item, C.IS_DRAGGABLE_DATA, "y");
    },

    showItem: function(item) {
        item.style.visibility = "visible";
        Dom.rm(item, C.IS_DRAGGABLE_DATA);
    },

    repositionItems: function() {
        if(settings.eq("append", "default"))
            var cb = function() { appender.createInitialCr(); };
        else
            var cb = function() { reversedAppender.createInitialCr(); };

        connectors.setNextFlushCb(cb);
        ev.onRepositionEndForDrag(function() {
            var cns = cnsSorter.sortForReappend(connections.get());
            var items = [];

            for(var i = 0; i < cns.length; i++)
                items.push(cns[i].item);

            ev.emit(EV.DRAG_END, items);
        });

        this._reposition();
    },

    _reposition: function() {
        if(!Dom.browsers.isAndroidFirefox() && !Dom.browsers.isAndroidUC()) {
            reposition.all();
            return;
        }

        clearTimeout(this._repositionTimeout);
        this._repositionTimeout = setTimeout(function() {
            reposition.all();
        }, C.DRAGIFIER_REPOS_DELAY);
    }
});