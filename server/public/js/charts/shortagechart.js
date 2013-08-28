if (typeof(charts.shortagechart) != 'undefined') return;

//==============================================================================
// Static declarations
//

var drawDonut = null;
var drawHole = null;
var analyzeShortages = null;

// TODO: Move this to a utils file

function foldl(f, init, values) {
    var result = init;
    for (var i=0; i < values.length; i++) {
        result = f(result, values[i]);
    }
    return result;
}

function maximum(values) {
    if (values.length == 0)
        return null;

    return foldl(Math.max, values[0], values);
}

//==============================================================================
// Public API
//


charts.shortagechart = {

    MAX_CHART_WIDTH: 320,
    SINGLE_CHART_HEIGHT: 320,
    NUM_CHARTS_PER_ROW: 3,
    TOP_MARGIN: 50,

    getChartHeight: function(width, chartArray) {

        return (this.SINGLE_CHART_HEIGHT +this.TOP_MARGIN) *
            Math.ceil(chartArray.length / this.NUM_CHARTS_PER_ROW);
    },

    getEffortSize: function(chartDataset) {
        var shortage = chartDataset.shortage;
        var demand = chartDataset.demand;
        var anyShortage = false;
        for (var i=0; i < shortage.length; i++) {
            if (shortage[i].value > 0) {
                anyShortage = true;
                break;
            }
        }

        var result = 0;
        if (anyShortage) {
            for (var i=0; i < demand.length; i++) {
                result += demand[i].value;
            }
        }
        else {
            for (var i=0; i < shortage.length; i++) {
                result -= shortage[i].value;
            }
        }
        return result;
    },

    normalizeDimensions: function(dimension, sizes) {
        if (sizes.length == 0)
            return [];

        var max = maximum(sizes);
        var scale = dimension/max;
        var result = [];
        for (var i=0; i < sizes.length; i++) {
            result.push(scale * sizes[i]);
        }
        return result;
    },

    getChartLayout: function(chartArray, chartSizes) {
        var xStep = this.MAX_CHART_WIDTH;
        var yStep = this.SINGLE_CHART_HEIGHT + this.TOP_MARGIN;

        var curX = 0;
        var curY = 0;
        var result = [];
        for (var i=0; i < chartArray.length; i++) {
            var sizeOffset = (this.MAX_CHART_WIDTH - chartSizes[i])/2.0;
            curX = xStep * (i % this.NUM_CHARTS_PER_ROW) + sizeOffset;
            curY = this.TOP_MARGIN + yStep * Math.floor(i / this.NUM_CHARTS_PER_ROW);
            result.push([curX, curY]);
        }
        return result;
    },

    layOutCharts: function(selection, layouts) {
        selection.attr("transform", function(d, i) {
            return "translate(" + (layouts[i][0]) + "," + (layouts[i][1]) + ")";
        });
    },

    //------------------------------------------------------------------------------
    // Draws shortage chart in svg element.
    //
    draw: function(g, chart, size) {
        if (!chart.data.type) return;
        var dataset = chart.data.dataset;

        var height = size;
        var width = size;
        var titleSize = 24;


        var outerRadius = height / 2.0 * 0.8;
        var leftMargin = 15;
        var topMargin = 20;
        var cx = outerRadius + leftMargin;
        var cy = outerRadius + topMargin;
        var titleIndent = 20;

        charts.setChartHeight(g, height);
        charts.setChartWidth(g, width);

        // Compute total demand
        var totalDemand = 0;
        for (var i=0; i < dataset.demand.length; i++) {
            totalDemand += dataset.demand[i].value;
        }

        // Analyze shortages
        var shortageInfo = analyzeShortages(dataset.shortage);

        // Add chart title
        var title = g.append('text')
         .attr("font-size", titleSize + "px")
         .attr("font-family", charts.FONT_FAMILY)
         .text(chart.title);

        var textWidth = title[0][0].clientWidth;
        var horizMargin = 40;
        var titleOffset = (size - horizMargin - textWidth)/2.0;
        if (titleOffset < 0)
            titleOffset = 0;
        title.attr("transform", "translate(" + (titleOffset) + "," + (-10) + ")");


        //
        // Draw donut and hole
        //
        // NOTE: For a normal layout, the shortages are the hole.
        //       For an inverted layout, the demand is the hole.
        if (shortageInfo.normal_layout) {
            var innerRadius = outerRadius *
                Math.sqrt(shortageInfo.totalShortage/totalDemand);

            drawDonut(g, dataset.demand, outerRadius, innerRadius, cx, cy, false);
            drawHole(g, shortageInfo.shortages, innerRadius, cx, cy, false);
        }
        else {
            var innerRadius = outerRadius *
                Math.sqrt(totalDemand/(shortageInfo.totalShortage + totalDemand));

            drawHole(g, dataset.demand, innerRadius, cx, cy, true);
            drawDonut(g, shortageInfo.shortages, outerRadius, innerRadius, cx, cy, true);
        }
    }
}


//==============================================================================
// Static functions
//

drawDonut = function(svg, dataset, outerRadius, innerRadius, cx, cy, is_inverted) {
   // Parameters
   //
   // TODO: Scale label based on size
   var labelSize = 16;
   var color = d3.scale.category10();
   var textColor = "white";
   var stroke = "none";
   var strokeWidth = 0;

   if (is_inverted) {
      color = function(i) {return "#2ca02c"};
      textColor = "dark gray";
      stroke = "white";
      strokeWidth = 2;
   }

   var arc = d3.svg.arc().innerRadius(innerRadius)
      .outerRadius(outerRadius);

   var pie = d3.layout.pie()
      .value(function(d) {return d.value});

   var arcs = svg.selectAll("g.arc")
      .data(pie(dataset))
      .enter()
      .append("g")
      .attr("class", "arc")
      .attr("transform", "translate(" + cx + "," + cy + ")");
   arcs.append("path")
      .style('stroke-width', strokeWidth)
      .style('stroke', stroke)
      .attr("fill", function(d, i) {
         return color(i);
      })
   .attr("d", arc);

   // Add pie wedge labels
   //
   arcs.append("text")
      .attr("transform", function(d) {
         return "translate(" + arc.centroid(d) + ")";
      })
   .attr("text-anchor", "middle")
      .attr("fill", textColor)
      .attr("font-size", labelSize + "px")
      .attr("font-family", charts.FONT_FAMILY)
      .text(function(d) {
         return d.data.label;
      });
}

drawHole = function(svg, dataset, radius, cx, cy, is_inverted) {
   // Parameters
   //
   var outerRadius = radius;
   var innerRadius = 0;
   // TODO: Scale this based on size
   var labelSize = 16;

   var color = function(i) {return "#333"};
   var strokeWidth = 2;
   var stroke = "white";
   if (is_inverted) {
      color = d3.scale.category10();
      strokeWidth = 0;
      stroke = "none";
   }



   var arc = d3.svg.arc().innerRadius(innerRadius)
      .outerRadius(outerRadius);

   var pie = d3.layout.pie()
      .value(function(d) {return d.value});

   var arcs = svg.selectAll("g.holearc")
      .data(pie(dataset))
      .enter()
      .append("g")
      .attr("class", "holearc")
      .attr("transform", "translate(" + cx + "," + cy + ")");
   arcs.append("path")
      .style('stroke-width', strokeWidth)
      .style('stroke', stroke)
      .attr("fill", function(d, i) {
         return color(i);
      })
   .attr("d", arc);

   // Add pie wedge labels
   //
   arcs.append("text")
      .attr("transform", function(d) {
         return "translate(" + arc.centroid(d) + ")";
      })
   .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", labelSize + "px")
      .attr("font-family", charts.FONT_FAMILY)
      .text(function(d) {
         return d.data.label;
      });
}


analyzeShortages = function(shortages) {
   var result = {};
   result.shortages = [];
   result.totalShortage = 0;
   result.normal_layout = true;

   // To get the total shortage, we need to handle the case where some are
   // negative. We'll also need to filter out negative shortages from mixed
   // shortage.
   var hasPositiveShortage = false;
   var hasNegativeShortage = false;
   for (var i=0; i < shortages.length; i++) {
      var shortage = shortages[i].value;
      if (shortage <= 0) {
         hasNegativeShortage = true;
      }
      if (shortage > 0) {
         hasPositiveShortage = true;
      }
   }

   if (hasNegativeShortage == false && hasPositiveShortage == true) {
      for (var i=0; i < shortages.length; i++) {
         var shortage = shortages[i];
         result.shortages.push(shortage);
         result.totalShortage += shortage.value;
      }
   }
   else if (hasNegativeShortage == true && hasPositiveShortage == false) {
      // In this case, there are no shortages, so we want the "shortage" to be
      // the donut and the demand to be the hole (i.e., normal_layout -> false).
      // We'll also take the negative of the shortages.
      result.normal_layout = false;
      for (var i=0; i < shortages.length; i++) {
         var shortage = shortages[i];
         result.shortages.push(shortage);
         result.totalShortage -= shortage.value;
      }
   }
   else if (hasNegativeShortage && hasPositiveShortage) {
      // This is the mixed case. We want to show shortages only.
      for (var i=0; i < shortages.length; i++) {
         var shortage = shortages[i];
         if (shortage.value > 0) {
            result.shortages.push(shortage);
            result.totalShortage += shortage.value;
         }
      }
   }
   else {
      console.log("Ugh. Something went wrong");
   }

   return result;
}
