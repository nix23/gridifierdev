Gridifier.GUID = function() {
    var me = this;

    this._maxItemGUID = 9999;
    this._minItemGUID = 10000;

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

Gridifier.GUID.prototype.reinit = function() {
    this._maxItemGUID = 9999;
    this._minItemGUID = 10000;
}

Gridifier.GUID.prototype.reinitMaxGUID = function(newMaxGUID) {
    if(typeof newMaxGUID == "undefined" || newMaxGUID == null)
        this._maxItemGUID = 9999;
    else
        this._maxItemGUID = newMaxGUID;
}

Gridifier.GUID.prototype.getItemGUID = function(item) {
    return Dom.toInt(item.getAttribute(Gridifier.GUID.GUID_DATA_ATTR));
}

Gridifier.GUID.prototype.setItemGUID = function(item, itemGUID) {
    return item.setAttribute(
        Gridifier.GUID.GUID_DATA_ATTR, itemGUID
    );
}

Gridifier.GUID.prototype.markNextAppendedItem = function(item) {
    this._maxItemGUID++;
    item.setAttribute(Gridifier.GUID.GUID_DATA_ATTR, this._maxItemGUID);

    return this._maxItemGUID;
}

Gridifier.GUID.prototype.markNextPrependedItem = function(item) {
    this._minItemGUID--;
    item.setAttribute(Gridifier.GUID.GUID_DATA_ATTR, this._minItemGUID);

    return this._minItemGUID;
}