Gridifier.Api.Toggle = function(settings, eventEmitter, sizesResolverManager) {
    var me = this;

    this._settings = null;
    this._eventEmitter = null;
    this._sizesResolverManager = null;

    this._slideApi = null;
    this._rotateApi = null;

    this._toggleFunction = null;
    this._toggleFunctions = {};

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._eventEmitter = eventEmitter;
        me._sizesResolverManager = sizesResolverManager;

        me._slideApi = new Gridifier.Api.Slide(
            me._settings, me._eventEmitter, me._sizesResolverManager
        );
        me._rotateApi = new Gridifier.Api.Rotate(
            me._settings, me._eventEmitter, me._sizesResolverManager
        );

        me._toggleFunctions = {};

        me._addSlides();
        me._addRotateX();
        me._addRotateY();
        me._addScale();
        me._addFade();
        me._addVisibility();
        me._addVoid();
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

Gridifier.Api.Toggle.prototype.setToggleFunction = function(toggleFunctionName) {
    if(!this._toggleFunctions.hasOwnProperty(toggleFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_TOGGLE_INVALID_PARAM,
            toggleFunctionName
        );
        return;
    }

    this._toggleFunction = this._toggleFunctions[toggleFunctionName];
}

Gridifier.Api.Toggle.prototype.addToggleFunction = function(toggleFunctionName, toggleFunctionData) {
    this._toggleFunctions[toggleFunctionName] = toggleFunctionData;
}

Gridifier.Api.Toggle.prototype.getToggleFunction = function() {
    return this._toggleFunction;
}

Gridifier.Api.Toggle.prototype._addSlides = function() {
    var me = this;

    this._toggleFunctions.slideLeft = this._slideApi.createHorizontalSlideToggler(false, false, false);
    this._toggleFunctions.slideLeftTop = this._slideApi.createHorizontalSlideToggler(true, false, false);
    this._toggleFunctions.slideLeftBottom = this._slideApi.createHorizontalSlideToggler(false, true, false);

    this._toggleFunctions.slideRight = this._slideApi.createHorizontalSlideToggler(false, false, true);
    this._toggleFunctions.slideRightTop = this._slideApi.createHorizontalSlideToggler(true, false, true);
    this._toggleFunctions.slideRightBottom = this._slideApi.createHorizontalSlideToggler(false, true, true);

    this._toggleFunctions.slideTop = this._slideApi.createVerticalSlideToggler(false, false, false);
    this._toggleFunctions.slideTopLeft = this._slideApi.createVerticalSlideToggler(true, false, false);
    this._toggleFunctions.slideTopRight = this._slideApi.createVerticalSlideToggler(false, true, false);

    this._toggleFunctions.slideBottom = this._slideApi.createVerticalSlideToggler(false, false, true);
    this._toggleFunctions.slideBottomLeft = this._slideApi.createVerticalSlideToggler(true, false, true);
    this._toggleFunctions.slideBottomRight = this._slideApi.createVerticalSlideToggler(false, true, true);
}

Gridifier.Api.Toggle.prototype._addRotateX = function() {
    var me = this;

    this._toggleFunctions.rotateX = {
        "show": function(item, grid, animationMsDuration, eventEmitter, sizesResolverManager) {
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "visible";
                eventEmitter.emitShowEvent(item);
                return;
            }

            me._rotateApi.show(item, grid);
        },

        "hide": function(item, itemClone, grid, animationMsDuration, eventEmitter, sizesResolverManager) {
            itemClone.style.visibility = "visible";
            item.style.visibility = "hidden";

            if(!Dom.isBrowserSupportingTransitions()) {
                itemClone.style.visibility = "hidden";
                eventEmitter.emitHideEvent(item);
                return;
            }

            me._rotateApi.hide(itemClone, grid);
        }
    };
}

Gridifier.Api.Toggle.prototype._addRotateY = function() {
    var me = this;

    this._toggleFunctions.rotateY = {
        "show": function(item, grid, animationMsDuration, eventEmitter, sizesResolverManager) {
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "visible";
                eventEmitter.emitShowEvent(item);
                return;
            }

            me._rotateApi.show(item, grid, true);
        },

        "hide": function(item, itemClone, grid, animationMsDuration, eventEmitter, sizesResolverManager) {
            itemClone.style.visibility = "visible";
            item.style.visibility = "hidden";

            if(!Dom.isBrowserSupportingTransitions()) {
                itemClone.style.visibility = "hidden";
                eventEmitter.emitHideEvent(item);
                return;
            }

            me._rotateApi.hide(itemClone, grid, true);
        }
    };
}

Gridifier.Api.Toggle.prototype._addScale = function() {
    var me = this;

    this._toggleFunctions.scale = {
        "show": function(item, grid, animationMsDuration, eventEmitter, sizesResolverManager) {
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "visible";
                eventEmitter.emitShowEvent(item);
                return;
            }
            
            Dom.css3.transition(item, "none");
            Dom.css3.transformProperty(item, "scale", 0);
            
            item.style.visibility = "visible"; // Ie11 blinking fix(:))
            setTimeout(function() {
                item.style.visibility = "visible";
                Dom.css3.transition(
                    item, 
                    Prefixer.getForCSS('transform', item) + " " + animationMsDuration + "ms ease"
                );
                Dom.css3.transformProperty(item, "scale", 1);

                setTimeout(function() {
                    eventEmitter.emitShowEvent(item);
                }, animationMsDuration + 20);
            }, 20); 
        },

        "hide": function(item, itemClone, grid, animationMsDuration, eventEmitter, sizesResolverManager) {
            itemClone.style.visibility = "visible";
            item.style.visibility = "hidden";

            if(!Dom.isBrowserSupportingTransitions()) {
                itemClone.style.visibility = "hidden";
                eventEmitter.emitHideEvent(item);
                return;
            }

            Dom.css3.transition(
                itemClone, 
                Prefixer.getForCSS('transform', itemClone) + " " + animationMsDuration + "ms ease"
            );

            Dom.css3.transform(itemClone, "scale(0)");
            setTimeout(function() {
                itemClone.style.visibility = "hidden";
                grid.removeChild(itemClone);
                eventEmitter.emitHideEvent(item);
            // setTimeout should be smaller than animation duration(Flickering bug in Webkit)
            }, animationMsDuration - 100); 
        }
    };
}

Gridifier.Api.Toggle.prototype._addFade = function() {
    var me = this;

    this._toggleFunctions.fade = {
        "show": function(item, grid, animationMsDuration, eventEmitter, sizesResolverManager) {
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "visible";
                eventEmitter.emitShowEvent(item);
                return;
            }

            Dom.css3.transition(item, "none");
            Dom.css3.opacity(item, "0");

            setTimeout(function() {
                item.style.visibility = "visible";
                Dom.css3.transition(
                    item, 
                    Prefixer.getForCSS('opacity', item) + " " + animationMsDuration + "ms ease"
                );
                Dom.css3.opacity(item, 1);

                setTimeout(function() {
                    eventEmitter.emitShowEvent(item);
                }, animationMsDuration + 20);
            }, 20);
        },

        "hide": function(item, itemClone, grid, animationMsDuration, eventEmitter, sizesResolverManager) {
            itemClone.style.visibility = "visible";
            item.style.visibility = "hidden";

            if(!Dom.isBrowserSupportingTransitions()) {
                itemClone.style.visibility = "hidden";
                eventEmitter.emitHideEvent(item);
                return;
            }

            Dom.css3.transition(
                itemClone, 
                Prefixer.getForCSS('opacity', itemClone) + " " + animationMsDuration + "ms ease"
            );

            Dom.css3.opacity(itemClone, "0");
            setTimeout(function() {
                itemClone.style.visibility = "hidden";
                grid.removeChild(itemClone);
                eventEmitter.emitHideEvent(item);
            }, animationMsDuration + 20);
        }
    };
}

Gridifier.Api.Toggle.prototype._addVisibility = function() {
    var me = this;

    this._toggleFunctions.visibility = {
        "show": function(item, grid, animationMsDuration, eventEmitter, sizesResolverManager) {
            item.style.visibility = "visible";
            eventEmitter.emitShowEvent(item);
        },

        "hide": function(item, itemClone, grid, animationMsDuration, eventEmitter, sizesResolverManager) {
            itemClone.style.visibility = "hidden";
            item.style.visibility = "hidden";

            grid.removeChild(itemClone);
            eventEmitter.emitHideEvent(item);
        }
    };
}

Gridifier.Api.Toggle.prototype._addVoid = function() {
    var me = this;

    this._toggleFunctions.void = {
        "show": function(item) {
            me._eventEmitter.emitShowEvent(item); // @pass event emitter to call
        },

        "hide": function(item) {
            me._eventEmitter.emitHideEvent(item); // @pass event emitter to call
        }
    };
}