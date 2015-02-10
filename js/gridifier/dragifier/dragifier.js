Gridifier.Dragifier = function(gridifier,
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

    this._draggableItems = [];
    this._isDragging = false;

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

        if(me._settings.shouldEnableDragifierOnInit()) {
            me._bindEvents();
        }
    };

    this._bindEvents = function() {
        // @todo -> Move this to selector, and if child is passed, find closest gridItem(Depending on
        //          that, which was set up in settings)
        var draggableItemSelector = me._settings.getDragifierItemSelector();

        // @todo -> Replace with native events
        $(me._gridifier.getGrid()).on("touchstart", draggableItemSelector, function(event) {
            event.preventDefault();
            SizesResolverManager.startCachingTransaction();
            me._isDragging = true;

            if(me._isAlreadyDraggable($(this).get(0))) {
                var newTouch = event.originalEvent.changedTouches[0];
                var alreadyDraggableItem = me._findAlreadyDraggableItem($(this).get(0));
                alreadyDraggableItem.addDragIdentifier(newTouch.identifier);
                return;
            }

            var draggableItem = me._createDraggableItem();
            var initialTouch = event.originalEvent.changedTouches[0];

            draggableItem.bindDraggableItem($(this).get(0), initialTouch.pageX, initialTouch.pageY);
            draggableItem.addDragIdentifier(initialTouch.identifier);
            
            me._draggableItems.push(draggableItem);
        });

        $("body").on("touchend", draggableItemSelector, function(event) {
            if(!me._isDragging) return;
            event.preventDefault();

            setTimeout(function() {
                if(!me._isDragging) return;
                
                var touches = event.originalEvent.changedTouches;
                for(var i = 0; i < touches.length; i++) {
                    var draggableItemData = me._findDraggableItemByIdentifier(touches[i].identifier, true);
                    if(draggableItemData.item == null)
                        continue;
                    draggableItemData.item.removeDragIdentifier(touches[i].identifier);

                    if(draggableItemData.item.getDragIdentifiersCount() == 0) {
                        draggableItemData.item.unbindDraggableItem();
                        me._draggableItems.splice(draggableItemData.itemIndex, 1);
                    }
                }

                if(me._draggableItems.length == 0) {
                    me._isDragging = false;
                    SizesResolverManager.stopCachingTransaction();
                }
            }, 0);
        });

        $("body").on("touchmove", function(event) {
            if(!me._isDragging) return;
            event.preventDefault();

            setTimeout(function() {
                if(!me._isDragging) return;

                var touches = event.originalEvent.changedTouches;
                for(var i = 0; i < touches.length; i++) {
                    var draggableItem = me._findDraggableItemByIdentifier(touches[i].identifier);
                    if(draggableItem == null)
                        continue;
                    draggableItem.processDragMove(touches[i].pageX, touches[i].pageY);
                }
           }, 0);
        });

        $(me._gridifier.getGrid()).on("mousedown", draggableItemSelector, function(event) {
            event.preventDefault();
            SizesResolverManager.startCachingTransaction();
            me._isDragging = true;

            var draggableItem = me._createDraggableItem();

            draggableItem.bindDraggableItem($(this).get(0), event.pageX, event.pageY);
            me._draggableItems.push(draggableItem);
        });

        $("body").on("mouseup.gridifier.dragifier", function() {
            setTimeout(function() {
                if(!me._isDragging) return;
                
                me._draggableItems[0].unbindDraggableItem();
                me._draggableItems.splice(0, 1);
                me._isDragging = false;
                SizesResolverManager.stopCachingTransaction();
            }, 0);
        });

        $("body").on("mousemove.gridfier.dragifier", function(event) {
            setTimeout(function() {
                if(!me._isDragging) return;

                me._draggableItems[0].processDragMove(event.pageX, event.pageY);
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

Gridifier.Dragifier.prototype._createDraggableItem = function() {
    // @todo -> Add customSD mode
    if(this._settings.isDisabledSortDispersion()) {
        var draggableItem = new Gridifier.Dragifier.ConnectionIntersectionDraggableItem(
            this._gridifier, 
            this._appender,
            this._reversedAppender,
            this._connections, 
            this._connectors, 
            this._guid, 
            this._settings
        );
    }
    else if(this._settings.isCustomAllEmptySpaceSortDispersion()) {
        var draggableItem = new Gridifier.Dragifier.GridDiscretizationDraggableItem(
            this._gridifier, 
            this._appender,
            this._reversedAppender,
            this._connections, 
            this._connectors, 
            this._guid, 
            this._settings
        );
    }

    return draggableItem;
}

Gridifier.Dragifier.prototype._isAlreadyDraggable = function(item) {
    for(var i = 0; i < this._draggableItems.length; i++) {
        var draggableItem = this._draggableItems[i].getDraggableItem();
        if(this._guid.getItemGUID(draggableItem) == this._guid.getItemGUID(item))
            return true;
    }

    return false;
}

Gridifier.Dragifier.prototype._findAlreadyDraggableItem = function(item) {
    for(var i = 0; i < this._draggableItems.length; i++) {
        var draggableItem = this._draggableItems[i].getDraggableItem();

        if(this._guid.getItemGUID(draggableItem) == this._guid.getItemGUID(item))
            return this._draggableItems[i];
    }

    throw new Error("Draggable item not found");
}

Gridifier.Dragifier.prototype._findDraggableItemByIdentifier = function(identifier,
                                                                        fetchIndex) {
    var fetchIndex = fetchIndex || false;
    var draggableItem = null;
    var draggableItemIndex = null;

    for(var i = 0; i < this._draggableItems.length; i++) {
        if(this._draggableItems[i].hasDragIdentifier(identifier)) {
            draggableItem = this._draggableItems[i];
            draggableItemIndex = i;
            break;
        }
    }

    if(fetchIndex) {
        return {
            item: draggableItem,
            itemIndex: draggableItemIndex
        };
    }
    else {
        return draggableItem;
    }
}