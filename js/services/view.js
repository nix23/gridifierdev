var View = {
    ids: {
        DEMO_LAYOUT_BUILDER: {
            DEMO_LAYOUT_BUILDER: "demoLayoutBuilder",

            CONFIGURATOR: "demoLayoutBuilder.Configurator",
            GRID_TYPE_SELECTOR: "demoLayoutBuilder.GridTypeSelector",
            GRID_SETTINGS: "demoLayoutBuilder.GridSettings",
            INSERT_SETTING_DEMONSTRATOR: "demoLayoutBuilder.insertSettingDemonstrator",
            GRID_ADDITIONAL_SETTINGS: "demoLayoutBuilder.GridAdditionalSettings",
            INTERSECTIONS_SETTING_DEMONSTRATOR: "demoLayoutBuilder.intersectionsSettingDemonstrator",
            SORT_DISPERSION_SETTING_DEMONSTRATOR: "demoLayoutBuilder.sortDispersionSettingDemonstrator",
            CREATE_GRID: "demoLayoutBuilder.createGrid",

            DEMO_LAYOUT: "demoLayoutBuilder.demoLayout"
        }
    },

    init: function()
    {
        var demoLayoutBuilderView = twig({
            id: this.ids.DEMO_LAYOUT_BUILDER.DEMO_LAYOUT_BUILDER,
            href: "views/demoLayoutBuilder/demoLayoutBuilder.html.twig",
            async: false
        });

        var demoLayoutBuilderConfiguratorView = twig({
            id: this.ids.DEMO_LAYOUT_BUILDER.CONFIGURATOR,
            href: "views/demoLayoutBuilder/configurator/configurator.html.twig",
            async: false
        });

        var demoLayoutBuilderGridTypeSelectorView = twig({
            id: this.ids.DEMO_LAYOUT_BUILDER.GRID_TYPE_SELECTOR,
            href: "views/demoLayoutBuilder/configurator/gridTypeSelector.html.twig",
            async: false
        });

        var demoLayoutBuilderGridSettingsView = twig({
            id: this.ids.DEMO_LAYOUT_BUILDER.GRID_SETTINGS,
            href: "views/demoLayoutBuilder/configurator/gridSettings.html.twig",
            async: false
        });

        var demoLayoutBuilderInsertSettingDemonstratorView = twig({
            id: this.ids.DEMO_LAYOUT_BUILDER.INSERT_SETTING_DEMONSTRATOR,
            href: "views/demoLayoutBuilder/configurator/insertSettingDemonstrator.html.twig",
            async: false
        });

        var demoLayoutBuilderAdditionalSettingsView = twig({
            id: this.ids.DEMO_LAYOUT_BUILDER.GRID_ADDITIONAL_SETTINGS,
            href: "views/demoLayoutBuilder/configurator/gridAdditionalSettings.html.twig",
            async: false
        });

        var demoLayoutBuilderIntersectionsSettingDemonstratorView = twig({
            id: this.ids.DEMO_LAYOUT_BUILDER.INTERSECTIONS_SETTING_DEMONSTRATOR,
            href: "views/demoLayoutBuilder/configurator/intersectionsSettingDemonstrator.html.twig",
            async: false
        });

        var demoLayoutBuilderSortDispersionDemonstratorView = twig({
            id: this.ids.DEMO_LAYOUT_BUILDER.SORT_DISPERSION_SETTING_DEMONSTRATOR,
            href: "views/demoLayoutBuilder/configurator/sortDispersionSettingDemonstrator.html.twig",
            async: false
        });

        var createGridView = twig({
            id: this.ids.DEMO_LAYOUT_BUILDER.CREATE_GRID,
            href: "views/demoLayoutBuilder/configurator/createGrid.html.twig",
            async: false
        });

        var demoLayoutView = twig({
            id: this.ids.DEMO_LAYOUT_BUILDER.DEMO_LAYOUT,
            href: "views/demoLayoutBuilder/demoLayout/demoLayout.html.twig",
            async: false
        });
    },

    attach: function($view, $targetEl, viewId, params)
    {
        var params = params || {};
        var viewHTML = twig({ ref: viewId }).render(params);

        $view = $($.parseHTML(viewHTML));
        $targetEl.append($view);

        this.applyServicesTo($view);
        return $view;
    },

    applyServicesTo: function($view)
    {
        CssCalcNormalizer.applyTo($view.parent());
    }
}