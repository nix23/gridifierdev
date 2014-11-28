$(document).ready(function() {
    window.outerWidthTesterPxWidthPxPaddingGrid = {
        testCallWithContentBoxPxWidthAndPxPaddingGridPerAllContentBoxItems: function() {
            var gridWidths = [17, 261, 300, 550, 773];

            for(var i = 0; i < gridWidths.length; i++) {
                var gridWidth = gridWidths[i];
                var $grid = this._gridGenerator.gridsWithContentBoxBS.createGridWithPxWidthAndPxPadding(gridWidth);
                var gridHorizontalPaddingLabel = this._gridGenerator.gridsWithContentBoxBS.PADDING_PX_SIZE;
                var gridLabel = gridWidth + "px; padding = " + gridHorizontalPaddingLabel;

                this._gridItemTests.setBoxSizing(this._gridItemTests.BOX_SIZINGS.CONTENT_BOX);
                clearTestData();
                $testContent.append($grid);
                this._gridItemTests.callPerItemWithPxWidth($grid, gridLabel, 237, 237);

                clearTestData();
                $testContent.append($grid);
                var itemWidth = 237;
                var expectedItemWidth = itemWidth + parseInt(this._gridItemTests.PADDING_PX_SIZE, 10) * 2;
                this._gridItemTests.callPerItemWithPxWidthAndPxPadding(
                    $grid, gridLabel, itemWidth, expectedItemWidth
                );

                clearTestData();
                $testContent.append($grid);
                var itemWidth = 237;
                var expectedItemWidth = itemWidth + parseInt(this._gridItemTests.MARGIN_PX_SIZE, 10) * 2;
                this._gridItemTests.callPerItemWithPxWidthAndPxMargin(
                    $grid, gridLabel, itemWidth, expectedItemWidth
                );

                clearTestData();
                $testContent.append($grid);
                var itemWidth = 237;
                var expectedItemWidth = itemWidth + parseInt(this._gridItemTests.BORDER_PX_SIZE, 10) * 2;
                this._gridItemTests.callPerItemWithPxWidthAndPxBorder(
                    $grid, gridLabel, itemWidth, expectedItemWidth
                );

                clearTestData();
                $testContent.append($grid);
                var itemWidth = 30;
                var gridHorizontalPadding = parseInt(this._gridGenerator.gridsWithContentBoxBS.PADDING_PX_SIZE, 10) * 2;
                var expectedItemWidth = (gridWidth + gridHorizontalPadding) / 100 * itemWidth;
                this._gridItemTests.callPerItemWithPercentageWidth(
                    $grid, gridLabel, itemWidth, expectedItemWidth
                );

                // @Notice -> test disabled.(When grid has px padding, and grid item has percentage paddings,
                //                           Chrome calculates grid item paddings from raw parent width,
                //                           FF calculates from raw parent width + paddings)
                // clearTestData();
                // $testContent.append($grid);
                // var itemWidth = 30;
                // var gridHorizontalPadding = parseInt(this._gridGenerator.gridsWithContentBoxBS.PADDING_PX_SIZE, 10) * 2;
                // var expectedItemWidth = (gridWidth + gridHorizontalPadding) / 100 * itemWidth;
                // // Percentage padding width is relative to parent's raw width(without paddings)
                // var paddingWidth = (gridWidth) / 100 * (parseFloat(this._gridItemTests.PADDING_PERCENTS_SIZE) * 2);
                // expectedItemWidth += paddingWidth;
                // var $item = this._gridItemTests._createItem(itemWidth + "%");
                // $item.css({"padding": this._gridItemTests.PADDING_PERCENTS_SIZE})
                // $grid.append($item);
                // this._gridItemTests.callPerItemWithPercentageWidthAndPercentagePadding(
                //     $grid, gridLabel, itemWidth, expectedItemWidth
                // );

                // @Notice -> test disabled.(When grid has px padding, and grid item has percentage margins,
                //                           Chrome is calculating margins incorrectly(OK In FF))
                // clearTestData();
                // $testContent.append($grid);
                // var itemWidth = 33;
                // var gridHorizontalPadding = parseInt(this._gridGenerator.gridsWithContentBoxBS.PADDING_PX_SIZE, 10) * 2;
                // var expectedItemWidth = (gridWidth + gridHorizontalPadding) / 100 * itemWidth;
                // var marginWidth = (gridWidth + gridHorizontalPadding) / 100 * (parseFloat(this._gridItemTests.MARGIN_PERCENTS_SIZE) * 2);
                // expectedItemWidth += marginWidth;
                // this._gridItemTests.callPerItemWithPercentageWidthAndPercentageMargin(
                //     $grid, gridLabel, itemWidth, expectedItemWidth
                // );

                clearTestData();
                $testContent.append($grid);
                var itemWidth = 33;
                var gridHorizontalPadding = parseInt(this._gridGenerator.gridsWithContentBoxBS.PADDING_PX_SIZE, 10) * 2;
                var expectedItemWidth = (gridWidth + gridHorizontalPadding) / 100 * itemWidth;
                var borderWidth = parseInt(this._gridItemTests.BORDER_PX_SIZE) * 2;
                expectedItemWidth += borderWidth;
                this._gridItemTests.callPerItemWithPercentageWidthAndPxBorder(
                    $grid, gridLabel, itemWidth, expectedItemWidth
                );
            }
        },

        testCallWithContentBoxPxWidthAndPxPaddingGridPerAllBorderBoxItems: function() {
            var gridWidths = [17, 261, 300, 550, 773];

            for(var i = 0; i < gridWidths.length; i++) {
                var gridWidth = gridWidths[i];
                var $grid = this._gridGenerator.gridsWithContentBoxBS.createGridWithPxWidthAndPxPadding(gridWidth);
                var gridHorizontalPaddingLabel = this._gridGenerator.gridsWithContentBoxBS.PADDING_PX_SIZE;
                var gridLabel = gridWidth + "px; padding = " + gridHorizontalPaddingLabel;

                this._gridItemTests.setBoxSizing(this._gridItemTests.BOX_SIZINGS.BORDER_BOX);
                clearTestData();
                $testContent.append($grid);
                this._gridItemTests.callPerItemWithPxWidth($grid, gridLabel, 237, 237);

                clearTestData();
                $testContent.append($grid);
                var itemWidth = 237;
                var expectedItemWidth = itemWidth;
                this._gridItemTests.callPerItemWithPxWidthAndPxPadding(
                    $grid, gridLabel, itemWidth, expectedItemWidth
                );

                clearTestData();
                $testContent.append($grid);
                var itemWidth = 237;
                var expectedItemWidth = itemWidth + parseInt(this._gridItemTests.MARGIN_PX_SIZE, 10) * 2;
                this._gridItemTests.callPerItemWithPxWidthAndPxMargin(
                    $grid, gridLabel, itemWidth, expectedItemWidth
                );

                clearTestData();
                $testContent.append($grid);
                var itemWidth = 237;
                var expectedItemWidth = itemWidth;
                this._gridItemTests.callPerItemWithPxWidthAndPxBorder(
                    $grid, gridLabel, itemWidth, expectedItemWidth
                );

                clearTestData();
                $testContent.append($grid);
                var gridHorizontalPadding = parseInt(this._gridGenerator.gridsWithContentBoxBS.PADDING_PX_SIZE, 10) * 2;
                var itemWidth = 30;
                var expectedItemWidth = (gridWidth + gridHorizontalPadding) / 100 * itemWidth;
                this._gridItemTests.callPerItemWithPercentageWidth(
                    $grid, gridLabel, itemWidth, expectedItemWidth
                );

                // @Notice -> test disabled. (When grid has px padding set and grid item has % padding,
                //                            IE11 returns incorrect calculated width per grid item)
                // clearTestData();
                // $testContent.append($grid);
                // var gridHorizontalPadding = parseInt(this._gridGenerator.gridsWithContentBoxBS.PADDING_PX_SIZE, 10) * 2;
                // var itemWidth = 30;
                // var expectedItemWidth = (gridWidth + gridHorizontalPadding) / 100 * itemWidth;
                // var $item = this._gridItemTests._createItem(itemWidth + "%");
                // $item.css({"padding": this._gridItemTests.PADDING_PERCENTS_SIZE})
                // $grid.append($item);
                // this._gridItemTests.callPerItemWithPercentageWidthAndPercentagePadding(
                //     $grid, gridLabel, itemWidth, expectedItemWidth
                // );

                // @Notice -> test disabled. (When grid has px padding and grid item has % margin,
                //                            Chrome returns incorrect calculated margins per item)
                // clearTestData();
                // $testContent.append($grid);
                // var gridHorizontalPadding = parseInt(this._gridGenerator.gridsWithContentBoxBS.PADDING_PX_SIZE, 10) * 2;
                // var itemWidth = 33;
                // var expectedItemWidth = (gridWidth + gridHorizontalPadding) / 100 * itemWidth;
                // var marginWidth = (gridWidth + gridHorizontalPadding) / 100 * (parseFloat(this._gridItemTests.MARGIN_PERCENTS_SIZE) * 2);
                // expectedItemWidth += marginWidth;
                // this._gridItemTests.callPerItemWithPercentageWidthAndPercentageMargin(
                //     $grid, gridLabel, itemWidth, expectedItemWidth
                // );

                clearTestData();
                $testContent.append($grid);
                var gridHorizontalPadding = parseInt(this._gridGenerator.gridsWithContentBoxBS.PADDING_PX_SIZE, 10) * 2;
                var itemWidth = 33;
                var expectedItemWidth = (gridWidth + gridHorizontalPadding) / 100 * itemWidth;
                this._gridItemTests.callPerItemWithPercentageWidthAndPxBorder(
                    $grid, gridLabel, itemWidth, expectedItemWidth
                );
            }
        }
    }
});