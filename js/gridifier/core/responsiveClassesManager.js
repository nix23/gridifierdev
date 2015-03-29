Gridifier.ResponsiveClassesManager = function(gridifier, itemClonesManager) {
    var me = this;

    this._gridifier = null;
    this._itemClonesManager = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._itemClonesManager = itemClonesManager;
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

Gridifier.ResponsiveClassesManager.prototype.toggleResponsiveClasses = function(maybeItem, className) {
    var items = this._itemClonesManager.unfilterClones(maybeItem);
    if(!Dom.isArray(className))
        var classNames = [className];
    else
        var classNames = className;

    for(var i = 0; i < items.length; i++) {
        if(this._gridifier.hasItemBindedClone(items[i]))
            var itemClone = this._gridifier.getItemClone(items[i]);
        else
            var itemClone = null;

        for(var j = 0; j < classNames.length; j++) {
            if(Dom.css.hasClass(items[i], classNames[j])) {
                Dom.css.removeClass(items[i], classNames[j]);
                if(itemClone != null)
                    Dom.css.removeClass(itemClone, classNames[j]);
            }
            else {
                Dom.css.addClass(items[i], classNames[j]);
                if(itemClone != null)
                    Dom.css.addClass(itemClone, classNames[j]);
            }
        }
    }
}

Gridifier.ResponsiveClassesManager.prototype.addResponsiveClasses = function(maybeItem, className) {
    var items = this._itemClonesManager.unfilterClones(maybeItem);
    if(!Dom.isArray(className))
        var classNames = [className];
    else
        var classNames = className;

    for(var i = 0; i < items.length; i++) {
        if(this._gridifier.hasItemBindedClone(items[i]))
            var itemClone = this._gridifier.getItemClone(items[i]);
        else
            var itemClone = null;

        for(var j = 0; j < classNames.length; j++) {
            if(!Dom.css.hasClass(items[i], classNames[j])) {
                Dom.css.addClass(items[i], classNames[j]);
                if(itemClone != null)
                    Dom.css.addClass(itemClone, className[j]);
            }
        }
    }
}

Gridifier.ResponsiveClassesManager.prototype.removeResponsiveClasses = function(maybeItem, className) {
    var items = this._itemClonesManager.unfilterClones(maybeItem);
    if(!Dom.isArray(className))
        var classNames = [className];
    else
        var classNames = className;

    for(var i = 0; i < items.length; i++) {
        if(this._gridifier.hasItemBindedClone(items[i]))
            var itemClone = this._gridifier.getItemClone(items[i]);
        else
            var itemClone = null;

        for(var j = 0; j < classNames.length; j++) {
            if(Dom.css.hasClass(items[i], classNames[j])) {
                Dom.css.removeClass(items[i], classNames[j]);
                if(itemClone != null)
                    Dom.css.removeClass(itemClone, classNames[j]);
            }
        }
    }
}