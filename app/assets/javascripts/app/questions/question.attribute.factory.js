"use strict";

(function(){
  angular
  .module("questions")
  .factory("QuestionAttributeFactory", QuestionAttributeFactory)

  QuestionAttributeFactory.$inject = ["$resource"];

  function QuestionAttributeFactory($resource){
    return $resource("/api/question_attributes/:id",{},{
      update: {method:"PUT"}
    })

  }
}())
