Gridifier.VerticalGrid.ConnectionsRanges = function(connections) {
    var me = this;

    this._connections = null;

    this._ranges = null;

    this._css = {

    }

    this._construct = function() {
        me._connections = connections;
    };

    this._bindEvents = function() {

    };

    this._unbindEvents = function() {

    };

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
}

//@todo -> Xranitj otdelnie srezi dlja appenda/prependa srazu so vsemi elementami(bez perebora nod)???

// @todo -> Should it be so large???(mobiles)
Gridifier.VerticalGrid.ConnectionsRanges.RANGE_PX_HEIGHT = 500;
//Gridifier.VerticalGrid.ConnectionsRanges.RANGE_PX_HEIGHT = 200;

Gridifier.VerticalGrid.ConnectionsRanges.prototype.init = function() {
    this._ranges = [];
    this._ranges.push({
        y1: 0,
        y2: Gridifier.VerticalGrid.ConnectionsRanges.RANGE_PX_HEIGHT,
        connectionIndexes: []
    });
    this._attachAllConnections();
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype.shiftAllRangesBy = function(verticalIncrease) {
    for(var i = 0; i < this._ranges.length; i++) {
        this._ranges[i].y1 += verticalIncrease;
        this._ranges[i].y2 += verticalIncrease;
    }
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype.createPrependedRange = function(newRangeY1, newRangeY2) {
    this._ranges.unshift({
        y1: -1,
        y2: newRangeY2,
        connectionIndexes: []
    });
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype._createNextRange = function() {
    var nextRangeY1 = this._ranges[this._ranges.length - 1].y2 + 1;

    this._ranges.push({
        y1: nextRangeY1,
        y2: nextRangeY1 + Gridifier.VerticalGrid.ConnectionsRanges.RANGE_PX_HEIGHT,
        connectionIndexes: []
    });
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype.attachConnection = function(connection, connectionIndex) {
    while(connection.y2 > this._ranges[this._ranges.length - 1].y2) {
        this._createNextRange();
    }

    for(var i = 0; i < this._ranges.length; i++) {
        var isAboveRange = connection.y2 < this._ranges[i].y1;
        var isBelowRange = connection.y1 > this._ranges[i].y2;

        if(!isAboveRange && !isBelowRange) {
            this._ranges[i].connectionIndexes.push(connectionIndex);
        }
    }
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype._attachAllConnections = function() {
    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) 
        this.attachConnection(connections[i], i);
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype.mapAllIntersectedAndUpperConnectionsPerEachConnector = function(sortedConnectors) {
    var currentConnectorRangeIndex = this._ranges.length - 1;
    var currentConnectorConnectionIndexes = [];

    for(var connectorIndex = 0; connectorIndex < sortedConnectors.length; connectorIndex++) {
        var currentConnectorRangeIndexFound = false;

        if(currentConnectorRangeIndex == this._ranges.length - 1)
            var isCurrentConnectorRangeSameAsPrevious = false;
        else
            var isCurrentConnectorRangeSameAsPrevious = true;

        while(!currentConnectorRangeIndexFound) {
            if(sortedConnectors[connectorIndex].y >= this._ranges[currentConnectorRangeIndex].y1 &&
                sortedConnectors[connectorIndex].y <= this._ranges[currentConnectorRangeIndex].y2) {
                currentConnectorRangeIndexFound = true;
            }
            else {
                currentConnectorRangeIndex--;
                isCurrentConnectorRangeSameAsPrevious = false;
            }
        }

        if(!isCurrentConnectorRangeSameAsPrevious) {
            currentConnectorConnectionIndexes = [];
            for(var rangeIndex = currentConnectorRangeIndex; rangeIndex >= 0; rangeIndex--)
                currentConnectorConnectionIndexes.push(this._ranges[rangeIndex].connectionIndexes);
        }

        sortedConnectors[connectorIndex].connectionIndexes = currentConnectorConnectionIndexes;
    }

    return sortedConnectors;
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype.getAllConnectionsFromIntersectedAndLowerRanges = function(y) {
    var connectionIndexes = [];
    var intersectedRangeIndex = null;

    for(var i = 0; i < this._ranges.length; i++) {
        if(y >= this._ranges[i].y1 && y <= this._ranges[i].y2) {
            intersectedRangeIndex = i;
            break;
        }
    }

    for(var i = intersectedRangeIndex; i < this._ranges.length; i++) {
        connectionIndexes.push(this._ranges[i].connectionIndexes);
    }

    return connectionIndexes;
}

// Gridifier.VerticalGrid.ConnectionsRanges.prototype.getAllConnectionsFromIntersectedAndUpperRanges = function(y) {
//     var connections = this._connections.get();
//     var rangeConnections = [];
//     var addedConnectionIndexes = [];
//     var intersectedRangeIndex = null;

//     var isConnectionAlreadyAdded = function(connectionIndex) {
//         for(var i = 0; i < addedConnectionIndexes.length; i++) {
//             if(connectionIndex == addedConnectionIndexes[i])
//                 return true;
//         }

//         return false;
//     }

//     for(var i = 0; i < this._ranges.length; i++) {
//         if(y >= this._ranges[i].y1 && y <= this._ranges[i].y2) {
//             for(var j = 0; j < this._ranges[i].connectionIndexes.length; j++) {
//                 var connectionIndex = this._ranges[i].connectionIndexes[j];

//                 if(!isConnectionAlreadyAdded(connectionIndex)) {
//                     rangeConnections.push(connections[connectionIndex]);
//                     addedConnectionIndexes.push(connectionIndex);
//                 }
//             }

//             intersectedRangeIndex = i;
//             break;
//         }
//     }

//     for(var i = intersectedRangeIndex; i >= 0; i--) {
//         for(var j = 0; j < this._ranges[i].connectionIndexes.length; j++) {
//             var connectionIndex = this._ranges[i].connectionIndexes[j];

//             if(!isConnectionAlreadyAdded(connectionIndex)) {
//                 rangeConnections.push(connections[connectionIndex]);
//                 addedConnectionIndexes.push(connectionIndex);
//             }
//         }
//     }

//     return rangeConnections;
// }

Gridifier.VerticalGrid.ConnectionsRanges.prototype.mapAllIntersectedAndLowerConnectionsPerEachConnector = function(sortedConnectors) {
    var currentConnectorRangeIndex = 0;
    var currentConnectorConnectionIndexes = [];

    for(var connectorIndex = 0; connectorIndex < sortedConnectors.length; connectorIndex++) {
        var currentConnectorRangeIndexFound = false;

        if(currentConnectorRangeIndex == 0)
            var isCurrentConnectorRangeSameAsPrevious = false;
        else
            var isCurrentConnectorRangeSameAsPrevious = true;

        while(!currentConnectorRangeIndexFound) {
            if(sortedConnectors[connectorIndex].y >= this._ranges[currentConnectorRangeIndex].y1 &&
               sortedConnectors[connectorIndex].y <= this._ranges[currentConnectorRangeIndex].y2) {
                currentConnectorRangeIndexFound = true;
            }
            else {
                currentConnectorRangeIndex++;
                isCurrentConnectorRangeSameAsPrevious = false;
            }
        }

        if(!isCurrentConnectorRangeSameAsPrevious) {
            currentConnectorConnectionIndexes = [];
            for(var rangeIndex = currentConnectorRangeIndex; rangeIndex < this._ranges.length; rangeIndex++)
                currentConnectorConnectionIndexes.push(this._ranges[rangeIndex].connectionIndexes);
        }

        sortedConnectors[connectorIndex].connectionIndexes = currentConnectorConnectionIndexes;
    }

    return sortedConnectors;
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype.getAllConnectionsFromIntersectedRange = function(y) {
    for(var i = 0; i < this._ranges.length; i++) {
        if(y >= this._ranges[i].y1 && y <= this._ranges[i].y2)
            return this._ranges[i].connectionIndexes;
    }
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype.getAllConnectionsFromIntersectedAndUpperRanges = function(y) {
    var connectionIndexes = [];
    var intersectedRangeIndex = null;

    for(var i = this._ranges.length - 1; i >= 0; i--) {
        if(y >= this._ranges[i].y1 && y <= this._ranges[i].y2) {
            intersectedRangeIndex = i;
            break;
        }
    }

    for(var i = intersectedRangeIndex; i >= 0; i--) {
        connectionIndexes.push(this._ranges[i].connectionIndexes);
    }

    return connectionIndexes;
}

// Gridifier.VerticalGrid.ConnectionsRanges.prototype.getAllConnectionsFromIntersectedAndLowerRanges = function(y) {
//     var connections = this._connections.get();
//     var rangeConnections = [];
//     var intersectedRangeIndex = null;

    //timer.start();
   // timer.start();
    // for(var i = 0; i < this._ranges.length; i++) {
    //     if(y >= this._ranges[i].y1 && y <= this._ranges[i].y2) {
    //         for(var j = 0; j < this._ranges[i].connectionIndexes.length; j++) {
    //             rangeConnections.push(connections[this._ranges[i].connectionIndexes[j]]);
    //         }

    //         intersectedRangeIndex = i;
    //         break;
    //     }
    // }
    // var time = timer.get();
    // if(time > 0.050) {
    //     console.log("cycle 1 = " + time);
    //     console.log("items count = " + this._ranges[intersectedRangeIndex].connectionIndexes.length);
    //     console.log("");
    // }
    
    // var before = rangeConnections.length;
    // timer.start();
    // for(var i = intersectedRangeIndex; i < this._ranges.length; i++) {
    //     for(var j = 0; j < this._ranges[i].connectionIndexes.length; j++) {
    //         rangeConnections.push(connections[this._ranges[i].connectionIndexes[j]]);
    //     }
    // }
    // var time = timer.get();
    // if(time > 0.050) {
    //     console.log("cycle 2 = " + time);
    //     console.log("items count = " + (rangeConnections.length - before));
    //     console.log("");
    // }
    // var spentTime = timer.get();
    // if(spentTime > 0.50) {
    //     var totalElemsCount = 0;
    //     for(var i = intersectedRangeIndex; i < this._ranges.length; i++) {
    //         totalElemsCount += this._ranges[i].connectionIndexes.length;
    //     }

    //     console.log("total elems count in intersected and bottom ranges = " + totalElemsCount);
    //     console.log("start index = " + intersectedRangeIndex);
    //     console.log("ranges count = " + this._ranges.length);
    //     console.log("total spent time = " + spentTime);
    // }

//     return rangeConnections;
// }

// Gridifier.VerticalGrid.ConnectionsRanges.prototype.getAllConnectionsFromIntersectedAndLowerRanges = function(y) {
//     var connections = this._connections.get();
//     var rangeConnections = [];
//     var addedConnectionIndexes = [];
//     var intersectedRangeIndex = null;

//     var isConnectionAlreadyAdded = function(connectionIndex) {
//         for(var i = 0; i < addedConnectionIndexes.length; i++) {
//             if(connectionIndex == addedConnectionIndexes[i])
//                 return true;
//         }

//         return false;
//     }
//     timer.start();
//     for(var i = 0; i < this._ranges.length; i++) {
//         if(y >= this._ranges[i].y1 && y <= this._ranges[i].y2) {
//             for(var j = 0; j < this._ranges[i].connectionIndexes.length; j++) {
//                 var connectionIndex = this._ranges[i].connectionIndexes[j];

//                 if(!isConnectionAlreadyAdded(connectionIndex)) {
//                     rangeConnections.push(connections[connectionIndex]);
//                     addedConnectionIndexes.push(connectionIndex);
//                 }
//             }

//             intersectedRangeIndex = i;
//             break;
//         }
//     }
//     var time = timer.get();
//     if(time > 0.100) {
//         console.log("first cycle = " + time);
//         console.log("ran len = " + this._ranges.length);
//     }
//     timer.start();
//     for(var i = intersectedRangeIndex; i < this._ranges.length; i++) {
//         for(var j = 0; j < this._ranges[i].connectionIndexes.length; j++) {
//             var connectionIndex = this._ranges[i].connectionIndexes[j];

//             if(!isConnectionAlreadyAdded(connectionIndex)) {
//                 rangeConnections.push(connections[connectionIndex]);
//                 addedConnectionIndexes.push(connectionIndex);
//             }
//         }
//     }
//     var time = timer.get();
//     if(time > 0.100) console.log("second cycle = " + time);

//     return rangeConnections;
// }