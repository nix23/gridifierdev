Gridifier.Settings = function(settings, gridifier, guid, eventEmitter, sizesResolverManager) {
    var me = this;

    this._settings = null;
    this._gridifier = null;
    this._guid = null;
    this._collector = null;
    this._eventEmitter = null;
    this._sizesResolverManager = null;

    this._coreSettingsParser = null;
    this._apiSettingsParser = null;

    this._gridType = null;

    this._prependType = null;
    this._appendType = null;

    this._intersectionStrategy = null;
    this._alignmentType = null;
    
    this._sortDispersionMode = null;
    this._sortDispersionValue = null;

    this._toggleApi = null;
    this._toggleTimeouterApi = null;
    this._sortApi = null;
    this._filterApi = null;
    this._coordsChangerApi = null;
    this._sizesChangerApi = null;
    this._dragifierApi = null;

    this._resizeTimeout = null;

    this._gridItemMarkingStrategyType = null;
    this._gridItemMarkingValue = null;

    this._dragifierMode = null;
    this._shouldEnableDragifierOnInit = false;
    this._dragifierItemSelector = null;

    this._shouldDisableItemHideOnGridAttach = false;
    this._toggleAnimationMsDuration = null;
    this._coordsChangeAnimationMsDuration = null;

    this._rotatePerspective = null;
    this._rotateBackface = null;

    this._gridTransformType = null;
    this._gridTransformTimeout = null;

    this._retransformQueueBatchSize = null;
    this._retransformQueueBatchTimeout = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._gridifier = gridifier;
        me._guid = guid;
        me._eventEmitter = eventEmitter;
        me._sizesResolverManager = sizesResolverManager;

        me._coreSettingsParser = new Gridifier.CoreSettingsParser(me, me._settings);
        me._apiSettingsParser = new Gridifier.ApiSettingsParser(me, me._settings);

        me._toggleApi = new Gridifier.Api.Toggle(me, me._gridifier,  me._eventEmitter, me._sizesResolverManager);
        me._toggleTimeouterApi = new Gridifier.Api.ToggleTimeouter();
        me._sortApi = new Gridifier.Api.Sort(me, me._eventEmitter);
        me._filterApi = new Gridifier.Api.Filter(me, me._eventEmitter);
        me._coordsChangerApi = new Gridifier.Api.CoordsChanger(me, me._gridifier, me._eventEmitter);
        me._sizesChangerApi = new Gridifier.Api.SizesChanger(me, me._eventEmitter);
        me._dragifierApi = new Gridifier.Api.Dragifier();

        me._parse();
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

Gridifier.Settings.prototype.setCollectorInstance = function(collector) {
    this._toggleApi.setCollectorInstance(collector);
    this._collector = collector;
}

Gridifier.Settings.prototype._parse = function() {
    this._gridType = this._coreSettingsParser.parseGridType();
    this._prependType = this._coreSettingsParser.parsePrependType();
    this._appendType = this._coreSettingsParser.parseAppendType();
    this._intersectionStrategy = this._coreSettingsParser.parseIntersectionStrategy();
    this._alignmentType = this._coreSettingsParser.parseIntersectionStrategyAlignmentType();
    this._sortDispersionMode = this._coreSettingsParser.parseSortDispersionMode();
    this._sortDispersionValue = this._coreSettingsParser.parseSortDispersionValue();

    this._resizeTimeout = this._coreSettingsParser.parseResizeTimeoutValue();
    this._shouldDisableItemHideOnGridAttach = this._coreSettingsParser.parseDisableItemHideOnGridAttachValue();
    this._toggleAnimationMsDuration = this._coreSettingsParser.parseToggleAnimationMsDuration();
    this._coordsChangeAnimationMsDuration = this._coreSettingsParser.parseCoordsChangeAnimationMsDuration();
    this._rotatePerspective = this._coreSettingsParser.parseRotatePerspective();
    this._rotateBackface = this._coreSettingsParser.parseRotateBackface();
    this._gridTransformType = this._coreSettingsParser.parseGridTransformType();
    this._gridTransformTimeout = this._coreSettingsParser.parseGridTransformTimeout();
    this._retransformQueueBatchSize = this._coreSettingsParser.parseRetransformQueueBatchSize();
    this._retransformQueueBatchTimeout = this._coreSettingsParser.parseRetransformQueueBatchTimeout();

    this._apiSettingsParser.parseToggleOptions(this._toggleApi);
    this._apiSettingsParser.parseSortOptions(this._sortApi);
    this._apiSettingsParser.parseFilterOptions(this._filterApi);
    this._apiSettingsParser.parseCoordsChangerOptions(this._coordsChangerApi);
    this._apiSettingsParser.parseSizesChangerOptions(this._sizesChangerApi);
    this._apiSettingsParser.parseDraggableItemDecoratorOptions(this._dragifierApi);

    var gridItemMarkingStrategyData = this._coreSettingsParser.parseGridItemMarkingStrategy();
    this._gridItemMarkingStrategyType = gridItemMarkingStrategyData.gridItemMarkingStrategyType;
    this._gridItemMarkingValue = gridItemMarkingStrategyData.gridItemMarkingValue;

    this._dragifierMode = this._coreSettingsParser.parseDragifierMode();
    var dragifierData = this._coreSettingsParser.parseDragifierSettings();
    this._shouldEnableDragifierOnInit = dragifierData.shouldEnableDragifierOnInit;
    this._dragifierItemSelector = dragifierData.dragifierItemSelector;
}

Gridifier.Settings.prototype.getCollector = function() {
    return this._collector;
}

Gridifier.Settings.prototype.getEventEmitter = function() {
    return this._eventEmitter;
}

Gridifier.Settings.prototype.getSizesResolverManager = function() {
    return this._sizesResolverManager;
}

Gridifier.Settings.prototype.getCoordsChangerApi = function() {
    return this._coordsChangerApi;
}

Gridifier.Settings.prototype.getResizeTimeout = function() {
    return this._resizeTimeout;
}

Gridifier.Settings.prototype.getToggleAnimationMsDuration = function() {
    return this._toggleAnimationMsDuration;
}

Gridifier.Settings.prototype.getCoordsChangeAnimationMsDuration = function() {
    return this._coordsChangeAnimationMsDuration;
}

Gridifier.Settings.prototype.setToggleAnimationMsDuration = function(animationMsDuration) {
    this._toggleAnimationMsDuration = animationMsDuration;
}

Gridifier.Settings.prototype.setCoordsChangeAnimationMsDuration = function(animationMsDuration) {
    this._coordsChangeAnimationMsDuration = animationMsDuration;
}

Gridifier.Settings.prototype.getRotatePerspective = function() {
    return this._rotatePerspective;
}

Gridifier.Settings.prototype.getRotateBackface = function() {
    return this._rotateBackface;
}

Gridifier.Settings.prototype.isExpandGridTransformType = function() {
    return this._gridTransformType == Gridifier.GRID_TRANSFORM_TYPES.EXPAND;
}

Gridifier.Settings.prototype.isFitGridTransformType = function() {
    return this._gridTransformType == Gridifier.GRID_TRANSFORM_TYPES.FIT;
}

Gridifier.Settings.prototype.getGridTransformTimeout = function() {
    return this._gridTransformTimeout;
}

Gridifier.Settings.prototype.getRetransformQueueBatchSize = function() {
    return this._retransformQueueBatchSize;
}

Gridifier.Settings.prototype.getRetransformQueueBatchTimeout = function() {
    return this._retransformQueueBatchTimeout;
}

Gridifier.Settings.prototype.getToggleTimeouter = function() {
    return this._toggleTimeouterApi;
}

Gridifier.Settings.prototype.getDraggableItemCoordsChanger = function() {
    return this._dragifierApi.getDraggableItemCoordsChanger();
}

Gridifier.Settings.prototype.getDraggableItemPointerDecorator = function() {
    return this._dragifierApi.getDraggableItemPointerDecorator();
}

Gridifier.Settings.prototype.getDragifierUserSelectToggler = function() {
    return this._dragifierApi.getDragifierUserSelectToggler();
}

Gridifier.Settings.prototype.isVerticalGrid = function() {
    return this._gridType == Gridifier.GRID_TYPES.VERTICAL_GRID;
}

Gridifier.Settings.prototype.isHorizontalGrid = function() {
    return this._gridType == Gridifier.GRID_TYPES.HORIZONTAL_GRID;
}

Gridifier.Settings.prototype.isDefaultPrepend = function() {
    return this._prependType == Gridifier.PREPEND_TYPES.DEFAULT_PREPEND;
}

Gridifier.Settings.prototype.isReversedPrepend = function() {
    return this._prependType == Gridifier.PREPEND_TYPES.REVERSED_PREPEND;
}

Gridifier.Settings.prototype.isMirroredPrepend = function() {
    return this._prependType == Gridifier.PREPEND_TYPES.MIRRORED_PREPEND;
}

Gridifier.Settings.prototype.isDefaultAppend = function() {
    return this._appendType == Gridifier.APPEND_TYPES.DEFAULT_APPEND;
}

Gridifier.Settings.prototype.isReversedAppend = function() {
    return this._appendType == Gridifier.APPEND_TYPES.REVERSED_APPEND;
}

Gridifier.Settings.prototype.isDefaultIntersectionStrategy = function() {
    return this._intersectionStrategy == Gridifier.INTERSECTION_STRATEGIES.DEFAULT;
}

Gridifier.Settings.prototype.isNoIntersectionsStrategy = function() {
    return this._intersectionStrategy == Gridifier.INTERSECTION_STRATEGIES.NO_INTERSECTIONS;
}

Gridifier.Settings.prototype.isVerticalGridTopAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_VERTICAL_GRID.TOP;
}

Gridifier.Settings.prototype.isVerticalGridCenterAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_VERTICAL_GRID.CENTER;
}

Gridifier.Settings.prototype.isVerticalGridBottomAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_VERTICAL_GRID.BOTTOM;
}

Gridifier.Settings.prototype.isHorizontalGridLeftAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_HORIZONTAL_GRID.LEFT;
}

Gridifier.Settings.prototype.isHorizontalGridCenterAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_HORIZONTAL_GRID.CENTER;
}

Gridifier.Settings.prototype.isHorizontalGridRightAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_HORIZONTAL_GRID.RIGHT;
}

Gridifier.Settings.prototype.isDisabledSortDispersion = function() {
    return this._sortDispersionMode == Gridifier.SORT_DISPERSION_MODES.DISABLED;
}

Gridifier.Settings.prototype.isCustomSortDispersion = function() {
    return this._sortDispersionMode == Gridifier.SORT_DISPERSION_MODES.CUSTOM;
}

Gridifier.Settings.prototype.isCustomAllEmptySpaceSortDispersion = function() {
    return this._sortDispersionMode == Gridifier.SORT_DISPERSION_MODES.CUSTOM_ALL_EMPTY_SPACE;
}

Gridifier.Settings.prototype.getSortDispersionValue = function() {
    return this._sortDispersionValue;
}

Gridifier.Settings.prototype.shouldDisableItemHideOnGridAttach = function() {
    return this._shouldDisableItemHideOnGridAttach;
}

Gridifier.Settings.prototype.setToggle = function(toggleFunctionName) {
    this._toggleApi.setToggleFunction(toggleFunctionName);
}

Gridifier.Settings.prototype.setFilter = function(filterFunctionName) {
    this._filterApi.setFilterFunction(filterFunctionName);
}

Gridifier.Settings.prototype.setSort = function(sortFunctionName) {
    this._sortApi.setSortFunction(sortFunctionName);
}

Gridifier.Settings.prototype.getToggle = function() {
    return this._toggleApi.getToggleFunction();
}

Gridifier.Settings.prototype.getSort = function() {
    return this._sortApi.getSortFunction();
}

Gridifier.Settings.prototype.getFilter = function() {
    return this._filterApi.getFilterFunction();
}

Gridifier.Settings.prototype.setCoordsChanger = function(coordsChangerFunctionName) {
    this._coordsChangerApi.setCoordsChangerFunction(coordsChangerFunctionName);
}

Gridifier.Settings.prototype.setSizesChanger = function(sizesChangerFunctionName) {
    this._sizesChangerApi.setSizesChangerFunction(sizesChangerFunctionName);
}

Gridifier.Settings.prototype.setDraggableItemDecorator = function(draggableItemDecoratorFunctionName) {
    this._dragifierApi.setDraggableItemDecoratorFunction(draggableItemDecoratorFunctionName);
}

Gridifier.Settings.prototype.getCoordsChanger = function() {
    return this._coordsChangerApi.getCoordsChangerFunction();
}

Gridifier.Settings.prototype.getSizesChanger = function() {
    return this._sizesChangerApi.getSizesChangerFunction();
}

Gridifier.Settings.prototype.getDraggableItemDecorator = function() {
    return this._dragifierApi.getDraggableItemDecoratorFunction();
}

Gridifier.Settings.prototype.isByClassGridItemMarkingStrategy = function() {
    return this._gridItemMarkingStrategyType == Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS;
}

Gridifier.Settings.prototype.isByDataAttrGridItemMarkingStrategy = function() {
    return this._gridItemMarkingStrategyType == Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR;
}

Gridifier.Settings.prototype.isByQueryGridItemMarkingStrategy = function() {
    return this._gridItemMarkingStrategyType == Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_QUERY;
}

Gridifier.Settings.prototype.getGridItemMarkingType = function() {
    return this._gridItemMarkingValue;
}

Gridifier.Settings.prototype.getGridItemMarkingValue = function() {
    return this._gridItemMarkingValue;
}

Gridifier.Settings.prototype.isIntersectionDragifierMode = function() {
    return this._dragifierMode == Gridifier.DRAGIFIER_MODES.INTERSECTION;
}

Gridifier.Settings.prototype.isDiscretizationDragifierMode = function() {
    return this._dragifierMode == Gridifier.DRAGIFIER_MODES.DISCRETIZATION;
}

Gridifier.Settings.prototype.shouldEnableDragifierOnInit = function() {
    return this._shouldEnableDragifierOnInit;
}

Gridifier.Settings.prototype.getDragifierItemSelector = function() {
    return this._dragifierItemSelector;
}