Gridifier.Normalizer = function() {
    // @todo -> Make option to disable/enable this option, and write docs about it.
    // (How it works, and why it can be disabled on px-valued items)
    this._roundingNormalizationValue = 2;

    this._css = {
    };

    this._construct = function() {
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

Gridifier.Normalizer.prototype.normalizeLowRounding = function(valueToNormalize) {
    return valueToNormalize - this._roundingNormalizationValue;
}

Gridifier.Normalizer.prototype.normalizeHighRounding = function(valueToNormalize) {
    return valueToNormalize + this._roundingNormalizationValue;
}