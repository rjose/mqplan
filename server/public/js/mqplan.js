//==============================================================================
// Local declarations
//
var chartsModule = angular.module("mqplan", []);

//==============================================================================
// Controllers
//
chartsModule.controller("MQPlanCtrl",
   ['$scope', '$location',
   function($scope, $location) {
      $scope.title = "Array of Charts!";
      $scope.selected = null;
      $location.path('main');

      function setSelectedPath(index) {
         if (index == null) {
            $location.path('main');
         }
         else {
            $location.path('chart' + index);
         }
      }

      setSelectedPath(null);

      function computeSelectedChartLayout(selectedIndex, chartAreaWidth) {
         var charts = d3.selectAll("g.shortagechart");
         var curX = 0;
         var stepY = 400;
         var marginX = 70;
         var curY =
            parseInt(d3.select(charts[0][selectedIndex]).attr("height")) + 100;
         console.log(curY);
         var newLayouts = [];

         charts.each(function(d, i) {
            if (i == selectedIndex) {
               newLayouts.push([50, 50]);
            }
            else {
               newLayouts.push([curX, curY]);
               var chartWidth = parseInt(d3.select(this).attr('width'));
               if (curX + chartWidth >= chartAreaWidth) {
                  curX = 0;
                  curY += stepY;
               }
               else {
                  curX += (chartWidth + marginX);
               }
            }
         });
          return newLayouts;
      }

      $scope.selectChart = function(index) {
         if ($scope.selected == index) {
            setSelectedPath(null);
         }
         else {
            setSelectedPath(index);
         }

          var selection = d3.selectAll("g.shortagechart");

          // TODO: Move this layout code out of the controller
          // Set width of chart area based chart selection
          var chartWidth;
          var chartLayouts;
          if ($scope.selected != index) {
             chartWidth = 640;
             chartLayouts =
                computeSelectedChartLayout(index, chartWidth);
          }
          else {
             chartWidth = 960;
             chartLayouts = $scope.defaultChartLayouts;
          }
          var chartHeight =
             charts.shortagechart.getChartHeight(chartWidth, $scope.charts);

          // Lay out charts
          charts.shortagechart.layOutCharts(selection, chartLayouts);

          // Apply new chart width and height
          var svg = d3.select("svg#charts");
          charts.setChartHeight(svg, chartHeight);
          charts.setChartWidth(svg, chartWidth);
          $scope.selected = index;
      };

      $scope.charts = [
        {title: 'Chart 1', data: {type: 'shortagechart',
                dataset: {demand: [
                        {label: 'Track1', value: 10},
                        {label: 'Track2', value: 20}
                ], shortage: [
                        {label: 'Apps', value: 10},
                        {label: 'Native', value: 5}
                ]}}},
        {title: 'Chart 2', data: {type: 'shortagechart',
                dataset: {demand: [
                        {label: 'Track1', value: 10},
                        {label: 'Track2', value: 10}
                ], shortage: [
                        {label: 'Apps', value: -3},
                        {label: 'Native', value: -5}
                ]}}},
        {title: 'Chart 3', data: {type: 'shortagechart',
                dataset: {demand: [
                        {label: 'Track1', value: 10},
                        {label: 'Track2', value: 20}
                ], shortage: [
                        {label: 'Apps', value: 10},
                        {label: 'Native', value: 5}
                ]}}},
        {title: 'Chart 4', data: {type: 'shortagechart',
                dataset: {demand: [
                        {label: 'Track1', value: 10},
                        {label: 'Track2', value: 10}
                ], shortage: [
                        {label: 'Apps', value: -3},
                        {label: 'Native', value: -5}
                ]}}}
      ];
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
         var el = element[0];
         var width = el.offsetWidth;
         var height = el.offsetHeight;

         // TODO: Split the responsibilities of this function
         scope.$watch('charts', function() {
            if (!scope.charts) return;

            // Clear out contents before creating new chart
            $(el).empty();

            var svg = d3.select(element[0])
               .append("svg")
               .attr("id", "charts")
               .attr("width", width)
               .attr("height", height);

            // TODO: figure out if we can assume initial set up here
            // TODO: Figure out if a chart is selected
            var selectedChart = null;

            // If a chart is selected, then we'll have a narrow view for the
            // shortage charts.
            var chartWidth = 960;
            if (selectedChart) {
                chartWidth = 640;
            }
            var chartHeight = charts.shortagechart.getChartHeight(chartWidth, scope.charts);
            charts.setChartHeight(svg, chartHeight);
            charts.setChartWidth(svg, chartWidth);

            // Compute chart sizes
            var chartEffortSizes = [];
            for (var i=0; i < scope.charts.length; i++) {
                chartEffortSizes.push(
                    charts.shortagechart
                      .getEffortSize(scope.charts[i].data.dataset));
            }

            var chartSizes = charts.shortagechart
               .normalizeDimensions(charts.shortagechart.SINGLE_CHART_HEIGHT,
                                    chartEffortSizes);

            // Get chart layout
            scope.defaultChartLayouts =
                charts.shortagechart.getChartLayout(scope.charts,chartSizes);

            var data = [];
            for (var i=0; i < scope.charts.length; i++) {
                data.push({
                    data: scope.charts[i],
                    size: chartSizes[i],
                    layout: scope.defaultChartLayouts[i]
                });
            }


            // HACK: Figure out how to lay out charts and to set their sizes
            // TODO: Move the click handler to its own function
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

//                        var selectedChart = d3.select(this);
//                        selectedChart.transition()
//                                .duration(1000)
//                                .attr("transform", function(d, i) {
//                                        return "translate(" + (i * 300 + 200) + "," + 0 + ")";
//                                });
                 });
         });
      }
   } });
