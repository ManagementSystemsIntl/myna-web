"use strict";

(function(){
  angular
  .module("questionTypes")
  .controller("QuestionTypeIndexController", QuestionTypeIndexController)

  QuestionTypeIndexController.$inject = ["$stateParams","$state","$scope",
  "QuestionTypeFactory","QuestionOptionFactory","QuestionCategoryFactory"];

  function QuestionTypeIndexController($stateParams,$state,$scope,
    QuestionTypeFactory,QuestionOptionFactory,QuestionCategoryFactory){
    var vm = this;

    vm.questionTypes = getQuestionTypes();
    vm.newQuestionType = newQuestionType();
    vm.questionOptions = getQuestionOptions();
    vm.questionCategories = getQuestionCategories();

    function getQuestionTypes(){
      return QuestionTypeFactory.query({});
    }

    function getQuestionOptions(){
      return QuestionOptionFactory.query({});
    }

    function getQuestionCategories(){
      return QuestionCategoryFactory.query({});
    }

    function newQuestionType(){
      return new QuestionTypeFactory();
    }

  }
}())
