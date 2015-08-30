Gridifier.TransformerOperations.Transform = function(sizesTransformer,
                                                     sizesResolverManager) {
    var me = this;

    this._sizesTransformer = null;
    this._sizesResolverManager = null;

    this._css = {
    };

    this._construct = function() {
        me._sizesTransformer = sizesTransformer;
        me._sizesResolverManager = sizesResolverManager;
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

Gridifier.TransformerOperations.Transform.prototype.executeRetransformAllSizes = function() {
    /* @system-log-start */
    Logger.startLoggingOperation(
        Logger.OPERATION_TYPES.TRANSFORM_SIZES,
        "retransformAllSizes"
    );
    /* @system-log-end */
    this._sizesResolverManager.startCachingTransaction();
    this._sizesTransformer.retransformAllConnections();
    this._sizesResolverManager.stopCachingTransaction();
}

Gridifier.TransformerOperations.Transform.prototype.executeRetransformFromFirstSortedConnection = function(items) {
    /* @system-log-start */
    Logger.startLoggingOperation(
        Logger.OPERATION_TYPES.TRANSFORM_SIZES,
        "retransformFromFirstSortedConnection"
    );
    /* @system-log-end */
    this._sizesResolverManager.startCachingTransaction();
    this._sizesTransformer.retransformFromFirstSortedConnection(items);
    this._sizesResolverManager.stopCachingTransaction();
}