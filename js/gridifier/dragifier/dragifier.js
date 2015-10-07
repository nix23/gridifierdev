Dragifier = function() {
    this._touch = {start: null, move: null, end: null};
    this._mouse = {down: null, move: null, up: null};

    this._items = [];
    this._isDragging = false;

    this._areEventsBinded = false;
    this._origReposQueueSize = null;

    this._coordsChanger = dragifierApi.getCoordsChanger();

    this._createEvents();
    if(!settings.eq("dragifier", false))
        this._bindEvents();

    self(this, {
        dragifierOn: function() { this._bindEvents(); },
        dragifierOff: function() { this._unbindEvents(); },
        isDragifierOn: function() { return this._areEventsBinded; }
    });
}

proto(Dragifier, {
    _createEvents: function() {
        this._createTouchEvents();
        this._createClickEvents();
    },

    _createTouchEvents: function() {
        var me = this;
        this._touch.start = function(event) {
            var touch = event.changedTouches[0];
            var item = me._findClosestConnected(event.target);
            if(item == null) return;

            me._initDrag.call(me, event);
            if(me._isAlreadyDraggable(item)) {
                me._findAlreadyDraggable(item).addDragId(touch.identifier);
                return;
            }

            me._initDraggableItem.call(me, item, touch, true);
        };

        this._touch.end = function(event) {
            if(!me._isDragging) return;
            event.preventDefault();

            setTimeout(function() {
                if(!me._isDragging) return;

                var touches = event.changedTouches;
                for(var i = 0; i < touches.length; i++) {
                    var itemData = me._findDraggableById(touches[i].identifier, true);
                    if(itemData.item == null) continue;
                    itemData.item.rmDragId(touches[i].identifier);

                    if(itemData.item.getDragIdsCount() == 0) {
                        itemData.item.unbind();
                        me._items.splice(itemData.itemIndex, 1);
                    }
                }

                if(me._items.length == 0) me._endDrag();
            }, 0);
        };

        this._touch.move = function(event) {
            if(!me._isDragging) return;
            event.preventDefault();

            setTimeout(function() {
                if(!me._isDragging) return;
                me._reposQueueSync();

                var touches = event.changedTouches;
                for(var i = 0; i < touches.length; i++) {
                    var item = me._findDraggableById(touches[i].identifier);
                    if(item == null) continue;
                    item.dragMove(touches[i].pageX, touches[i].pageY);
                }
            }, 0);
        };
    },

    _createClickEvents: function() {
        var me = this;
        this._mouse.down = function(event) {
            var item = me._findClosestConnected(event.target);
            // UCBrowser will fire and process mouse handlers first
            if(item == null || Dom.browsers.isAndroidUC()) return;

            me._initDrag.call(me, event);
            me._initDraggableItem.call(me, item, event, false);
        };

        this._mouse.up = function(event) {
            setTimeout(function() {
                if(!me._isDragging || Dom.browsers.isAndroidUC()) return;
                me._endDrag();
                me._items[0].unbind();
                me._items.splice(0, 1);
            }, 0);
        };

        this._mouse.move = function(event) {
            setTimeout(function() {
                if(!me._isDragging || Dom.browsers.isAndroidUC()) return;
                me._reposQueueSync();
                me._items[0].dragMove(event.pageX, event.pageY);
            }, 0);
        };
    },

    _initDrag: function(event) {
        event.preventDefault();
        this._reposQueueOff();
        dragifierApi.getSelectToggler().disableSelect();
        srManager.startCachingTransaction();
        this._isDragging = true;
    },

    _endDrag: function() {
        this._reposQueueOn();
        dragifierApi.getSelectToggler().enableSelect();
        srManager.stopCachingTransaction();
        this._isDragging = false;
    },

    _initDraggableItem: function(item, event, isTouch) {
        var draggableItem = this._createDraggableItem();
        draggableItem.bind(item, event.pageX, event.pageY);

        if(isTouch) draggableItem.addDragId(event.identifier);
        this._items.push(draggableItem);
    },

    _toggleEvents: function(fn) {
        Event[fn](grid.get(), "mousedown", this._mouse.down);
        Event[fn](document.body, "mouseup", this._mouse.up);
        Event[fn](document.body, "mousemove", this._mouse.move);

        Event[fn](grid.get(), "touchstart", this._touch.start);
        Event[fn](document.body, "touchend", this._touch.end);
        Event[fn](document.body, "touchmove", this._touch.move);
    },

    _bindEvents: function() {
        if(this._areEventsBinded) return;
        this._areEventsBinded = true;
        this._toggleEvents("add");
    },

    _unbindEvents: function() {
        if(!this._areEventsBinded) return;
        this._areEventsBinded = false;
        this._toggleEvents("rm");
    },

    _reposQueueOff: function() {
        if(settings.eq("disableQueueOnDrags", false)) return;
        this._origReposQueueSize = settings.get("queueSize");
        this._reposQueueSync();
    },

    _reposQueueOn: function() {
        if(settings.eq("disableQueueOnDrags", false)) return;
        settings.set("queueSize", this._origReposQueueSize);
    },

    _reposQueueSync: function() {
        if(settings.eq("disableQueueOnDrags", false)) return;
        settings.set("queueSize", gridifier.all().length);
    },

    _findClosestConnected: function(child) {
        if(child == grid.get()) return null;
        var dr = settings.get("dragifier");
        var checkClass = typeof dr == "string" || dr instanceof String;

        var connected = null;
        var parentNode = null;
        var hasClass = false;

        while(connected == null && parentNode != grid.get()) {
            parentNode = (parentNode == null) ? child : parentNode.parentNode;

            if(checkClass) {
                if(Dom.css.hasClass(parentNode, settings.get("dragifier")))
                    hasClass = true;
            }

            if(gridItem.isConnected(parentNode))
                connected = parentNode;
        }

        return (connected == null || (checkClass && !hasClass)) ? null : connected;
    },

    _createDraggableItem: function() {
        return (settings.get("dragifierMode", "i")) ? new IntDraggableItem() : new DiscrDraggableItem();
    },

    _isAlreadyDraggable: function(item) {
        for(var i = 0; i < this._items.length; i++) {
            if(guid.get(this._items[i].get()) == guid.get(item))
                return true;
        }

        return false;
    },

    _findAlreadyDraggable: function(item) {
        for(var i = 0; i < this._items.length; i++) {
            if(guid.get(this._items[i].get()) == guid.get(item))
                return this._items[i];
        }

        err("Drag.item NF.");
    },

    _findDraggableById: function(id, fetchIndex) {
        var fetchIndex = fetchIndex || false;
        for(var i = 0; i < this._items.length; i++) {
            if(this._items[i].hasDragId(id)) {
                if(fetchIndex)
                    return {item: this._items[i], itemIndex: i};
                else
                    return this._items[i];
            }
        }
    },

    render: function(item, left, top) {
        this._coordsChanger(item, left, top, Dom);
    }
});