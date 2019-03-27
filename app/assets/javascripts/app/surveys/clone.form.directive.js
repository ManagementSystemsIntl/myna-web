"use strict";

(function(){
  angular
  .module("surveys")
  .directive("surveyCloneForm", SurveyCloneForm)

  SurveyCloneForm.$inject = ["$state", "Flash", "SurveyGroups", "Surveys"];

  function SurveyCloneForm($state, Flash, SurveyGroups, Surveys){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        clients: "="
      },
      templateUrl: "surveys/_clone_form.html"
    };
    return directive;

    function link(scope, el){

      scope.clone = clone;
      scope.from_groups = [];
      scope.setSelectedSurvey = setSelectedSurvey;
      scope.surveys = [];
      scope.survey = {};
      scope.to_groups = [];
      scope.updateFromGroups = updateFromGroups;
      scope.updateToGroups = updateToGroups;
      scope.updateSurveys = updateSurveys;

      /////////////////////

      function clone(){
        var start = Flash.create('info', "<div class=\"margin-center text-center\"><i class=\"fa fa-fw fa-refresh fa-spin fa-5x text-info\"></i></div><div class=\"margin-top-15 text-center\">Cloning Survey...</div>", 0, {class:"full-screen"});
        Surveys.fetch("create_clone", {id: scope.survey.survey_id, to_client: scope.survey.to_client_id, to_group: scope.survey.to_survey_group_id, as: scope.survey.to_name}).then(function(clone){
          Flash.dismiss(start);
          $state.go("builder.surveyShow", {client_id: clone.client_id, group_id: clone.survey_group_id, id: clone.id});
        }).catch(function(err){
          Flash.dismiss(start);
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error cloning Survey. Survey "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        })
      }

      function setSelectedSurvey(id){
        scope.selectedSurvey = scope.surveys.find(function(d){return d.id == id});
      }

      function updateFromGroups(){
        return SurveyGroups.fetch("query", {client_id: scope.survey.from_client_id}).then(function(res){
          scope.from_groups = res;
        });
      }

      function updateToGroups(){
        return SurveyGroups.fetch("query", {client_id: scope.survey.to_client_id}).then(function(res){
          scope.to_groups = res;
        });
      }

      function updateSurveys(){
        return Surveys.fetch("query", {client_id: scope.survey.from_client_id, survey_group_id: scope.survey.from_group_id}).then(function(res){
          scope.surveys = res;
        });
      }

    }

  }
}())
