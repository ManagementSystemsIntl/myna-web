"use strict";

(function(){
  angular
  .module("sections")
  .directive("sectionLi", SectionLi)

  SectionLi.$inject = ["$stateParams", "Questions", "Utils"];

  function SectionLi($stateParams, Questions, Utils){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        group: "@",
        section: "=",
        survey: "="
      },
      templateUrl: "sections/_li.html"
    };
    return directive;

    function link(scope,el){

      scope.edit = false;
      scope.originalSection;
      scope.questions;
      scope.toggleEdit = toggleEdit;

      scope.$watch("section", function(newVal){
        if (newVal && newVal.hasOwnProperty("id")){
          scope.originalSection = angular.copy(newVal);
          scope.questions = Questions.get(newVal.survey_id, newVal.id);
        }else if (newVal){
          scope.edit = true;
        }
      });

      scope.$on("sections-renumbered", function(res, sections, closeEdit){
        if (closeEdit){
          scope.edit = false;
        }
        if (scope.section.hasOwnProperty("id")){
          var section = sections.find(function(d){return d.id == scope.section.id});
          scope.section = section;
          scope.originalSection = angular.copy(section);
        }else{
          var section = sections.find(function(d){return d.$$hashKey == scope.section.$$hashKey});
          scope.section = section;
        }
      })

      ////////////////////

      function toggleEdit(){
        if (scope.edit && !scope.section.id){
          return scope.$emit("unsaved-section-removed", scope.section);
        }
        if (scope.edit){
          Utils.matchOriginal(scope.section, scope.originalSection, ["autostop", "code", "is_publishable", "name", "skippable", "grade", "hint"]);
          scope.$broadcast("section-close-edit", scope.section);
        }
        scope.edit = Utils.toggleEdit(scope.edit);
      }

    }

  }
}())
