Gridifier.ApiSettingsParser = function(settingsCore, settings) {
    var me = this;

    this._settingsCore = null;
    this._settings = null;

    this._css = {
    };

    this._construct = function() {
        me._settingsCore = settingsCore;
        me._settings = settings;
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

Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER = "initial";

Gridifier.ApiSettingsParser.prototype.parseToggleOptions = function(toggleApi) {
    if(!this._settings.hasOwnProperty("toggle")) {
        toggleApi.setToggleFunction("scale");
        return;
    }

    if(typeof this._settings.toggle == "string" || this._settings.toggle instanceof String) {
        toggleApi.setToggleFunction(this._settings.toggle);
        return;
    }

    if(typeof this._settings.toggle != "object") {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_TOGGLE_PARAM_VALUE,
            this._settings.toggle
        );
    }

    for(var toggleFunctionName in this._settings.toggle) {
        if(toggleFunctionName == Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER) continue;
        var toggleFunctionsData = this._settings.toggle[toggleFunctionName];

        if(typeof toggleFunctionsData != "object"
            || typeof toggleFunctionsData.show == "undefined"
            || typeof toggleFunctionsData.hide == "undefined") {
            new Gridifier.Error(
                Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_TOGGLE_PARAMS,
                toggleFunctionsData
            );
        }

        toggleApi.addToggleFunction(toggleFunctionName, toggleFunctionsData);
    }

    if(this._settings.toggle.hasOwnProperty(Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER))
        toggleApi.setToggleFunction(this._settings.toggle[Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER]);
    else
        toggleApi.setToggleFunction("scale");
}

Gridifier.ApiSettingsParser.prototype.parseSortOptions = function(sortApi) {
    if(!this._settings.hasOwnProperty("sort")) {
        sortApi.setSortFunction("default");
        return;
    }

    if(typeof this._settings.sort == "string" || this._settings.sort instanceof String) {
        sortApi.setSortFunction(this._settings.sort);
        return;
    }
    else if(typeof this._settings.sort == "function") {
        sortApi.addSortFunction("clientDefault", this._settings.sort);
        sortApi.setSortFunction("clientDefault");
        return;
    }
    else if(typeof this._settings.sort == "object") {
        for(var sortFunctionName in this._settings.sort) {
            if(sortFunctionName == Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER) continue;
            var sortFunction = this._settings.sort[sortFunctionName];

            if(typeof sortFunction != "function") {
                new Gridifier.Error(
                    Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_SORT_FUNCTION_TYPES,
                    sortFunction
                );
            }
            
            sortApi.addSortFunction(sortFunctionName, sortFunction);
        }

        if(this._settings.sort.hasOwnProperty(Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER))
            sortApi.setSortFunction(this._settings.sort[Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER]);
        else
            sortApi.setSortFunction("default");
        return;
    }
    else {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_SORT_PARAM_VALUE,
            this._settings.sort
        );
    }
}

Gridifier.ApiSettingsParser.prototype.parseRetransformSortOptions = function(sortApi) {
    if(!this._settings.hasOwnProperty("retransformSort")) {
        sortApi.setRetransformSortFunction("default");
        return;
    }

    if(!this._settingsCore.isCustomAllEmptySpaceSortDispersion()) {
        var errorMsg = "Gridifier error: retransformSort option is supported only with ";
        errorMsg += "'customAllEmptySpace' sortDispersion param.";

        throw new Error(errorMsg);
    }

    if(typeof this._settings.retransformSort == "string" || this._settings.retransformSort instanceof String) {
        sortApi.setRetransformSortFunction(this._settings.retransformSort);
        return;
    }
    else if(typeof this._settings.retransformSort == "function") {
        sortApi.addRetransformSortFunction("clientDefault", this._settings.retransformSort);
        sortApi.setRetransformSortFunction("clientDefault");
        return;
    }
    else if(typeof this._settings.retransformSort == "object") {
        for(var sortFunctionName in this._settings.retransformSort) {
            if(sortFunctionName == Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER) continue;
            var sortFunction = this._settings.retransformSort[sortFunctionName];

            if(typeof sortFunction != "function") {
                new Gridifier.Error(
                    Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_RETRANSFORM_SORT_FUNCTION_TYPES,
                    sortFunction
                );
            }

            sortApi.addRetransformSortFunction(sortFunctionName, sortFunction);
        }

        if(this._settings.retransformSort.hasOwnProperty(Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER))
            sortApi.setRetransformSortFunction(this._settings.retransformSort[Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER]);
        else
            sortApi.setRetransformSortFunction("default");
        return;
    }
    else {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_RETRANSFORM_SORT_PARAM_VALUE,
            this._settings.retransformSort
        );
    }
}

Gridifier.ApiSettingsParser.prototype.parseFilterOptions = function(filterApi) {
    if(!this._settings.hasOwnProperty("filter")) {
        filterApi.setFilterFunction("all");
        return;
    }

    if(typeof this._settings.filter == "string" || this._settings.filter instanceof String
       || Dom.isArray(this._settings.filter)) {
        filterApi.setFilterFunction(this._settings.filter);
        return;
    }
    else if(typeof this._settings.filter == "function") {
        filterApi.addFilterFunction("clientDefault", this._settings.filter);
        filterApi.setFilterFunction("clientDefault");
        return;
    }
    else if(typeof this._settings.filter == "object") {
        for(var filterFunctionName in this._settings.filter) {
            if(filterFunctionName == Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER) continue;
            var filterFunction = this._settings.filter[filterFunctionName];

            if(typeof filterFunction != "function") {
                new Gridifier.Error(
                    Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_FILTER_FUNCTION_TYPES,
                    filterFunction
                );
            }

            filterApi.addFilterFunction(filterFunctionName, filterFunction);
        }

        if(this._settings.filter.hasOwnProperty(Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER))
            filterApi.setFilterFunction(this._settings.filter[Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER]);
        else
            filterApi.setFilterFunction("all");
        return;
    }
    else {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_FILTER_PARAM_VALUE,
            this._settings.filter
        );
    }
}

Gridifier.ApiSettingsParser.prototype.parseCoordsChangerOptions = function(coordsChangerApi) {
    if(!this._settings.hasOwnProperty("coordsChanger")) {
        coordsChangerApi.setCoordsChangerFunction("CSS3Translate3DWithRounding");
        return;
    }

    if(typeof this._settings.coordsChanger == "string" || this._settings.coordsChanger instanceof String) {
        coordsChangerApi.setCoordsChangerFunction(this._settings.coordsChanger);
        return;
    }
    else if(typeof this._settings.coordsChanger == "function") {
        coordsChangerApi.addCoordsChangerFunction("clientDefault", this._settings.coordsChanger);
        coordsChangerApi.setCoordsChangerFunction("clientDefault");
    }
    else if(typeof this._settings.coordsChanger == "object") {
        for(var coordsChangerFunctionName in this._settings.coordsChanger) {
            if(coordsChangerFunctionName == Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER) continue;
            var coordsChangerFunction = this._settings.coordsChanger[coordsChangerFunctionName];

            if(typeof coordsChangerFunction != "function") {
                new Gridifier.Error(
                    Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_COORDS_CHANGER_FUNCTION_TYPES,
                    coordsChangerFunction
                );
            }

            coordsChangerApi.addCoordsChangerFunction(coordsChangerFunctionName, coordsChangerFunction);
        }

        if(this._settings.coordsChanger.hasOwnProperty(Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER))
            coordsChangerApi.setCoordsChangerFunction(this._settings.coordsChanger[Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER]);
        else
            coordsChangerApi.setCoordsChangerFunction("CSS3Translate3DWithRounding");
    }
    else {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_COORDS_CHANGER_PARAM_VALUE,
            this._settings.coordsChanger
        );
    }
}

Gridifier.ApiSettingsParser.prototype.parseSizesChangerOptions = function(sizesChangerApi) {
    if(!this._settings.hasOwnProperty("sizesChanger")) {
        sizesChangerApi.setSizesChangerFunction("default");
        return;
    }

    if(typeof this._settings.sizesChanger == "string" || this._settings.sizesChanger instanceof String) {
        sizesChangerApi.setSizesChangerFunction(this._settings.sizesChanger);
        return;
    }
    else if(typeof this._settings.sizesChanger == "function") {
        sizesChangerApi.addSizesChangerFunction("clientDefault", this._settings.sizesChanger);
        sizesChangerApi.setSizesChangerFunction("clientDefault");
        return;
    }
    else if(typeof this._settings.sizesChanger == "object") {
        for(var sizesChangerFunctionName in this._settings.sizesChanger) {
            if(sizesChangerFunctionName == Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER) continue;
            var sizesChangerFunction = this._settings.sizesChanger[sizesChangerFunctionName];

            if(typeof sizesChangerFunction != "function") {
                new Gridifier.Error(
                    Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_SIZES_CHANGER_FUNCTION_TYPES,
                    sizesChangerFunction
                );
            }

            sizesChangerApi.addSizesChangerFunction(sizesChangerFunctionName, sizesChangerFunction);
        }

        if(this._settings.sizesChanger.hasOwnProperty(Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER))
            sizesChangerApi.setSizesChangerFunction(this._settings.sizesChanger[Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER]);
        else
            sizesChangerApi.setSizesChangerFunction("default");
        return;
    }
    else {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_SIZES_CHANGER_PARAM_VALUE,
            this._settings.sizesChanger
        );
    }
}

Gridifier.ApiSettingsParser.prototype.parseDraggableItemDecoratorOptions = function(dragifierApi) {
    if(!this._settings.hasOwnProperty("draggableItemDecorator")) {
        dragifierApi.setDraggableItemDecoratorFunction("cloneCSS");
        return;
    }

    if(typeof this._settings.draggableItemDecorator == "string" || this._settings.draggableItemDecorator instanceof String) {
        dragifierApi.setDraggableItemDecoratorFunction(this._settings.draggableItemDecorator);
        return;
    }
    else if(typeof this._settings.draggableItemDecorator == "function") {
        dragifierApi.addDraggableItemDecoratorFunction("clientDefault", this._settings.draggableItemDecorator);
        dragifierApi.setDraggableItemDecoratorFunction("clientDefault");
        return;
    }
    else if(typeof this._settings.draggableItemDecorator == "object") {
        for(var draggableItemDecoratorFunctionName in this._settings.draggableItemDecorator) {
            if(draggableItemDecoratorFunctionName == Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER) continue;
            var draggableItemDecoratorFunction = this._settings.draggableItemDecorator[draggableItemDecoratorFunctionName];

            if(typeof draggableItemDecoratorFunction != "function") {
                new Gridifier.Error(
                    Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_DRAGGABLE_ITEM_DECORATOR_FUNCTION_TYPES,
                    draggableItemDecoratorFunction
                );
            }

            dragifierApi.addDraggableItemDecoratorFunction(draggableItemDecoratorFunctionName, draggableItemDecoratorFunction);
        }

        if(this._settings.draggableItemDecorator.hasOwnProperty(Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER))
            dragifierApi.setDraggableItemDecoratorFunction(this._settings.draggableItemDecorator[Gridifier.ApiSettingsParser.INITIAL_SETTING_MARKER]);
        else
            dragifierApi.setDraggableItemDecoratorFunction("cloneCSS");
        return;
    }
    else {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_DRAGGABLE_ITEM_DECORATOR_PARAM_VALUE,
            this._settings.draggableItemDecorator
        );
    }
}