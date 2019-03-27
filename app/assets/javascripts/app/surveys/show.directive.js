"use strict";

(function(){
  angular
  .module("surveys")
  .directive("surveyShow", SurveyShow)

  SurveyShow.$inject = [];

  function SurveyShow(){

    var directive = {
      replace: true,
      restrict: "A",
      scope: {
        survey: "="
      },
      templateUrl: "surveys/_show.html",
    };
    return directive;

  }
}())
