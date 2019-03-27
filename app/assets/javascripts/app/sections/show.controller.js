"use strict";

(function(){
  angular
  .module("sections")
  .controller("SectionShowController", SectionShowController)

  SectionShowController.$inject = [
    "$q", "$rootScope", "$scope", "$stateParams", "$state",
    "Languages", "QuestionAttributes", "Questions", "Sections", "Utils",
    "choicelists", "questions", "questiontypes", "section", "survey"
  ];

  function SectionShowController(
    $q, $rootScope, $scope, $stateParams, $state,
    Languages, QuestionAttributes, Questions, Sections, Utils,
    choicelists, questions, questiontypes, section, survey
  ){

    var vm = this;

    vm.addNewQuestion = addNewQuestion;
    vm.dndListeners = {
      clone: {
        itemMoved: function(evt){
          vm.models.newQuestions = [Questions.make({survey_id: survey.id, section_id: section.id})];
          moveCallback();
        }
      },
      drag: {
        orderChanged: function(evt){
          moveCallback();
        }
      }
    };
    vm.edit = false;
    vm.models = Questions.model;
    vm.moved = moveCallback;
    vm.originalSection = angular.copy(Sections.mapSection(section));
    vm.questions = questions.map(Questions.mapQuestion);
    vm.questionTypes = questiontypes;
    vm.survey = survey;
    vm.section = Sections.mapSection(section);
    vm.toggleEdit = toggleEdit;

    // ng-listeners
    $scope.$on("question-created", function(res, question){
      vm.models.questions.splice(question.order, 1, question);
      moveCallback();
    });

    $scope.$on("question-deleted", function(res, question){
      QuestionAttributes.removeAttributes(question.survey_id, question.id);
      vm.models.questions.splice(question.order, 1);
      moveCallback();
    });

    $scope.$on("unsaved-question-removed", function(res,question){
      vm.models.questions.splice(question.order, 1);
    });

    $scope.$on("section-updated", function(res, section){
      vm.section = Sections.mapSection(section);
      vm.originalSection = angular.copy(Sections.mapSection(section));
      angular.element("#sectionFormModal").modal("hide");
      $rootScope.$broadcast("nav:section-updated", angular.copy(section));
      vm.edit = false;
    });

    $scope.$on("section-deleted", function(res){
      angular.element("#sectionFormModal").modal("hide");
      angular.element("body").removeClass("modal-open");
      angular.element("body").css("padding-right",0)
      angular.element(".modal-backdrop").hide();
      $state.go("builder.surveyShow", {group_id: $stateParams.group_id, id: $stateParams.survey_id}, {reload:true});
    });

    init();

    ////////////////////

    function init(){
      Questions.resetModels();
      vm.models.newQuestions.push(Questions.make({ survey_id: survey.id, section_id: section.id }));
      vm.models.questions = vm.questions;
      moveCallback();
    }

    function addNewQuestion(){
      vm.models.questions.push(Questions.make({survey_id: survey.id, section_id: section.id}));
      moveCallback();
    }

    function moveCallback(){
      if (vm.models.questions.length == 0){
        vm.models.questions = [Questions.make({ survey_id: survey.id, section_id: section.id })];
      }
      return moved().then(function(res){
        $scope.$broadcast("questions-renumbered", vm.models.questions);
        return res;
      });
    }

    function moved(){
      var promises = [];
      vm.models.questions.forEach(function(question,i){
        promises.push(updateOrder(question,i));
      });
      return $q.all(promises);
    }

    function updateOrder(question, i){
      question.order = i;
      var numbered = vm.models.questions.filter(function(d){ return d.has_number });
      var numberQ = numbered.find(function(d){ return d == question });
      var number = numbered.indexOf(numberQ);
      question.question_number = number + 1;
      if (question.id){
        question.question_number = number + 1;
        return question.$update({id: question.id, full: true}, function(question){
          return Questions.mapQuestion(question);
        });
      }else{
        return question;
      }
    }

    function toggleEdit(){
      if (vm.edit){
        Utils.matchOriginal(vm.section, vm.originalSection, ["autostop", "code", "name", "skippable", "is_publishable", "hint"]);
      }
      vm.edit = Utils.toggleEdit(vm.edit);
    }

  }
}())
