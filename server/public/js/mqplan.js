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

         scope.$watch('charts', function() {
            if (!scope.charts) return;

            // Clear out contents before creating new chart
            $(el).empty();

            var svg = d3.select(element[0])
               .append("svg")
               .attr("width", width)
               .attr("height", height);

            // TODO: Figure out how to set the size of the chart based on the
            // input data.
            charts.setChartHeight(svg, 700);
            charts.setChartWidth(svg, 700);

            // HACK: Figure out how to lay out charts and to set their sizes
            // TODO: Move the click handler to its own function
            svg.selectAll("g.shortagechart")
                .data(scope.charts)
                .enter()
                .append("g").attr("class", "shortagechart")
                .attr("transform", function(d, i) {
                        return "translate(" + (i * 300) + "," + 0 + ")";
                })
                .each(charts.shortagechart.drawChart)
                .on('click', function(d) {
                        var selectedChart = d3.select(this);
                        console.log(selectedChart);
                        selectedChart.transition()
                                .duration(1000)
                                .attr("transform", function(d, i) {
                                        return "translate(" + (i * 300 + 200) + "," + 0 + ")";
                                });
                 });
         });
      }
   } });
