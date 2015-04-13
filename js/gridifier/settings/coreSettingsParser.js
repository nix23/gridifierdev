Gridifier.CoreSettingsParser = function(settingsCore, settings) {
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

Gridifier.CoreSettingsParser.prototype.parseGridType = function() {
    if(!this._settings.hasOwnProperty("gridType")) {
        var gridType = Gridifier.GRID_TYPES.VERTICAL_GRID;
        return gridType;
    }

    if(this._settings.gridType != Gridifier.GRID_TYPES.VERTICAL_GRID
        && this._settings.gridType != Gridifier.GRID_TYPES.HORIZONTAL_GRID) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_GRID_TYPE,
            this._settings.gridType
        );
    }
    
    var gridType = this._settings.gridType;
    return gridType;
}

Gridifier.CoreSettingsParser.prototype.parsePrependType = function() {
    if(!this._settings.hasOwnProperty("prependType")) {
        var prependType = Gridifier.PREPEND_TYPES.DEFAULT_PREPEND;
        return prependType;
    }

    if(this._settings.prependType != Gridifier.PREPEND_TYPES.DEFAULT_PREPEND 
        && this._settings.prependType != Gridifier.PREPEND_TYPES.REVERSED_PREPEND 
        && this._settings.prependType != Gridifier.PREPEND_TYPES.MIRRORED_PREPEND) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_PREPEND_TYPE,
            this._settings.prependType
        );
    }
    
    var prependType = this._settings.prependType;
    return prependType;
}

Gridifier.CoreSettingsParser.prototype.parseAppendType = function() {
    if(!this._settings.hasOwnProperty("appendType")) {
        var appendType = Gridifier.APPEND_TYPES.DEFAULT_APPEND;
        return appendType;
    }

    if(this._settings.appendType != Gridifier.APPEND_TYPES.DEFAULT_APPEND
        && this._settings.appendType != Gridifier.APPEND_TYPES.REVERSED_APPEND) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_APPEND_TYPE,
            this._settings.appendType
        );
    }

    if(this._settingsCore.isHorizontalGrid())
        var appendType = this._settings.appendType;
    else if(this._settingsCore.isVerticalGrid()) {
        if(this._settings.appendType == Gridifier.APPEND_TYPES.DEFAULT_APPEND)
            appendType = Gridifier.APPEND_TYPES.REVERSED_APPEND;
        else if(this._settings.appendType == Gridifier.APPEND_TYPES.REVERSED_APPEND)
            appendType = Gridifier.APPEND_TYPES.DEFAULT_APPEND;
    }

    return appendType;
}

Gridifier.CoreSettingsParser.prototype.parseIntersectionStrategy = function() {
    if(!this._settings.hasOwnProperty("intersectionStrategy")
        && !this._settings.hasOwnProperty("alignmentType")) {
        var intersectionStrategy = Gridifier.INTERSECTION_STRATEGIES.DEFAULT;
        return intersectionStrategy;
    }

    if(this._settings.hasOwnProperty("intersectionStrategy")) {
        if(this._settings.intersectionStrategy != Gridifier.INTERSECTION_STRATEGIES.DEFAULT
            && this._settings.intersectionStrategy != Gridifier.INTERSECTION_STRATEGIES.NO_INTERSECTIONS) {
            new Gridifier.Error(
                Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_INTERSECTION_STRATEGY,
                this._settings.intersectionStrategy
            );
        }
    }

    if(this._settings.hasOwnProperty("intersectionStrategy"))
        var intersectionStrategy = this._settings.intersectionStrategy;
    else if(this._settings.hasOwnProperty("alignmentType"))
        var intersectionStrategy = Gridifier.INTERSECTION_STRATEGIES.NO_INTERSECTIONS;
    else
        var intersectionStrategy = Gridifier.INTERSECTION_STRATEGIES.DEFAULT;

    return intersectionStrategy;
}

Gridifier.CoreSettingsParser.prototype.parseIntersectionStrategyAlignmentType = function() {
    var alignmentTypes = Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES;

    if(!this._settings.hasOwnProperty("alignmentType")) {
        if(this._settingsCore.isVerticalGrid())
            var alignmentType = alignmentTypes.FOR_VERTICAL_GRID.TOP;
        else if(this._settingsCore.isHorizontalGrid()) 
            var alignmentType = alignmentTypes.FOR_HORIZONTAL_GRID.LEFT;
        
        return alignmentType;
    }

    this.ensureIsValidAlignmentType(this._settings.alignmentType);
    return this._settings.alignmentType;
}

Gridifier.CoreSettingsParser.prototype.ensureIsValidAlignmentType = function(alignmentType) {
    var alignmentTypes = Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES;

    if(this._settingsCore.isVerticalGrid()) {
        var validAlignmentTypes = [
            alignmentTypes.FOR_VERTICAL_GRID.TOP,
            alignmentTypes.FOR_VERTICAL_GRID.CENTER,
            alignmentTypes.FOR_VERTICAL_GRID.BOTTOM
        ];
    }
    else if(this._settingsCore.isHorizontalGrid()) {
        var validAlignmentTypes = [
            alignmentTypes.FOR_HORIZONTAL_GRID.LEFT,
            alignmentTypes.FOR_HORIZONTAL_GRID.CENTER,
            alignmentTypes.FOR_HORIZONTAL_GRID.RIGHT
        ];
    }

    var isValidAlignmentType = false;
    for(var i = 0; i < validAlignmentTypes.length; i++) {
        if(validAlignmentTypes[i] == alignmentType)
            return;
    }

    new Gridifier.Error(
        Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ALIGNMENT_TYPE,
        alignmentType
    );
}

Gridifier.CoreSettingsParser.prototype.parseSortDispersionMode = function() {
    if(!this._settings.hasOwnProperty("sortDispersionMode")) {
        var sortDispersionMode = Gridifier.SORT_DISPERSION_MODES.DISABLED;
        return sortDispersionMode;
    }

    if(this._settings.sortDispersionMode != Gridifier.SORT_DISPERSION_MODES.DISABLED 
        && this._settings.sortDispersionMode != Gridifier.SORT_DISPERSION_MODES.CUSTOM 
        && this._settings.sortDispersionMode != Gridifier.SORT_DISPERSION_MODES.CUSTOM_ALL_EMPTY_SPACE) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_SORT_DISPERSION_MODE,
            this._settings.sortDispersionMode
        );
    }

    var sortDispersionMode = this._settings.sortDispersionMode;
    return sortDispersionMode;
}

Gridifier.CoreSettingsParser.prototype.parseSortDispersionValue = function() {
    if(!this._settingsCore.isCustomSortDispersion())
        return "";

    if(!this._settings.hasOwnProperty("sortDispersionValue")) {
        new Gridifier.Error(Gridifier.Error.ERROR_TYPES.SETTINGS.MISSING_SORT_DISPERSION_VALUE);
    }

    var sortDispersionValueRegexp = new RegExp(/[\d]+(px)/);
    if(!sortDispersionValueRegexp.test(this._settings.sortDispersionValue)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_SORT_DISPERSION_VALUE,
            this._settings.sortDispersionValue
        );
    }

    var sortDispersionValue = this._settings.sortDispersionValue;
    return sortDispersionValue;
}

Gridifier.CoreSettingsParser.prototype.parseMaxInsertionRange = function() {
    if(!this._settings.hasOwnProperty("maxInsertionRange"))
        return Gridifier.VerticalGrid.ConnectorsCleaner.MAX_VALID_VERTICAL_DISTANCE.FROM_MOST_TOP_CONNECTOR;

    return this._settings.maxInsertionRange;
}

Gridifier.CoreSettingsParser.prototype.parseResizeTimeoutValue = function() {
    if(!this._settings.hasOwnProperty("resizeTimeout"))
        return null;

    return Dom.toInt(this._settings.resizeTimeout);
}

Gridifier.CoreSettingsParser.prototype.parseDisableItemHideOnGridAttachValue = function() {
    if(!this._settings.hasOwnProperty("disableItemHideOnGridAttach"))
        return false;

    return true;
}

Gridifier.CoreSettingsParser.prototype.parseToggleAnimationMsDuration = function() {
    if(!this._settings.hasOwnProperty("toggleAnimationMsDuration"))
        return Gridifier.DEFAULT_TOGGLE_ANIMATION_MS_DURATION;

    return this._settings.toggleAnimationMsDuration;
}

Gridifier.CoreSettingsParser.prototype.parseCoordsChangeAnimationMsDuration = function() {
    if(!this._settings.hasOwnProperty("coordsChangeAnimationMsDuration"))
        return Gridifier.DEFAULT_COORDS_CHANGE_ANIMATION_MS_DURATION;

    return this._settings.coordsChangeAnimationMsDuration;
}

Gridifier.CoreSettingsParser.prototype.parseToggleTransitionTiming = function() {
    if(!this._settings.hasOwnProperty("toggleTransitionTiming"))
        return Gridifier.DEFAULT_TOGGLE_TRANSITION_TIMING;

    return this._settings.toggleTransitionTiming;
}

Gridifier.CoreSettingsParser.prototype.parseCoordsChangeTransitionTiming = function() {
    if(!this._settings.hasOwnProperty("coordsChangeTransitionTiming"))
        return Gridifier.DEFAULT_COORDS_CHANGE_TRANSITION_TIMING;

    return this._settings.coordsChangeTransitionTiming;
}

Gridifier.CoreSettingsParser.prototype.parseRotatePerspective = function() {
    if(!this._settings.hasOwnProperty("rotatePerspective"))
        return Gridifier.DEFAULT_ROTATE_PERSPECTIVE;

    return this._settings.rotatePerspective;
}

Gridifier.CoreSettingsParser.prototype.parseRotateBackface = function() {
    if(!this._settings.hasOwnProperty("rotateBackface"))
        return Gridifier.DEFAULT_ROTATE_BACKFACE;

    return this._settings.rotateBackface;
}

Gridifier.CoreSettingsParser.prototype.parseRotateAngles = function() {
    if(!this._settings.hasOwnProperty("rotateAngles") ||
        !Dom.isArray(this._settings.rotateAngles)) {
        return [
            Gridifier.DEFAULT_ROTATE_ANGLES.FRONT_FRAME_INIT,
            Gridifier.DEFAULT_ROTATE_ANGLES.BACK_FRAME_INIT,
            Gridifier.DEFAULT_ROTATE_ANGLES.FRONT_FRAME_TARGET,
            Gridifier.DEFAULT_ROTATE_ANGLES.BACK_FRAME_TARGET
        ];
    }

    return this.parseRotateAnglesArray(this._settings.rotateAngles);
}

Gridifier.CoreSettingsParser.prototype.parseRotateAnglesArray = function(rotateAnglesArray) {
    return [
        (typeof rotateAnglesArray[0] != "undefined") ? rotateAnglesArray[0] : Gridifier.DEFAULT_ROTATE_ANGLES.FRONT_FRAME_INIT,
        (typeof rotateAnglesArray[1] != "undefined") ? rotateAnglesArray[1] : Gridifier.DEFAULT_ROTATE_ANGLES.BACK_FRAME_INIT,
        (typeof rotateAnglesArray[2] != "undefined") ? rotateAnglesArray[2] : Gridifier.DEFAULT_ROTATE_ANGLES.FRONT_FRAME_TARGET,
        (typeof rotateAnglesArray[3] != "undefined") ? rotateAnglesArray[3] : Gridifier.DEFAULT_ROTATE_ANGLES.BACK_FRAME_TARGET
    ];
}

Gridifier.CoreSettingsParser.prototype.parseGridTransformType = function() {
    if(!this._settings.hasOwnProperty("gridTransformType"))
        return Gridifier.GRID_TRANSFORM_TYPES.FIT;

    if(this._settings.gridTransformType == Gridifier.GRID_TRANSFORM_TYPES.EXPAND)
        return Gridifier.GRID_TRANSFORM_TYPES.EXPAND;
    else
        return Gridifier.GRID_TRANSFORM_TYPES.FIT;
}

Gridifier.CoreSettingsParser.prototype.parseGridTransformTimeout = function() {
    if(!this._settings.hasOwnProperty("gridTransformTimeout"))
        return Gridifier.DEFAULT_GRID_TRANSFORM_TIMEOUT;

    return this._settings.gridTransformTimeout;
}

Gridifier.CoreSettingsParser.prototype.parseRetransformQueueBatchSize = function() {
    if(!this._settings.hasOwnProperty("retransformQueueBatchSize"))
        return Gridifier.RETRANSFORM_QUEUE_DEFAULT_BATCH_SIZE;

    return this._settings.retransformQueueBatchSize;
}

Gridifier.CoreSettingsParser.prototype.parseRetransformQueueBatchTimeout = function() {
    if(!this._settings.hasOwnProperty("retransformQueueBatchTimeout"))
        return Gridifier.RETRANSFORM_QUEUE_DEFAULT_BATCH_TIMEOUT;

    return this._settings.retransformQueueBatchTimeout;
}

Gridifier.CoreSettingsParser.prototype.parseGridItemMarkingStrategy = function() {
    if(!this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS) 
        && !this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR)
        && !this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_QUERY)) {
        return {
            gridItemMarkingStrategyType: Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR,
            gridItemMarkingValue: Gridifier.GRID_ITEM_MARKING_DEFAULTS.DATA_ATTR
        };
    }

    if(this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS)) {
        return {
            gridItemMarkingStrategyType: Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS,
            gridItemMarkingValue: this._settings[Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS]
        };
    }
    else if(this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR)) {
        return {
            gridItemMarkingStrategyType: Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR,
            gridItemMarkingValue: this._settings[Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR]
        };
    }
    else if(this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_QUERY)) {
        return {
            gridItemMarkingStrategyType: Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_QUERY,
            gridItemMarkingValue: this._settings[Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_QUERY]
        };
    }
}

Gridifier.CoreSettingsParser.prototype.parseDragifierMode = function() {
    if(this._settings.hasOwnProperty("dragifierMode") &&
        (this._settings.dragifierMode == Gridifier.DRAGIFIER_MODES.INTERSECTION ||
         this._settings.dragifierMode == Gridifier.DRAGIFIER_MODES.DISCRETIZATION)) {
        if(this._settings.dragifierMode == Gridifier.DRAGIFIER_MODES.DISCRETIZATION) {
            if(this._settingsCore.isNoIntersectionsStrategy() || !this._settingsCore.isCustomAllEmptySpaceSortDispersion()) {
                new Gridifier.Error(
                    Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_DRAGIFIER_DISCRETIZATION_MODE
                );
            }
        }

        return this._settings.dragifierMode;
    }

    return Gridifier.DRAGIFIER_MODES.INTERSECTION;
}

Gridifier.CoreSettingsParser.prototype.parseDragifierSettings = function() {
    if(this._settings.hasOwnProperty("dragifier") && this._settings.dragifier) {
        var shouldEnableDragifierOnInit = true;

        if(typeof this._settings.dragifier == "boolean") {
            var dragifierItemSelector = false;
        }
        else {
            var dragifierItemSelector = this._settings.dragifier;
        }
        
        return {
            shouldEnableDragifierOnInit: shouldEnableDragifierOnInit,
            dragifierItemSelector: dragifierItemSelector
        };
    }

    var shouldEnableDragifierOnInit = false;
    var dragifierItemSelector = false;

    return {
        shouldEnableDragifierOnInit: shouldEnableDragifierOnInit,
        dragifierItemSelector: dragifierItemSelector
    };
}

Gridifier.CoreSettingsParser.prototype.parseDisableRetransformQueueOnDrags = function() {
    if(!this._settings.hasOwnProperty("disableRetransformQueueOnDrags")) {
        if(this._settingsCore.isIntersectionDragifierMode())
            return true;
        else if(this._settingsCore.isDiscretizationDragifierMode())
            return false;
    }

    return this._settings.disableRetransformQueueOnDrags;
}