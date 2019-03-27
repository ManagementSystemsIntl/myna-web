"use strict";

(function(){
  angular
  .module("questions")
  .service("QuestionOptions", QuestionOptions)

  QuestionOptions.$inject = ["QuestionOptionFactory"];

  function QuestionOptions(QuestionOptionFactory){
    
    return {
      fetch: fetch,
      get: get,
      get_by_name: get_by_name,
      make: make,
      options: []
    };

    //////////////////

    function get(option_id){
      return this.options.find(function(d){ return d.id == option_id });
    }

    function get_by_name(name){
      return this.options.find(function(d){ return d.name == name });
    }

    function fetch(type, params){
      var self = this;
      return QuestionOptionFactory[type](params, function(res){
        if (type == "query"){
          self.options = res;
        };
        return res;
      }).$promise;
    }

    function make(params){
      return new QuestionOptionFactory(params);
    }

  }
}())
