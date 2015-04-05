Gridifier.Api.Sort = function(settings, eventEmitter) {
    var me = this;

    this._settings = null;
    this._eventEmitter = null;

    this._sortComparatorTools = null;

    this._sortFunction = null;
    this._sortFunctions = {};

    this._retransformSortFunction = null;
    this._retransformSortFunctions = {};

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._eventEmitter = eventEmitter;

        me._sortFunctions = {};

        me._addDefaultSort();
        me._addDefaultRetransformSort();
        me._addBySizesRetransformSort();
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

Gridifier.Api.Sort.prototype.getSortComparatorTools = function() {
    if(this._sortComparatorTools == null) {
        var applyReplacers = function(value, replacers) {
            for(var i = 0; i < replacers.length; i++)
                value = value.replace(replacers[i][0], replacers[i][1]);

            return value;
        }

        this._sortComparatorTools = {
            comparatorFns: {
                byData: function(item, comparatorParam, replacers) {
                    var value = item.getAttribute(comparatorParam);
                    return (!replacers) ? value : applyReplacers(value, replacers);
                },
                byDataInt: function(item, comparatorParam, replacers) {
                    var value = item.getAttribute(comparatorParam);
                    return (!replacers) ? Dom.toInt(value) : Dom.toInt(applyReplacers(value, replacers));
                },
                byDataFloat: function(item, comparatorParam, replacers) {
                    var value = item.getAttribute(comparatorParam);
                    return (!replacers) ? parseFloat(value) : parseFloat(applyReplacers(value, replacers));
                },
                byContent: function(item, comparatorParam, replacers) {
                    var value = item.innerHTML;
                    return (!replacers) ? value : applyReplacers(value, replacers);
                },
                byContentInt: function(item, comparatorParam, replacers) {
                    var value = item.innerHTML;
                    return (!replacers) ? Dom.toInt(value) : Dom.toInt(applyReplacers(value, replacers));
                },
                byContentFloat: function(item, comparatorParam, replacers) {
                    var value = item.innerHTML;
                    return (!replacers) ? parseFloat(value) : parseFloat(applyReplacers(value, replacers));
                },
                byQuery: function(item, comparatorParam, replacers) {
                    var value = Dom.get.byQuery(item, comparatorParam)[0].innerHTML;
                    return (!replacers) ? value : applyReplacers(value, replacers);
                },
                byQueryInt: function(item, comparatorParam, replacers) {
                    var value = Dom.get.byQuery(item, comparatorParam)[0].innerHTML;
                    return (!replacers) ? Dom.toInt(value) : Dom.toInt(applyReplacers(value, replacers));
                },
                byQueryFloat: function(item, comparatorParam, replacers) {
                    var value = Dom.get.byQuery(item, comparatorParam)[0].innerHTML;
                    return (!replacers) ? parseFloat(value) : parseFloat(applyReplacers(value, replacers));
                }
            },

            saveOriginalOrder: function(items) {
                for(var i = 0; i < items.length; i++) {
                    items[i].setAttribute(Gridifier.Collector.ITEM_SORTING_INDEX_DATA_ATTR, i + 1);
                }
            },

            flushOriginalOrder: function(items) {
                for(var i = 0; i < items.length; i++) {
                    items[i].removeAttribute(Gridifier.Collector.ITEM_SORTING_INDEX_DATA_ATTR);
                }
            },

            byOriginalPos: function(firstItem, secondItem) {
                var firstItemOriginalPos = firstItem.getAttribute(Gridifier.Collector.ITEM_SORTING_INDEX_DATA_ATTR);
                var secondItemOriginalPos = secondItem.getAttribute(Gridifier.Collector.ITEM_SORTING_INDEX_DATA_ATTR);

                if(Dom.toInt(firstItemOriginalPos) > Dom.toInt(secondItemOriginalPos))
                    return 1;
                else if(Dom.toInt(firstItemOriginalPos) < Dom.toInt(secondItemOriginalPos))
                    return -1;
            },

            byComparator: function(firstItemComparator, secondItemComparator, reverseOrder) {
                var orderReverser = (reverseOrder) ? -1 : 1;

                if(firstItemComparator > secondItemComparator)
                    return 1 * orderReverser;
                else if(firstItemComparator < secondItemComparator)
                    return -1 * orderReverser;

                return 0;
            },

            byMultipleComparators: function(firstItem, secondItem, comparators, reverseOrder) {
                for(var i = 0; i < comparators.length; i++) {
                    var result = this.byComparator(
                        comparators[i].forFirstItem, comparators[i].forSecondItem, reverseOrder
                    );
                    if(result == 0) {
                        if(i == comparators.length - 1)
                            return this.byOriginalPos(firstItem, secondItem);

                        continue;
                    }

                    return result;
                }
            },

            buildComparators: function(firstItem,
                                       secondItem,
                                       comparatorGetterFn,
                                       comparatorParam,
                                       comparatorParamReplacers) {
                if(typeof comparatorParam == "undefined")
                    throw new Error("Gridifier error: sort comparator param is undefined.");

                if(!Dom.isArray(comparatorParam))
                    var comparatorParams = [comparatorParam];
                else
                    var comparatorParams = comparatorParam;

                var comparators = [];
                for(var i = 0; i < comparatorParams.length; i++) {
                    comparators.push({
                        forFirstItem: comparatorGetterFn(
                            firstItem, comparatorParams[i], comparatorParamReplacers
                        ),
                        forSecondItem: comparatorGetterFn(
                            secondItem, comparatorParams[i], comparatorParamReplacers
                        )
                    });
                }

                return comparators;
            },

            sortBy: function(firstItem,
                             secondItem,
                             comparatorGetterFn,
                             comparatorParam,
                             reverseOrder,
                             comparatorParamReplacers) {
                return this.byMultipleComparators(
                    firstItem,
                    secondItem,
                    this.buildComparators(
                        firstItem,
                        secondItem,
                        comparatorGetterFn,
                        comparatorParam,
                        comparatorParamReplacers || false
                    ),
                    reverseOrder || false
                );
            },

            byData: function(firstItem, secondItem, dataAttr, reverseOrder, replacers) {
                return this.sortBy(firstItem, secondItem, this.comparatorFns.byData, dataAttr, reverseOrder, replacers);
            },

            byDataInt: function(firstItem, secondItem, dataAttr, reverseOrder, replacers) {
                return this.sortBy(firstItem, secondItem, this.comparatorFns.byDataInt, dataAttr, reverseOrder, replacers);
            },

            byDataFloat: function(firstItem, secondItem, dataAttr, reverseOrder, replacers) {
                return this.sortBy(firstItem, secondItem, this.comparatorFns.byDataFloat, dataAttr, reverseOrder, replacers);
            },

            byContent: function(firstItem, secondItem, reverseOrder, replacers) {
                return this.sortBy(firstItem, secondItem, this.comparatorFns.byContent, null, reverseOrder, replacers);
            },

            byContentInt: function(firstItem, secondItem, reverseOrder, replacers) {
                return this.sortBy(firstItem, secondItem, this.comparatorFns.byContentInt, null, reverseOrder, replacers);
            },

            byContentFloat: function(firstItem, secondItem, reverseOrder, replacers) {
                return this.sortBy(firstItem, secondItem, this.comparatorFns.byContentFloat, null, reverseOrder, replacers);
            },

            byQuery: function(firstItem, secondItem, selector, reverseOrder, replacers) {
                return this.sortBy(firstItem, secondItem, this.comparatorFns.byQuery, selector, reverseOrder, replacers);
            },

            byQueryInt: function(firstItem, secondItem, selector, reverseOrder, replacers) {
                return this.sortBy(firstItem, secondItem, this.comparatorFns.byQueryInt, selector, reverseOrder, replacers);
            },

            byQueryFloat: function(firstItem, secondItem, selector, reverseOrder, replacers) {
                return this.sortBy(firstItem, secondItem, this.comparatorFns.byQueryFloat, selector, reverseOrder, replacers);
            }
        };
    }

    return this._sortComparatorTools;
}

Gridifier.Api.Sort.prototype.setSortFunction = function(sortFunctionName) {
    if(!this._sortFunctions.hasOwnProperty(sortFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_SORT_INVALID_PARAM,
            sortFunctionName
        );
        return;
    }

    this._sortFunction = this._sortFunctions[sortFunctionName];
}

Gridifier.Api.Sort.prototype.addSortFunction = function(sortFunctionName, sortFunction) {
    this._sortFunctions[sortFunctionName] = sortFunction;
}

Gridifier.Api.Sort.prototype.getSortFunction = function() {
    return this._sortFunction;
}

Gridifier.Api.Sort.prototype._addDefaultSort = function() {
    this._sortFunctions["default"] = function(firstItem, secondItem) {
        var firstItemSortNumber = firstItem.getAttribute(Gridifier.Collector.ITEM_SORTING_INDEX_DATA_ATTR);
        var secondItemSortNumber = secondItem.getAttribute(Gridifier.Collector.ITEM_SORTING_INDEX_DATA_ATTR);

        return parseInt(firstItemSortNumber, 10) - parseInt(secondItemSortNumber, 10);
    };
}

Gridifier.Api.Sort.prototype.setRetransformSortFunction = function(retransformSortFunctionName) {
    if(!this._retransformSortFunctions.hasOwnProperty(retransformSortFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_RETRANSFORM_SORT_INVALID_PARAM,
            retransformSortFunctionName
        );
        return;
    }

    this._retransformSortFunction = this._retransformSortFunctions[retransformSortFunctionName];
}

Gridifier.Api.Sort.prototype.addRetransformSortFunction = function(retransformSortFunctionName, retransformSortFunction) {
    this._retransformSortFunctions[retransformSortFunctionName] = retransformSortFunction;
}

Gridifier.Api.Sort.prototype.getRetransformSortFunction = function() {
    return this._retransformSortFunction;
}

Gridifier.Api.Sort.prototype._addDefaultRetransformSort = function() {
    this._retransformSortFunctions["default"] = function(connections) { console.log("called default");
        return connections;
    };
}

Gridifier.Api.Sort.prototype._addBySizesRetransformSort = function() {
    var me = this;

    //setTimeout(function() {
    //setTimeout(function() {
    //    me._eventEmitter.onBeforeShow(function() {
    //        me._eventEmitter._gridifier.triggerResize();
    //    });
    //}, 0);
    //}, 500);

    var calculateAreaPerEachConnection = function(connections) {
        for(var i = 0; i < connections.length; i++) {
            var connectionWidth = Math.abs(connections[i].x2 - connections[i].x1) + 1;
            var connectionHeight = Math.abs(connections[i].y2 - connections[i].y1) + 1;
            var connectionArea = connectionWidth * connectionHeight;
            connections[i].area = connectionArea;
        }
    }

    var packConnectionsByAreas = function(connections) {
        var areasWithConnections = [];
        for(var i = 0; i < connections.length; i++) {
            var connectionArea = connections[i].area;

            var wasAddedToExistingArea = false;
            for(var j = 0; j < areasWithConnections.length; j++) {
                if(areasWithConnections[j].area == connectionArea) {
                    areasWithConnections[j].connections.push(connections[i]);
                    wasAddedToExistingArea = true;
                    break;
                }
            }

            if(!wasAddedToExistingArea) {
                areasWithConnections.push({
                    area: connectionArea,
                    connections: [connections[i]]
                });
            }
        }

        return areasWithConnections;
    }

    var sortLinear = function(connections) {
        var areasWithConnections = packConnectionsByAreas(connections);
        areasWithConnections.sort(function(firstConnection, secondConnection) {
            return parseFloat(firstConnection.area) - parseFloat(secondConnection).area;
        });

        var sortedConnections = [];
        var allEmpty = false;
        while(!allEmpty) {
            var noChanges = true;
            for(var i = 0; i < areasWithConnections.length; i++) {
                if(areasWithConnections[i].connections.length != 0) {
                    if(i == 0) {
                        // @todo -> Pass, how many elements from most big group could be taken
                        sortedConnections.push(areasWithConnections[i].connections.shift());
                        if(areasWithConnections[i].connections.length != 0)
                            sortedConnections.push(areasWithConnections[i].connections.shift());
                    }
                    else {
                        sortedConnections.push(areasWithConnections[i].connections.shift());
                    }
                    noChanges = false;
                }
            }

            if(noChanges)
                allEmpty = true;
        }

        return sortedConnections;
    }

    // Split connections to batches and call repack per each batch???
    // Splicer should be separate object, which will be called to 'splice' connection to groups
    this._retransformSortFunctions["areaDesc"] = function(connections) { console.log("conn orig count = " + connections.length);
        calculateAreaPerEachConnection(connections);
        var nextPosition = 0;
        for(var i = 0; i < connections.length; i++) {
            nextPosition++;
            connections[i].retransformSortPosition = nextPosition;
        }

        var connectionBatches = [];
        var connectionIndex = 0;
        var nextBatch = [];
        for(var i = 0; i < connections.length; i++) {
            connectionIndex++;
            nextBatch.push(connections[i]);
            if(connectionIndex % 320 == 0) {
                connectionBatches.push(nextBatch);
                nextBatch = [];
            }


        }
        if(nextBatch.length != 0)
            connectionBatches.push(nextBatch);
        console.log("count = " + connectionBatches.length);
        for(var i = 0; i < connectionBatches.length; i++) {
            connectionBatches[i] = sortLinear(connectionBatches[i]);
            //connectionBatches[i].sort(function(firstConnection, secondConnection) {
            //    if(firstConnection.area > secondConnection.area)
            //        return -1;
            //    else if(firstConnection.area < secondConnection.area)
            //        return 1;
            //    else
            //        return firstConnection.retransformSortPosition - secondConnection.retransformSortPosition;
            //});
        }

        connections.splice(0, connections.length);
        for(var i = 0; i < connectionBatches.length; i++) {
            for(var j = 0; j < connectionBatches[i].length; j++) {
                connections.push(connectionBatches[i][j]);
            }
        }
        console.log("conn modified count = " + connections.length);
        return connections;
    }
}