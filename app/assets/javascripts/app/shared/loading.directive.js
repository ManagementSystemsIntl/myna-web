"use strict";

(function(){
  angular
  .module("formBuilder")
  .directive("stateLoading", StateLoading)

  StateLoading.$inject = ["$rootScope"];

  function StateLoading($rootScope){
    var directive = {
      link: { pre: preLink },
      priority: 100,
      restrict: "A"
    };
    return directive;

    function preLink(scope, el, attrs){

      el.bind("click", function(e){
        el.addClass("disabled");
        var icon = getIcon();
        if (icon){
          var originalClassName = icon.className;
          icon.className = "fa fa-fw fa-spinner fa-spin";
        }else{
          var spinner = "<i class=\"fa fa-fw fa-spinner fa-spin\"></i>";
          el.prepend(spinner);
        }
        var loadingWatch = $rootScope.$watch("pageLoading", function(newVal){
          if (!newVal){
            el.removeClass("disabled");

            if (icon){
              icon.className = originalClassName;
            }else{
              var spinner = el.find(".fa-spinner");
              spinner.remove();
            }
            loadingWatch();
          }
        }, true);
      });

      function getIcon(){
        var icon = el.find(".fa");
        return icon.length > 0 ? icon[0] : false;
      }

    }

  }

}())
