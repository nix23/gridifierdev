Gridifier.Normalizer = function() {
    // @todo -> Make option to disable/enable this option, and write docs about it.
    // (How it works, and why it can be disabled on px-valued items)
    // this._roundingNormalizationValue = 2; // @todo -> Looks like without Math.floor in SR 1 pixel is enough(Per IE)
    this._roundingNormalizationValue = 1;

    // This is required per FF responsive grids support.
    // (To not overflow right grid corner)
    this._renderNormalizationValue = 0.01;

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

Gridifier.Normalizer.prototype.normalizeFractionalValueForRender = function(valueToNormalize) {
    return valueToNormalize - this._renderNormalizationValue;
}

Gridifier.Normalizer.prototype.unnormalizeFractionalValueForRender = function(valueToUnnormalize) {
    return valueToUnnormalize + this._renderNormalizationValue;
}