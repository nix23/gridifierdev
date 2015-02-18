Gridifier.Api.SizesChanger = function(settings, eventEmitter) {
    var me = this;

    this._settings = null;
    this._eventEmitter = null;

    this._sizesChangerFunction = null;
    this._sizesChangerFunctions = {};

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._eventEmitter = eventEmitter;

        me._sizesChangerFunctions = {};

        me._addDefaultSizesChanger();
        me._addSimultaneousCSS3TransitionSizesChanger();
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

Gridifier.Api.SizesChanger.prototype.setSizesChangerFunction = function(sizesChangerFunctionName) {
    if(!this._sizesChangerFunctions.hasOwnProperty(sizesChangerFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_SIZES_CHANGER_INVALID_PARAM,
            sizesChangerFunctionName
        );
        return;
    }

    this._sizesChangerFunction = this._sizesChangerFunctions[sizesChangerFunctionName];
}

Gridifier.Api.SizesChanger.prototype.addSizesChangerFunction = function(sizesChangerFunctionName, 
                                                                        sizesChangerFunction) {
    this._sizesChangerFunctions[sizesChangerFunctionName] = sizesChangerFunction;
}

Gridifier.Api.SizesChanger.prototype.getSizesChangerFunction = function() {
    return this._sizesChangerFunction;
}

Gridifier.Api.SizesChanger.prototype._addDefaultSizesChanger = function() {
    this._sizesChangerFunctions["default"] = function(item, newWidth, newHeight) {
        Dom.css3.transitionProperty(item, "width 0ms ease, height 0ms ease");
        Dom.css.set(item, {
            width: newWidth,
            height: newHeight
        });
    };
}

Gridifier.Api.SizesChanger.prototype._addSimultaneousCSS3TransitionSizesChanger = function() {
    this._sizesChangerFunctions.simultaneousCSS3Transition = function(item, newWidth, newHeight) {
        // @todo -> correctly parse params
        //var transition = item.style.transition;

        //Dom.css3.transition(item, "width 300ms ease, height 300ms ease");
        Dom.css.set(item, {
            width: newWidth,
            height: newHeight
        });
    };
}