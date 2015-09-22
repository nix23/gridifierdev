var Operation = function() {
    this._last = null;
}

proto(Operation, {
    isInitial: function(current) {
        if(this._last == null) {
            this._last = current;
            return true;
        }

        return false;
    },

    isSameAsPrev: function(current) {
        if(this._last != current) {
            this._last = current;
            return false;
        }

        return true;
    },

    setLast: function(last) {
        this._last = last;
    }
});