"uss strict";

(function(){
  angular
  .module("dashboard")
  .directive("trainingChart", TrainingChartDirective)

  TrainingChartDirective.$inject = ["$window", "Scorer"];

  function TrainingChartDirective($window, Scorer){
    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        block: "="
      },
      templateUrl: "dashboard/training/_training_chart.html"
    };
    return directive;

    function link(scope,el,attrs){

      scope.$on("update-chart", function(e, data, subtask){
        scope.block = false;
        scope.enums = data;
        scope.field = subtask;
        update(subtask || "All Subtasks");
      });

      scope.$on("block-charts", function(e){
        scope.block = true;
      });

      var svg,enums,w,h,kSvg,kSvgG,kLine,ksvgW;

      var colorScale = Scorer.colorScale;
      var domainStops = colorScale.domain().filter(function(d,i){return (i+1)%2 == 0});
      var colors = colorScale.range();

      angular.element($window).bind("resize", resize);

      var tooltip = d3.select(el[0]).select(".ttip");

      init();

      function init(){
        svg = d3.select(el[0]).select(".box-container");
        w = el.find(".box-container")[0].clientWidth - 12;
        if (w < 20){
          w = document.querySelector(".row").clientWidth - 12;
        }
        ksvgW = w - 20;

        makeKsvg();
      }

      function makeKsvg(){
        kSvg = d3.select(el[0]).select(".svg-key").attr("height",30);
        var uniqueColors = colors.filter(function(d,i){return i%2 == 0});
        kSvgG = kSvg.append("g");
        kSvgG.append("g").attr("class","rects").selectAll("rect").data(domainStops).enter().append("rect")
          .attr("fill", function(d,i){return uniqueColors[i]})
          .attr("height",20)
          .attr("width", function(d,i){
            var e = d;
            var s = domainStops[i-1] || 0;
            var pct = (e - s) / 100;
            return pct * ksvgW;
          })
          .attr("transform", function(d,i){
            var xd = domainStops[i-1] || 0;
            var x = xd == 0 ? 0 : xd/100*ksvgW;
            var y = 5;
            return "translate("+x+","+y+")";
          })

        kLine = kSvgG.append("line")
          .attr("y1",0)
          .attr("y2",30)
          .attr("x1",-100)
          .attr("x2",-100)
          .attr("stroke","black")
          .attr("stroke-width",3)
      }

      function resize(){

        w = el.find(".box-container")[0].clientWidth - 12;
        ksvgW = w - 20;

        kSvgG.selectAll("rect")
          .attr("height",20)
          .attr("width", function(d,i){
            var e = d;
            var s = domainStops[i-1] || 0;
            var pct = (e - s) / 100;
            return pct * ksvgW > 0 ? pct * ksvgW : 1;
          })
          .attr("transform", function(d,i){
            var xd = domainStops[i-1] || 0;
            var x = xd == 0 ? 0 : xd/100*ksvgW;
            var y = 5;
            return "translate("+x+","+y+")";
          })

        kLine.attr("x1",-100).attr("x2",-100)

      }

      function update(field){

        scope.enums.sort(function(a,b){
          if (a.response_info.enumerator_id < b.response_info.enumerator_id) return -1;
          if (a.response_info.enumerator_id > b.response_info.enumerator_id) return 1;
          return 0;
        });

        enums = svg.selectAll(".enumerator").data(scope.enums).attr("class","enumerator");

        var newEnums = enums.enter().append("div").attr("class","enumerator well left col-xs-2")
          .attr("data-toggle","modal").attr("data-target","#trainingViewModal")
          .style("background",function(d){
            var val = field == "All Subtasks" ? d.summary.avg :
              d.sections.hasOwnProperty(field) ? d.sections[field].summary.avg : -1;
            var color = val !== -1 ? colorScale(val*100) : "#ccc";
            return Scorer.rgbaify(color,0.6);
          }).html(function(d){
             return "<p>"+d.response_info.enumerator_id+"<br>"+d.response_info.enumerator_name+"</p>";
          })

        enums.exit().remove();

        enums.attr("class","enumerator well left col-xs-2")//.transition().duration(500)
          .style("background", function(d){
            var val = field == "All Subtasks" ? d.summary.avg :
              d.sections.hasOwnProperty(field) ? d.sections[field].summary.avg : -1;
            var color = val !== -1 ? colorScale(val*100) : "#ccc";
            return Scorer.rgbaify(color,0.6);
          })
          .html(function(d){
            return "<p>"+d.response_info.enumerator_id+"<br>"+d.response_info.enumerator_name+"</p>";
          })

        enums.select(".chartFO")
          .html(function(d){
            return "<p>"+d.response_info.enumerator_id+"<br>"+d.response_info.enumerator_name+"</p>";
          })

        enums.on("mouseover", function(d){
          var score = field == "All Subtasks" ? d.summary.score :
            d.sections.hasOwnProperty(field) ? d.sections[field].summary.score : -1;
          var outOf = field == "All Subtasks" ? d.summary.outOf :
            d.sections.hasOwnProperty(field) ? d.sections[field].summary.outOf : -1;
          var avg = field == "All Subtasks" ? d3.round(d.summary.avg*100,2) :
           d.sections.hasOwnProperty(field) ? d3.round(d.sections[field].summary.avg*100,2) : -1;
          var val = score+"/"+outOf+", "+avg+"%";
          var text = "<p style='float:left'><span>"+d.response_info.enumerator_name+"</span><span> -  "+d.response_info.enumerator_id+"</span></p><p style='float:right'>"+val+"</p>";
          tooltip.html(text);

          kLine.transition().duration(500)
            .attr("x1",ksvgW*avg/100)
            .attr("x2",ksvgW*avg/100)

        })

        enums.on("click", function(d){
          if (scope.field !== "All Subtasks" && !d.sections.hasOwnProperty(scope.field)){
            d3.event.stopPropagation();
            return;
          }
          scope.$emit("clicked-modal",d);
        });

      }

    }
  }

}())
