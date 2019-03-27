"use strict";

(function(){
  angular
  .module("questionTypes")
  .factory("QuestionTypeFactory", QuestionTypeFactory)

  QuestionTypeFactory.$inject = ["$resource"];

  function QuestionTypeFactory($resource){
    return $resource("/api/question_types/:id.json",{},{
      update: {method:"PUT"}
    })
  }

}())
