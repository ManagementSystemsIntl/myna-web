"use strict";

(function(){
  angular
  .module("dashboard")
  .controller("DashboardIndexController", DashboardIndexController)

  DashboardIndexController.$inject = ["surveygroups"];

  function DashboardIndexController(surveygroups){
    var vm = this;
    vm.surveyGroups = surveygroups;
  }
}())
