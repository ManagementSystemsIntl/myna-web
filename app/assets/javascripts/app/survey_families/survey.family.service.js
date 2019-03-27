"use strict";

(function(){
  angular
  .module("surveyFamilies")
  .service("SurveyFamilies", SurveyFamilies)

  SurveyFamilies.$inject = ["SurveyFamilyFactory"];

  function SurveyFamilies(SurveyFamilyFactory){
    return {
      fetch: fetch,
      make: make
    };

    //////////////////

    function fetch(type, params){
      return SurveyFamilyFactory[type](params).$promise;
    }

    function make(params){
      return new SurveyFamilyFactory(params);
    }

  }
}())
