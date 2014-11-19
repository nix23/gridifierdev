$(document).ready(function() {
    module("Sizes resolver tests.");

    $testStyles = $(".testStyles");
    $testContent = $(".testContent");

    $testStyles.append = function(stylesContent) {
        if(browserDetector.isIe8())
            $testStyles.prop('styleSheet').cssText = stylesContent;
        else
            $testStyles.html(stylesContent);
    }

    var clearTestData = function() {
        $testStyles.html("");
        $testContent.html("");
    }

    var hasPercentageSidesTester = {
        _before: function() {

        },

        _after: function() {

        },

        runTests: function() {
            this._before();
            this._testHasPercentageWidthCallWithElementWithoutParentNode();
            this._testHasPercentageHeightCallWithElementWithoutParentNode();
            this._testHasPercentageWidthCallWithPxWidth();
            this._testHasPercentageHeightCallWithPxHeight();
            this._testHasPercentageWidthCallWithPercentageWidth();
            this._testHasPercentageHeightCallWithPercentageHeight();
            this._testHasPercentageWidthCallWithPercentageWidthDeclaredInClass();
            this._testHasPercentageHeightCallWithPercentageHeightDeclaredInClass();
            this._after();
        },

        _testHasPercentageWidthCallWithElementWithoutParentNode: function() {
            test("call hasPercentageWidth on element without parent node", function(assert) {
                clearTestData();

                var testerDiv = document.createElement("div");
                assert.throws(
                    function() { SizesResolver.hasPercentageWidth(testerDiv); },
                    /(.*)Can't determine if is percentage width on element without parentNode.(.*)/,
                    "Without parentNode"
                );
            });
        },

        _testHasPercentageHeightCallWithElementWithoutParentNode: function() {
            test("call hasPercentageHeight on element without parent node", function(assert) {
                clearTestData();

                var testerDiv = document.createElement("div");
                assert.throws(
                    function() { SizesResolver.hasPercentageHeight(testerDiv); },
                    /(.*)Can't determine if is percentage height on element without parentNode.(.*)/,
                    "Without parentNode"
                );
            });
        },

        _testHasPercentageWidthCallWithPxWidth: function() {
            test("call hasPercentageWidth with px width", function() {
                clearTestData();

                var testerDiv = document.createElement("div");
                testerDiv.style.width = "200px";
                $testContent.append($(testerDiv)); 

                ok(!SizesResolver.hasPercentageWidth(testerDiv), "ok");
            });
        },

        _testHasPercentageHeightCallWithPxHeight: function() {
            test("call hasPercentageHeight with px height", function() {
                clearTestData();

                var testerDiv = document.createElement("div");
                testerDiv.style.height = "200px";
                $testContent.append($(testerDiv));

                ok(!SizesResolver.hasPercentageHeight(testerDiv), "ok");
            });
        },

        _testHasPercentageWidthCallWithPercentageWidth: function() {
            test("call hasPercentageWidth with % width", function() {
                clearTestData();

                var testerDiv = document.createElement("div");
                testerDiv.style.width = "60%";
                $testContent.append($(testerDiv));

                ok(SizesResolver.hasPercentageWidth(testerDiv), "ok");
            });
        },

        _testHasPercentageHeightCallWithPercentageHeight: function() {
            test("call hasPercentageHeight with % height", function() {
                clearTestData();

                var testerDiv = document.createElement("div");
                testerDiv.style.height = "60%";
                $testContent.append($(testerDiv));

                ok(SizesResolver.hasPercentageHeight(testerDiv), "ok");
            });
        },

        _testHasPercentageWidthCallWithPercentageWidthDeclaredInClass: function() {
            test("call hasPercentageWidth with % width declared in class", function() {
                clearTestData();
                var testStyles = ".testDiv { width: 60%; }";
                $testStyles.append(testStyles);

                var testerDiv = document.createElement("div");
                testerDiv.setAttribute("class", "testDiv");
                $testContent.append($(testerDiv));

                ok(SizesResolver.hasPercentageWidth(testerDiv), "ok");
            });
        },

        _testHasPercentageHeightCallWithPercentageHeightDeclaredInClass: function() {
            test("call hasPercentageHeight with % height declared in class", function() {
                clearTestData();
                var testStyles = ".testDiv { height: 60%; }";
                $testStyles.append(testStyles);

                var testerDiv = document.createElement("div");
                testerDiv.setAttribute("class", "testDiv");
                $testContent.append($(testerDiv));

                ok(SizesResolver.hasPercentageHeight(testerDiv), "ok");
            });
        }
    }

    hasPercentageSidesTester.runTests();
    clearTestData();

    var getPercentageSidesTester = {
        _before: function() {

        },

        _after: function() {

        },

        runTests: function() {
            this._before();
            this._testGetPercentageWidthCallOnElemWithPercentageWidth();
            this._testGetPercentageHeightCallOnElemWithPercentageHeight();
            this._testGetPercentageWidthCallOnElemWithPercentageWidthDeclaredInClass();
            this._testGetPercentageHeightCallOnElemWithPercentageHeightDeclaredInClass();
            this._after();
        },

        _testGetPercentageWidthCallOnElemWithPercentageWidth: function() {
            test("call getPercentageWidth with % width", function() {
                clearTestData();

                var testerDiv = document.createElement("div");
                testerDiv.style.width = "60%";
                $testContent.append($(testerDiv));

                ok(SizesResolver.getPercentageWidth(testerDiv) == "60%", "ok");
            });
        },

        _testGetPercentageHeightCallOnElemWithPercentageHeight: function() {
            test("call getPercentageHeight with % height", function() {
                clearTestData();

                var testerDiv = document.createElement("div");
                testerDiv.style.height = "60%";
                $testContent.append($(testerDiv));

                ok(SizesResolver.getPercentageHeight(testerDiv) == "60%", "ok");
            });
        },

        _testGetPercentageWidthCallOnElemWithPercentageWidthDeclaredInClass: function() {
            test("call getPercentageWidth with % width declared in class", function() {
                clearTestData();
                var testStyles = ".testDiv { width: 60%; }";
                $testStyles.append(testStyles);

                var testerDiv = document.createElement("div");
                testerDiv.setAttribute("class", "testDiv");
                $testContent.append($(testerDiv));

                ok(SizesResolver.getPercentageWidth(testerDiv) == "60%", "ok");
            });
        },

        _testGetPercentageHeightCallOnElemWithPercentageHeightDeclaredInClass: function() {
            test("call getPercentageHeight with % height declared in class", function() {
                clearTestData();
                var testStyles = ".testDiv { height: 60%; }";
                $testStyles.append(testStyles);

                var testerDiv = document.createElement("div");
                testerDiv.setAttribute("class", "testDiv");
                $testContent.append($(testerDiv));

                ok(SizesResolver.getPercentageHeight(testerDiv) == "60%", "ok");
            });
        }
    }

    getPercentageSidesTester.runTests();
    clearTestData();
});