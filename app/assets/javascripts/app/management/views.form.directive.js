"use strict";

(function(){
  angular
  .module("management")
  .directive("viewsForm", ViewsForm)

  ViewsForm.$inject = [];

  function ViewsForm(){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        ddoc: "@",
        key: "=",
        type: "@",
        view: "="
      },
      templateUrl: "management/_views_form.html"
    };
    return directive;

    function link(scope, el){
      scope.aceLoaded = aceLoaded;
      scope.ace = {
        useWrapMode : true,
        showGutter: true,
        firstLineNumber: 1,
        mode: 'javascript',
        workerPath: '/public/assets/ace-builds',
        onLoad: scope.aceLoaded
      };
      scope.originalKey;
      scope.reduces = ["_count","_sum","_stats","NONE"];
      scope.saving = false;
      scope.updateView = updateView;

      scope.$on("view-updated", function(evt, type, ddoc, key){
        if (type == scope.type && ddoc == scope.ddoc && key == scope.key && scope.saving == true){
          scope.saving = false;
          scope.$digest();
        }
      });

      var keywatch = scope.$watch("key", function(newVal){
        if (newVal){
          scope.originalKey = angular.copy(newVal);
          keywatch();
        }
      });

      function aceLoaded(_editor){
        console.log(_editor);
      }

      function updateView(key,view){
        scope.saving = true;
        if (view.reduce == "NONE"){
          delete view.reduce;
        }
        if (!view.alias){
          view.alias = key;
        }
        if (!view.show_threshold){
          delete view.show_threshold;
        }
        scope.$emit("update-view", scope.type, scope.ddoc, scope.originalKey, key, view);
      }

    }

  }

}())
