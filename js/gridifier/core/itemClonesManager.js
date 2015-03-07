Gridifier.ItemClonesManager = function(grid, collector) {
   var me = this;

   this._grid = null;
   this._collector = null;

   this._itemClones = [];
   this._nextBindingId = 0;

   this._css = {
   };

   this._construct = function() {
      me._grid = grid;
      me._collector = collector;

      me._itemClones = [];

      me._bindEvents();
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

Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR = "gridifier-clones-manager-binding";

Gridifier.ItemClonesManager.prototype.createClone = function(item) {
   var itemClone = item.cloneNode(true);
   this._collector.markItemAsRestrictedToCollect(item);
   this._grid.getGrid().appendChild(itemClone);

   this._nextBindingId++;
   item.setAttribute(Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR, this._nextBindingId);
   itemClone.setAttribute(Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR, this._nextBindingId);

   this._itemClones.push(itemClone);
}

Gridifier.ItemClonesManager.prototype.hasBindedClone = function(item) {
   return Dom.hasAttribute(item, Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR);
}

Gridifier.ItemClonesManager.prototype.getBindedClone = function(item) {
   var bindedClone = null;

   for(var i = 0; i < this._itemClones.length; i++) {
      if(this._itemClones[i].getAttribute(Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR)
         == item.getAttribute(Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR)) {
         bindedClone = this._itemClones[i];
      }
   }

   if(bindedClone == null)
      throw new Error("Gridifier error: binded clone not found(on bind). ", item);

   return bindedClone;
}

Gridifier.ItemClonesManager.prototype.destroyClone = function(item) {
   var bindedClone = null;

   for(var i = 0; i < this._itemClones.length; i++) {
      if(this._itemClones[i].getAttribute(Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR)
         == item.getAttribute(Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR)) {
         bindedClone = this._itemClones[i];
         this._itemClones.splice(i, 1);
         break;
      }
   }

   if(bindedClone == null) 
      throw new Error("Gridifier error: binded clone not found(on destroy). ", item);
   
   this._grid.getGrid().removeChild(bindedClone);
   item.removeAttribute(Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR);
}