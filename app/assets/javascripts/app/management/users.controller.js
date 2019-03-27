"use strict";

(function(){
  angular
  .module("management")
  .controller("UsersIndexController", UsersIndexController)

  UsersIndexController.$inject = ["$scope", "CurrentUser", "Roles", "Users", "roles", "users"];

  function UsersIndexController($scope, CurrentUser, Roles, Users, roles, users){

    var vm = this;

    vm.roles = roles;
    vm.setSortType = setSortType;
    vm.sortDirection = true;
    vm.sortType = "name";
    vm.users = users.map(Roles.mapRoles);
    vm.you = Roles.mapRoles(CurrentUser.current_user);

    $scope.$on("user-roles-updated", function(res, user){
      if (user.id == vm.you.id){
        vm.you = Roles.mapRoles(user);
        CurrentUser.update_current_user(user);
      }
      Users.replaceUser(user);
    });

    function setSortType(field){
      vm.sortType = field;
      vm.sortDirection = !vm.sortDirection;
    }

  }
}())
