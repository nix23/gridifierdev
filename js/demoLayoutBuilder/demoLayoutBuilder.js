DemoLayoutBuilder = function($targetEl) {
    var me = this;

    this._$view = View.attach(this._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.DEMO_LAYOUT_BUILDER);

    this._gridConfigurator = null;
    this._gridLayout = null;

    this._$demoLayoutBuilder = null;
    this._$gridConfiguratorAccordionTab = null;
    this._$gridLayoutAccordionTab = null;

    this._accordionTabSlideMsInterval = 4000;

    this._css = {
        demoLayoutBuilderClass: "demoLayoutBuilder",
        gridConfiguratorAccordionTabClass: "gridConfiguratorAccordionTab",
        gridLayoutAccordionTabClass: "gridLayoutAccordionTab"
    }

    this._construct = function() {
        me._$demoLayoutBuilder = me._$view.parent().find("." + me._css.demoLayoutBuilderClass);
        me._$gridConfiguratorAccordionTab = me._$demoLayoutBuilder.find("." + me._css.gridConfiguratorAccordionTabClass);
        me._$gridLayoutAccordionTab = me._$demoLayoutBuilder.find("." + me._css.gridLayoutAccordionTabClass);

        me._gridConfigurator = new DemoLayoutBuilder.Configurator(me._$gridConfiguratorAccordionTab, me);
        
        this._bindEvents();
    }

    this._bindEvents = function() {
        $(me._gridConfigurator).on(DemoLayoutBuilder.Configurator.EVENT_CREATE_HORIZONTAL_GRID, function(event, gridifierSettings) {
            if(me._gridLayout != null)
                me._gridLayout.destruct();

            me._gridLayout = new DemoLayoutBuilder.DemoLayout(
                me._$gridLayoutAccordionTab, 
                DemoLayoutBuilder.DemoLayout.GRID_TYPES.HORIZONTAL_GRID,
                gridifierSettings
            );

            $(me).trigger(DemoLayoutBuilder.EVENT_CREATE_GRID);
            me._showGridLayoutAccordionTab();
        });

        $(me._gridConfigurator).on(DemoLayoutBuilder.Configurator.EVENT_CREATE_VERTICAL_GRID, function(event, gridifierSettings) {
            if(me._gridLayout != null)
                me._gridLayout.destruct();

            me._gridLayout = new DemoLayoutBuilder.DemoLayout(
                me._$gridLayoutAccordionTab,
                DemoLayoutBuilder.DemoLayout.GRID_TYPES.VERTICAL_GRID,
                gridifierSettings
            ); 

            $(me).trigger(DemoLayoutBuilder.EVENT_CREATE_GRID);
            me._showGridLayoutAccordionTab();
        });
    }

    this._unbindEvents = function() {
        $(me._gridConfigurator).off(DemoLayoutBuilder.Configurator.EVENT_CREATE_HORIZONTAL_GRID);
        $(me._gridConfigurator).off(DemoLayoutBuilder.Configurator.EVENT_CREATE_VERTICAL_GRID);
    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.EVENT_CREATE_GRID = "demoLayoutBuilder.createGrid";

DemoLayoutBuilder.prototype._showGridLayoutAccordionTab = function() {
    var me = this;
    this._$gridConfiguratorAccordionTab.transition({"max-height": "0px"}, this._accordionTabSlideMsInterval, function() {
        me._$gridLayoutAccordionTab.css("display", "block");

        var gridLayoutAccordionTabHeight = me._gridLayout.getView().outerHeight();
        me._$gridLayoutAccordionTab.transition({"max-height": gridLayoutAccordionTabHeight + "px"}, me._accordionTabSlideMsInterval);
    });
}