"use strict";

(function(){
  angular
  .module("questions")
  .factory("QuestionFactory", QuestionFactory)

  QuestionFactory.$inject = ["$resource"];

  function QuestionFactory($resource){
    return $resource("/api/questions/:id.json",{},{
      update: {method:"PUT"}
    })

  }
}())
