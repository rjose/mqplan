//==============================================================================
// Local declarations
//
var chartsModule = angular.module("mqplan", []);

var sample_charts = [
    {title: 'Chart 1',
     type: 'shortagechart',
     dataset: {demand: [
                    {label: 'Track1', value: 10},
                    {label: 'Track2', value: 20}
                    ],
               shortage: [
                    {label: 'Apps', value: 10},
                    {label: 'Native', value: 5}
               ]}},
    {title: 'Chart 2',
     type: 'shortagechart',
     dataset: {demand: [
                    {label: 'Track1', value: 10},
                    {label: 'Track2', value: 20}
                    ],
               shortage: [
                    {label: 'Apps', value: -13},
                    {label: 'Native', value: -5}
               ]}},
    {title: 'Chart 3',
     type: 'shortagechart',
     dataset: {demand: [
                    {label: 'Track1', value: 10},
                    {label: 'Track2', value: 20}
                    ],
               shortage: [
                    {label: 'Apps', value: 10},
                    {label: 'Native', value: 5}
               ]}},
    {title: 'Chart 4',
     type: 'shortagechart',
     dataset: {demand: [
                    {label: 'Track1', value: 10},
                    {label: 'Track2', value: 20}
                    ],
               shortage: [
                    {label: 'Apps', value: -3},
                    {label: 'Native', value: -5}
               ]}},
];

//==============================================================================
// Controllers
//
chartsModule.controller("MQPlanCtrl",
   ['$scope', '$location',
   function($scope, $location) {
      //========================================================================
      // Scope variables
      //
      $scope.title = "Array of Charts!";
      $scope.selected = null;
      $scope.charts = null; 

      //========================================================================
      // Static declarations
      //
      var renderPath;
      var setSelectedPath;

      //========================================================================
      // Public API and behavior
      //

      //------------------------------------------------------------------------
      // Updates "selected" scope variable when a chart is selected.
      //
      //    Typically, this will be called when someone clicks on one of the
      //    charts in the view.
      //
      $scope.selectChart = function(index) {
         if ($scope.selected == index) {
            setSelectedPath(null);
            $scope.selected = null;
         }
         else {
            setSelectedPath(index);
            $scope.selected = index;
         }

      };


      //------------------------------------------------------------------------
      // Renders page whenever URL changes.
      //
      $scope.$watch(function() {return $location.path()},
         function(newpath) {
            renderPath(newpath.substring(1));
         }
      );


      //========================================================================
      // Internal functions
      //

      //------------------------------------------------------------------------
      // Renders the state of the page given the path.
      //
      //    This is the funnel point for all changes to the page. If a user
      //    selects a chart, the render eventually comes through here.
      //
      //    We know when a page has been reloaded or visited directly because
      //    $scope.charts will not yet have been set. For this case, there
      //    should be no animation.
      //
      //    For the case where the user is interacting with the page, the charts
      //    will animate into place.
      //
      renderPath = function(path) {
         var matcher = /chart(\d+)/;
         var match = matcher.exec(path);
         if (match) {
            $scope.selected = parseInt(match[1]);
         }
         else {
            $scope.selected = null;
         }

         // If need to load data, do so. This should cause a render without
         // animation.
         if (!$scope.charts) {
            // TODO: Make an ajax call to get them
            setTimeout(function() {
               $scope.charts = sample_charts;
               $scope.$apply();
            }, 0);
         }
      }


      //------------------------------------------------------------------------
      // Sets the hash fragment part of the URL
      //
      setSelectedPath = function(index) {
         if (index == null) {
            $location.path('main');
         }
         else {
            $location.path('chart' + index);
         }
      }

   }]
);



//==============================================================================
// Directives
//


//------------------------------------------------------------------------------
// Adds ability to render charts to elements.
//
chartsModule.directive("teamcharts", function() {
   return {
      link: function(scope, element, attrs) {
         //=====================================================================
         // Static declarations
         //
         var DEFAULT_WIDTH = 960;
         var SELECTED_WIDTH = 640;
         var MAX_CHART_WIDTH = 320;
         var SINGLE_CHART_HEIGHT = 320;
         var NUM_CHARTS_PER_ROW = 3;
         var TOP_MARGIN = 50;

         var updateChartSize;
         var computeChartSizes;
         var computeLayouts;
         var getNominalLayout;
         var getChartHeight;
         var normalizeDimensions;
         var layOutCharts;

         //=====================================================================
         // Public API and behavior
         //

         //---------------------------------------------------------------------
         // Redraws chart area when selected chart changes.
         //
         //    When a chart is selected, the overall chart area is resized to a
         //    narrower width to allow for the display of details on the chart.
         //    When a chart is deselected (i.e., selected becomes null), the
         //    overall chart is resized to its original dimensions.
         //
         //    If chart data already exists, this animates the existing charts
         //    to their new locations. Otherwise, nothing else is done.
         //
         scope.$watch('selected', function() {
            scope.width = SELECTED_WIDTH;
            if (scope.selected == null) {
               scope.width = DEFAULT_WIDTH;
               updateChartSize();
            }

            // If we have chart data, animate charts to their new positions.
            if (scope.charts) {
              var chartLayouts =
               computeLayouts(scope.selected, scope.width);

              // Move charts into new positions
              var selection = d3.selectAll("g.shortagechart");
              layOutCharts(selection, chartLayouts, true,
                                                function() {updateChartSize()});
            }
         });


         //---------------------------------------------------------------------
         // Creates array of shortage charts when charts data changes.
         //
         //    Whenever scope.charts changes, this deletes any existing shortage
         //    charts from the parent view, and reconstructs them from the new
         //    chart data, laying out the charts based on on what chart (if any)
         //    is selected, and setting up the click handlers for each item.
         //
         scope.$watch('charts', function() {
            if (!scope.charts) return;
            $(element[0]).empty();

            // Create svg parent
            var svg = d3.select(element[0])
               .append("svg")
               .attr("id", "charts")
               .attr("width", scope.width)
               .attr("height", scope.height);

            // Compute layout info
            var chartSizes = computeChartSizes();
            var chartLayouts = computeLayouts(scope.selected, scope.width);
            var data = [];
            for (var i=0; i < scope.charts.length; i++) {
                data.push({
                    data: scope.charts[i],
                    size: chartSizes[i],
                    layout: chartLayouts[i]
                });
            }

            // Add shortage charts
            svg.selectAll("g.shortagechart")
                .data(data)
                .enter()
                .append("g").attr("class", "shortagechart")
                .each(function(d) {
                    charts.shortagechart.draw(d3.select(this), d);
                })
                .on('click', function(d, i) {
                    scope.selectChart(i);
                    scope.$apply();
                 });
         });


         //=====================================================================
         // Internal functions
         //

         //---------------------------------------------------------------------
         // Returns overall chart height given area and number of charts.
         //
         getChartHeight = function(width, numCharts) {
            var numRows = Math.ceil(numCharts / NUM_CHARTS_PER_ROW) + 1;
            return (SINGLE_CHART_HEIGHT + TOP_MARGIN) * numRows;
         }


         //---------------------------------------------------------------------
         // Gets nominal chart layout.
         //
         //    In effect, this is the chart layout when none of the charts is
         //    selected.
         //
         getNominalLayout = function(chartArray, chartSizes) {
             var xStep = MAX_CHART_WIDTH;
             var yStep = SINGLE_CHART_HEIGHT + TOP_MARGIN;

             var curX = 0;
             var curY = 0;
             var result = [];
             for (var i=0; i < chartArray.length; i++) {
                 var sizeOffset = (MAX_CHART_WIDTH - chartSizes[i])/2.0;
                 curX = xStep * (i % NUM_CHARTS_PER_ROW) + sizeOffset;
                 curY = TOP_MARGIN + yStep * Math.floor(i / NUM_CHARTS_PER_ROW);
                 result.push([curX, curY]);
             }
             return result;
         }

         //---------------------------------------------------------------------
         // Returns an array of sizes scaled to "dimension".
         //
         normalizeDimensions = function(dimension, sizes) {
             if (sizes.length == 0)
                 return [];

             var max = maximum(sizes);
             var scale = dimension/max;
             var result = [];
             for (var i=0; i < sizes.length; i++) {
                 result.push(scale * sizes[i]);
             }
             return result;
         }


         //---------------------------------------------------------------------
         // Updates dimensions of total chart area using scope data.
         //
         updateChartSize = function() {
            if (!scope.charts) return;

            // Apply new chart width and height
            var svg = d3.select("svg#charts");
            scope.height = getChartHeight(scope.width, scope.charts.length);
            charts.setChartHeight(svg, scope.height);
            charts.setChartWidth(svg, scope.width);
         }


         //---------------------------------------------------------------------
         // Scales chart sizes relative to target size.
         //
         //    This scales the charts so the one with the biggest effort is of
         //    height SINGLE_CHART_HEIGHT. All other charts are sized relatively
         //    based on total effort.
         //
         computeChartSizes = function() {
            var chartEffortSizes = [];
            for (var i=0; i < scope.charts.length; i++) {
                chartEffortSizes.push(
                    charts.shortagechart
                      .getEffortSize(scope.charts[i].dataset));
            }

            var chartSizes =
               normalizeDimensions(SINGLE_CHART_HEIGHT, chartEffortSizes);
            return chartSizes;
         }


         //---------------------------------------------------------------------
         // Computes a basic layout for the shortage charts.
         //
         //    This just packs shortage charts in rows. If one of the charts is
         //    selected, it goes to the top left by in its own row.
         //
         //    NOTE: We may want to replace this with a tree layout
         //
         computeLayouts = function(selectedIndex, chartAreaWidth) {
            var chartSizes = computeChartSizes();

            if (selectedIndex == null) {
                return getNominalLayout(scope.charts, chartSizes);
            }

            var curX = 0;
            var stepY = 400;
            var marginX = 70;
            var curY = chartSizes[selectedIndex] + 100;
            var newLayouts = [];

            for (var i=0; i < chartSizes.length; i++) {
               if (i == selectedIndex) {
                  newLayouts.push([50, 50]);
               }
               else {
                  newLayouts.push([curX, curY]);
                  var chartWidth = chartSizes[i];
                  if (curX + chartWidth + marginX >= chartAreaWidth) {
                     curX = 0;
                     curY += stepY;
                  }
                  else {
                     curX += (chartWidth + marginX);
                  }
               }
            }
             return newLayouts;
         }


         //---------------------------------------------------------------------
         // Lays out charts in the chart area.
         //
         //    If animate is true, the charts are animated into position.
         //
         layOutCharts = function(selection, layouts, animate, callback) {
            if (animate) {
               selection.transition()
                  .duration(1000)
                  .attr("transform", function(d, i) {
                     return "translate(" + (layouts[i][0]) + "," + (layouts[i][1]) + ")";
                  })
               .each("end", callback);
            }
            else {
               selection
                  .attr("transform", function(d, i) {
                     return "translate(" + (layouts[i][0]) + "," + (layouts[i][1]) + ")";
                  })
               .each("end", callback);
            }
         }

      }
   } });
