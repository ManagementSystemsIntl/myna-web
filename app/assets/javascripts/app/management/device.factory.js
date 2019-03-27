"use strict";

(function(){
  angular
  .module("management")
  .factory("DeviceFactory", DeviceFactory)

  DeviceFactory.$inject = ["$resource"];

  function DeviceFactory($resource){
    return $resource("/api/devices/:id.json",{},{
      update: {method:"PUT"}
    })

  }
}())
