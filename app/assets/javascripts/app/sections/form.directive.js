"use strict";

(function(){
  angular
  .module("sections")
  .directive("sectionForm", SectionForm)

  SectionForm.$inject = ["Flash", "Sections", "pdb", "PouchKeys"];

  function SectionForm(Flash, Sections, pdb, PouchKeys){

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

      PouchKeys.fetch("get", {survey_group_id: scope.survey.survey_group_id}).then(function (key) {
        var pouch = pdb.getGroup(scope.survey.survey_group_id, key.username, key.pwd, key.db_name, key.db_address);

        pouch.remoteSurveyDB.get("codebook").then(function (res) {
          scope.codes = res.hasOwnProperty("codes") ? angular.copy(res).codes : [];
         })
         .catch(function (err) { console.log(err) });
      }).catch(function (err) { console.log(err) });

      scope.delete = deleteSection;
      scope.editAutostop = false;
      scope.originalSection;
      scope.submit = submitSection;
      scope.setCode = setCode;
      scope.autocomplete = [];
      scope.updateAutocomplete = updateAutocomplete;

      scope.$on("section-close-edit", function(res, section){
        scope.section = section;
        scope.originalSection = angular.copy(section);
      });

      ////////////////////

      function updateAutocomplete() {
        if (!scope.section.code || scope.section.code.length < 2) {
          scope.autocomplete = [];
          return;
        };
        scope.autocomplete = scope.codes.filter(function (d) { 
          if (d.code) {
            return d.code.toLowerCase().match(scope.section.code.toLowerCase()) || d.section.toLowerCase().match(scope.section.code.toLowerCase())
          }
        });
      }

      function setCode(code) {
        scope.autocomplete = [];
        scope.section.code = code;
      }

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
