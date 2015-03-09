Gridifier.Api.CoordsChanger = function(settings, gridifier, eventEmitter) {
    var me = this;

    this._settings = null;
    this._gridifier = null;
    this._eventEmitter = null;

    this._coordsChangerFunction = null;
    this._coordsChangerOnToggleFunction = null;
    this._coordsChangerFunctions = {};

    this._css = {
    };

    this._construct = function() { 
        me._settings = settings;
        me._gridifier = gridifier;
        me._eventEmitter = eventEmitter;

        me._coordsChangerFunctions = {};

        me._addDefaultCoordsChanger();
        me._addCSS3PositionCoordsChanger();
        me._addCSS3TranslateCoordsChanger();
        me._addCSS3Translate3DCoordsChanger();
        me._addCSS3Translate3DClonesCoordsChanger();
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

Gridifier.Api.CoordsChanger.prototype.setCoordsChangerFunction = function(coordsChangerFunctionName) {
    if(!this._coordsChangerFunctions.hasOwnProperty(coordsChangerFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_COORDS_CHANGER_INVALID_PARAM,
            coordsChangerFunctionName
        );
        return;
    }

    this._coordsChangerFunction = this._coordsChangerFunctions[coordsChangerFunctionName];
}

Gridifier.Api.CoordsChanger.prototype.addCoordsChangerFunction = function(coordsChangerFunctionName, 
                                                                          coordsChangerFunction) {
    this._coordsChangerFunctions[coordsChangerFunctionName] = coordsChangerFunction;
}

Gridifier.Api.CoordsChanger.prototype.getCoordsChangerFunction = function() {
    return this._coordsChangerFunction;
}

Gridifier.Api.CoordsChanger.prototype.setCoordsChangerOnToggleFunction = function(coordsChangerFunctionName) {
    if(!this._coordsChangerFunctions.hasOwnProperty(coordsChangerFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_COORDS_CHANGER_INVALID_PARAM,
            coordsChangerFunctionName
        );
        return;
    }

    this._coordsChangerOnToggleFunction = this._coordsChangerFunctions[coordsChangerFunctionName];
}

Gridifier.Api.CoordsChanger.prototype.getCoordsChangerOnToggleFunction = function() {
    return this._coordsChangerOnToggleFunction;
}

Gridifier.Api.CoordsChanger.prototype._addDefaultCoordsChanger = function() {
    this._coordsChangerFunctions["default"] = function(item, 
                                                       newLeft, 
                                                       newTop,
                                                       animationMsDuration,
                                                       eventEmitter,
                                                       emitTransformEvent,
                                                       newWidth,
                                                       newHeight) { 
        //Dom.css3.transitionProperty(item, "left 0ms ease, top 0ms ease"); If !ie8(isSupporting)
        Dom.css.set(item, {
            left: newLeft,
            top: newTop
        });

        if(emitTransformEvent) {
            eventEmitter.emitTransformEvent(item, newWidth, newHeight, newLeft, newTop);
        }
    };
}

Gridifier.Api.CoordsChanger.prototype._addCSS3PositionCoordsChanger = function() {
    this._coordsChangerFunctions.CSS3Position = function(item,
                                                         newLeft,
                                                         newTop,
                                                         animationMsDuration,
                                                         eventEmitter,
                                                         emitTransformEvent,
                                                         newWidth,
                                                         newHeight) {
        Dom.css3.transitionProperty(
            item, 
            Prefixer.getForCSS('left', item) + " " + animationMsDuration + "ms ease"
        );
        Dom.css3.transitionProperty(
            item,
            Prefixer.getForCSS('top', item) + " " + animationMsDuration + "ms ease"
        );

        Dom.css.set(item, {
            left: parseFloat(newLeft) + "px",
            top: parseFloat(newTop) + "px"
        });

        if(emitTransformEvent) {
            setTimeout(function() {
                eventEmitter.emitTransformEvent(item, newWidth, newHeight, newLeft, newTop);
            }, animationMsDuration + 20);
        }
    }
}

Gridifier.Api.CoordsChanger.prototype._addCSS3TranslateCoordsChanger = function() {
    this._coordsChangerFunctions.CSS3Translate = function(item, 
                                                          newLeft, 
                                                          newTop,
                                                          animationMsDuration,
                                                          eventEmitter,
                                                          emitTransformEvent,
                                                          newWidth,
                                                          newHeight) {
        // @todo -> if !supporting transitions -> default

        var newLeft = parseFloat(newLeft);
        var newTop = parseFloat(newTop);

        var currentLeft = parseFloat(item.style.left);
        var currentTop = parseFloat(item.style.top);

        if(newLeft > currentLeft)
            var translateX = newLeft - currentLeft;
        else if(newLeft < currentLeft)
            var translateX = (currentLeft - newLeft) * -1;
        else 
            var translateX = 0;

        if(newTop > currentTop)
            var translateY = newTop - currentTop;
        else if(newTop < currentTop)
            var translateY = (currentTop - newTop) * -1;
        else
            var translateY = 0;
        
        Dom.css3.transitionProperty(
            item, 
            Prefixer.getForCSS('transform', item) + " " + animationMsDuration + "ms ease"
        );
        
        Dom.css3.transformProperty(item, "translate", translateX + "px," + translateY + "px");

        if(emitTransformEvent) {
            setTimeout(function() {
                eventEmitter.emitTransformEvent(item, newWidth, newHeight, newLeft, newTop);
            }, animationMsDuration + 20);
        }
    };
}

Gridifier.Api.CoordsChanger.prototype._addCSS3Translate3DCoordsChanger = function() {
    this._coordsChangerFunctions.CSS3Translate3D = function(item, 
                                                            newLeft, 
                                                            newTop,
                                                            animationMsDuration,
                                                            eventEmitter,
                                                            emitTransformEvent,
                                                            newWidth,
                                                            newHeight) {
        // @todo -> if !supporting transitions -> default

        var newLeft = parseFloat(newLeft);
        var newTop = parseFloat(newTop);

        var currentLeft = parseFloat(item.style.left);
        var currentTop = parseFloat(item.style.top);

        if(newLeft > currentLeft)
            var translateX = newLeft - currentLeft;
        else if(newLeft < currentLeft)
            var translateX = (currentLeft - newLeft) * -1;
        else 
            var translateX = 0;

        if(newTop > currentTop)
            var translateY = newTop - currentTop;
        else if(newTop < currentTop)
            var translateY = (currentTop - newTop) * -1;
        else
            var translateY = 0;
        
        Dom.css3.transitionProperty(
            item, 
            Prefixer.getForCSS('transform', item) + " " + animationMsDuration + "ms ease"
        );
        
        Dom.css3.perspective(item, "1000");
        Dom.css3.backfaceVisibility(item, "hidden");
        Dom.css3.transformProperty(item, "translate3d", translateX + "px," + translateY + "px,0px");

        if(emitTransformEvent) {
            setTimeout(function() {
                eventEmitter.emitTransformEvent(item, newWidth, newHeight, newLeft, newTop);
            }, animationMsDuration + 20);
        }
    };
}

Gridifier.Api.CoordsChanger.prototype._addCSS3Translate3DClonesCoordsChanger = function() {
    var me = this;
    var itemShownDataAttr = "data-gridifier-item-shown";

    this._gridifier.onShow(function(item) { 
        var itemClonesManager = me._gridifier.getItemClonesManager();
        if(!itemClonesManager.hasBindedClone(item))
            return;
        if(itemClonesManager.isItemClone(item)) {
            item.style.visibility = "hidden";
            return;
        }

        item.style.visibility = "visible";
        item.setAttribute(itemShownDataAttr, "yes");
    });

    this._gridifier.onHide(function(item) {
       var itemClonesManager = me._gridifier.getItemClonesManager();
       if(!itemClonesManager.hasBindedClone(item))
           return;
       if(itemClonesManager.isItemClone(item)) {
           item.style.visibility = "hidden";
           return;
       }
       
       item.style.visibility = "hidden";
       item.removeAttribute(itemShownDataAttr);
    });

    var clonesHideTimeouts = [];

    this._coordsChangerFunctions.CSS3Translate3DClones = function(item,
                                                                  newLeft,
                                                                  newTop,
                                                                  animationMsDuration,
                                                                  eventEmitter,
                                                                  emitTransformEvent,
                                                                  newWidth,
                                                                  newHeight) {
        // @todo -> if !supporting transitions -> default
        
        var itemClonesManager = me._gridifier.getItemClonesManager();
        var itemClone = itemClonesManager.getBindedClone(item);

        var guid = item.getAttribute(Gridifier.GUID.GUID_DATA_ATTR);

        if(typeof clonesHideTimeouts[guid] == "undefined") {
            clonesHideTimeouts[guid] = null;
        }

        if(Dom.hasAttribute(item, itemShownDataAttr)) {
            itemClone.style.visibility = "visible";
        }
        item.style.visibility = "hidden";

        if(emitTransformEvent) {
            Dom.css.set(itemClone, {
                width: newWidth,
                height: newHeight
            });

            setTimeout(function() {
                eventEmitter.emitTransformEvent(itemClone, newWidth, newHeight, newLeft, newTop);
            }, animationMsDuration + 20);
        }
        
        me._coordsChangerFunctions.CSS3Translate3D(
            itemClone, newLeft, newTop, animationMsDuration, eventEmitter, emitTransformEvent, newWidth, newHeight
        );

        if(clonesHideTimeouts[guid] != null) {
           clearTimeout(clonesHideTimeouts[guid]);
           clonesHideTimeouts[guid] = null;
        }

        Dom.css.set(item, {
           left: newLeft,
           top: newTop
        });

        if(Dom.toInt(animationMsDuration) > 20)
            var hideCloneTimeout = animationMsDuration - 20;
        else
            var hideCloneTimeout = animationMsDuration;

        clonesHideTimeouts[guid] = setTimeout(function() {
            if(Dom.hasAttribute(item, itemShownDataAttr)) {
                item.style.visibility = "visible";
                itemClone.style.visibility = "hidden";
            }
        }, hideCloneTimeout);
    };
}