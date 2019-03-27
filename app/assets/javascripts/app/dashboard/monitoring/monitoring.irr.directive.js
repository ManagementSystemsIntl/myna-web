// "use strict";

(function(){
  angular
  .module("dashboard")
  .directive("monitoringIrr", MonitoringIRR)

  MonitoringIRR.$inject = ["$q", "Scorer", "$window"];

  function MonitoringIRR($q, Scorer, $window){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        pouch: "=",
        schemas: "="
      },
      templateUrl: "dashboard/monitoring/_monitoring_irr.html"
    };
    return directive;

    function link(scope, el){

      scope.irrs;
      scope.resettable = false;
      scope.updateIrrModal = updateIrrModal;

      scope.$on("update-irr", function(evt, date){
        updateData(date).then(function(irrs){
          scope.irrs = irrs;
          scope.originalIrrs = angular.copy(irrs);
          scope.clusterData = Scorer.formatForClusterChart(irrs, "All Subtasks").reverse();
          resize();
          updateChart();
          updateClusterChart();
          scope.$digest();
        })
      });

      angular.element("a[data-target='#irr']").on("shown.bs.tab", function(evt){
        try{
          resize();
          scope.$apply();
        }catch(err){
          //
        }
      });

      var svg,irrs,w,h,kSvg,kSvgG,kLine,ksvgW;

      el.find("button").on("click", function(){
        scope.resettable = false;
        scope.irrs = angular.copy(scope.originalIrrs);
        updateChart();
        scope.$digest();
      });

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
            return pct * ksvgW > 0 ? pct * ksvgW : 0;
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
        d3.select(el[0]).select(".cluster-chart").selectAll("*").remove();
        updateClusterChart();

        w = el.find(".box-container")[0].clientWidth - 12;
        if (w < 20){
          w = document.querySelector(".row").clientWidth - 12;
        }
        ksvgW = w - 20;

        kSvgG.selectAll("rect")
          .attr("height",20)
          .attr("width", function(d,i){
            var e = d;
            var s = domainStops[i-1] || 0;
            var pct = (e - s) / 100;
            return pct * ksvgW > 0 ? pct * ksvgW : 0;
          })
          .attr("transform", function(d,i){
            var xd = domainStops[i-1] || 0;
            var x = xd == 0 ? 0 : xd/100*ksvgW;
            var y = 5;
            return "translate("+x+","+y+")";
          })

        kLine.attr("x1",-100).attr("x2",-100);

        scope.$digest();
      }

      function updateData(date){
        var options = {include_docs: false, reduce: true, group_level: 2, startkey: [date], endkey: [date,{}]};
        return scope.pouch.queryResponses("monitoring/operational-date-student", options).then(function(res){
          var irr = res.filter(function(d){ return d.value > 1});
          var irr_queries = irr.map(function(d){
            var options = {include_docs: true, reduce: false, key: d.key};
            return scope.pouch.queryResponses("monitoring/operational-date-student", options);
          });
          return $q.all(irr_queries);
        }).then(function(irrs){
          return irrs.map(function(docs){
            docs[0].direction = getSurveyDirection(docs[0]);
            return Scorer.formatForTrainingChart(docs, ["Consent_"]);
          }).sort(function(a,b){ return a.enumids[0] - b.enumids[0] });
        });
      }

      function updateChart(){

        irrs = svg.selectAll(".enumerator").data(scope.irrs).attr("class","enumerator");

        var newIrrs = irrs.enter().append("div").attr("class","enumerator well left col-xs-2")
          .attr("data-toggle","modal").attr("data-target","#monitoringIrrModal")
          .style("background",function(d){
            var val = d.summary.avg;
            var color = val !== -1 ? colorScale(val*100) : "#ccc";
            return Scorer.rgbaify(color,0.6);
          }).html(function(d){
             return "<p>"+d.enumids.join("<br>")+"</p>";
          })

        irrs.exit().remove();

        irrs.attr("class","enumerator well left col-xs-2")//.transition().duration(500)
          .style("background", function(d){
            var val = d.summary.avg;
            var color = val !== -1 ? colorScale(val*100) : "#ccc";
            return Scorer.rgbaify(color,0.6);
          })
          .html(function(d){
            return "<p>"+d.enumids.join("<br>")+"</p>";
          })

        irrs.select(".chartFO")
          .html(function(d){
            return "<p>"+d.enumids.join("<br>")+"</p>";
          })

        irrs.on("mouseover", function(d){
          var score = d.summary.score;
          var outOf = d.summary.outOf;
          var avg = d3.round(d.summary.avg*100,2);
          var val = score+"/"+outOf+", "+avg+"%";
          var text = "<p style='float:left'><span>"+d.names.join(", ")+"</span></p><p style='float:right'>"+val+"</p>";
          tooltip.html(text);

          kLine.transition().duration(500)
            .attr("x1",ksvgW*avg/100)
            .attr("x2",ksvgW*avg/100)
        })

        irrs.on("click", function(d){
          // if (scope.field !== "All Subtasks" && !d.sections.hasOwnProperty(scope.field)){
          //   d3.event.stopPropagation();
          //   return;
          // }
          scope.$emit("update-irr-modal", d);
        });
      }

      function getSurveyDirection(doc){
        var uuid = doc.response_info.survey_uuid;
        var language = doc.response_info.language || "language";
        var schema = scope.schemas.find(function(d){ return d._id == uuid });
        if (doc.hasOwnProperty("surveys")){
          var survey_uuid = schema.survey_info.surveys[0].uuid;
          schema = scope.schemas.find(function(d){ return d._id == survey_uuid });
          return schema.translations[language].survey_direction;
        }else{
          return schema.translations[language].survey_direction;
        }
      }

      function updateIrrModal(data){
        // scope.$emit("update-irr-modal", data);
      }

      function updateClusterChart(){
        var margin = 30, barH = 25, barMargin = 5;

        var w = angular.element(".cluster-box")[0].clientWidth - (margin*2);
        var h = scope.clusterData.length*(barH+barMargin*2)+margin;
        var svg = d3.select(el[0]).select(".cluster-chart").attr("height", h).append("g");
        var max = d3.max(scope.clusterData, function(d){ return d.count });
        var xscale = d3.scale.linear().domain([0,max]).range([0,w]);
        var xaxis = d3.svg.axis().orient("top").scale(xscale).ticks(5);
        var yscale = d3.scale.linear().domain([0,scope.clusterData.length -1]).range([h,margin]);
        var yaxis = d3.svg.axis().orient("left").scale(yscale).tickFormat("");

        var bars = svg.append("g").attr("class", "bars");

        var bar = bars.selectAll(".bar").data(scope.clusterData).enter().append("g").attr("class","bar");
        bar.attr("transform", function(d,i){
          return "translate(0,"+(30 + barMargin + (i*(barH+barMargin)))+")";
        });
        bar.append("rect").attr("height", barH).attr("width", function(d){
          var x = xscale(d.count);
          return x > 0 ? x : 0;
        }).attr("transform", "translate("+margin+",0)").attr("fill", function(d){
          return Scorer.rgbaify(Scorer.colorScale(d.b), 1);
        }).on("mouseover", function(d){
          d3.select(this).attr("fill", function(d){
            return Scorer.rgbaify(Scorer.colorScale(d.b), 0.5);
          })
        }).on("mouseout", function(d){
          d3.select(this).attr("fill", function(d){
            return Scorer.rgbaify(Scorer.colorScale(d.b), 1);
          })
        }).on("click", function(d){
          scope.resettable = true;
          scope.irrs = d.data;
          updateChart();
          scope.$digest();
        });

        var x = svg.append("g").attr("class","xaxis").call(xaxis)
          .attr("transform", "translate("+margin+","+margin+")")
          .style("font-size","12px");

        bar.append("text").attr("transform", "translate("+(margin - 6)+","+((barH+barMargin)/1.5)+") rotate(20)").attr("text-anchor","end")
          .text(function(d,i){
            return d.b !== 50 ? "> " + scope.clusterData[i+1].b : "< 50"
          }).style("font-size","12px");
      }

    }

  }
}())
