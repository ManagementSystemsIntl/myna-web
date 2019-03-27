"use strict";

(function(){
  angular
  .module("surveyFamilies")
  .directive("surveyFamilyShow", SurveyFamilyShow)

  SurveyFamilyShow.$inject = [];

  function SurveyFamilyShow(){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope:{
        family: "="
      },
      templateUrl: "survey_families/_show.html"
    };
    return directive;

    function link(scope, el){

      scope.$watch("family", function(newVal){
        if (newVal.hasOwnProperty("surveys")){
          scope.family.surveys.sort(function(a,b){return a.order-b.order});
        }
      },true);

    }

  }
}())
