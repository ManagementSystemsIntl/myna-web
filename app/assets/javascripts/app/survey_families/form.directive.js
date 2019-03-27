"use strict";

(function(){
  angular
  .module("surveyFamilies")
  .directive("surveyFamilyForm", SurveyFamilyForm)

  SurveyFamilyForm.$inject = [
    "$stateParams", "Flash", "pdb",
    "PouchKeys", "SchemaFactory", "Surveys", "SurveyFamilies"
  ];

  function SurveyFamilyForm(
    $stateParams, Flash, pdb,
    PouchKeys, SchemaFactory, Surveys, SurveyFamilies
  ){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        group: "@",
        family: "=",
        surveys: "="
      },
      templateUrl: "survey_families/_form.html"
    }
    return directive;

    function link(scope, el){

      scope.check = check;
      scope.delete = deleteFamily;
      scope.dragControlListeners = {
        orderChanged: function(evt){
          moveCallback();
        },
        itemMoved: function(evt){
          moveCallback();
        }
      };
      scope.models = {};
      scope.submit = submitFamily;

      scope.$on("set-family-form", function (res, family) {
        if (!el.parent().hasClass("modal-body")) return;
        var golds = family.gold_standards ? family.gold_standards.split(",") : [];
        scope.models.selected = angular.copy(family.surveys);
        scope.models.unselected = angular.copy(scope.surveys.filter(function (d) {
          return scope.models.selected.map(function (b) { return b.id }).indexOf(d.id) === -1;
        }));
        scope.goldStandards = "1,2,3,4,5,6".split(",").map(function(d){ return {v: d, checked: golds.indexOf(d) > -1 } });
        scope.checked = {gs: 0};
      });

      /////////////////////

      function check(type, val) {
        scope.checked[type] += val ? 1 : -1;
      }

      function moveCallback(){
        scope.models.selected.forEach(function(d,i){
          d.order = i;
        });
        scope.models.unselected.forEach(function(d){
          d.order = null;
          d.random = null;
        });
      }

      scope.$watch("surveys", function (n, o) {
        if (n && n.length > scope.surveys.length) {
          scope.models.unselected.push(angular.copy(n.pop()));
        }
      }, true);

      var famwatch = scope.$watch("family", function (n,o) {
        scope.$watch("surveys", function (nn,oo) {
          if (nn && n && n.hasOwnProperty("id")) {
            return
          } else if (nn) {
            scope.models.unselected = angular.copy(nn);
            scope.models.selected = [];
            scope.goldStandards = "1,2,3,4,5,6".split(",").map(function(d){ return {v: d, checked: false} });
            scope.checked = {gs: 0};
          }
          famwatch()
        }, true);
      }, true);

      function deleteFamily(){
        scope.family.$delete({id: scope.family.id}, function(family){
          scope.$emit("family-deleted", family);
        }, function(err){
          console.log(err);
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error deleting Survey Family. Survey Family "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        })
      }

      function submitFamily(){
        if (scope.family.hasOwnProperty("id")){
          return updateFamily().then(function(family){
            scope.family = family;
            scope.$emit("family-updated", scope.family);
          });
        } else {
          return saveFamily().then(function(family){
            scope.familyForm.$setPristine();
            scope.familyForm.$setUntouched();
            scope.$emit("family-created", family);
            scope.goldStandards = "1,2,3,4,5,6".split(",").map(function(d){ return {v: d, checked: false} });
            scope.checked = {gs: 0};
            scope.models.unselected = angular.copy(scope.surveys);
            scope.models.selected = [];
            scope.family = SurveyFamilies.make({survey_group_id: scope.group});
          });
        }
      }

      function updateFamily(){
        var famList = scope.models.selected.map(function(d){
          return [d.id,d.random,d.order].join("_");
        }).join(",");
        scope.family.gold_standards = scope.goldStandards.filter(function(d){return d.checked}).map(function(d){return d.v}).join(",");
        return scope.family.$update({id: scope.family.id, surveys: famList}, function(family){
          return family;
        }, function(err){
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error updating Survey Family. Survey Family "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        })
      }

      function saveFamily(){
        var famList = scope.models.selected.map(function(d){
          return [d.id,d.random,d.order].join("_");
        }).join(",");
        scope.family.gold_standards = scope.goldStandards.filter(function(d){return d.checked}).map(function(d){return d.v}).join(",");
        return scope.family.$save({surveys: famList}, function(family){
          return family;
        }, function(err){
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error saving Survey Family. Survey Family "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        });
      }

    }

  }
}())
