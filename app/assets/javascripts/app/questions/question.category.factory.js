"use strict";

(function(){
  angular
  .module("questions")
  .factory("QuestionCategoryFactory", QuestionCategoryFactory)

  QuestionCategoryFactory.$inject = ["$resource"];

  function QuestionCategoryFactory($resource){
    return $resource("/api/question_categories/:id",{},{
      update: {method:"PUT"}
    })

  }
}())
