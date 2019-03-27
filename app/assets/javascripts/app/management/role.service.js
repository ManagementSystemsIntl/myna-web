"use strict";

(function(){
  angular
  .module("management")
  .service("Roles", Roles)

  Roles.$inject = ["RoleFactory"];

  function Roles(RoleFactory){

    return {
      get: get,
      fetch: fetch,
      mapRoles: mapRoles,
      roles: []
    };

    ////////

    function get(role_id){
      return !role_id ? this.roles : this.roles.find(function(d){ return d.id == role_id });
    }

    function fetch(type, params){
      var self = this;
      return RoleFactory[type](params, function(res){
        if (type == "query"){
          self.roles = res;
        }
        return res;
      }).$promise;
    }

    function mapRoles(user){
      user.roles_display = user.roles.map(function(d){ return d.name }).join(", ");
      return user;
    }

  }
}())
