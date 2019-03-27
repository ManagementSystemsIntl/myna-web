"use strict";

(function(){
  angular
  .module("questionTypes")
  .directive("questionTypeLi", QuestionTypeLi)

  QuestionTypeLi.$inject = ["QuestionTypeFactory"];

  function QuestionTypeLi(QuestionTypeFactory){
    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        type: "=",
        categories: "="
      },
      templateUrl: "question_types/_li.html"
    }
    return directive;

    function link(scope,el){
      scope.edit = false;
      scope.toggleEdit = toggleEdit;

      function toggleEdit(){
        if (scope.edit){
          scope.type = QuestionTypeFactory.get({id:scope.type.id});
          scope.edit = false;
        }else{
          scope.edit = true;
        }
      }
    }

  }
}())
