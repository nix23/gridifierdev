DemoLayoutBuilder = function($targetEl) {
    var me = this;

    this._$view = View.attach(this._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.DEMO_LAYOUT_BUILDER);

    this._gridConfigurator = null;
    this._gridLayout = null;

    this._$demoLayoutBuilder = null;
    this._$gridConfiguratorAccordionTab = null;
    this._$gridLayoutAccordionTab = null;

    //this._accordionTabSlideMsInterval = 500; @todo remove
    this._accordionTabSlideMsInterval = 0;

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
        $(me._gridConfigurator).trigger(DemoLayoutBuilder.Configurator.EVENT_CREATE_VERTICAL_GRID); // @tmp
    }

    this._bindEvents = function() {
        me._bindGridConfiguratorEvents();

        $(me).on(DemoLayoutBuilder.EVENT_LOAD_GRID_CONFIGURATOR, function() {
            me._showGridConfiguratorAccordionTab();
        });
    }

    this._bindGridConfiguratorEvents = function() {
        if(me._gridConfigurator == null)
            return;

        $(me._gridConfigurator).on(DemoLayoutBuilder.Configurator.EVENT_CREATE_HORIZONTAL_GRID, function(event, gridifierSettings) {
            if(me._gridLayout != null)
                me._gridLayout.destruct();

            me._gridLayout = new DemoLayoutBuilder.DemoLayout(
                me._$gridLayoutAccordionTab, 
                DemoLayoutBuilder.DemoLayout.GRID_TYPES.HORIZONTAL_GRID,
                gridifierSettings,
                me
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
                gridifierSettings,
                me
            ); 

            $(me).trigger(DemoLayoutBuilder.EVENT_CREATE_GRID);
            me._showGridLayoutAccordionTab();
        });
    }

    this._unbindEvents = function() {
        me._unbindGridConfiguratorEvents();
    }

    this._unbindGridConfiguratorEvents = function() {
        if(me._gridConfigurator == null)
            return;

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
DemoLayoutBuilder.EVENT_LOAD_GRID_CONFIGURATOR = "demoLayoutBuilder.loadGridConfigurator";
DemoLayoutBuilder.EVENT_LOCK_CONFIGURATOR_ANIMATIONS = "demoLayoutBuilder.lockConfiguratorAnimatons";
DemoLayoutBuilder.EVENT_UNLOCK_CONFIGURATOR_ANIMATIONS = "demoLayoutBuilder.unlockConfiguratorAnimations";

DemoLayoutBuilder.prototype._showGridLayoutAccordionTab = function() {
    var me = this;
    this._$gridConfiguratorAccordionTab.transition({"max-height": "0px"}, this._accordionTabSlideMsInterval, function() {
        me._$gridConfiguratorAccordionTab.css("display", "none");
        me._unbindGridConfiguratorEvents();
        me._gridConfigurator.destruct();

        me._$gridLayoutAccordionTab.css("display", "block");

        var gridLayoutAccordionTabHeight = me._gridLayout.getView().outerHeight();
        me._$gridLayoutAccordionTab.transition({"max-height": gridLayoutAccordionTabHeight + "px"}, me._accordionTabSlideMsInterval);
    });
}

DemoLayoutBuilder.prototype._showGridConfiguratorAccordionTab = function() {
    var me = this;
    this._$gridLayoutAccordionTab.transition({"max-height": "0px"}, this._accordionTabSlideMsInterval, function() {
        me._$gridConfiguratorAccordionTab.css("display", "none");
        me._gridLayout.destruct();
        me._gridLayout = null;

        me._$gridConfiguratorAccordionTab.css("display", "block");

        me._gridConfigurator = new DemoLayoutBuilder.Configurator(me._$gridConfiguratorAccordionTab, me);
        me._bindGridConfiguratorEvents();
        $(me).trigger(DemoLayoutBuilder.EVENT_LOCK_CONFIGURATOR_ANIMATIONS);

        var gridConfiguratorAccordionTabHeight = me._gridConfigurator.getView().outerHeight();
        me._$gridConfiguratorAccordionTab.transition({"max-height": gridConfiguratorAccordionTabHeight + "px"}, me._accordionTabSlideMsInterval, function() {
            $(me).trigger(DemoLayoutBuilder.EVENT_UNLOCK_CONFIGURATOR_ANIMATIONS);
        });
    });
}