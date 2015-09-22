var Prefixer = {
    _prefixes: ['Moz', 'Webkit', 'ms', 'Ms', 'Khtml', 'O'],

    _getter: function(propName, item, getterFn) {
        item = item || document.documentElement;
        var style = item.style;

        if(typeof style[propName] === "string") {
            return propName;
        }

        var originalPropName = propName;
        var propName = propName.charAt(0).toUpperCase() + propName.slice(1);
        for(var i = 0; i < this._prefixes.length; i++) {
            var prefixedPropName = this._prefixes[i] + propName;
            if(typeof style[prefixedPropName] === "string")
                return getterFn(prefixedPropName, originalPropName, i);
        }
    },

    get: function(propName, item) {
        return this._getter(propName, item, function(propName) { return propName; });
    },

    getForCss: function(propName, item) {
        var me = this;
        return this._getter(propName, item, function(propName, originalPropName, i) {
            return "-" + me._prefixes[i].toLowerCase() + "-" + originalPropName;
        });
    }
}