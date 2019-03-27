"use strict";

(function(){
  angular
  .module("management")
  .controller("DevicesController", DevicesController)

  DevicesController.$inject = ["devices"];

  function DevicesController(devices){

    var vm = this;

    vm.devices = devices;

  }
}())
