"use strict";

(function(){
  angular
  .module("translations")
  .factory("TranslationFactory", TranslationFactory)

  TranslationFactory.$inject = ["$resource"];

  function TranslationFactory($resource){
    return $resource("/api/translations/:id.json",{},{
      update: {method:"PUT"}
    })
  }

}())
