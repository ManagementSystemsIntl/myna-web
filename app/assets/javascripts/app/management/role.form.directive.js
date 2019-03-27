"use strict";

(function(){
  angular
  .module("management")
  .directive("roleForm", RoleForm)

  RoleForm.$inject = ["Flash", "Roles"];

  function RoleForm(Flash, Roles){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        user: "="
      },
      templateUrl: "management/_role_form.html"
    };
    return directive;

    function link(scope, el){

      scope.addRole = addRole;
      scope.allRoles = Roles.get();
      scope.availableRoles;
      scope.newRole = {
        id: null
      };

      scope.$watch("user", function(user){
        if (user && user.hasOwnProperty("id")){
          scope.availableRoles = getAvailableRoles();
        }
      }, true);

      ////////////////

      function addRole(){
        scope.user.$add_role({id: scope.user.id, role: scope.newRole.id}, function(res){
          scope.newRole.id = null;
          scope.$emit("user-roles-updated", res);
          return res;
        }, function(err){
          console.log(err)
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error adding Role to User. User "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        })
      }

      function getAvailableRoles(){
        var userRoleIds = scope.user.roles.map(function(d){ return d.id });
        return scope.allRoles.map(function(d){ return d.id })
        .filter(function(d){
          return userRoleIds.indexOf(d) == -1;
        }).map(function(d){
          return scope.allRoles.find(function(b){ return b.id == d });
        })
      }

    }

  }
}())
