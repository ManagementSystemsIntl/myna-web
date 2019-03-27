"use strict";

(function(){
  angular
  .module("translations")
  .directive("translator", Translator)

  function Translator(){
    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        translation: "=",
        initial: "@"
      },
      templateUrl: "translations/_translator.html"
    };
    return directive;

    function link(scope,el){
      scope.i = scope.initial;
      scope.save = saveTranslation;
      scope.showSave = false;
      scope.toggleSave = toggleSave;

      ////////////////////

      function saveTranslation(){
        scope.translation.$update({id: scope.translation.id}, function(translation){
          scope.i = translation.value;
          scope.showSave = false;
        })
      }

      function toggleSave(value){
        scope.showSave = scope.translation.value == scope.i? false : true;
      }

    }

  }
}())
