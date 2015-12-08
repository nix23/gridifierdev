$(document).ready(function() {
    module("Item");

    var tester = {
        _before: function() {
            ;
        },

        _after: function() {

        },

        runTests: function() {
            var me = this;

            test("all", function(assert) {
                var test = function(tests) {
                    me._before.call(me);

                    for(var i = 0; i < tests.length; i++)
                        me["_" + tests[i]].call(me, assert);

                    me._after.call(me);
                }

                test([
                    "crud", "filter", "toNative", "getNew"
                ]);
            });
        },

        _crud: function() {
            var gridItem = new Item();
            var item = Dom.div();

            gridItem.markAsConnected(item);
            ok(gridItem.isConnected(item), "item is connected ok");
            ok(!gridItem.isConnected(Dom.div()), "item is not connected ok");

            gridItem.unmarkAsConnected(item);
            ok(!gridItem.isConnected(item), "unmark as connected ok");
        },

        _filter: function() {
            var gridItem = new Item();
            var items = [Dom.div(), Dom.div(), Dom.div(), Dom.div()];

            gridItem.markAsConnected(items[0]);
            gridItem.markAsConnected(items[1]);

            ok(gridItem.filterConnected(items).length == 2, "filterConnected ok");
            ok(gridItem.filterNotConnected(items).length == 2, "filterNotConnected ok");
        },

        _toNative: function(assert) {
            var gridItem = new Item();
            var $items = [$("<div/>"), $("<div/>"), $("<div/>")];
            var items = [Dom.div(), Dom.div(), Dom.div()];
            var mixed = [Dom.div(), $("<div/>"), Dom.div()];

            ok(gridItem.toNative($items).length == 3, "toNative jQuery objects ok");
            ok(gridItem.toNative(items).length == 3, "toNative DOM objects ok");
            ok(gridItem.toNative(mixed).length == 3, "toNative mixed objects ok");

            var items = [Dom.div(), {}];
            assert.throws(
                function() { gridItem.toNative(items); },
                /(.*)one of items is not jQuery(.*)Native DOM object(.*)/,
                "toNative with false mixed object ok"
            );

            assert.throws(
                function() { gridItem.toNative({}); },
                /(.*)one of items is not jQuery(.*)Native DOM object(.*)/,
                "toNative with false object ok"
            );
        },

        _getNew: function(assert) {
            var gridItem = new Item();
            gridItem.filterNotConnected = function(items) { 
                return (items == "i") ? "fi" : null; 
            };
            gridItem.toNative = function(items) { 
                return (items == "items") ? "i" : null; 
            };

            var wasAdded = false;
            grid = {
                add: function(items) {
                    wasAdded = (items == "fi");
                }
            };

            var items = gridItem.getNew("items"); 
            ok(items == "fi" && wasAdded, "getNew items ok");
        }
    }

    tester.runTests();
    clearTestData();
});