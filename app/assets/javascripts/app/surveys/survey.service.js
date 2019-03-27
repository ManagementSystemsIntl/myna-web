"use strict";

(function(){
  angular
  .module("surveys")
  .service("Surveys", Surveys)

  Surveys.$inject = ["SurveyFactory"];

  function Surveys(SurveyFactory){

    return {
      get: get,
      fetch: fetch,
      make: make,
      replaceSurvey: replaceSurvey,
      surveys: []
    };

    ////////////////

    // function get(survey_id){
    //   return this.surveys.find(function(d){ return d.id == survey_id });
    // }

    function get(group_id, survey_id){
      return !survey_id ? this.surveys.filter(function(d){ return d.survey_group_id == group_id }) : this.surveys.find(function(d){ return d.id == survey_id});
    }

    function fetch(type, params){
      var self = this;
      return SurveyFactory[type](params, function(res){
        if (type == "query"){
          res.forEach(replaceSurvey.bind(self));
        }else if (type == "get"){
          self.replaceSurvey(res);//.bind(self);
        };
        return res;
      }).$promise;
    }

    function replaceSurvey(survey){
      var self = this;
      var match = self.surveys.find(function(d){ return d.id == survey.id });
      if (match){
        var idx = self.surveys.indexOf(match);
        self.surveys[idx] = survey;
      }else{
        self.surveys.push(survey);
      }
    }

    function make(params){
      return new SurveyFactory(params);
    }

  }
}())
