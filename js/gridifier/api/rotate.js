Gridifier.Api.Rotate = function(settings, eventEmitter, sizesResolverManager) {
    var me = this;

    this._settings = null;
    this._eventEmitter = null;
    this._sizesResolverManager = null;
    this._collector = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._eventEmitter = eventEmitter;
        me._sizesResolverManager = sizesResolverManager;
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

Gridifier.Api.Rotate.prototype.setCollectorInstance = function(collector) {
    this._collector = collector;
}

Gridifier.Api.Rotate.prototype.show = function(item, grid, inverseRotateAxis, timeouter) {
    var rotateProp = (inverseRotateAxis) ? "rotateY" : "rotateX";
    this._rotate(item, grid, rotateProp, false, timeouter);
}

Gridifier.Api.Rotate.prototype.hide = function(item, grid, inverseRotateAxis, timeouter) {
    var rotateProp = (inverseRotateAxis) ? "rotateY" : "rotateX";
    this._rotate(item, grid, rotateProp, true, timeouter);
}

Gridifier.Api.Rotate.prototype._rotate = function(item, grid, rotateProp, inverseToggle, timeouter) {
    if(!inverseToggle) {
        var isShowing = true;
        var isHiding = false;
    }
    else {
        var isShowing = false;
        var isHiding = true;
    }

    var scene = this._createScene(item, grid);
    var frames = this._createFrames(scene);
    var itemClone = this._createItemClone(item);

    item.setAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING, "yes");
    item.setAttribute(Gridifier.Api.CoordsChanger.CSS3_TRANSLATE_3D_CLONES_RESTRICT_CLONE_SHOW_DATA_ATTR, "yes");
    var frontFrame = this._createFrontFrame(frames, rotateProp);
    var backFrame = this._createBackFrame(frames, rotateProp);

    if(isShowing) {
        backFrame.appendChild(itemClone);
        item.style.visibility = "hidden";
    }
    else if(isHiding) {
        frontFrame.appendChild(itemClone);
        item.style.visibility = "hidden";
    }

    var animationMsDuration = this._settings.getToggleAnimationMsDuration();
    Dom.css3.transitionProperty(
        frontFrame, 
        Prefixer.getForCSS('transform', frontFrame) + " " + animationMsDuration + "ms ease"
    );
    Dom.css3.transitionProperty(
        backFrame, 
        Prefixer.getForCSS('transform', backFrame) + " " + animationMsDuration + "ms ease"
    );

    var me = this;
    var initRotateTimeout = setTimeout(function() {
        Dom.css3.transformProperty(frontFrame, rotateProp, "180deg");
        Dom.css3.transformProperty(backFrame, rotateProp, "0deg");
    }, 20);
    //timeouter.add(item, initRotateTimeout);

    // A little helper to reduce blink effect after animation finish
    if(animationMsDuration > 400) {
       var prehideItemTimeout = setTimeout(function () {
          item.removeAttribute(Gridifier.Api.CoordsChanger.CSS3_TRANSLATE_3D_CLONES_RESTRICT_CLONE_SHOW_DATA_ATTR);

          if (isShowing)
             item.style.visibility = "visible";
          else if (isHiding)
             item.style.visibility = "hidden";
       }, animationMsDuration - 50);
       //timeouter.add(item, prehideItemTimeout);
    }

    var completeRotateTimeout = setTimeout(function() {
        scene.parentNode.removeChild(scene);
        item.removeAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING);

        if(isShowing) {
            item.style.visibility = "visible";
            me._eventEmitter.emitShowEvent(item);
        }
        else if(isHiding) {
            item.style.visibility = "hidden";
            me._eventEmitter.emitHideEvent(item);
        }
    }, animationMsDuration + 20);
    //timeouter.add(item, completeRotateTimeout);
}

Gridifier.Api.Rotate.prototype._createScene = function(item, grid) {
    var scene = document.createElement("div");
    Dom.css.set(scene, {
        width: this._sizesResolverManager.outerWidth(item, true) + "px",
        height: this._sizesResolverManager.outerHeight(item, true) + "px",
        position: "absolute",
        // @todo -> Pass here original left and top values????
        top: this._sizesResolverManager.positionTop(item) + "px",
        left: this._sizesResolverManager.positionLeft(item) + "px"
    });
    Dom.css3.perspective(scene, this._settings.getRotatePerspective()); 
    grid.appendChild(scene);

    return scene;
}

Gridifier.Api.Rotate.prototype._createFrames = function(scene) {
    var frames = document.createElement("div");
    Dom.css.set(frames, {
        width: "100%", height: "100%", position: "absolute"
    });
    Dom.css3.transformStyle(frames, "preserve-3d");
    Dom.css3.perspective(frames, this._settings.getRotatePerspective());

    scene.appendChild(frames);
    return frames;
}

Gridifier.Api.Rotate.prototype._createItemClone = function(item) {
    var itemClone = item.cloneNode(true);
    this._collector.markItemAsRestrictedToCollect(itemClone);
    Dom.css.set(itemClone, {
        left: "0px",
        top: "0px",
        visibility: "visible",
        width: this._sizesResolverManager.outerWidth(item, true) + "px",
        height: this._sizesResolverManager.outerHeight(item, true) + "px"
    });

    return itemClone;
}

Gridifier.Api.Rotate.prototype._addFrameCss = function(frame) {
    Dom.css.set(frame, {
        display: "block", 
        position: "absolute", 
        width: "100%", 
        height: "100%"
    });

    if(!this._settings.getRotateBackface())
        Dom.css3.backfaceVisibility(frame, "hidden");
}

Gridifier.Api.Rotate.prototype._createFrontFrame = function(frames, rotateProp) {
    var frontFrame = document.createElement("div");
    this._addFrameCss(frontFrame);
    frames.appendChild(frontFrame);

    Dom.css.set(frontFrame, {zIndex: 2});
    Dom.css3.transitionProperty(frontFrame, Prefixer.getForCSS('transform', frontFrame) + " 0ms ease");
    Dom.css3.transformProperty(frontFrame, rotateProp, "0deg");

    return frontFrame;
}

Gridifier.Api.Rotate.prototype._createBackFrame = function(frames, rotateProp) {
    var backFrame = document.createElement("div");
    this._addFrameCss(backFrame);
    frames.appendChild(backFrame);

    Dom.css3.transitionProperty(backFrame, Prefixer.getForCSS('transform', backFrame) + " 0ms ease");
    Dom.css3.transformProperty(backFrame, rotateProp, "-180deg");

    return backFrame;
}