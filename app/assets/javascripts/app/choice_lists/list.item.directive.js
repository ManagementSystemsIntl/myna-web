"use strict";

(function(){
  angular
  .module("choiceLists")
  .directive("choiceListLi",ChoiceListLi)

  ChoiceListLi.$inject = ["QuestionAttributeFactory", "Utils"];

  function ChoiceListLi(QuestionAttributeFactory, Utils){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        list: "="
      },
      templateUrl: "choice_lists/_li.html"
    };
    return directive;

    function link(scope, el){

      scope.edit = false;
      scope.openEdit = openEdit;
      scope.originalList;

      scope.$watch("list", function(newVal){
        if (newVal && newVal.hasOwnProperty("id")){
          scope.originalList = angular.copy(newVal);
        }
      });

      scope.$on("choice-list-cancel-edit", function(res){
        if (scope.edit){
          closeEdit();
        }
      });

      scope.$on("choice-list-updated-li", function(res, list){
        if (scope.edit){
          var choices = list.choices.map(mapQA)
          list.choices = choices;
          scope.list = list;
          scope.originalList = angular.copy(list);
          scope.edit = false;
        }
      });

      ///////////////////////

      function closeEdit(){
        Utils.matchOriginal(scope.list, scope.originalList, ["name", "choices", "language_id"]);
        scope.edit = false;
      }

      function openEdit(){
        scope.edit = true;
        scope.$emit("choice-list-open-edit", scope.list);
      }

      function mapQA(c){
        return new QuestionAttributeFactory(c);
      }

    }

  }
}())
