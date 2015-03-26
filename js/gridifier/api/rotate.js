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

Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES = {X: 0, Y: 1, Z: 2, XY: 3, XZ: 4, YZ: 5, XYZ: 6};
Gridifier.Api.Rotate.ROTATE_FUNCTION_TYPES = {X: 0, Y: 1, Z: 2};

Gridifier.Api.Rotate.prototype.setCollectorInstance = function(collector) {
    this._collector = collector;
}

Gridifier.Api.Rotate.prototype._getRotateMatrix = function(rotateMatrixType) {
    if(rotateMatrixType == Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.X)
        return "1, 0, 0, ";
    else if(rotateMatrixType == Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.Y)
        return "0, 1, 0, ";
    else if(rotateMatrixType == Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.Z)
        return "0, 0, 1, ";
    else if(rotateMatrixType == Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.XY)
        return "1, 1, 0, ";
    else if(rotateMatrixType == Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.XZ)
        return "1, 0, 1, ";
    else if(rotateMatrixType == Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.YZ)
        return "0, 1, 1, ";
    else if(rotateMatrixType == Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.XYZ)
        return "1, 1, 1, ";

    throw new Error("Gridifier error: wrong rotate matrix type = " + rotateMatrixType);
}

Gridifier.Api.Rotate.prototype._getRotateFunction = function(rotateFunctionType) {
    if(rotateFunctionType == Gridifier.Api.Rotate.ROTATE_FUNCTION_TYPES.X)
        return "rotateX";
    else if(rotateFunctionType == Gridifier.Api.Rotate.ROTATE_FUNCTION_TYPES.Y)
        return "rotateY";
    else if(rotateFunctionType == Gridifier.Api.Rotate.ROTATE_FUNCTION_TYPES.Z)
        return "rotateZ";

    throw new Error("Gridifier error: wrong rotate function type = " + rotateFunctionType);
}

Gridifier.Api.Rotate.prototype.show3d = function(item, grid, rotateMatrixType, timeouter, left, top) {
    var rotateProp = "rotate3d";
    this._rotate(item, grid, rotateProp, false, timeouter, this._getRotateMatrix(rotateMatrixType), left, top);
}

Gridifier.Api.Rotate.prototype.hide3d = function(item, grid, rotateMatrixType, timeouter, left, top) {
    var rotateProp = "rotate3d";
    this._rotate(item, grid, rotateProp, true, timeouter, this._getRotateMatrix(rotateMatrixType), left, top);
}

Gridifier.Api.Rotate.prototype.show = function(item, grid, rotateFunctionType, timeouter, left, top) {
    var rotateProp = this._getRotateFunction(rotateFunctionType);
    this._rotate(item, grid, rotateProp, false, timeouter, "", left, top);
}

Gridifier.Api.Rotate.prototype.hide = function(item, grid, rotateFunctionType, timeouter, left, top) {
    var rotateProp = this._getRotateFunction(rotateFunctionType);
    this._rotate(item, grid, rotateProp, true, timeouter, "", left, top);
}

Gridifier.Api.Rotate.prototype._rotate = function(item, grid, rotateProp, inverseToggle, timeouter, rotateMatrix, left, top) {
    if(!inverseToggle) {
        var isShowing = true;
        var isHiding = false;
    }
    else {
        var isShowing = false;
        var isHiding = true;
    }

    var scene = this._createScene(item, grid, left, top);
    var frames = this._createFrames(scene);
    var itemClone = this._createItemClone(item);

    item.setAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING, "yes");
    item.setAttribute(Gridifier.Api.CoordsChanger.CSS3_TRANSLATE_3D_CLONES_RESTRICT_CLONE_SHOW_DATA_ATTR, "yes");
    var frontFrame = this._createFrontFrame(frames, rotateProp, rotateMatrix);
    var backFrame = this._createBackFrame(frames, rotateProp, rotateMatrix);

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
        Dom.css3.transformProperty(frontFrame, rotateProp, rotateMatrix + "180deg");
        Dom.css3.transformProperty(backFrame, rotateProp, rotateMatrix + "0deg");
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

Gridifier.Api.Rotate.prototype._createScene = function(item, grid, left, top) {
    var scene = document.createElement("div");
    Dom.css.set(scene, {
        width: this._sizesResolverManager.outerWidth(item) + "px",
        height: this._sizesResolverManager.outerHeight(item) + "px",
        position: "absolute",
        left: left,
        top: top
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
        width: this._sizesResolverManager.outerWidth(item) + "px",
        height: this._sizesResolverManager.outerHeight(item) + "px"
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

Gridifier.Api.Rotate.prototype._createFrontFrame = function(frames, rotateProp, rotateMatrix) {
    var frontFrame = document.createElement("div");
    this._addFrameCss(frontFrame);
    frames.appendChild(frontFrame);

    Dom.css.set(frontFrame, {zIndex: 2});
    Dom.css3.transitionProperty(frontFrame, Prefixer.getForCSS('transform', frontFrame) + " 0ms ease");
    Dom.css3.transformProperty(frontFrame, rotateProp, rotateMatrix + "0deg");

    return frontFrame;
}

Gridifier.Api.Rotate.prototype._createBackFrame = function(frames, rotateProp, rotateMatrix) {
    var backFrame = document.createElement("div");
    this._addFrameCss(backFrame);
    frames.appendChild(backFrame);

    Dom.css3.transitionProperty(backFrame, Prefixer.getForCSS('transform', backFrame) + " 0ms ease");
    Dom.css3.transformProperty(backFrame, rotateProp, rotateMatrix + "-180deg");

    return backFrame;
}