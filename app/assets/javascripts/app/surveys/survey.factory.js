"use strict";

(function(){
  angular
  .module("surveys")
  .factory("SurveyFactory", SurveyFactory)

  SurveyFactory.$inject = ["$resource"];

  function SurveyFactory($resource){
    return $resource("/api/surveys/:id.json", {}, {
      create_clone: {
        method: "POST",
        params: {id: "@id", to_client: "@to_client", to_group: "@to_group", as: "@as"},
        url: "/api/surveys/:id/create_clone.json?client_id=:to_client&group_id=:to_group&as=:as"
      },
      get_clones: {
        method: "GET",
        url: "/api/surveys/:id/clones.json"
      },
      update: {
        method: "PUT"
      },
      publish_schema: {
        method: "POST",
        url: "/api/surveys/:id/publish_schema.json"
      },
      query_all: {
        method: "GET",
        url: "/api/surveys",
        isArray: true
      },
      update_target: {
        method: "POST",
        url: "/api/surveys/:id/update_target"
      },
      update_active: {
        method: "PUT",
        url: "/api/surveys/:id/update_active"
      },
      latest_schema: {
        method: "GET",
        url: "/api/surveys/:id/latest_schema"
      }
    })

  }
}())
