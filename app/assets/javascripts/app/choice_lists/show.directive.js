"use strict";

(function(){
  angular
  .module("choiceLists")
  .directive("choiceListShow", ChoiceListShow)

  ChoiceListShow.$inject = ["Languages"];

  function ChoiceListShow(Languages){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        list: "="
      },
      templateUrl: "choice_lists/_show.html"
    }
    return directive;

    function link(scope, el){

      scope.$watch("list", function(list){
        if (list && list.hasOwnProperty("id")){
          scope.language = Languages.get(list.survey_group_id, list.language_id);
        }
      }, true)

    }

  }
}())
