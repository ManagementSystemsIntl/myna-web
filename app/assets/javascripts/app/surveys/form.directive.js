"use strict";

(function(){
  angular
  .module("surveys")
  .directive("surveyForm", SurveyForm)

  SurveyForm.$inject = ["Surveys", "Flash"];

  function SurveyForm(Surveys, Flash){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        group: "@",
        survey: "=",
        languages: "="
      },
      templateUrl: "surveys/_form.html"
    };
    return directive;

    function link(scope, el){

      scope.check = check;
      scope.submit = submitSurvey;
      scope.delete = deleteSurvey;

      scope.$watch("languages", function (n,o) {
        if (n) {
          scope.languagesCopy = angular.copy(n);
        }
      }, true);

      var surveywatch = scope.$watch("survey", function (n,o) {
        if (n.hasOwnProperty("id")) {
          var setup = setupSurvey(n);
          scope.goldStandards = "1,2,3,4,5,6".split(",").map(function(d){ return {v: d, checked: setup.golds.indexOf(d) > -1}});
          scope.grades = "1,2,3,4,5,6,7,8".split(",").map(function(d){ return {v: d, checked: setup.grades.indexOf(d) > -1}});
          scope.$watch("languages", function (n,o) {
            if (n) {
              scope.languagesCopy = angular.copy(n);
              scope.languagesCopy.map(function(d){ d.checked = setup.languages.indexOf(d.id) > -1; return d;});
              scope.checked = {grade: setup.grades.length, gs: setup.golds.length, language: setup.languages.length};
              surveywatch();
            }
          });
        } else {
          scope.goldStandards = "1,2,3,4,5,6".split(",").map(function(d){ return {v: d, checked: false} });
          scope.grades = "1,2,3,4,5,6,7,8".split(",").map(function(d){ return {v: d, checked: false} });
          scope.checked = {grade: 0, gs: 0, language: 0};
          surveywatch();
        }
      }, true);

      // listeners
      scope.$on("survey-cancel-edit", function(res, survey){
        var setup = setupSurvey(survey);
        scope.goldStandards = "1,2,3,4,5,6".split(",").map(function(d){ return {v: d, checked: setup.golds.indexOf(d) > -1}});
        scope.grades = "1,2,3,4,5,6,7,8".split(",").map(function(d){ return {v: d, checked: setup.grades.indexOf(d) > -1}});
        scope.languagesCopy.map(function(d){ d.checked = setup.languages.indexOf(d.id) > -1; return d;});
        scope.checked = {grade: setup.grades.length, gs: setup.golds.length, language: setup.languages.length};
      });

      function check(type, val, id) {
        if (type === 'language') {
          scope.languagesCopy.forEach(function (d) {
            d.checked = d.id === id;
          });
        }
        scope.checked[type] += val ? 1 : -1;
      }

      function setupSurvey(survey) {
        return {
          golds: survey.gold_standards ? survey.gold_standards.split(",") : [],
          grades: survey.grade.split(","),
          languages: survey.languages.split(",").map(function (d){ return parseInt(d) })
        };
      }

      function submitSurvey(){
        scope.survey.grade = scope.grades.filter(function(d){return d.checked}).map(function(d){return d.v}).join(",");
        if (scope.survey.grade === "") {
          scope.survey.grade = "NO_GRADE";
        }
        scope.survey.gold_standards = scope.goldStandards.filter(function(d){return d.checked}).map(function(d){return d.v}).join(",");
        scope.survey.languages = scope.languagesCopy.filter(function(d){return d.checked}).map(function(d){return d.id}).join(",");
        if (scope.survey.hasOwnProperty("id")){
          return updateSurvey().then(function(survey){
            scope.survey = survey;
            return scope.$emit("survey-updated", survey);
          });
        }else{
          return saveSurvey().then(function(survey){
            scope.surveyForm.$setPristine();
            scope.surveyForm.$setUntouched();
            scope.$emit("survey-created", survey);
            scope.languagesCopy = angular.copy(scope.languages);
            scope.goldStandards = "1,2,3,4,5,6".split(",").map(function(d){ return {v: d, checked: false} });
            scope.grades = "1,2,3,4,5,6,7,8".split(",").map(function(d){ return {v: d, checked: false} });
            scope.checked = {grade: 0, gs: 0, language: 0};
            scope.survey = Surveys.make({survey_group_id: scope.group});
          });
        }
      }

      function updateSurvey(){
        return scope.survey.$update({id: scope.survey.id}, function(survey){
          return survey;
        }, function(err){
          console.log(err);
          Flash.create('warning', "<i class=\"fa fa-fw fa-warning\"></i> Error updating Survey. Survey "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        });
      }

      function saveSurvey(){
        return scope.survey.$save({}, function(survey){
          return survey;
        }, function(err){
          console.log(err);
          Flash.create('warning', "<i class=\"fa fa-fw fa-warning\"></i> Error creating Survey. Survey "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        });
      }

      function deleteSurvey(){
        return scope.survey.$delete({id: scope.survey.id}, function(resp){
          return scope.$emit("survey-deleted");
        }, function(err){
          console.log(err);
          Flash.create('warning', "<i class=\"fa fa-fw fa-warning\"></i> Error deleting Survey. Survey "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        });
      }

    }

  }
}())
