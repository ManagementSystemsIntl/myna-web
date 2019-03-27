"use strict";

(function(){
  angular
  .module("management")
  .directive("viewsModal", ViewsModal)

  ViewsModal.$inject = [];

  function ViewsModal(){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {},
      templateUrl: "management/_views_modal.html"
    };
    return directive;

    function link(scope, el){

      scope.addDdoc = addDdoc;
      scope.addView = addView;

      scope.$on("update-views-modal", function(evt, cohort, pouch){
        scope.cohort = cohort;
        scope.pouch = pouch;
        scope.pouch.getDesginDocs().then(function(res){
          scope.views = res;
        });
      });

      scope.$on("update-view", function(evt, type, ddoc, oKey, key, view){
        var db = checkType(type);
        return scope.pouch[db].get(ddoc).then(function(doc){
          doc.views[key] = view;
          if (oKey !== key){
            delete doc.views[oKey];
          }
          return scope.pouch[db].put(doc);
        }).then(function(res){
          scope.$broadcast("view-updated", type, ddoc, key);
        });
      });

      function addDdoc(name, type){
        var ddoc = { _id: "_design/"+name, language: "javascript", views: {} };
        var db = checkType(type);
        return scope.pouch[db].put(ddoc).then(function(res){
          if (type == "surveys"){
            scope.newSurveysDdoc = null;
          }else if (type == "responses"){
            scope.newResponsesDdoc = null;
          }
          ddoc.rev = res.rev;
          scope.views[type].push(ddoc);
          scope.$digest();
        })
      }

      function addView(ddoc,val){
        ddoc.views[val.newview] = {};
        val.newview = null;
      }

      function checkType(type){
        if (type == "surveys"){
          return "remoteSurveyDB";
        }else if (type == "responses"){
          return "remoteResponseDB";
        }
      }

    }

  }
}())
