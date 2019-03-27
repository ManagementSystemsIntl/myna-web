"use strict";

(function(){
  angular
  .module("sections")
  .factory("SectionFactory", SectionFactory)

  SectionFactory.$inject = ["$resource"];

  function SectionFactory($resource){
    return $resource("/api/sections/:id.json",{},{
      update: {method:"PUT"}
    })
  }

}())
