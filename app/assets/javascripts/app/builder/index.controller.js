"use strict";

(function(){
  angular
  .module("formBuilder")
  .controller("BuilderIndexController", BuilderIndexController)

  BuilderIndexController.$inject = ["$scope", "$state", "Languages", "SurveyGroups", "surveygroups"];

  function BuilderIndexController($scope, $state, Languages, SurveyGroups, surveygroups){

    var vm = this;
    vm.newLanguages = [Languages.make({})];
    vm.newSurveyGroup = SurveyGroups.make({});
    vm.surveyGroups = surveygroups;

    $scope.$on("survey-group-created", function(res, group, languages){
      SurveyGroups.replaceGroup(group);
      languages.forEach(function(language){Languages.replaceLanguage(group.id, language)});
      $state.go("builder.groupShow", {id: group.id}, {reload:true});
    });

  }
}())
