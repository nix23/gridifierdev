var Settings = function() {
    // You can replace default settings
    // or extend API settings here and then
    // build custom version of Gridifier.
    // Read more about custom builds at http://gridifier.io/essentials/install
    this._settings = {
        grid: "vertical",
        prepend: "mirrored",
        append: "default",
        intersections: true,
        align: "top",
        sortDispersion: false,
        class: "grid-item",
        data: false,
        query: false,
        loadImages: false,

        dragifier: false,
        dragifierMode: "i",
        dragifierClass: false,

        gridResize: "fit",
        gridResizeDelay: 100,

        toggleTime: 500,
        toggleTiming: "ease",
        coordsChangeTime: 300,
        coordsChangeTiming: "ease",

        rotatePerspective: "200px",
        rotateBackface: true,
        rotateAngles: [0, -180, 180, 0],

        widthPtAs: 0,
        widthPxAs: 0,
        heightPtAs: 0,
        heightPxAs: 0,

        repackSize: null,

        // Read about filters at http://gridifier.io/sortings/filters
        filter: {
            selected: "all",
            all: function(item) {
                return true;
            }
            // Define custom filters here
            // , custom: function(item) {
            //      return (someCond) ? true : false;
            // }
        },
        // Read about sorts at http://gridifier.io/sortings/sorts
        sort: {
            selected: "default",
            "default": function(first, second, sort, dom) {
                var sortAttr = "data-gridifier-orig-sort-index";
                return dom.int(dom.get(first, sortAttr)) - dom.int(dom.get(second, sortAttr));
            }
            // Define custom sorts here
            // , customSort: function(first, second, sort) {
            //       // return sort comparator result here
            //       // never return 0 from this function(sorts are unstable in most browsers)
            //   }
        },
        // Read about togglers at http://gridifier.io/api/togglers
        toggle: {
            selected: "scale"
            // To write custom toggler some additional info is required.
            // So, we will write separate chapter about it later.
        },
        drag: {
            selected: "cloneCSS",
            cloneCSS: function(itemClone, item, srManager) {
                srManager.copyComputedStyle(item, itemClone);
            }
        },
        // Read about retransform sorts at http://gridifier.io/sortings/retransform-sorts
        rsort: {
            selected: "default",
            "default": function(connections) {
                return connections;
            }
            // , customRsort: function(connections) {
            //       // Sort connections here. Each connections
            //       // array entry has x1, y1, x2, y2 coords available.
            //       return connections;
            //   }
        },
        coordsChanger: {
            selected: "translate3dInt"
        },

        insertRange: 3000,
        resizeDelay: null,

        queueSize: 12,
        queueDelay: 25,
        disableQueueOnDrags: true
    }

    var settings = (typeof sourceSettings != "undefined") ? sourceSettings : {};
    this._parse(settings);
}

proto(Settings, {
    _parse: function(settings) {
        this._parseCoreSettings(settings);
        this._adjustCoreSettings(settings);
        this._parseApiSettings(settings);
    },

    _parseCoreSettings: function(settings) {
        if(Dom.hasAnyProp(settings, ["class", "data", "query"]))
            this._set([["class", false], ["data", false], ["query", false]]);

        for(var name in settings) {
            var val = settings[name];
            var eventReg = /^on(.*)$/;

            if(Dom.hasOwnProp(this._settings, name) && !this._isApiSetting(name))
                this._set(name, val);
            else if(eventReg.test(name))
                gridifier[name](val);
        }
    },

    _adjustCoreSettings: function(settings) {
        if(this.eq("grid", "horizontal") && this.eq("intersections", false)
            && !Dom.hasOwnProp(settings, "align"))
            this.set("align", "left");

        if(Dom.hasOwnProp(settings, "align"))
            this.set("intersections", false);

        if(Dom.hasOwnProp("dragifier")) {
            if((typeof this.get("dragifier") == "string" || this.get("dragifier") instanceof String)) {
                this.set("dragifierClass", this.get("dragifier"));
                this.set("dragifier", true);
            }
        }

        if(this.eq("dragifierMode", "d")) {
            this.set("intersections", true);
            this.set("sortDispersion", true);
            if(!Dom.hasOwnProp(settings, "disableQueueOnDrags"))
                this.set("disableQueueOnDrags", false);
        }
    },

    _parseApiSettings: function(settings) {
        for(var name in settings) {
            var val = settings[name];

            if(this._isApiSetting(name))
                this._parseApiSetting(name, val);
        }
    },

    _isApiSetting: function(name) {
        for(var as in AS) {
            if(AS[as] == name)
                return true;
        }

        return false;
    },

    _parseApiSetting: function(name, val) {
        if(typeof val == "string" || val instanceof String ||
            (name == AS.FILTER && Dom.isArray(val))) {
            this._settings[name].selected = val;
        }
        else if(typeof val == "function") {
            this._settings[name].userfn = val;
            this._settings[name].selected = "userfn";
        }
        else if(typeof val == "object") {
            for(var fnName in val) {
                if(fnName == "selected") continue;
                var fn = val[fnName];

                this._settings[name][fnName] = fn;
            }

            if(Dom.hasOwnProp(val, "selected"))
                this._settings[name].selected = val.selected;
        }
    },

    get: function(name) {
        this._check(name, "get");
        return this._settings[name];
    },

    set: function(name, val) {
        if(!Dom.isArray(val)) {
            this._check(name, "set");
            this._settings[name] = val;
            ev.emitInternal(INT_EV.SET_SETTING_FOR_NZER, name);
            return;
        }

        for(var i = 0; i < name.length; i++) {
            this._check(name, "set");
            this._settings[name[i][0]] = name[i][1];
            ev.emitInternal(INT_EV.SET_SETTING_FOR_NZER, name[i][0]);
        }
    },

    getApi: function(name) {
        this._check(name, "getApi");
        var apiObj = this.get(name);
        var throwErr = function(fnName) {
            err("getApi('" + name + "') -> " + fnName + " fn not found");
        }

        if(name != AS.FILTER) {
            if(!Dom.hasOwnProp(apiObj, apiObj.selected))
                throwErr(apiObj.selected);
            return apiObj[apiObj.selected];
        }

        var selFilters = apiObj.selected;
        if(!Dom.isArray(selFilters)) selFilters = [selFilters];
        var fns = [];
        for(var i = 0; i < selFilters.length; i++) {
            if(!Dom.hasOwnProp(apiObj, selFilters[i]))
                throwErr(selFilters[i]);
            fns.push(apiObj[selFilters[i]]);
        }

        return fns;
    },

    setApi: function(name, fnName) {
        this._check(name, "setApi");
        this.get(name).selected = fnName;

        if(name == AS.RSORT)
            ev.emitInternal(INT_EV.RSORT_CHANGE);
    },

    addApi: function(name, fnName, fn) {
        this._check(name, "addApi");
        this.get(name)[fnName] = fn;
    },

    eq: function(name, val) {
        this._check(name, "eq");
        return this._settings[name] == val;
    },

    notEq: function(name, val) {
        return !this.eq(name, val);
    },

    _check: function(name, fnName) {
        if(!Dom.hasOwnProp(this._settings, name))
           err("No setting '" + name + "' to " + fnName);
    }
});