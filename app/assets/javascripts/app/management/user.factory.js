"use strict";

(function(){
  angular
  .module("management")
  .factory("UserFactory", UserFactory)

  UserFactory.$inject = ["$resource"];

  function UserFactory($resource){
    return $resource("/api/users/:id.json",{},{
      remove_role: {
        method: "POST",
        params: {id: "@id", role: "@role"},
        url: "/api/users/:id/remove_user_role.json?role=:role"
      },
      add_role: {
        method: "POST",
        params: {id: "@id", role: "@role"},
        url: "/api/users/:id/add_user_role.json?role=:role"
      },
      update: {
        method:"PUT"
      }
    })

  }
}())
