Prefixer = {
    prefixes: ['Moz', 'Webkit', 'ms', 'Ms', 'Khtml', 'O'],

    init: function() {
        ;
    },

    get: function(propertyName, element) {
        element = element || document.documentElement;
        var style = element.style;

        if(typeof style[propertyName] === "string") {
            return propertyName;
        }

        var propertyName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
        for(var i = 0; i < this.prefixes.length; i++) {
            var prefixedPropertyName = this.prefixes[i] + propertyName;
            if(typeof style[prefixedPropertyName] === "string")
                return prefixedPropertyName;
        }
    },

    getForCSS: function(propertyName, element) {
        element = element || document.documentElement;
        var style = element.style;

        if(typeof style[propertyName] === "string") {
            return propertyName;
        }
        
        var originalPropertyName = propertyName;
        var propertyName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
        for(var i = 0; i < this.prefixes.length; i++) {
            var prefixedPropertyName = this.prefixes[i] + propertyName; 
            if(typeof style[prefixedPropertyName] === "string")
                return "-" + this.prefixes[i].toLowerCase() + "-" + originalPropertyName;
        }
    }
}