$(document).ready(function() {
    module("Connections");

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
                    "find",
                    "findInReposQueue",
                    "create"
                ]);
            });
        },

        _find: function(assert) {
            guid = {get: function(item) { if(typeof item == "object") return 3; }};
            connections = {get: function() { return []; }};
            repositionQueue = {isEmpty: function() { return true; }};

            var cnsCore = new CnsCore();
            assert.throws(
                function() { cnsCore.find({}); },
                /no inserted items/,
                "no cns to find ok"
            );

            connections = {get: function() {
                return [
                    {itemGUID: 1},
                    {itemGUID: 2},
                    {itemGUID: 3}
                ];
            }};

            var cn = cnsCore.find({});
            ok(cn.itemGUID == 3, "find cn in cns ok");

            guid = {get: function(item) { if(typeof item == "object") return 6; }};
            ok(cnsCore.find({}, true) == null, "find not existing cn ok");

            assert.throws(
                function() { cnsCore.find({}); },
                /can't find conn. by item/,
                "can't find conn by item ok"
            );

            clearTestData();
        },

        _findInReposQueue: function(assert) {
            guid = {get: function(item) { if(typeof item == "object") return 6; }};
            connections = {get: function() { return [{itemGUID: 700}]; }};
            repositionQueue = {
                isEmpty: function() { return false; },
                getQueued: function() { return []; }
            };

            var cnsCore = new CnsCore();

            assert.throws(
                function() { cnsCore.find({}); },
                /can't find conn. by item/,
                "can't find conn by item ok"
            );

            repositionQueue.getQueued = function() {
                return [
                    {cn: {itemGUID: 17}},
                    {cn: {itemGUID: 6}}
                ];
            };
            ok(cnsCore.find({}).itemGUID == 6, "find cn in repos queue ok");

            clearTestData();
        },

        _create: function() {
            guid = {get: function(item) { if(typeof item == "object") return 6; }};
            gridItem = new Item();

            var cnsCore = new CnsCore();
            var cn = cnsCore.create(Dom.div(), {x1: 12.608, x2: 15.703, y1: 14.00, y2: 86.145});

            ok(gridItem.isConnected(cn.item) && cn.x1 == 12.61 && cn.x2 == 15.70 &&
               cn.y1 == 14.00 && cn.y2 == 86.15 && cn.hOffset == 0 && cn.vOffset == 0 &&
               cn.itemGUID == 6 && !cn.restrictCollect, "create cn ok");

            cn.vOffset = 10;
            cn.hOffset = 13;
            cn.restrictCollect = true;
            cn = cnsCore.create(cn.item, cn);
            ok(cn.vOffset == 10 && cn.hOffset == 13 && cn.restrictCollect, "recreate cn ok");

            clearTestData();
        }
    }

    tester.runTests();
    clearTestData();
});