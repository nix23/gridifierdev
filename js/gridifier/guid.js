Gridifier.GUID = function() {
    var me = this;

    // @todo -> Don't forget to correct this values after deletes
    this._firstPrependedItemGUID = null;
    this._firstAppendedItemGUID = null;

    this._nextAppendedItemGUID = 9999;
    this._nextPrependedItemGUID = 10000;

    this._css = {
    };

    this._construct = function() {
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

Gridifier.GUID.GUID_DATA_ATTR = "data-gridifier-item-id";

Gridifier.GUID.prototype.getItemGUID = function(item) {
    return Dom.toInt(item.getAttribute(Gridifier.GUID.GUID_DATA_ATTR));
}

Gridifier.GUID.prototype.setItemGUID = function(item, itemGUID) {
    return item.setAttribute(
        Gridifier.GUID.GUID_DATA_ATTR, itemGUID
    );
}

Gridifier.GUID.prototype.markNextAppendedItem = function(item) {
    this._nextAppendedItemGUID++;
    item.setAttribute(Gridifier.GUID.GUID_DATA_ATTR, this._nextAppendedItemGUID);
}

Gridifier.GUID.prototype.markNextPrependedItem = function(item) {
    this._nextPrependedItemGUID--;
    item.setAttribute(Gridifier.GUID.GUID_DATA_ATTR, this._nextPrependedItemGUID);
}

Gridifier.GUID.prototype.markIfIsFirstPrependedItem = function(item) {
    var itemGUID = item.getAttribute(Gridifier.GUID.GUID_DATA_ATTR);
    if(this._firstPrependedItemGUID != null) return;
    this._firstPrependedItemGUID = Dom.toInt(itemGUID);
}

Gridifier.GUID.prototype.markIfIsFirstAppendedItem = function(item) {
    var itemGUID = item.getAttribute(Gridifier.GUID.GUID_DATA_ATTR);
    if(this._firstAppendedItemGUID != null) return;
    this._firstAppendedItemGUID = Dom.toInt(itemGUID);
}

Gridifier.GUID.prototype.wasItemPrepended = function(itemGUID) {
    // @todo -> Check is_int???
    if(this._firstPrependedItemGUID == null)
        return false;

    return (itemGUID <= this._firstPrependedItemGUID) ? true : false;
}

Gridifier.GUID.prototype.wasItemAppended = function(itemGUID) {
    if(this._firstAppendedItemGUID == null)
        return false;
    
    return (itemGUID >= this._firstAppendedItemGUID) ? true : false;
}

Gridifier.GUID.prototype.isFirstPrependedItem = function(itemGUID) {
    if(this._firstPrependedItemGUID == null)
        return false;

    return (itemGUID == this._firstPrependedItemGUID) ? true : false;
}

Gridifier.GUID.prototype.isFirstAppendedItem = function(itemGUID) {
    if(this._firstAppendedItemGUID == null)
        return false;

    return (itemGUID == this._firstAppendedItemGUID) ? true : false;
}

Gridifier.GUID.prototype.getMaxGUIDBefore = function(beforeItemGUID, connections) {
    var maxGUID = null;
    for(var i = 0; i < connections.length; i++) {
        var connectionItemGUID = Dom.toInt(this.getItemGUID(connections[i].item));

        if(connectionItemGUID < beforeItemGUID) {
            if(maxGUID == null) 
                maxGUID = connections[i].itemGUID;
            else {
                if(connectionItemGUID > maxGUID)
                    maxGUID = connectionItemGUID;
            }
        }
    }

    return maxGUID;
}