"use strict";

(function(){
  angular
  .module("languages")
  .directive("languageForm", LanguageForm)

  LanguageForm.$inject = ["Languages"];

  function LanguageForm(Languages){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        group: "@",
        languages: "="
      },
      templateUrl: "languages/_language_form.html"
    };
    return directive;

    function link(scope, el){

      scope.addOne = addOne;
      scope.delete = deleteOption;

      ////////////////////

      function addOne(){
        scope.languages.push(Languages.make({survey_group_id: scope.group}));
      }

      function deleteOption(option){
        if (option.id){
          option.markForDeletion = true;
        }else{
          var idx = scope.languages.indexOf(scope.languages.find(function(d){ return d == option }));
          scope.languages.splice(idx, 1);
        }
      }

    }

  }
}())
