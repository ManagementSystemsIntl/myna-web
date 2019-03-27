"use strict";

(function(){
  angular
  .module("surveyGroups")
  .factory("PouchKeyFactory", PouchKeyFactory)

  PouchKeyFactory.$inject = ["$resource"];

  function PouchKeyFactory($resource){
    return $resource("/api/pouch_keys/:id.json",{},{
      update: {method: "PUT"}
    })
  }

}())
