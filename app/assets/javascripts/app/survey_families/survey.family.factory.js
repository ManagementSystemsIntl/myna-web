"use strict";

(function(){
  angular
  .module("surveyFamilies")
  .factory("SurveyFamilyFactory", SurveyFamilyFactory)

  SurveyFamilyFactory.$inject = ["$resource"];

  function SurveyFamilyFactory($resource){
    return $resource("/api/survey_families/:id.json", {}, {
      update: {
        method: "PUT"
      },
      query_all: {
        method: "GET",
        url: "/api/survey_families",
        isArray: true
      },
      update_target: {
        method: "POST",
        url: "/api/survey_families/:id/update_target"
      },
      update_active: {
        method: "PUT",
        url: "/api/survey_families/:id/update_active"
      }
    })
  }

}())
