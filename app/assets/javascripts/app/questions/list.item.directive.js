"use strict";

(function(){
  angular
  .module("questions")
  .directive("questionLi", QuestionLi)

  QuestionLi.$inject = ["QuestionAttributes", "QuestionTypes", "Utils"];

  function QuestionLi(QuestionAttributes, QuestionTypes, Utils){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        code: "@",
        direction: "@",
        question: "=",
        section: "@",
        survey: "@"
      },
      templateUrl: "questions/_li.html"
    };
    return directive;

    function link(scope,el){
      scope.attributes;
      scope.edit = false;
      scope.options;
      scope.originalAttributes;
      scope.originalOptions;
      scope.originalQuestion;
      scope.question;
      scope.question_type;
      scope.toggleEdit = toggleEdit;

      scope.$watch("question", function(newVal){

        if (newVal && !newVal.hasOwnProperty("id")){
          scope.edit = true;
        }else if (newVal && newVal.hasOwnProperty("attributes") && newVal.hasOwnProperty("options")){
          scope.question = newVal;
          scope.originalQuestion = angular.copy(scope.question);
          scope.question_type = QuestionTypes.get(scope.question.question_type_id);

          // add existing attributes to attributes service
          QuestionAttributes.updateAttributes(scope.question.survey_id, scope.question.attributes);

          scope.$broadcast("got-question-parts", scope.question.survey_id, scope.question.id, scope.question.options, scope.question.choice_list_id);
        }
      });

      scope.$on("question-created", function(res, question){
        scope.question = question;
        scope.originalQuestion = angular.copy(scope.question);
        scope.question_type = QuestionTypes.get(scope.question.question_type_id);
        scope.edit = false;
        scope.$broadcast("update-question-show", scope.question.question_type_id);
      })

      scope.$on("question-updated", function(res, question){
        scope.question = question;
        scope.originalQuestion = angular.copy(scope.question);
        scope.question_type = QuestionTypes.get(scope.question.question_type_id);
        scope.edit = false;
        scope.$broadcast("update-question-show", scope.question.question_type_id);
      });

      // scope.$on("questions-renumbered", function(res, questions){
        // console.log("renumber triggered")
        // console.log("this edit is", scope.question.id, scope.edit)
        // scope.$broadcast("question-cancel-edit", scope.question.question_type_id);
        // if (scope.question.hasOwnProperty("id")){
        //   var question = questions.find(function(d){return d.id == scope.question.id});
        //   scope.question.order = question.order || 0;
        //   if (scope.question.has_number){
        //     scope.question.question_number = question.question_number;
        //   }
        //   scope.originalQuestion = angular.copy(question);
        //   scope.question_type = QuestionTypes.get(scope.question.question_type_id);
        //
        //   scope.$broadcast("got-question-parts", scope.question.survey_id, scope.question.id, scope.question.options, scope.question.choice_list_id);
        // }else{
        //   var question = questions.find(function(d){return d.$$hashKey == scope.question.$$hashKey});
        //   scope.question = question;
        //   scope.edit = true;
        // }
      // })

      ///////////////////

      function toggleEdit(){
        if (scope.edit && !scope.question.id){
          return scope.$emit("unsaved-question-removed", scope.question);
        }
        if (scope.edit){
          Utils.matchOriginal(scope.question, scope.originalQuestion, ["question_type_id", "question_number", "choice_list_id"]);
          scope.$broadcast("question-cancel-edit", scope.question.question_type_id);
        }
        scope.edit = Utils.toggleEdit(scope.edit);
      }

    }

  }
}())
