Gridifier.Dragifier = function(gridifier,
                               appender,
                               reversedAppender,
                               collector,
                               connections,
                               connectors,
                               guid,
                               settings,
                               sizesResolverManager,
                               eventEmitter) {
    var me = this;

    this._gridifier = null;
    this._appender = null;
    this._reversedAppender = null;
    this._collector = null;
    this._connections = null;
    this._connectors = null;
    this._guid = null;
    this._settings = null;
    this._sizesResolverManager = null;
    this._eventEmitter = null;

    this._connectedItemMarker = null;

    this._touchStartHandler = null;
    this._touchMoveHandler = null;
    this._touchEndHandler = null;
    this._mouseDownHandler = null;
    this._mouseMoveHandler = null;
    this._mouseUpHandler = null;

    this._draggableItems = [];
    this._isDragging = false;

    this._areDragifierEventsBinded = false;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._collector = collector;
        me._connections = connections;
        me._connectors = connectors;
        me._guid = guid;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;
        me._eventEmitter = eventEmitter;

        me._connectedItemMarker = new Gridifier.ConnectedItemMarker();
        me._dragifierApi = new Gridifier.Api.Dragifier();

        me._bindEvents();
        if(me._settings.shouldEnableDragifierOnInit()) {
            me.bindDragifierEvents();
        }
    };

    this._bindEvents = function() {
        me._touchStartHandler = function(event) {
            var connectedItem = me._findClosestConnectedItem(event.target);
            if(connectedItem == null) return;

            event.preventDefault();
            me._disableUserSelect();
            me._sizesResolverManager.startCachingTransaction();
            me._isDragging = true;

            if(me._isAlreadyDraggable(connectedItem)) {
                var newTouch = event.changedTouches[0];
                var alreadyDraggableItem = me._findAlreadyDraggableItem(connectedItem);
                alreadyDraggableItem.addDragIdentifier(newTouch.identifier);
                return;
            }

            var draggableItem = me._createDraggableItem();
            var initialTouch = event.changedTouches[0];

            draggableItem.bindDraggableItem(connectedItem, initialTouch.pageX, initialTouch.pageY);
            draggableItem.addDragIdentifier(initialTouch.identifier);

            me._draggableItems.push(draggableItem);
        };

        me._touchEndHandler = function(event) {
            if(!me._isDragging) return;
            event.preventDefault();

            setTimeout(function() {
                if(!me._isDragging) return;

                var touches = event.changedTouches;
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
                    me._enableUserSelect();
                    me._isDragging = false;
                    me._sizesResolverManager.stopCachingTransaction();
                }
            }, 0);
        };

        me._touchMoveHandler = function(event) {
            if(!me._isDragging) return;
            event.preventDefault();

            setTimeout(function() {
                if(!me._isDragging) return;

                var touches = event.changedTouches;
                for(var i = 0; i < touches.length; i++) {
                    var draggableItem = me._findDraggableItemByIdentifier(touches[i].identifier);
                    if(draggableItem == null)
                        continue;
                    draggableItem.processDragMove(touches[i].pageX, touches[i].pageY);
                }
           }, 0);
        };

        me._mouseDownHandler = function(event) {
            var connectedItem = me._findClosestConnectedItem(event.target);
            if(connectedItem == null) return;

            event.preventDefault();
            me._disableUserSelect();
            me._sizesResolverManager.startCachingTransaction();
            me._isDragging = true;

            var draggableItem = me._createDraggableItem();

            draggableItem.bindDraggableItem(connectedItem, event.pageX, event.pageY);
            me._draggableItems.push(draggableItem);
        };

        me._mouseUpHandler = function() {
            setTimeout(function() {
                if(!me._isDragging) return;

                me._enableUserSelect();
                me._draggableItems[0].unbindDraggableItem();
                me._draggableItems.splice(0, 1);
                me._isDragging = false;
                me._sizesResolverManager.stopCachingTransaction();
            }, 0);
        };

        me._mouseMoveHandler = function(event) {
            setTimeout(function() {
                if(!me._isDragging) return;
                me._draggableItems[0].processDragMove(event.pageX, event.pageY);
           }, 0);
        };
    };

    this._unbindEvents = function() {
    };

    this.destruct = function() {
       me._unbindEvents();
    };

    this._construct();
    return this;
}

Gridifier.Dragifier.IS_DRAGGABLE_ITEM_DATA_ATTR = "data-gridifier-is-draggable-item";

Gridifier.Dragifier.prototype.bindDragifierEvents = function() {
    if(this._areDragifierEventsBinded)
        return;

    this._areDragifierEventsBinded = true;

    Event.add(this._gridifier.getGrid(), "mousedown", this._mouseDownHandler);
    Event.add(document.body, "mouseup", this._mouseUpHandler);
    Event.add(document.body, "mousemove", this._mouseMoveHandler);

    Event.add(this._gridifier.getGrid(), "touchstart", this._touchStartHandler);
    Event.add(document.body, "touchend", this._touchEndHandler);
    Event.add(document.body, "touchmove", this._touchMoveHandler);
}

Gridifier.Dragifier.prototype.unbindDragifierEvents = function() {
    if(!this._areDragifierEventsBinded)
        return;

    this._areDragifierEventsBinded = false;

    Event.remove(this._gridifier.getGrid(), "mousedown", this._mouseDownHandler);
    Event.remove(document.body, "mouseup", this._mouseUpHandler);
    Event.remove(document.body, "mousemove", this._mouseMoveHandler);

    Event.remove(this._gridifier.getGrid(), "touchstart", this._touchStartHandler);
    Event.remove(document.body, "touchend", this._touchEndHandler);
    Event.remove(document.body, "touchmove", this._touchMoveHandler);
}

Gridifier.Dragifier.prototype._disableUserSelect = function() {
    var dragifierUserSelectToggler = this._settings.getDragifierUserSelectToggler();
    dragifierUserSelectToggler.disableSelect();
}

Gridifier.Dragifier.prototype._enableUserSelect = function() {
    var dragifierUserSelectToggler = this._settings.getDragifierUserSelectToggler();
    dragifierUserSelectToggler.enableSelect();
}

Gridifier.Dragifier.prototype._findClosestConnectedItem = function(maybeConnectedItemChild) {
    var grid = this._gridifier.getGrid();
    var draggableItemSelector = this._settings.getDragifierItemSelector();

    if(maybeConnectedItemChild == grid)
        return null;

    if(typeof draggableItemSelector == "boolean" && !draggableItemSelector)
        var checkThatAnyBubblePhaseElemHasClass = false;
    else
        var checkThatAnyBubblePhaseElemHasClass = true;

    var connectedItem = null;
    var parentNode = null;
    var hasAnyBubblePhaseElemClass = false;

    while(connectedItem == null && parentNode != grid) {
        if(parentNode == null)
            parentNode = maybeConnectedItemChild;
        else
            parentNode = parentNode.parentNode;

        if(checkThatAnyBubblePhaseElemHasClass) {
            if(Dom.css.hasClass(parentNode, draggableItemSelector))
                hasAnyBubblePhaseElemClass = true;
        }

        if(this._connectedItemMarker.isItemConnected(parentNode))
            connectedItem = parentNode;
    }

    if(connectedItem == null || (checkThatAnyBubblePhaseElemHasClass && !hasAnyBubblePhaseElemClass)) {
        return null;
    }

    return connectedItem;
}

Gridifier.Dragifier.prototype._createDraggableItem = function() {
    if(this._settings.isIntersectionDragifierMode()) {
        var draggableItem = new Gridifier.Dragifier.ConnectionIntersectionDraggableItem(
            this._gridifier, 
            this._appender,
            this._reversedAppender,
            this._collector,
            this._connections, 
            this._connectors, 
            this._guid, 
            this._settings,
            this._sizesResolverManager,
            this._eventEmitter
        );
    }
    else if(this._settings.isDiscretizationDragifierMode()) {
        var draggableItem = new Gridifier.Dragifier.GridDiscretizationDraggableItem(
            this._gridifier, 
            this._appender,
            this._reversedAppender,
            this._collector,
            this._connections, 
            this._connectors, 
            this._guid, 
            this._settings,
            this._sizesResolverManager,
            this._eventEmitter
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