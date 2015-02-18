Gridifier.Api.Rotate = function(settings, eventEmitter) {
    var me = this;

    this._settings = null;
    this._eventEmitter = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._eventEmitter = eventEmitter;
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

Gridifier.Api.Rotate.prototype.show = function(item, grid, inverseRotateAxis) {
    var rotateProp = (inverseRotateAxis) ? "rotateY" : "rotateX";
    this._rotate(item, grid, rotateProp, false);
}

Gridifier.Api.Rotate.prototype.hide = function(item, grid, inverseRotateAxis) {
    var rotateProp = (inverseRotateAxis) ? "rotateY" : "rotateX";
    this._rotate(item, grid, rotateProp, true);
}

Gridifier.Api.Rotate.prototype._rotate = function(item, grid, rotateProp, inverseToggle) {
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

    var frontFrame = this._createFrontFrame(frames, rotateProp);
    var backFrame = this._createBackFrame(frames, rotateProp);

    if(isShowing) {
        backFrame.appendChild(itemClone);
    }
    else if(isHiding) {
        frontFrame.appendChild(itemClone);
        item.style.visibility = "hidden";
    }

    var duration = this._settings.getAnimationMsDuration();
    Dom.css3.transitionProperty(
        frontFrame, 
        Prefixer.getForCSS('transform', frontFrame) + " " + duration + "ms ease"
    );
    Dom.css3.transitionProperty(
        backFrame, 
        Prefixer.getForCSS('transform', backFrame) + " " + duration + "ms ease"
    );

    setTimeout(function() {
        Dom.css3.transformProperty(backFrame, rotateProp, "0deg");
        Dom.css3.transformProperty(frontFrame, rotateProp, "180deg");
    }, 20);

    setTimeout(function() {
        scene.parentNode.removeChild(scene);
        if(isShowing)
            item.style.visibility = "visible";
        // @todo -> Send event after completion
    }, this._settings.getAnimationMsDuration() + 1);
}

Gridifier.Api.Rotate.prototype._createScene = function(item, grid) {
    var scene = document.createElement("div");
    Dom.css.set(scene, {
        width: SizesResolverManager.outerWidth(item, true) + "px",
        height: SizesResolverManager.outerHeight(item, true) + "px",
        position: "absolute",
        // @todo -> Pass here original left and top values????
        top: SizesResolverManager.positionTop(item) + "px",
        left: SizesResolverManager.positionLeft(item) + "px"
    });
    Dom.css3.perspective(scene, "200px"); 
    grid.appendChild(scene);

    return scene;
}

Gridifier.Api.Rotate.prototype._createFrames = function(scene) {
    var frames = document.createElement("div");
    Dom.css.set(frames, {
        width: "100%", height: "100%", position: "absolute"
    });
    Dom.css3.transformStyle(frames, "preserve-3d");
    Dom.css3.perspective(frames, "200px");

    scene.appendChild(frames);
    return frames;
}

Gridifier.Api.Rotate.prototype._createItemClone = function(item) {
    var itemClone = item.cloneNode(true);
    Dom.css.set(itemClone, {
        left: "0px",
        top: "0px",
        visibility: "visible",
        width: SizesResolverManager.outerWidth(item, true) + "px",
        height: SizesResolverManager.outerHeight(item, true) + "px"
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