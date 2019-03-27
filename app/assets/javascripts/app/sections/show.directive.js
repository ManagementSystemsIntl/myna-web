"use strict";

(function(){
  angular
  .module("sections")
  .directive("sectionShow", SectionShowFunction)

  SectionShowFunction.$inject = ["$sce", "$state"];

  function SectionShowFunction($sce, $state){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        group: "@",
        survey: "@",
        section: "="
      },
      templateUrl: "sections/_show.html"
    };
    return directive;

    function link(scope, el){

      scope.is_li = is_li();

      function is_li(){
        return $state.current.name == "builder.sectionShow" ? false : true;
      }

    }

  }
}())
