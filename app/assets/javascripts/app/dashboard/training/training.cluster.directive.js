"use strict";

(function(){
  angular
  .module("dashboard")
  .directive("trainingCluster", TrainingCluster)

  TrainingCluster.$inject = ["$window", "Scorer"];

  function TrainingCluster($window, Scorer){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        block: "="
      },
      templateUrl: "dashboard/training/_training_cluster.html"
    };
    return directive;

    function link(scope, el){

      scope.$on("block-charts", function(e){
        scope.block = true;
      });

      scope.$on("update-cluster-chart", function(e, data){
        scope.block = false;
        scope.resettable = false;
        scope.data = data.sort(function(b,a){ return a.b - b.b });
        if (!bars){
          init();
        }
        update();
      });

      var svg,w,h,xaxis,xscale,yaxis,yscale,max,x,y,bars,bar;
      var margin = 30, barH = 25, barMargin = 5;

      angular.element($window).bind("resize", resize);

      el.find("button").on("click", function(){
        scope.resettable = false;
        scope.$digest();
        scope.$emit("reset-cluster");
      });

      function init(){

        w = angular.element(".cluster-box")[0].clientWidth - (margin*2);
        h = scope.data.length*(barH+barMargin*2)+margin;
        svg = d3.select(el[0]).select(".cluster-chart").attr("height", h).append("g");
        max = d3.max(scope.data, function(d){ return d.count });
        xscale = d3.scale.linear().domain([0,max]).range([0,w]);
        xaxis = d3.svg.axis().orient("top").scale(xscale).ticks(5);
        yscale = d3.scale.linear().domain([0,scope.data.length -1]).range([h,margin]);
        yaxis = d3.svg.axis().orient("left").scale(yscale).tickFormat("");

        bars = svg.append("g").attr("class", "bars");

        bar = bars.selectAll(".bar").data(scope.data).enter().append("g").attr("class","bar");
        bar.attr("transform", function(d,i){
          return "translate(0,"+(30 + barMargin + (i*(barH+barMargin)))+")";
        });
        bar.append("rect").attr("height", barH).attr("width", function(d){
          return xscale(d.count);
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
          scope.$digest();
          scope.$emit("clicked-cluster", d.data);
        })

        x = svg.append("g").attr("class","xaxis").call(xaxis)
          .attr("transform", "translate("+margin+","+margin+")")
          .style("font-size","12px");

        bar.append("text").attr("transform", "translate("+(margin - 6)+","+((barH+barMargin)/1.5)+") rotate(20)").attr("text-anchor","end")
          .text(function(d,i){
            return d.b !== 50 ? "> " + scope.data[i+1].b : "< 50"
          }).style("font-size","12px");
      }

      function update(){
        max = d3.max(scope.data, function(d){ return d.count });
        xscale.domain([0,max]);
        xaxis.scale(xscale);

        x.transition().duration(500).call(xaxis);

        bar = bars.selectAll(".bar").data(scope.data);
        bar.select("rect").transition().duration(500).attr("width", function(d){
          return xscale(d.count);
        });

      }

      function resize(){
        d3.select(el[0]).select(".cluster-chart").selectAll("*").remove();
        if (bars){
          init();
        }
      }

    }

  }
}())
