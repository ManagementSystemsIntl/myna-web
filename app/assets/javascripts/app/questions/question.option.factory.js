"use strict";

(function(){
  angular
  .module("questions")
  .factory("QuestionOptionFactory", QuestionOptionFactory)

  QuestionOptionFactory.$inject = ["$resource"];

  function QuestionOptionFactory($resource){
    return $resource("/api/question_options/:id.json")
  }

}())
