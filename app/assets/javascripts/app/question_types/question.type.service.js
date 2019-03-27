"use strict";

(function(){
  angular
  .module("questionTypes")
  .service("QuestionTypes", QuestionTypes)

  QuestionTypes.$inject = ["QuestionTypeFactory"];

  function QuestionTypes(QuestionTypeFactory){

    return {
      fetch: fetch,
      get: get,
      question_types: []
    };

    ////////////////

    function get(type_id){
      return this.question_types.find(function(d){return d.id == type_id});
    }

    function fetch(type, params){
      var self = this;
      return QuestionTypeFactory[type](params, function(res){
        if (type == "query"){
          self.question_types = res;
        };
      }).$promise;
    };

  }
}())
