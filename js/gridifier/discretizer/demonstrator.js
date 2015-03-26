Gridifier.Discretizer.Demonstrator = function(gridifier, settings) {
    var me = this;

    this._gridifier = null;
    this._settings = null;

    this._demonstrator = null;
    this._demonstratorClickHandler = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;

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

Gridifier.Discretizer.Demonstrator.prototype.create = function(cells) {
    this._createDemonstrator();
    this._decorateDemonstrator();
    this._bindDemonstratorDeleteOnClick();
    this._createCells(cells);
}

Gridifier.Discretizer.Demonstrator.prototype._createDemonstrator = function() {
    this._demonstrator = document.createElement("div");
    this._gridifier.getGrid().appendChild(this._demonstrator);

    Dom.css.set(this._demonstrator, {
        width: (this._gridifier.getGridX2() + 1) + "px",
        height: (this._gridifier.getGridY2() + 1) + "px",
        position: "absolute",
        left: "0px",
        top: "0px"
    });
}

Gridifier.Discretizer.Demonstrator.prototype._decorateDemonstrator = function() {
    Dom.css.set(this._demonstrator, {
        background: "rgb(235,235,235)",
        zIndex: "100",
        opacity: "0.8"
    });
}

Gridifier.Discretizer.Demonstrator.prototype._bindDemonstratorDeleteOnClick = function() {
    var me = this;
    this._demonstratorClickHandler = function() {
        Event.remove(me._demonstrator, "click", me._demonstratorClickHandler);
        me["delete"].call(me);
    };

    Event.add(this._demonstrator, "click", this._demonstratorClickHandler);
}

Gridifier.Discretizer.Demonstrator.prototype.update = function(cells) {
    if(this._demonstrator != null)
        this["delete"].call(this);

    this.create(cells);
}

Gridifier.Discretizer.Demonstrator.prototype["delete"] = function() {
    if(this._demonstrator == null)
        return;
    
    this._demonstrator.parentNode.removeChild(this._demonstrator);
    this._demonstrator = null;
}

Gridifier.Discretizer.Demonstrator.prototype._createCells = function(cells) {
    var borderColors = ["gridFirstBorderColor", "gridSecondBorderColor", "gridThirdBorderColor",
                        "gridFourthBorderColor", "gridFifthBorderColor"];
    var currentBorderColor = -1;

    for(var row = 0; row < cells.length; row++) {
        for(var col = 0; col < cells[row].length; col++) {
            var cellDemonstrator = document.createElement("div");
            var cellWidth = cells[row][col].x2 - cells[row][col].x1 + 1;
            var cellHeight = cells[row][col].y2 - cells[row][col].y1 + 1;

            currentBorderColor++;
            if(currentBorderColor == 5) {
                borderColors.reverse();
                currentBorderColor = 0;
            }
            cellDemonstrator.setAttribute("class", borderColors[currentBorderColor]);

            Dom.css.set(cellDemonstrator, {
                position: "absolute",
                boxSizing: "border-box",
                left: cells[row][col].x1 + "px",
                top: cells[row][col].y1 + "px",
                width: cellWidth + "px",
                height: cellHeight + "px",
                border: "5px dashed"
            });

            if(cells[row][col][Gridifier.Discretizer.IS_INTERSECTED_BY_ITEM]) {
                cellDemonstrator.style.background = "red";
                cellDemonstrator.style.opacity = "1";
            }

            this._demonstrator.appendChild(cellDemonstrator);

            var centerPointDemonstrator = document.createElement("div");
            Dom.css.set(centerPointDemonstrator, {
                position: "absolute",
                left: cells[row][col][Gridifier.Discretizer.CELL_CENTER_X] + "px",
                top: cells[row][col][Gridifier.Discretizer.CELL_CENTER_Y] + "px",
                width: "5px",
                height: "5px",
                background: "black"
            });

            this._demonstrator.appendChild(centerPointDemonstrator);
        }
    }
}