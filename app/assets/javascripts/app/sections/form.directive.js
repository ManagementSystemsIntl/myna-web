"use strict";

(function(){
  angular
  .module("sections")
  .directive("sectionForm", SectionForm)

  SectionForm.$inject = ["Flash", "Sections"];

  function SectionForm(Flash, Sections){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        section: "=",
        survey: "="
      },
      templateUrl: "sections/_form.html"
    };
    return directive;

    function link(scope, el){

      scope.delete = deleteSection;
      scope.editAutostop = false;
      scope.originalSection;
      scope.submit = submitSection;

      scope.$on("section-close-edit", function(res, section){
        scope.section = section;
        scope.originalSection = angular.copy(section);
      });

      ////////////////////

      function deleteSection(){
        return scope.section.$delete({id: scope.section.id}, function(res){
          scope.$emit("section-deleted", scope.section);
        }, function(err){
          console.log(err);
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error in deleting Section. Section "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        })
      }

      function submitSection(){
        scope.section.survey_id = scope.survey.id;
        var params = {
          skippable: scope.section.skippable === "true" ? true : false,
          is_publishable: scope.section.is_publishable === "true" ? true : false
        };
        if (scope.section.hasOwnProperty("id")){
          return updateSection(params);
        }else{
          return saveSection(params);
        }
      }

      function updateSection(params){
        params.id = scope.section.id;
        return scope.section.$update(params ,function(res){
          scope.section = Sections.mapSection(res);
          scope.$emit("section-updated", scope.section);
        }, function(err){
          console.log("err", err);
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error updating Section. Section "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        });
      }

      function saveSection(params){
        return scope.section.$save(params, function(res){
          scope.$emit("section-created", scope.section);
        }, function(err){
          console.log("err", err);
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error saving Section. Section "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        });
      }

    }

  }
}())
