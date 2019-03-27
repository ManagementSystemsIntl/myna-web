"use strict";

(function(){
  angular
  .module("dashboard")
  .directive("monitoringModal",MonitoringModalFunction)

  MonitoringModalFunction.$inject = [];

  function MonitoringModalFunction(){
    var directive = {
      link: link,
      scope:{},
      restrict: "A",
      replace: true,
      templateUrl: "dashboard/monitoring/_monitoring_modal.html"
    };
    return directive;

    function link(scope,el){

      scope.$on("mon-survey-clicked", function(e,d,f){
        scope.data = d;
        scope.field = f;
        init();
      })

      function init(){
        if (scope.data.hasOwnProperty("surveys")){
          makeSections(scope.data);
        }
        var subtasks = [];
        angular.forEach(scope.data.sections, function(s,k){
          if (scope.field){
            if (k.match(scope.field)){
              subtasks.push(compileTask(s,k))
            }
          }else{
            subtasks.push(compileTask(s,k));
          }
        })
        subtasks.push(compileTask(scope.data.response_info,"Response Metadata"))
        scope.contents = subtasks.map(function(d){
          return "<div class='response-compare-section'>"+d+"</div>";
        }).join("");
      }

      function makeSections(data){
        var sections = {};
        angular.forEach(data.surveys, function(survey){
          var surveyName = survey.response_info.name;
          // var fullSurvey = vm.allSurveys.find(function(d){return d._id == surveyUuid});
          // var direction = fullSurvey.translations[language].survey_direction;
          // var surveyName = fullSurvey.survey_info.name;
          angular.forEach(survey.sections, function(s,k){
            try{
              // var sectionName = fullSurvey.sections.find(function(d){ return d.code == k}).name;
              sections[surveyName+": "+k] = s;
            }
            catch(err){
              console.log(err);
            }
          })
        })
        data.sections = sections;
        data.direction = "direction_rtl";
      }

      function compileTask(questions,name){
        // remove arabic from names
        var nice_name = name.replace(/[^\w\s]/g,"");
        var summary = "<p class='lead'>"+nice_name+"</p>";

        var grid = "";
        var keys = Object.keys(questions);

        var head = "<thead><th>Question</th><th>"+scope.data.response_info.enumerator_name+"</th></thead>"

        var qs = "";
        angular.forEach(questions, function(q,k){
          if (k.match("_Full_Response_Grid") || k.match("_Incorrect_Response_Grid") || k.match("_Full_Grid") || k.match("_Incorrect_Grid") || k.match("_Incorrect_Count") || k.match("_grid$")){
            return;
          }else if (k.match("Incorrect_Response_Index") || k.match("Incorrect_Index")){
            grid += compileGridHtml(questions,k,keys);
            return;
          }else if (k.match("\\$time")) {
            qs+="<tr>";
            qs+="<td>Duration</td><td>"+formatTime(q.duration)+"</td>";
            qs+="</tr>";
          }else{
            qs+="<tr>";
            qs+="<td>"+k+"</td><td>"+q+"</td>";
            qs+="</tr>";
          }
        })
        return summary + grid +"<div class='table-responsive'><table class='table table-striped table-hover response-compare-table'>" + head +"<tbody>" +qs + "</tbody></table></div>";
      }

      function formatTime(miliseconds) {
        var mins = Math.floor(miliseconds/1000/60)
        var seconds = "0" + Math.round((miliseconds/1000) - (mins*60), 0);
        return [mins, seconds.slice(-2)].join(":");
      }

      function compileGridHtml(questions,key,keys){
        var lastWordKey = keys.find(function(d){return d.match("_Attempted")});
        var lastWord = questions[lastWordKey];
        var lastWordIdx = lastWord - 1;

        var fullGridKey = keys.find(function(d){return d.match("_Full_Response_Grid") || d.match("_Full_Grid")});
        var fullGrid = questions[fullGridKey];

        if (!Array.isArray(fullGrid)){
          fullGrid = fullGrid.split("|");
        }
        var sliceGrid = fullGrid.slice(0,lastWord);

        var incorrectWords = questions[key];

        if (!Array.isArray(incorrectWords)){
          incorrectWords = incorrectWords.split("|");
        }

        var incorrectIdx = incorrectWords.map(function(d){
          return parseInt(d) - 1;
        })

        var gridHtml = "<tr>";
        angular.forEach(sliceGrid,function(g,i){
          if (i%10==0){
            gridHtml += "</tr><tr>";
          }
          var cellClass = incorrectIdx.indexOf(i) > -1 ? "second" : "none";
          cellClass += (i == lastWordIdx) ? " lw-second" : "";
          gridHtml += "<td class='"+cellClass+"'>"+g+"</td>";
        })
        gridHtml += "</tr>"

        return "<table class='response-compare-grid-table "+scope.data.direction+"'>"+gridHtml+"</table>";
      }

    }

  }

}())
