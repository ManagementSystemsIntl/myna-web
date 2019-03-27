"use strict";

(function(){
  angular
  .module("formBuilder")
  .service("Utils", Utils)

  Utils.$inject = [];

  function Utils(){
    
    return {
      matchOriginal: matchOriginal,
      toggleEdit: toggleEdit
    };

    ///////////////////

    function matchOriginal(working, original, fields){
      fields.forEach(function(field){
        working[field] = original[field];
      })
      return working;
    }

    function toggleEdit(edit){
      return !edit;
    }

  }
}())
