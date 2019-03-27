"use strict";

(function(){
  angular
  .module("formBuilder")
  .service("csvService", Csv)

  Csv.$inject = [];

  function Csv(){

    return {
      callback: callback
    }

    /////////////////

    function callback(){
      // this needs to be here for the csv upload directive to work, strange
    }
    
  }
}())
