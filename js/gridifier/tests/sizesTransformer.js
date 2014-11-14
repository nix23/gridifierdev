$(document).ready(function() {
    module("Sizes transformer tests.");

    var gridifierMock = {};
    var settingsMock = {
        isVerticalGrid: function() {
            return true;
        }
    };
    var connectorsMock = {};
    var connectionsMock = {};
    var guidMock = {};
    var appenderMock = {};
    var reversedAppenderMock = {};

    var sizesTransformer = new Gridifier.SizesTransformer(
        gridifierMock,
        settingsMock,
        connectorsMock,
        connectionsMock,
        guidMock,
        appenderMock,
        reversedAppenderMock
    );

    var initConnectionTransformTester = {
        _realSizesResolver: null,
        _sizesResolverMock: null,
        _connectionMock: null,

        _before: function() {
            this._realSizesResolver = SizesResolver;
            this._sizesResolverMock = {
                outerWidth: function(DOMElem, includeMargins) {
                    return 100;
                },

                outerHeight: function(DOMElem, includeMargins) {
                    return 100;
                }
            };
            SizesResolver = this._sizesResolverMock;

            this._connectionMock = {
                item: {}
            };
        },

        _after: function() {
            SizesResolver = this._realSizesResolver;
        },

        runTests: function() {
            this._before();
            this._testCallWithPxWidthAndPxHeight();
            this._testCallWithWrongParam();
            this._testCallWithParamsWithoutPostfixes();
            this._testCallWithoutParams();
            this._after();
        },

        _testCallWithPxWidthAndPxHeight: function() {
            var targetSizes = sizesTransformer.initConnectionTransform(
                this._connectionMock, "100px", "300px"
            );
            test("call initConnectionTransform with pxWidth and pxHeight", function() {
                ok((targetSizes.targetWidth == "100px" && targetSizes.targetHeight =="300px"), "ok");
            });
        },

        _testCallWithWrongParam: function() {
            var me = this;
            test("call initConnectionTransform with wrong params", function(assert) {
                assert.throws(
                    function() { sizesTransformer.initConnectionTransform(me._connectionMock, "wrongpx", "100px") },
                    /(.*)Wrong target transformation sizes(.*)/,
                    "With wrong width"
                );

                assert.throws(
                    function() { sizesTransformer.initConnectionTransform(me._connectionMock, "100px", "wrongpx") },
                    /(.*)Wrong target transformation sizes(.*)/,
                    "With wrong height"
                );
            });
        },

        _testCallWithParamsWithoutPostfixes: function() {
            var targetSizes = sizesTransformer.initConnectionTransform(
                this._connectionMock, 100, "100"
            );
            test("call initConnectionTransform with params without prefixes", function() {
                ok((targetSizes.targetWidth == "100px" && targetSizes.targetHeight == "100px"), "ok");
            });
        },

        _testCallWithoutParams: function() {
            var targetSizes = sizesTransformer.initConnectionTransform(this._connectionMock);
            test("call initConnectionTransform without params", function() {
                ok((targetSizes.targetWidth == "100px" && targetSizes.targetHeight == "100px"), "ok");
            });
        }
    }

    initConnectionTransformTester.runTests();
});