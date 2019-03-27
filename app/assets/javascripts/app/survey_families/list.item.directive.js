"use strict";

(function(){
  angular
  .module("surveyFamilies")
  .directive("surveyFamilyLi", SurveyFamilyLi)

  SurveyFamilyLi.$inject = ["SurveyFamilyFactory"];

  function SurveyFamilyLi(SurveyFamilyFactory){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        family: "="
      },
      templateUrl: "survey_families/_li.html"
    }
    return directive;

    function link(scope, el){

      scope.edit = false;
      scope.openEdit = openEdit;
      scope.originalFamily;
      scope.toggleActive = toggleActive;

      scope.$watch("family", function(newVal){
        if (newVal && newVal.hasOwnProperty("id")){
          scope.originalFamily = angular.copy(newVal);
        }
      });

      scope.$on("family-updated-li", function(res, family){
        if (scope.edit){
          scope.family = family;
          scope.originalFamily = angular.copy(family);
          scope.edit = false;
        }
      });

      function toggleActive(){
        var famList = scope.family.surveys.map(function(d){
          return [d.id,d.random,d.order].join("_");
        }).join(",");
        if (scope.family.is_active) {
          scope.family.is_active = false;
          scope.family.$update({id: scope.family.id, surveys:famList}).then(function(){
            scope.$emit("family-activity-toggle", scope.family);
          });
        } else {
          scope.family.is_active = true;
          scope.family.$update({id: scope.family.id, surveys:famList}).then(function(){
            scope.$emit("family-activity-toggle", scope.family);
          });
        }
      }

      function openEdit(){
        scope.edit = true;
        scope.$emit("family-open-edit", scope.family);
      }

    }

  }
}())
