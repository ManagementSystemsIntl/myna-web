"use strict";

(function(){
  angular
  .module("formBuilder")
  .directive("confirm", Confirm)

  Confirm.$inject = [];

  function Confirm(){

    var directive = {
      link: { pre: preLink },
      priority: 100,
      restrict: "A"
    };
    return directive;

    function preLink(scope, el, attrs){

      var msg = attrs.confirm.split("<br>").join("\n\n") || "Are you sure?";

      el.bind("click", function(e){
        if (!confirm(msg)){
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      });
      
    }

  }
}())
