DiscretizerDebug = function() {
    this._debug = null;
    this._onClick = null;
}

proto(DiscretizerDebug, {
    create: function() {
        this._create();
        this._decorate();
        this._bindRmOnClick();
        this._createCells(discretizer.cells());
    },

    _create: function() {
        this._debug = Dom.div();
        grid.get().appendChild(this._debug);

        Dom.css.set(this._debug, {
            width: (grid.x2() + 1) + "px", height: (grid.y2() + 1) + "px",
            position: "absolute", left: "0px", top: "0px"
        });
    },

    _decorate: function() {
        Dom.css.set(this.debug, {
            background: "rgb(235,235,235)", zIndex: "100", opacity: "0.8"
        });
    },

    _bindRmOnClick: function() {
        var me = this;
        this._onClick = function() {
            Event.rm(me._debug, "click", me._onClick);
            me["rm"].call(me);
        }

        Event.add(this._debug, "click", this._onClick);
    },

    rm: function() {
        if(this._debug == null)
            return;

        this._debug.parentNode.removeChild(this._debug);
        this._debug = null;
    },

    update: function() {
        if(this._debug != null)
            this.rm.call(this);

        this.create();
    },

    _createCells: function(cells) {
        var colors = ["First", "Second", "Third", "Fourth", "Fifth"];
        var currColor = -1;

        for(var row = 0; row < cells.length; row++) {
            for(var col = 0; col < cells[row].length; col++) {
                var cell = Dom.div();
                var width = cells[row][col].x2 - cells[row][col].x1 + 1;
                var height = cells[row][col].y2 - cells[row][col].y1 + 1;

                currColor++;
                if(currColor == 5) {
                    colors.reverse();
                    currColor = 0;
                }
                Dom.set(cell, "class", "grid" + colors[currColor] + "BorderColor");

                Dom.css.set(cell, {
                    position: "absolute", boxSizing: "border-box",
                    left: cells[row][col].x1 + "px", top: cells[row][col].y1 + "px",
                    width: width + "px", height: height + "px", border: "5px dashed"
                });

                if(cells[row][col].isInt) {
                    cell.style.background = "red";
                    cell.style.opacity = 1;
                }

                this._debug.appendChild(cell);

                var centerPoint = Dom.div();
                Dom.css.set(centerPoint, {
                    position: "absolute",
                    left: cells[row][col].centerX + "px", top: cells[row][col].centerY + "px",
                    width: "5px", height: "5px", backround: "black"
                });

                this._debug.appendChild(centerPoint);
            }
        }
    }
});