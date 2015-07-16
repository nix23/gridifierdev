Gridifier.ImagesResolver.ResolvedImage = function(imagesResolver, image) {
    var me = this;

    this._image = null;
    this._imagesResolver = null;

    this._resolvedImage = null;
    this._isResolved = false;

    this._loadCallback = null;
    this._errorCallback = null;

    this._construct = function() {
        me._image = image;
        me._imagesResolver = imagesResolver;
    }

    this._bindEvents = function () {
        me._loadCallback = function() { me._onLoad.call(me); };
        me._errorCallback = function() { me._onError.call(me); };

        Event.add(me._resolvedImage, "load", me._loadCallback);
        Event.add(me._resolvedImage, "error", me._errorCallback);
    }

    this._unbindEvents = function () {
        if(me._loadCallback != null)
            Event.remove(me._resolvedImage, "load", me._loadCallback);
        if(me._errorCallback != null)
            Event.remove(me._resolvedImage, "error", me._errorCallback);
    }

    this.destruct = function () {
        me._unbindEvents();
    }

    this._construct();
    return this;
}

Gridifier.ImagesResolver.ResolvedImage.prototype.scheduleResolve = function() {
    if(this._isAlreadyResolved()) {
        this._isResolved = true;
        this._imagesResolver.onResolve(this, this._image);
        return;
    }

    this._resolvedImage = new Image();
    this._bindEvents();
    this._resolvedImage.src = this._image.src;
}

Gridifier.ImagesResolver.ResolvedImage.prototype.isImageResolved = function() {
    return this._isResolved;
}

Gridifier.ImagesResolver.ResolvedImage.prototype._isAlreadyResolved = function() {
    return (this._image.complete && this._image.naturalWidth !== undefined
            && this._image.naturalWidth !== 0);
}

Gridifier.ImagesResolver.ResolvedImage.prototype._onLoad = function() {
    this._isResolved = true;
    this._imagesResolver.onResolve(this, this._image);
}

Gridifier.ImagesResolver.ResolvedImage.prototype._onError = function() {
    this._isResolved = true;
    this._imagesResolver.onResolve(this, this._image);
}