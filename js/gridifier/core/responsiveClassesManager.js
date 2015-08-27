Gridifier.ResponsiveClassesManager = function(gridifier, settings, collector, guid, eventEmitter) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._collector = null;
    this._guid = null;
    this._eventEmitter = null;

    this._eventsData = [];

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._collector = collector;
        me._guid = guid;
        me._eventEmitter = eventEmitter;
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

Gridifier.ResponsiveClassesManager.prototype._saveTransformDataPerEvent = function(item, addedClasses, removedClasses) {
    var itemGUID = this._guid.getItemGUID(item);

    var itemEventData = null;
    for(var i = 0; i < this._eventsData.length; i++) {
        if(this._eventsData[i].itemGUID == itemGUID) {
            itemEventData = this._eventsData[i];
            break;
        }
    }

    if(itemEventData == null) {
        itemEventData = {};
        this._eventsData.push(itemEventData);
    }

    itemEventData.itemGUID = itemGUID;
    itemEventData.addedClasses = addedClasses;
    itemEventData.removedClasses = removedClasses;
}

Gridifier.ResponsiveClassesManager.prototype.emitTransformEvents = function(connections) {
    if(this._eventsData.length == 0)
        return;

    var me = this;
    for(var i = 0; i < connections.length; i++) {
        for(var j = 0; j < this._eventsData.length; j++) {
            if(Dom.toInt(connections[i].itemGUID) == this._eventsData[j].itemGUID) {
                (function(item, addedClasses, removedClasses) {
                    setTimeout(function() {
                        me._eventEmitter.emitResponsiveTransformEvent(
                            item, addedClasses, removedClasses
                        );
                    }, me._settings.getCoordsChangeAnimationMsDuration());
                })(connections[i].item, this._eventsData[j].addedClasses, this._eventsData[j].removedClasses);
                this._eventsData.splice(j, 1);
                break;
            }
        }
    }
}

Gridifier.ResponsiveClassesManager.prototype.toggleResponsiveClasses = function(maybeItem, className) {
    var items = this._collector.toDOMCollection(maybeItem);
    this._collector.ensureAllItemsAreConnectedToGrid(items);

    if(!Dom.isArray(className))
        var classNames = [className];
    else
        var classNames = className;

    for(var i = 0; i < items.length; i++) {
        var addedClasses = [];
        var removedClasses = [];

        for(var j = 0; j < classNames.length; j++) {
            if(Dom.css.hasClass(items[i], classNames[j])) {
                removedClasses.push(classNames[j]);
                Dom.css.removeClass(items[i], classNames[j]);
            }
            else {
                addedClasses.push(classNames[j]);
                Dom.css.addClass(items[i], classNames[j]);
            }
        }

        this._saveTransformDataPerEvent(items[i], addedClasses, removedClasses);
    }

    return items;
}

Gridifier.ResponsiveClassesManager.prototype.addResponsiveClasses = function(maybeItem, className) {
    var items = this._collector.toDOMCollection(maybeItem);
    this._collector.ensureAllItemsAreConnectedToGrid(items);

    if(!Dom.isArray(className))
        var classNames = [className];
    else
        var classNames = className;

    for(var i = 0; i < items.length; i++) {
        var addedClasses = [];

        for(var j = 0; j < classNames.length; j++) {
            if(!Dom.css.hasClass(items[i], classNames[j])) {
                addedClasses.push(classNames[j]);
                Dom.css.addClass(items[i], classNames[j]);
            }
        }

        this._saveTransformDataPerEvent(items[i], addedClasses, []);
    }

    return items;
}

Gridifier.ResponsiveClassesManager.prototype.removeResponsiveClasses = function(maybeItem, className) {
    var items = this._collector.toDOMCollection(maybeItem);
    this._collector.ensureAllItemsAreConnectedToGrid(items);

    if(!Dom.isArray(className))
        var classNames = [className];
    else
        var classNames = className;

    for(var i = 0; i < items.length; i++) {
        var removedClasses = [];

        for(var j = 0; j < classNames.length; j++) {
            if(Dom.css.hasClass(items[i], classNames[j])) {
                removedClasses.push(classNames[j]);
                Dom.css.removeClass(items[i], classNames[j]);
            }
        }

        this._saveTransformDataPerEvent(items[i], [], removedClasses);
    }

    return items;
}