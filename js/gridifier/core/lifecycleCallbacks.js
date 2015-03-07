Gridifier.LifecycleCallbacks = function(collector) {
   var me = this;

   this._collector = null;

   this._preInsertCallbacks = [];
   this._preDisconnectCallbacks = [];

   this._css = {
   };

   this._construct = function() {
      me._collector = collector;

      me._insertCallbacks = [];
      me._disconnectCallbacks = [];

      this._bindEvents();
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

Gridifier.LifecycleCallbacks.prototype.addPreInsertCallback = function(callback) {
   this._preInsertCallbacks.push(callback);
}

Gridifier.LifecycleCallbacks.prototype.addPreDisconnectCallback = function(callback) {
   this._preDisconnectCallbacks.push(callback);
}

Gridifier.LifecycleCallbacks.prototype.executePreInsertCallbacks = function(items) {
   var items = this._collector.toDOMCollection(items);
   
   for(var i = 0; i < this._preInsertCallbacks.length; i++) {
      this._preInsertCallbacks[i](items);
   }
}

Gridifier.LifecycleCallbacks.prototype.executePreDisconnectCallbacks = function(items) {
   var items = this._collector.toDOMCollection(items);
   
   for(var i = 0; i < this._preDisconnectCallbacks.length; i++) {
      this._preDisconnectCallbacks[i](items);
   }
}