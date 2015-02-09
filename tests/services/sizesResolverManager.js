$(document).ready(function() {
    module("Sizes resolver manager tests.");

    var outerWidthTester = {
        _realSizesResolver: null,
        _sizesResolverMock: null,
        _testDomElemGUID: 0,
        _testDomElemGUIDDataAttr: "data-test-dom-elem-guid",
        _testDomElemGUIDMarker: "per-dom-elem-with-guid",
        _realSizesResolverOuterWidthCallMarker: "real-sizes-resolver-outer-width-call",
        _cachedSizesResolverOuterWidthCallMarker: "cached-sizes-resolver-outer-width-call",
        _callWithIncludeMarginsParamMarker: "with-include-margins-param",
        _callWithoutIncludeMarginsParamMarker: "without-include-margins-param",

        _before: function() {
            var me = this;
            this._realSizesResolver = SizesResolver;
            this._sizesResolverMock = {
                outerWidth: function(DOMElem, includeMargins) {
                    var response = "";

                    response += me._realSizesResolverOuterWidthCallMarker;
                    response += "-" + me._testDomElemGUIDMarker + DOMElem.getAttribute(me._testDomElemGUIDDataAttr);

                    if(includeMargins)
                        response += "-" + me._callWithIncludeMarginsParamMarker;
                    else
                        response += "-" + me._callWithoutIncludeMarginsParamMarker;

                    return response;
                }
            }
            
            SizesResolver = this._sizesResolverMock;
        },

        _after: function() {
            SizesResolver = this._realSizesResolver;
        },

        runTests: function() {
            var me = this;

            test("outerWidth", function(assert) {
                me._before.call(me);

                me._testSizesResolverOuterWidthMockCall.call(me);
                me._testCallWithoutActiveCachingTransaction.call(me);
                me._testIfSecondCallIsCachedWithIncludeMarginsParam.call(me);
                me._testIfSecondCallIsCachedWithoutIncludeMarginsParam.call(me);
                me._testIfCallsWithAllPossibleParamsAreCachedSeparately.call(me);
                me._testIfSequentialCallsOnDifferentElemsAreCached.call(me);
                me._testIfUncachedCallAfterCachingActiveTransactionStop.call(me);

                me._after.call(me);
            });
        },

        _markCachedValuesInOuterWidthCacheArray: function() {
            for(var i = 0; i < SizesResolverManager._outerWidthCache.length; i++) {
                var cacheEntry = SizesResolverManager._outerWidthCache[i];
                var cachedReturnedValues = cacheEntry.cachedReturnedValues;

                if(cachedReturnedValues.withIncludeMarginsParam != null) {
                    if(cachedReturnedValues.withIncludeMarginsParam.match(this._realSizesResolverOuterWidthCallMarker)) {
                        cachedReturnedValues.withIncludeMarginsParam = cachedReturnedValues.withIncludeMarginsParam.replace(
                            this._realSizesResolverOuterWidthCallMarker,
                            this._cachedSizesResolverOuterWidthCallMarker
                        );
                    }
                }

                if(cachedReturnedValues.withoutIncludeMarginsParam != null) {
                    if(cachedReturnedValues.withoutIncludeMarginsParam.match(this._realSizesResolverOuterWidthCallMarker)) {
                        cachedReturnedValues.withoutIncludeMarginsParam = cachedReturnedValues.withoutIncludeMarginsParam.replace(
                            this._realSizesResolverOuterWidthCallMarker,
                            this._cachedSizesResolverOuterWidthCallMarker
                        );
                    }
                }
            }
        },

        _testSizesResolverOuterWidthMockCall: function() {
            this._testDomElemGUID = 0;

            var testerDiv = document.createElement("div");
            testerDiv.setAttribute(this._testDomElemGUIDDataAttr, this._testDomElemGUID);

            var expectedResponse = this._realSizesResolverOuterWidthCallMarker;
            expectedResponse += "-" + this._testDomElemGUIDMarker + testerDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponse += "-" + this._callWithoutIncludeMarginsParamMarker;
            ok(
                this._sizesResolverMock.outerWidth(testerDiv) == expectedResponse,
                "call sizesResolver outerWidth mock with includeMargins = false"
            );

            var expectedResponse = this._realSizesResolverOuterWidthCallMarker;
            expectedResponse += "-" + this._testDomElemGUIDMarker + testerDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponse += "-" + this._callWithIncludeMarginsParamMarker;
            ok(
                this._sizesResolverMock.outerWidth(testerDiv, true) == expectedResponse,
                "call sizesResolver outerWidth mock with includeMargins = true"
            );
        },

        _testCallWithoutActiveCachingTransaction: function() {
            this._testDomElemGUID = 0;

            var testerDiv = document.createElement("div");
            testerDiv.setAttribute(this._testDomElemGUIDDataAttr, this._testDomElemGUID);

            var expectedResponse = this._realSizesResolverOuterWidthCallMarker;
            expectedResponse += "-" + this._testDomElemGUIDMarker + testerDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponse += "-" + this._callWithoutIncludeMarginsParamMarker;
            ok(
                SizesResolverManager.outerWidth(testerDiv) == expectedResponse,
                "call with includeMargins = false"
            );

            var expectedResponse = this._realSizesResolverOuterWidthCallMarker;
            expectedResponse += "-" + this._testDomElemGUIDMarker + testerDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponse += "-" + this._callWithIncludeMarginsParamMarker;
            ok(
                SizesResolverManager.outerWidth(testerDiv, true) == expectedResponse,
                "call with includeMargins = true"
            );
        },

        _testIfSecondCallIsCachedWithIncludeMarginsParam: function() {
            this._testDomElemGUID = 0;

            var testerDiv = document.createElement("div");
            testerDiv.setAttribute(this._testDomElemGUIDDataAttr, this._testDomElemGUID);

            var expectedResponse = this._cachedSizesResolverOuterWidthCallMarker;
            expectedResponse += "-" + this._testDomElemGUIDMarker + testerDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponse += "-" + this._callWithIncludeMarginsParamMarker;

            SizesResolverManager.startCachingTransaction();
            SizesResolverManager.outerWidth(testerDiv, true);
            this._markCachedValuesInOuterWidthCacheArray();

            ok(
                SizesResolverManager.outerWidth(testerDiv, true) == expectedResponse,
                "cached call with includeMargins = true"
            );
            SizesResolverManager.stopCachingTransaction();
        },

        _testIfSecondCallIsCachedWithoutIncludeMarginsParam: function() {
            this._testDomElemGUID = 0;

            var testerDiv = document.createElement("div");
            testerDiv.setAttribute(this._testDomElemGUIDDataAttr, this._testDomElemGUID);

            var expectedResponse = this._cachedSizesResolverOuterWidthCallMarker;
            expectedResponse += "-" + this._testDomElemGUIDMarker + testerDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponse += "-" + this._callWithoutIncludeMarginsParamMarker;

            SizesResolverManager.startCachingTransaction();
            SizesResolverManager.outerWidth(testerDiv);
            this._markCachedValuesInOuterWidthCacheArray();

            ok(
                SizesResolverManager.outerWidth(testerDiv) == expectedResponse,
                "cached call with includeMargins = false"
            );
            SizesResolverManager.stopCachingTransaction();
        },

        _testIfCallsWithAllPossibleParamsAreCachedSeparately: function() {
            this._testDomElemGUID = 0;

            var testerDiv = document.createElement("div");
            testerDiv.setAttribute(this._testDomElemGUIDDataAttr, this._testDomElemGUID);

            var expectedResponsePrefix = this._cachedSizesResolverOuterWidthCallMarker;
            expectedResponsePrefix += "-" + this._testDomElemGUIDMarker + testerDiv.getAttribute(this._testDomElemGUIDDataAttr);

            var withoutParamCallExpectedResponse = expectedResponsePrefix + "-" + this._callWithoutIncludeMarginsParamMarker;
            var withParamCallExpectedResponse = expectedResponsePrefix + "-" + this._callWithIncludeMarginsParamMarker;

            SizesResolverManager.startCachingTransaction();
            SizesResolverManager.outerWidth(testerDiv);
            SizesResolverManager.outerWidth(testerDiv, true);
            this._markCachedValuesInOuterWidthCacheArray();

            ok(
                SizesResolverManager.outerWidth(testerDiv) == withoutParamCallExpectedResponse &&
                SizesResolverManager.outerWidth(testerDiv, true) == withParamCallExpectedResponse,
                "cached calls with all possible params"
            );
            SizesResolverManager.stopCachingTransaction();
        },

        _testIfSequentialCallsOnDifferentElemsAreCached: function() {
            this._testDomElemGUID = 0;

            var firstTesterDiv = document.createElement("div");
            firstTesterDiv.setAttribute(this._testDomElemGUIDDataAttr, this._testDomElemGUID);

            this._testDomElemGUID++;
            var secondTesterDiv = document.createElement("div");
            secondTesterDiv.setAttribute(this._testDomElemGUIDDataAttr, this._testDomElemGUID);

            var expectedResponsePrefix = this._cachedSizesResolverOuterWidthCallMarker;

            var expectedResponsePerFirstTesterDiv = expectedResponsePrefix + "-" + this._testDomElemGUIDMarker;
            expectedResponsePerFirstTesterDiv += firstTesterDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponsePerFirstTesterDiv += "-" + this._callWithoutIncludeMarginsParamMarker;

            var expectedResponsePerSecondTesterDiv = expectedResponsePrefix + "-" + this._testDomElemGUIDMarker;
            expectedResponsePerSecondTesterDiv += secondTesterDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponsePerSecondTesterDiv += "-" + this._callWithoutIncludeMarginsParamMarker;

            SizesResolverManager.startCachingTransaction();
            SizesResolverManager.outerWidth(firstTesterDiv);
            SizesResolverManager.outerWidth(secondTesterDiv);
            this._markCachedValuesInOuterWidthCacheArray();

            ok(
                SizesResolverManager.outerWidth(firstTesterDiv) == expectedResponsePerFirstTesterDiv &&
                SizesResolverManager.outerWidth(secondTesterDiv) == expectedResponsePerSecondTesterDiv,
                "cached calls per different elements"
            );
            SizesResolverManager.stopCachingTransaction();
        },

        _testIfUncachedCallAfterCachingActiveTransactionStop: function() {
            this._testDomElemGUID = 0;

            var testerDiv = document.createElement("div");
            testerDiv.setAttribute(this._testDomElemGUIDDataAttr, this._testDomElemGUID);

            var expectedResponse = this._realSizesResolverOuterWidthCallMarker;
            expectedResponse += "-" + this._testDomElemGUIDMarker + testerDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponse += "-" + this._callWithoutIncludeMarginsParamMarker;

            SizesResolverManager.startCachingTransaction();
            SizesResolverManager.outerWidth(testerDiv);
            SizesResolverManager.outerWidth(testerDiv);
            SizesResolverManager.stopCachingTransaction();
            SizesResolverManager.startCachingTransaction();

            ok(
                SizesResolverManager.outerWidth(testerDiv) == expectedResponse,
                "uncached call after activeTransactionCaching stop"
            );
            SizesResolverManager.stopCachingTransaction();
        }
    }

    outerWidthTester.runTests();
    clearTestData();

    var outerHeightTester = {
        _realSizesResolver: null,
        _sizesResolverMock: null,
        _testDomElemGUID: 0,
        _testDomElemGUIDDataAttr: "data-test-dom-elem-guid",
        _testDomElemGUIDMarker: "per-dom-elem-with-guid",
        _realSizesResolverOuterHeightCallMarker: "real-sizes-resolver-outer-height-call",
        _cachedSizesResolverOuterHeightCallMarker: "cached-sizes-resolver-outer-height-call",
        _callWithIncludeMarginsParamMarker: "with-include-margins-param",
        _callWithoutIncludeMarginsParamMarker: "without-include-margins-param",

        _before: function() {
            var me = this;
            this._realSizesResolver = SizesResolver;
            this._sizesResolverMock = {
                outerHeight: function(DOMElem, includeMargins) {
                    var response = "";

                    response += me._realSizesResolverOuterHeightCallMarker;
                    response += "-" + me._testDomElemGUIDMarker + DOMElem.getAttribute(me._testDomElemGUIDDataAttr);

                    if(includeMargins)
                        response += "-" + me._callWithIncludeMarginsParamMarker;
                    else
                        response += "-" + me._callWithoutIncludeMarginsParamMarker;

                    return response;
                }
            }

            SizesResolver = this._sizesResolverMock;
        },

        _after: function() {
            SizesResolver = this._realSizesResolver;
        },

        runTests: function() {
            var me = this;

            test("outerHeight", function(assert) {
                me._before.call(me);

                me._testSizesResolverOuterHeightMockCall.call(me);
                me._testCallWithoutActiveCachingTransaction.call(me);
                me._testIfSecondCallIsCachedWithIncludeMarginsParam.call(me);
                me._testIfSecondCallIsCachedWithoutIncludeMarginsParam.call(me);
                me._testIfCallsWithAllPossibleParamsAreCachedSeparately.call(me);
                me._testIfSequentialCallsOnDifferentElemsAreCached.call(me);
                me._testIfUncachedCallAfterCachingActiveTransactionStop.call(me);

                me._after.call(me);
            });
        },

        _markCachedValuesInOuterHeightCacheArray: function() {
            for(var i = 0; i < SizesResolverManager._outerHeightCache.length; i++) {
                var cacheEntry = SizesResolverManager._outerHeightCache[i];
                var cachedReturnedValues = cacheEntry.cachedReturnedValues;

                if(cachedReturnedValues.withIncludeMarginsParam != null) {
                    if(cachedReturnedValues.withIncludeMarginsParam.match(this._realSizesResolverOuterHeightCallMarker)) {
                        cachedReturnedValues.withIncludeMarginsParam = cachedReturnedValues.withIncludeMarginsParam.replace(
                            this._realSizesResolverOuterHeightCallMarker,
                            this._cachedSizesResolverOuterHeightCallMarker
                        );
                    }
                }

                if(cachedReturnedValues.withoutIncludeMarginsParam != null) {
                    if(cachedReturnedValues.withoutIncludeMarginsParam.match(this._realSizesResolverOuterHeightCallMarker)) {
                        cachedReturnedValues.withoutIncludeMarginsParam = cachedReturnedValues.withoutIncludeMarginsParam.replace(
                            this._realSizesResolverOuterHeightCallMarker,
                            this._cachedSizesResolverOuterHeightCallMarker
                        );
                    }
                }
            }
        },

        _testSizesResolverOuterHeightMockCall: function() {
            this._testDomElemGUID = 0;

            var testerDiv = document.createElement("div");
            testerDiv.setAttribute(this._testDomElemGUIDDataAttr, this._testDomElemGUID);

            var expectedResponse = this._realSizesResolverOuterHeightCallMarker;
            expectedResponse += "-" + this._testDomElemGUIDMarker + testerDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponse += "-" + this._callWithoutIncludeMarginsParamMarker;
            ok(
                this._sizesResolverMock.outerHeight(testerDiv) == expectedResponse,
                "call sizesResolver outerHeight mock with includeMargins = false"
            );

            var expectedResponse = this._realSizesResolverOuterHeightCallMarker;
            expectedResponse += "-" + this._testDomElemGUIDMarker + testerDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponse += "-" + this._callWithIncludeMarginsParamMarker;
            ok(
                this._sizesResolverMock.outerHeight(testerDiv, true) == expectedResponse,
                "call sizesResolver outerHeight mock with includeMargins = true"
            );
        },

        _testCallWithoutActiveCachingTransaction: function() {
            this._testDomElemGUID = 0;

            var testerDiv = document.createElement("div");
            testerDiv.setAttribute(this._testDomElemGUIDDataAttr, this._testDomElemGUID);

            var expectedResponse = this._realSizesResolverOuterHeightCallMarker;
            expectedResponse += "-" + this._testDomElemGUIDMarker + testerDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponse += "-" + this._callWithoutIncludeMarginsParamMarker;
            ok(
                SizesResolverManager.outerHeight(testerDiv) == expectedResponse,
                "call with includeMargins = false"
            );

            var expectedResponse = this._realSizesResolverOuterHeightCallMarker;
            expectedResponse += "-" + this._testDomElemGUIDMarker + testerDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponse += "-" + this._callWithIncludeMarginsParamMarker;
            ok(
                SizesResolverManager.outerHeight(testerDiv, true) == expectedResponse,
                "call with includeMargins = true"
            );
        },

        _testIfSecondCallIsCachedWithIncludeMarginsParam: function() {
            this._testDomElemGUID = 0;

            var testerDiv = document.createElement("div");
            testerDiv.setAttribute(this._testDomElemGUIDDataAttr, this._testDomElemGUID);

            var expectedResponse = this._cachedSizesResolverOuterHeightCallMarker;
            expectedResponse += "-" + this._testDomElemGUIDMarker + testerDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponse += "-" + this._callWithIncludeMarginsParamMarker;

            SizesResolverManager.startCachingTransaction();
            SizesResolverManager.outerHeight(testerDiv, true);
            this._markCachedValuesInOuterHeightCacheArray();

            ok(
                SizesResolverManager.outerHeight(testerDiv, true) == expectedResponse,
                "cached call with includeMargins = true"
            );
            SizesResolverManager.stopCachingTransaction();
        },

        _testIfSecondCallIsCachedWithoutIncludeMarginsParam: function() {
            this._testDomElemGUID = 0;

            var testerDiv = document.createElement("div");
            testerDiv.setAttribute(this._testDomElemGUIDDataAttr, this._testDomElemGUID);

            var expectedResponse = this._cachedSizesResolverOuterHeightCallMarker;
            expectedResponse += "-" + this._testDomElemGUIDMarker + testerDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponse += "-" + this._callWithoutIncludeMarginsParamMarker;

            SizesResolverManager.startCachingTransaction();
            SizesResolverManager.outerHeight(testerDiv);
            this._markCachedValuesInOuterHeightCacheArray();

            ok(
                SizesResolverManager.outerHeight(testerDiv) == expectedResponse,
                "cached call with includeMargins = false"
            );
            SizesResolverManager.stopCachingTransaction();
        },

        _testIfCallsWithAllPossibleParamsAreCachedSeparately: function() {
            this._testDomElemGUID = 0;

            var testerDiv = document.createElement("div");
            testerDiv.setAttribute(this._testDomElemGUIDDataAttr, this._testDomElemGUID);

            var expectedResponsePrefix = this._cachedSizesResolverOuterHeightCallMarker;
            expectedResponsePrefix += "-" + this._testDomElemGUIDMarker + testerDiv.getAttribute(this._testDomElemGUIDDataAttr);

            var withoutParamCallExpectedResponse = expectedResponsePrefix + "-" + this._callWithoutIncludeMarginsParamMarker;
            var withParamCallExpectedResponse = expectedResponsePrefix + "-" + this._callWithIncludeMarginsParamMarker;

            SizesResolverManager.startCachingTransaction();
            SizesResolverManager.outerHeight(testerDiv);
            SizesResolverManager.outerHeight(testerDiv, true);
            this._markCachedValuesInOuterHeightCacheArray();

            ok(
                SizesResolverManager.outerHeight(testerDiv) == withoutParamCallExpectedResponse &&
                SizesResolverManager.outerHeight(testerDiv, true) == withParamCallExpectedResponse,
                "cached calls with all possible params"
            );
            SizesResolverManager.stopCachingTransaction();
        },

        _testIfSequentialCallsOnDifferentElemsAreCached: function() {
            this._testDomElemGUID = 0;

            var firstTesterDiv = document.createElement("div");
            firstTesterDiv.setAttribute(this._testDomElemGUIDDataAttr, this._testDomElemGUID);

            this._testDomElemGUID++;
            var secondTesterDiv = document.createElement("div");
            secondTesterDiv.setAttribute(this._testDomElemGUIDDataAttr, this._testDomElemGUID);

            var expectedResponsePrefix = this._cachedSizesResolverOuterHeightCallMarker;

            var expectedResponsePerFirstTesterDiv = expectedResponsePrefix + "-" + this._testDomElemGUIDMarker;
            expectedResponsePerFirstTesterDiv += firstTesterDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponsePerFirstTesterDiv += "-" + this._callWithoutIncludeMarginsParamMarker;

            var expectedResponsePerSecondTesterDiv = expectedResponsePrefix + "-" + this._testDomElemGUIDMarker;
            expectedResponsePerSecondTesterDiv += secondTesterDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponsePerSecondTesterDiv += "-" + this._callWithoutIncludeMarginsParamMarker;

            SizesResolverManager.startCachingTransaction();
            SizesResolverManager.outerHeight(firstTesterDiv);
            SizesResolverManager.outerHeight(secondTesterDiv);
            this._markCachedValuesInOuterHeightCacheArray();

            ok(
                SizesResolverManager.outerHeight(firstTesterDiv) == expectedResponsePerFirstTesterDiv &&
                SizesResolverManager.outerHeight(secondTesterDiv) == expectedResponsePerSecondTesterDiv
            );
            SizesResolverManager.stopCachingTransaction();
        },

        _testIfUncachedCallAfterCachingActiveTransactionStop: function() {
            this._testDomElemGUID = 0;

            var testerDiv = document.createElement("div");
            testerDiv.setAttribute(this._testDomElemGUIDDataAttr, this._testDomElemGUID);

            var expectedResponse = this._realSizesResolverOuterHeightCallMarker;
            expectedResponse += "-" + this._testDomElemGUIDMarker + testerDiv.getAttribute(this._testDomElemGUIDDataAttr);
            expectedResponse += "-" + this._callWithoutIncludeMarginsParamMarker;

            SizesResolverManager.startCachingTransaction();
            SizesResolverManager.outerHeight(testerDiv);
            SizesResolverManager.outerHeight(testerDiv);
            SizesResolverManager.stopCachingTransaction();
            SizesResolverManager.startCachingTransaction();

            ok(
                SizesResolverManager.outerHeight(testerDiv) == expectedResponse,
                "uncached call after activeTransactionCaching stop"
            );
            SizesResolverManager.stopCachingTransaction();
        }
    }

    outerHeightTester.runTests();
    clearTestData();
});