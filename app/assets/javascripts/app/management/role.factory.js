"use strict";

(function(){
  angular
  .module("management")
  .factory("RoleFactory", RoleFactory)

  RoleFactory.$inject = ["$resource"];

  function RoleFactory($resource){
    return $resource("/api/roles/:id.json",{},{
      update: {method:"PUT"}
    })

  }
}())
