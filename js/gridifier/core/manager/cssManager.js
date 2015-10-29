var CssManager = function() {
    this._eventsData = [];

    var publicFns = ["toggle", "add", "rm"];
    for(var i = 0; i < publicFns.length; i++) {
        (function(c, fnName) {
            var fns = {};
            fns[fnName + "Css"] = function(i, cl) {
                var items = this.changeCss(fnName, i, cl);
                antialiaser.updateAs();
                reposition.fromFirstSortedCn(items);

                return gridifier;
            }
            self(c, fns);
        })(this, publicFns[i]);
    }
}

proto(CssManager, {
    changeCss: function(type, items, classes) {
        var items = gridItem.filterConnected(gridItem.toNative(items));
        var classes = (Dom.isArray(classes)) ? classes : [classes];

        for(var i = 0; i < items.length; i++) {
            var added = [];
            var removed = [];
            // If app will call add/rm N-times in a row, ev should contain classname
            var addClass = function(i, c) {
                added.push(c);
                if(!Dom.css.hasClass(i, c)) Dom.css.addClass(i, c);
            };
            var rmClass = function(i, c) {
                removed.push(c);
                if(Dom.css.hasClass(i, c)) Dom.css.removeClass(i, c);
            };

            for(var j = 0; j < classes.length; j++) {
                if(type == "toggle") {
                    if(Dom.css.hasClass(items[i], classes[j]))
                        rmClass(items[i], classes[j]);
                    else
                        addClass(items[i], classes[j]);
                }
                else if(type == "add")
                    addClass(items[i], classes[j]);
                else if(type == "rm")
                    rmClass(items[i], classes[j]);
            }

            this._saveEventData(items[i], added, removed);
        }

        return items;
    },

    _saveEventData: function(item, added, removed) {
        var itemGUID = guid.get(item);
        var eventData = null;

        for(var i = 0; i < this._eventsData.length; i++) {
            if(this._eventsData[i].itemGUID == itemGUID) {
                eventData = this._eventsData[i];
                break;
            }
        }

        if(eventData == null) {
            eventData = {};
            this._eventsData.push(eventData);
        }

        eventData.itemGUID = itemGUID;
        eventData.added = added;
        eventData.removed = removed;
    },

    emitEvents: function(cns) {
        if(this._eventsData.length == 0)
            return;

        for(var i = 0; i < cns.length; i++) {
            for(var j = 0; j < this._eventsData.length; j++) {
                if(Dom.int(cns[i].itemGUID) == this._eventsData[j].itemGUID) {
                    var ed = this._eventsData[j];

                    (function(item, added, removed) {
                        setTimeout(function() {
                            ev.emit(EV.CSS_CHANGE, item, added, removed);
                        }, settings.get("coordsChangeTime"));
                    })(cns[i].item, ed.added, ed.removed);

                    this._eventsData.splice(j, 1);
                    break;
                }
            }
        }
    }
});