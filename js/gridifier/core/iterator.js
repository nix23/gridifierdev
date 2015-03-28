Gridifier.Iterator = function(settings, collector, connections, connectionsSorter, guid) {
    var me = this;

    this._settings = null;
    this._collector = null;
    this._connections = null;
    this._connectionsSorter = null;
    this._guid = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._collector = collector;
        me._connections = connections;
        me._connectionsSorter = connectionsSorter;
        me._guid = guid;
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

Gridifier.Iterator.prototype.getFirst = function() {
    var connections = this._connections.get();
    if(connections.length == 0)
        return null;

    connections = this._connectionsSorter.sortConnectionsPerReappend(connections);
    return connections[0].item;
}

Gridifier.Iterator.prototype.getLast = function() {
    var connections = this._connections.get();
    if(connections.length == 0)
        return null;

    connections = this._connectionsSorter.sortConnectionsPerReappend(connections);
    return connections[connections.length - 1].item;
}

Gridifier.Iterator.prototype.getNext = function(item) {
    var items = this._collector.toDOMCollection(item);
    item = items[0];

    var connections = this._connections.get();
    if(connections.length == 0)
        return null;

    connections = this._connectionsSorter.sortConnectionsPerReappend(connections);
    for(var i = 0; i < connections.length; i++) {
        if(this._guid.getItemGUID(connections[i].item) == this._guid.getItemGUID(item)) {
            if(i + 1 > connections.length - 1)
                return null;

            return connections[i + 1].item;
        }
    }

    return null;
}

Gridifier.Iterator.prototype.getPrev = function(item) {
    var items = this._collector.toDOMCollection(item);
    item = items[0];

    var connections = this._connections.get();
    if(connections.length == 0)
        return null;

    connections = this._connectionsSorter.sortConnectionsPerReappend(connections);
    for(var i = connections.length - 1; i >= 0; i--) {
        if(this._guid.getItemGUID(connections[i].item) == this._guid.getItemGUID(item)) {
            if(i - 1 < 0)
                return null;

            return connections[i - 1].item;
        }
    }

    return null;
}