"use strict";

(function(){
  angular
  .module("formBuilder")
  .directive("modelDiff",ModelDiff)

  function ModelDiff(){
    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        diff: "="
      },
      templateUrl: "builder/_diff.html"
    };
    return directive;

    function link(scope,el){
      var updated_at = new RegExp(/updated_at(.*?)Z/);

      scope.$watch('diff', function(diffs){
        if(diffs) {
          scope.diffs = scope.diff.raw
            .filter(function(d){return typeof d == "object"})
            .map(mapObject)
            .filter(function(d){return d});
        }
      });

      function mapObject(d){
        if (d.hasOwnProperty("delete")){
          d.delete = d.delete.replace(updated_at,"").split("\n").filter(function(d){return d})
        }
        if (d.hasOwnProperty("insert")){
          d.insert = d.insert.replace(updated_at,"").split("\n").filter(function(d){return d})
        }
        return (d.insert == "" && d.delete == "") ? undefined : d;
      }

    }

  }
}())
