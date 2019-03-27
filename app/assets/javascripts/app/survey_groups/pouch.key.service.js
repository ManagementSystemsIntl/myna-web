"use strict";

(function(){
  angular
  .module("surveyGroups")
  .service("PouchKeys", PouchKeys)

  PouchKeys.$inject = ["PouchKeyFactory"];

  function PouchKeys(PouchKeyFactory){

    return {
      fetch: fetch,
      make: make
    };

    //////////////////

    function fetch(type, params){
      return PouchKeyFactory[type](params).$promise;
    }

    function make(params){
      return new PouchKeyFactory(params);
    }

  }
}())
