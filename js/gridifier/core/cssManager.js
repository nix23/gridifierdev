var CssManager = function() {
    this._eventsData = [];

    var publicFns = ["toggle", "add", "remove"];
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
            var addClass = function(i, c) { added.push(c); Dom.css.addClass(i, c); };
            var rmClass = function(i, c) { removed.push(c); Dom.css.removeClass(i, c); };

            for(var j = 0; j < classes.length; j++) {
                if(type == "toggle") {
                    if(Dom.css.hasClass(items[i], classes[j]))
                        rmClass(items[i], classes[j]);
                    else
                        addClass(items[i], classes[j]);
                }
                else if(type == "add") {
                    if(!Dom.css.hasClass(items[i], classes[j]))
                        addClass(items[i], classes[j]);
                }
                else if(type == "rm") {
                    if(Dom.css.hasClass(items[i], classes[j]))
                        rmClass(items[i], classes[j]);
                }
            }

            this._saveEventData(items[i], added, removed);
        }

        return items;
    },

    _saveEventData: function(item, added, removed) {
        var itemGUID = guid.get(item);
        var itemEventData = null;

        for(var i = 0; i < this._eventsData.length; i++) {
            if(this._eventsData[i].itemGUID == itemGUID) {
                itemEventData = this._eventsData[i];
                break;
            }
        }

        if(itemEventData == null) {
            itemEventData = {};
            this._eventsData.push(itemEventData);
        }

        itemEventData.itemGUID = itemGUID;
        itemEventData.added = added;
        itemEventData.removed = removed;
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
                            event.emit(EV.CSS_CHANGE, item, added, removed);
                        }, settings.get("coordsChangeTime"));
                    })(cns[i].item, ed.added, ed.removed);

                    this._eventsData.splice(j, 1);
                    break;
                }
            }
        }
    }
});