"use strict";

(function () {
  angular
  .module("formBuilder")
  .controller("HelpController", HelpController);

  HelpController.$inject = ["$scope", "CurrentUser"];

  function HelpController($scope, CurrentUser) {
    var vm = this;
    vm.abilities = CurrentUser.parse_abilities();

    var all = vm.abilities.indexOf("can manage all") > -1;
    vm.show = {
      fb: all || vm.abilities.indexOf("can see builder") > -1,
      dash: all || vm.abilities.indexOf("can see dashboards") > -1,
      data: all || vm.abilities.indexOf("can download data") > -1,
      mgmt: all
    };

  }
}());
