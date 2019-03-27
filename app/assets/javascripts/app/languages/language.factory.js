"use strict";

(function(){
  angular
  .module("languages")
  .factory("LanguageFactory", LanguageFactory)

  LanguageFactory.$inject = ["$resource"];

  function LanguageFactory($resource){
    return $resource("/api/languages/:id.json",{},{
      update: {method: "PUT"}
    })
  }

}())
