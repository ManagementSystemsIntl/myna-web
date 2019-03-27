"use strict";

(function(){
  angular
  .module("choiceLists")
  .factory("ChoiceListFactory", ChoiceListFactory)

  ChoiceListFactory.$inject = ["$resource"];

  function ChoiceListFactory($resource){
    return $resource("/api/choice_lists/:id.json", {}, {
      update: {method: "PUT"}
    })
  }

}())
