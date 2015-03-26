Gridifier.Dragifier.Renderer = function(settings, dragifierApi) {
    var me = this;

    this._settings = null;
    this._coordsChanger = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;

        me._setRenderFunction();
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

Gridifier.Dragifier.Renderer.prototype._setRenderFunction = function() {
    this._coordsChanger = this._settings.getDraggableItemCoordsChanger();
}

Gridifier.Dragifier.Renderer.prototype.render = function(item, newLeft, newTop) {
    this._coordsChanger(item, newLeft, newTop);
}