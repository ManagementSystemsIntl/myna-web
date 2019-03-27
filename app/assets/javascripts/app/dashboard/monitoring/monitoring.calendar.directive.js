"use strict";

(function(){
  angular
  .module("dashboard")
  .directive("monitoringCalendar",MonitoringCalendarFunction)

  MonitoringCalendarFunction.$inject = ["$window"];

  function MonitoringCalendarFunction($window){
    var directive = {
      link: link,
      scope: {
        days: "="
      },
      replace: true,
      restrict: "A",
      templateUrl: "dashboard/monitoring/_monitoring_calendar.html"
    };
    return directive;

    function link(scope,el){

      scope.$on("make-calendar", function(e,d){
        scope.days = d.map(function(da){
          if (da.data.length == 0){
            da.data = "none";
          }
          return da;
        });
        update();
      })

      var svg,g,enums,w,h,sqMargin,dimension,blockD,days,fDayIdx,wks;
      angular.element($window).bind("resize", resize);

      var tooltip = d3.select(el[0]).select(".cal-ttip");
      var dow = ["Sat","Sun","Mon","Tue","Wed","Thu","Fri"];
      var colorScale = d3.scale.linear().range([0.35,0.8]);

      init();

      function init(){
        svg = d3.select(el[0]).select(".svg-main");
        g = svg.append("g");
        w = el.find(".svg-main")[0].clientWidth;
        sqMargin = 1.5;
      }

      function resize(){
        w = el.find(".svg-main")[0].clientWidth;
        // dimension = w/wks;
        dimension = 50;
        h = dimension*7;
        blockD = dimension - 2*sqMargin;
        svg.attr("height",h);

        days = g.selectAll(".day");
        days.attr("transform", function(d,i){
          var dayIdx = dow.indexOf(d.day);
          var y = dayIdx * dimension;
          var x = Math.floor((i+fDayIdx)/7) * dimension;
          return "translate("+x+","+y+")";
        })
        days.selectAll("rect").attr("height",blockD).attr("width",blockD)
          .attr("transform","translate("+sqMargin+","+sqMargin+")");
        try{
          days.selectAll("foreignObject")
            .attr("width",dimension)
            .attr("height",dimension)
        }catch(err){};

      }

      function update(){
        days = g.selectAll(".day").data(scope.days).attr("class","day");

        var dataCounts = scope.days.map(function(d){
          return d.data == "none" ? 0 : d.data.length;
        })

        colorScale.domain([0,d3.max(dataCounts)])

        fDayIdx = dow.indexOf(scope.days[0].day);
        wks = Math.ceil((scope.days.length + fDayIdx)/7);
        // dimension = w/wks;
        dimension = 50;
        h = dimension*7;
        blockD = dimension - 2*sqMargin;

        svg.attr("height",h);

        var newDays = days.enter().append("g").attr("class","day")
        newDays.attr("transform", function(d,i){
          var dayIdx = dow.indexOf(d.day);
          var y = dayIdx * dimension;
          var x = Math.floor((i+fDayIdx)/7) * dimension;
          return "translate("+x+","+y+")";
        })

        newDays.append("rect").attr("height",blockD).attr("width",blockD)
          .attr("transform","translate("+sqMargin+","+sqMargin+")")
          .attr("stroke","black")
          .attr("stroke-width",0)
          .attr("fill",function(d){
            return d.data == "none" ? "gray" : "rgb(220,10,10)";
          }).attr("fill-opacity",function(d){
            return d.data == "none" ? 0.4 : colorScale(d.data.length);
          })

        newDays.append("foreignObject")
          .attr("width",dimension)
          .attr("height",dimension)
        .append("xhtml:body")
          .attr("class","chartFO")
          .html(function(d){
            return "<p>"+d.date.split(" ").splice(0,2).join(" ")+"</p>";
          })

        days.exit().remove();

        days.select("rect")
          .transition().duration(500)
          .attr("fill",function(d){
            return d.data == "none" ? "gray" : "rgb(220,10,10)";
          }).attr("fill-opacity",function(d){
            return d.data == "none" ? 0.4 : colorScale(d.data.length);
          })

        days.select(".chartFO")
          .html(function(d){
            return "<p>"+d.date.split(" ").splice(0,2).join(" ")+"</p>";
          })

        days.on("mouseover", function(d){
          // var txt = [d.day,d.date].join(" ");
          // tooltip.html(txt);
          //
          // svg.selectAll("rect").attr("stroke-width",0);
          // d3.select(this).select("rect").attr("stroke-width",2);
          d3.select(this).style("cursor","pointer");
        })

        days.on("click", function(d){
          if (d.data == "none") return;
          svg.selectAll("rect").attr("stroke-width",0);
          d3.select(this).select("rect").attr("stroke-width",2);
          scope.$emit("clicked-cal",d);
        })
      }

    }

  }

}())
