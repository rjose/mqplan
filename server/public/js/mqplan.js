//==============================================================================
// Local declarations
//
var chartsModule = angular.module("mqplan", []);

//==============================================================================
// Controllers
//
chartsModule.controller("MQPlanCtrl",
   ['$scope',
   function($scope) {
      $scope.title = "Array of Charts!";
      $scope.selected = null;

      $scope.selectChart = function(index) {
          var selection = d3.selectAll("g.shortagechart");
          var newLayouts = [];
          for (var i=0; i < $scope.defaultChartLayouts.length; i++) {
              var layout = $scope.defaultChartLayouts[i];
              newLayouts.push([layout[0] + 50, layout[1] + 50]);
          }

          if ($scope.selected == index) {
              charts.shortagechart.layOutCharts(selection, $scope.defaultChartLayouts);
          }
          else {
              charts.shortagechart.layOutCharts(selection, newLayouts);
              //var tree = d3.layout.tree();
              //tree.size([960, 640]);
              //tree.nodeSize([300, 300]);
              //selection.call(function(selection) {
              //    var nodes = selection[0];
              //    var root = nodes[index];
              //    var children = [];
              //    for (var i=0; i < nodes.length; i++) {
              //        if (i != index) {
              //            children.push(nodes[i]);
              //        }
              //    }
              //    root.children = children;
              //    var newNodes = tree.nodes(root);

              //    var newLayouts = [];
              //    for (var i=0; i < newNodes.length; i++) {
              //        newLayouts.push([newNodes[i].x, newNodes[i].y]);
              //    }
              //    charts.shortagechart.layOutCharts(selection, newLayouts);
              //});
          }
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
               .attr("width", width)
               .attr("height", height);

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
