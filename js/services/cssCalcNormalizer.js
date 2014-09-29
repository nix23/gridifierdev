/**
* Example usage: 
*   <div id="demoLayoutContainer" data-applyplugin="cssCalcNormalizer" data-plugin-mode="substractFromParent" data-plugin-secondvalue="30px"
*                                                  data-plugin-property="width">
*   </div>
*/
CssCalcNormalizer = {
    initialized: false,
    normalizedElementGUID: 0,
    isBrowserSupportingCalc: null,
    $elements: [],
    // @todo -> rewrite(It's not constants)
    PLUGIN_DATA_ATTR_NAME_POSTFIX: "applyplugin",
    PLUGIN_DATA_ATTR_VALUE: "cssCalcNormalizer",
    PLUGIN_APPLIED_DATA_ATTR_NAME: "pluginapplied",
    MODE_DATA_ATTR_NAME_POSTFIX: "plugin-mode",
    MODE_DATA_ATTR_VALUES: {
        SUBSTRACT_FROM_PARENT: "substractFromParent"
    },
    PROPERTY_DATA_ATTR_NAME_POSTFIX: "plugin-property",
    FIRST_VALUE_DATA_ATTR_NAME: "plugin-firstvalue",
    SECOND_VALUE_DATA_ATTR_NAME: "plugin-secondvalue",
    PLUGIN_GUID_DATA_ATTR_POSTFIX: "plugin-guid",

    init: function()
    {
        if(this.initialized)
            return;

        this.initialized = true;
        this.isBrowserSupportingCalc = Modernizr.csscalc;
    },

    applyTo: function($elem)
    {
        this.init();
        this.$elements = [];
        this.grabElementsFromHTML($elem);
        
        if(!this.isBrowserSupportingCalc)
            this.makeCalcCrossbrowser();
    },

    grabElementsFromHTML: function($elem)
    {
        var me = this;
        $.each($elem.find("[data-" + this.PLUGIN_DATA_ATTR_NAME_POSTFIX + "]"), function() {
            if(this.hasAttribute("data-" + me.PLUGIN_APPLIED_DATA_ATTR_NAME)
                || $(this).attr("data-" + me.PLUGIN_DATA_ATTR_NAME_POSTFIX) != me.PLUGIN_DATA_ATTR_VALUE)
                return;

            $(this).attr("data-" + me.PLUGIN_APPLIED_DATA_ATTR_NAME, "true");
            me.$elements.push($(this));
        });
    },

    makeCalcCrossbrowser: function()
    {
        for(var i = 0; i < this.$elements.length; i++)
        {
            var $elem = this.$elements[i];
            var pluginMode = $elem.attr("data-" + this.MODE_DATA_ATTR_NAME_POSTFIX);

            if(pluginMode == this.MODE_DATA_ATTR_VALUES.SUBSTRACT_FROM_PARENT)
            {
                this.simulateCalcSubstractFromParent($elem);
            }
            else
                throw new Error("cssCalcNormalizer: correct plugin mode attr not found per element: " + $elem.get(0));
        }
    },

    simulateCalcSubstractFromParent: function($elem)
    {
        if(!$elem.get(0).hasAttribute("data-" + this.SECOND_VALUE_DATA_ATTR_NAME))
            throw new Error("cssCalcNormalizer: can't find secondValue in data attrs per element: " + $elem.get(0));
        if(!$elem.get(0).hasAttribute("data-" + this.PROPERTY_DATA_ATTR_NAME_POSTFIX))
            throw new Error("cssCalcNormalizer: can't find property name in data attrs per element: " + $elem.get(0));

        var secondValue = $elem.attr("data-" + this.SECOND_VALUE_DATA_ATTR_NAME);
        var propertyName = $elem.attr("data-" + this.PROPERTY_DATA_ATTR_NAME_POSTFIX);

        this.normalizedElementGUID++;
        var closureNormalizedElementGUID = this.normalizedElementGUID;
        $elem.attr("data-" + this.PLUGIN_GUID_DATA_ATTR_POSTFIX, closureNormalizedElementGUID);
        $elem.css(propertyName, ($elem.parent().outerWidth() - parseInt(secondValue, 10)) + "px");

        $(window).on("resize.cssCalcNormalizerElem" + closureNormalizedElementGUID, function() {
            // Element was deleted
            if($elem.closest("body").length == 0)
            {
                $(window).off("resize.cssCalcNormalizerElem" + closureNormalizedElementGUID);
                return;
            }

            $elem.css(propertyName, ($elem.parent().outerWidth() - parseInt(secondValue, 10)) + "px");
        });
    }
}