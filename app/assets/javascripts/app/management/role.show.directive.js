"use strict";

(function(){
  angular
  .module("management")
  .directive("roleShow", RoleShow)

  RoleShow.$inject = [];

  function RoleShow(){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        role: "=",
        user: "="
      },
      templateUrl: "management/_role_show.html"
    };
    return directive;

    function link(scope, el){

      scope.removeRole = removeRole;

      function removeRole(){
        scope.user.$remove_role({id: scope.user.id, role: scope.role.id}, function(res){
          scope.$emit("user-roles-updated", res);
          return res;
        }, function(err){
          console.log(err)
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error removing Role from User. User "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        })
      }

    }

  }
}())
