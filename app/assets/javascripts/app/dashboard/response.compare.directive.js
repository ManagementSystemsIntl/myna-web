"use strict";

(function(){
  angular
  .module("dashboard")
  .directive("responseCompare",ResponseCompareFunction)

  ResponseCompareFunction.$inject = [];

  function ResponseCompareFunction(){
    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        compare: "=",
        gold: "=",
        task: "=",
        survey: "="
      },
      templateUrl: "dashboard/_response_compare.html"
    }
    return directive;

    function link(scope,el,attrs){
      scope.$on("update-modal", function(e,compare,task,digest){
        if (compare){
          scope.compare = compare;
        }
        if (task){
          scope.task = task;
        }
        init(digest);
      })

      function init(digest){
        if (scope.task == "All Subtasks"){
          var subtasks = [];
          angular.forEach(scope.compare.sections, function(s,k){
            subtasks.push(compileTask(s,k,scope.compare.names));
          })
          scope.contents = subtasks.map(function(d){
            return "<div class='response-compare-section'>"+d+"</div>";
          }).join("");
        }else{
          var t = compileTask(scope.compare.sections[scope.task], scope.task, scope.compare.names);
          scope.contents = "<div class='response-compare-section'>"+t+"</div>";
        }
        if (digest){
          scope.$digest();
        }
      }

      function compileTask(questions,name,names){
        // remove arabic from names
        var nice_name = name.replace(/[^\w\s]/g,"");
        var summary = "<p class='lead'>"+nice_name+" - "+questions.summary.score+"/"+questions.summary.outOf+", "+d3.round(questions.summary.avg*100,2)+"%</p>";

        var grid = "";
        var keys = Object.keys(questions);

        var head = "<thead><th>Question</th>"+names.map(function(d){return "<th>"+d+"</th>"}).join("")+"</thead>"

        var qs = "";
        angular.forEach(questions, function(q,k){
          if (!q.hasOwnProperty("values")){
            return;
          }else if (k.match("Incorrect_Response_Index") || k.match("Incorrect_Index")){
            grid += compileGridHtml(questions,k,keys);
            return;
          }else{
            qs+="<tr>";
            var classVal = q.scores.score/q.scores.outOf == 1 ? "correct" : "incorrect";
            if (k == "summary") return;
            qs+="<td class='"+classVal+"'>"+k+"</td>";
            angular.forEach(q.values, function(v){
              qs+="<td>"+v+"</td>";
            })
            qs+="</tr>";
          }
        })
        return summary + grid +"<div class='table-responsive'><table class='table table-striped table-hover response-compare-table'>" + head +"<tbody>" +qs + "</tbody></table></div>";
      }

      function compileGridHtml(questions,key,keys){
        var lastWordKey = keys.find(function(d){return d.match("_Attempted")});
        var lastWords = questions[lastWordKey];
        if (lastWords.scores.score == 1){
          questions[key].scores[lastWords.values[0]-1].cellClass = "lw-both";
        }else{
          if (lastWords.values[0]){
            questions[key].scores[lastWords.values[0]-1].cellClass = "lw-first";
          }
          if (lastWords.values[1]){
            questions[key].scores[lastWords.values[1]-1].cellClass = "lw-second";
          }
        }

        var gridHtml = "<tr>";
        angular.forEach(questions[key].scores,function(g,i){
          if (i%10==0){
            gridHtml += "</tr><tr>";
          }
          var ct = g.values.reduce(function(a,b){return a+b},0);
          var cellClass = ct == g.values.length ? "both" :
            ct == 1 && g.values.indexOf(1)==0 ? "first" :
              ct == 1 && g.values.indexOf(1)!==0 ? "second" : "none";

          if (g.hasOwnProperty("cellClass")){
            cellClass += " "+g.cellClass;
          }

          gridHtml += "<td class='"+cellClass+"'>"+g.character+"</td>";
        })
        gridHtml += "</tr>"

        var gridKey = "<label>Grid Key</label><ul><li class='both'>Marked by Both</li><li class='first'>Marked by Column 1</li><li class='second'>Marked by Column 2</li><li class='lw'>Last Word</li></ul>"

        return "<table class='response-compare-grid-table "+scope.compare.direction+"'>"+gridHtml+"</table>"+gridKey;
      }

    }


  }

}())
