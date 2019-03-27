"use strict";

(function(){
  angular
  .module("surveyGroups")
  .factory("SurveyGroupFactory", SurveyGroupFactory)

  SurveyGroupFactory.$inject = ["$resource"];

  function SurveyGroupFactory($resource){
    return $resource("/api/survey_groups/:id.json",{},{
      update: {
        method: "PUT"
      },
      query_all: {
        method: "GET",
        url: "/api/survey_groups",
        isArray: true
      },
      query_tree: {
        method: "GET",
        params: {tree: "@tree"},
        url: "/api/survey_groups?tree=:tree",
        isArray: true
      }
    })
  }

}())
