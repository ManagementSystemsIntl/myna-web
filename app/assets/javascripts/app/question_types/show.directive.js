"use strict";

(function(){
  angular
  .module("questionTypes")
  .directive("questionTypeShow", QuestionTypeShow)

  QuestionTypeShow.$inject = [];

  function QuestionTypeShow(){
    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope:{
        questionType: "="
      },
      templateUrl: "question_types/_show.html"
    };
    return directive;

    function link(scope,el){

    }

  }
}())
