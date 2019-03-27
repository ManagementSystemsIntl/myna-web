"use strict";

(function(){
  angular
  .module("management")
  .service("Devices", Devices)

  Devices.$inject = ["DeviceFactory"];

  function Devices(DeviceFactory){

    return {
      get: get,
      fetch: fetch,
      devices: []
    };

    ////////

    function get(device_id){
      return !device_id ? this.devices : this.devices.find(function(d){ return d.id == device_id });
    }

    function fetch(type, params){
      var self = this;
      return DeviceFactory[type](params, function(res){
        if (type == "query"){
          self.devices = res;
        }
        return res;
      }).$promise;
    }

  }
}())
