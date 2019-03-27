"use strict";

(function(){
  angular
  .module("questions")
  .directive("customOptionsForm", CustomOption)

  CustomOption.$inject = ["QuestionAttributes"];

  function CustomOption(QuestionAttributes){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope:{
        options: "=",
        otype: "="
      },
      templateUrl: "questions/_custom_option.html"
    };
    return directive;

    function link(scope,el){
      scope.addOne = addOne;
      scope.delete = deleteOption;
      scope.optionOrder;
      scope.placeholder = getPlaceholder();
      scope.placeholders = ["Pork","Tuna","Turkey","Beef","Chicken","Tofu","Kale","Ham","Cheese"];

      ////////////////////

      // this watch ensures that choice options are rendered in app in the same order as they are listed in builder
      scope.$watch("options.length", function(newVal){
        if (newVal){
          scope.options.sort(function(a,b){return a.order - b.order});
          scope.optionOrder = scope.options[scope.options.length - 1].order + 1;
        }
      },true)

      function addOne(){
        var newOpt = QuestionAttributes.make({question_option_id: scope.otype.id, name: scope.otype.name, order: scope.optionOrder || 0});
        newOpt.placeholder = getPlaceholder();
        scope.options.push(newOpt);
      }

      function getPlaceholder(){
        var a = ["Pork","Tuna","Turkey","Beef","Chicken","Tofu","Kale","Ham","Cheese"];
        var random = Math.floor(Math.random() * (a.length-1));
        return a[random];
      }

      function deleteOption(option){
        if (option.id){
          option.markForDeletion = true;
        }else{
          var idx = scope.options.indexOf(scope.options.find(function(d){return d === option}));
          scope.options.splice(idx,1);
        }
      }

    }

  }
}())
