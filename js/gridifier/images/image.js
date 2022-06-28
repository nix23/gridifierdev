LoadedImage = function(image) {
    this._image = image;
    this._loadedImage = null;
    this._isLoaded = false;

    this._onLoad = null;
    this._onError = null;
}

proto(LoadedImage, {
    _bindEvents: function() {
        var me = this;
        me._onLoad = function() { me._load.call(me); };
        me._onError = function() { me._error.call(me); };

        Event.add(me._loadedImage, "load", me._onLoad);
        Event.add(me._loadedImage, "error", me._onError);
    },

    _unbindEvents: function() {
        var me = this;
        if(me._onLoad != null)
            Event.rm(me._loadedImage, "load", me._onLoad);
        if(me._onError != null)
            Event.rm(me._loadedImage, "error", me._onError);
    },

    destroy: function() {
        this._unbindEvents();
    },

    scheduleLoad: function() {
        if(this._isAlreadyLoaded()) {
            this._isLoaded = true;
            imagesLoader.onLoad(this._image);
            return;
        }

        this._loadedImage = this._loader();
        this._bindEvents();
        this._loadedImage.src = this._image.src;
    },

    _loader: function() {
        return new Image();
    },

    isLoaded: function() {
        return this._isLoaded;
    },

    _isAlreadyLoaded: function() {
        return (this._image.complete && this._image.naturalWidth !== undefined
                && this._image.naturalWidth !== 0);
    },

    _load: function() {
        this._isLoaded = true;
        imagesLoader.onLoad(this._image);
    },

    _error: function() {
        this._isLoaded = true;
        imagesLoader.onLoad(this._image);
    }
});