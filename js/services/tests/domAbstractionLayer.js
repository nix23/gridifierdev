$(document).ready(function() {
    module("Dom abstraction layer tests.");

    var CSS3transformPropertyTester = {
        _before: function() {
            ;
        },

        _after: function() {
            ;
        },

        runTests: function() {
            var me = this;

            test("CSS3transformProperty", function(assert) {
                me._before.call(me);

                me._testCallOnAddingNewParamToEmptyTransformString.call(me);
                me._testCallOnAddingNewParamToNotEmptyTransformString.call(me);
                me._testCallOnReplacingParamOnTransformStringOnlyWithThatParam.call(me);
                me._testCallOnReplacingParamOnTransformStringWithThatAndOtherParams.call(me);
                me._testCallOnReplacingParamOnTransformStringWithMultipleParams.call(me);

                me._after.call(me);
            });
        },

        _testCallOnAddingNewParamToEmptyTransformString: function() {
            // @todo -> Add vendor prefixes
            var fakeDOMElem = {style: {transform: ""}};
            Dom.css3.transformProperty(fakeDOMElem, "scale", 1);

            ok(
                fakeDOMElem.style.transform == "scale(1)",
                "call with scale(1) param on empty transform string"
            );
        },

        _testCallOnAddingNewParamToNotEmptyTransformString: function() {
            var fakeDOMElem = {style: {transform: "rotate(90)"}};
            Dom.css3.transformProperty(fakeDOMElem, "scale", 1);

            ok(
                fakeDOMElem.style.transform == "rotate(90) scale(1)",
                "call with scale(1) param on 'rotate(90)' string"
            );
        },

        _testCallOnReplacingParamOnTransformStringOnlyWithThatParam: function() {
            var fakeDOMElem = {style: {transform: "scale(10)"}};
            Dom.css3.transformProperty(fakeDOMElem, "scale", 1);

            ok(
                fakeDOMElem.style.transform == "scale(1)",
                "call with scale(1) param on 'scale(10)' string"
            );
        },

        _testCallOnReplacingParamOnTransformStringWithThatAndOtherParams: function() {
            var fakeDOMElem = {style: {transform: "scale(10) rotate(90)"}};
            Dom.css3.transformProperty(fakeDOMElem, "scale", 1);

            ok(
                fakeDOMElem.style.transform == "scale(1) rotate(90)",
                "call with scale(1) param on 'scale(10) rotate(90)' string"
            );
        },

        _testCallOnReplacingParamOnTransformStringWithMultipleParams: function() {
            var fakeDOMElem = {style: {transform: "scale(10)"}};
            Dom.css3.transformProperty(fakeDOMElem, "scale", "10px, 5px");

            ok(
                fakeDOMElem.style.transform == "scale(10px, 5px)",
                "call with scale(10px, 5px) param on 'scale(10)' string"
            );

            var fakeDOMElem = {style: {transform: "rotate(90) scale(10)"}};
            Dom.css3.transformProperty(fakeDOMElem, "scale", "10px,5px");
            ok(
                fakeDOMElem.style.transform == "rotate(90) scale(10px,5px)",
                "call with scale(10px,5px) param on 'rotate(90) scale(10) string"
            );
        }
    }

    CSS3transformPropertyTester.runTests();
    clearTestData();

    var CSS3transitionPropertyTester = {
        _before: function() {
            ;
        },

        _after: function() {
            ;
        },

        runTests: function() {
            var me = this;

            test("CSS3transitionProperty", function(assert) {
                me._before.call(me);

                me._testCallOnAddingNewParamToEmptyTransitionString.call(me);
                me._testCallOnAddingNewParamToNotEmptyTransitionString.call(me);
                me._testCallOnReplacingParamOnTransitionStringOnlyWithThatParam.call(me);
                me._testCallOnReplacingParamOnTransitionStringWithThatAndOtherParams.call(me);
                me._testCallOnReplacingParamOnTransitionStringWithMultipleParams.call(me);

                me._after.call(me);
            });
        },

        _testCallOnAddingNewParamToEmptyTransitionString: function() {
            // @todo -> Add vendor prefixes
            var fakeDOMElem = {style: {transition: ""}};
            Dom.css3.transitionProperty(fakeDOMElem, "width 0ms ease");

            ok(
                fakeDOMElem.style.transition == "width 0ms ease",
                "call with 'width 0ms ease' param on empty transition string"
            );
        },

        _testCallOnAddingNewParamToNotEmptyTransitionString: function() {
            var fakeDOMElem = {style: {transition: "height 0ms ease, transform 0ms ease"}};
            Dom.css3.transitionProperty(fakeDOMElem, "width 0ms ease");

            ok(
                fakeDOMElem.style.transition == "width 0ms ease, height 0ms ease, transform 0ms ease",
                "call with 'width 0ms ease' param on 'height 0ms ease, transform 0ms ease' string"
            );
        },

        _testCallOnReplacingParamOnTransitionStringOnlyWithThatParam: function() {
            var fakeDOMElem = {style: {transition: "transform 0ms ease"}};
            Dom.css3.transitionProperty(fakeDOMElem, "transform 10ms ease");

            ok(
                fakeDOMElem.style.transition == "transform 10ms ease",
                "call with 'transform 10ms ease' param on 'transform 0ms ease' string"
            );
        },

        _testCallOnReplacingParamOnTransitionStringWithThatAndOtherParams: function() {
            var fakeDOMElem = {style: {transition: "width 0ms ease, height 0ms ease"}};
            Dom.css3.transitionProperty(fakeDOMElem, "width 10ms ease");

            ok(
                fakeDOMElem.style.transition == "width 10ms ease, height 0ms ease",
                "call with 'width 10ms ease' param on 'width 0ms ease, height 0ms ease' string"
            );
        },

        _testCallOnReplacingParamOnTransitionStringWithMultipleParams: function() {
            var fakeDOMElem = {style: {transition: "width 0ms ease, height 0ms ease"}};
            Dom.css3.transitionProperty(fakeDOMElem, "transform 10ms ease, height 20ms ease");

            ok(
                fakeDOMElem.style.transition == "transform 10ms ease, height 20ms ease, width 0ms ease",
                "call with 'transform 10ms ease, height 20ms ease' param on 'width 0ms ease, height 0ms ease' string"
            );
        }
    }

    CSS3transitionPropertyTester.runTests();
    clearTestData();
});