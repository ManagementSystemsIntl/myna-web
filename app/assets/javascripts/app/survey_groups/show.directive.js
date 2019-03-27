"use strict";

(function(){
  angular
  .module("surveyGroups")
  .directive("surveyGroupShow", GroupShowFunction)

  GroupShowFunction.$inject = [];

  function GroupShowFunction(){
    
    var directive = {
      replace: true,
      restrict: "A",
      scope:{
        group: "="
      },
      templateUrl: "survey_groups/_show.html"
    };
    return directive;

  }
}())
