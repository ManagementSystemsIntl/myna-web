"use strict";

(function(){
  angular
  .module("choiceLists")
  .directive("choiceListForm", ChoiceListForm)

  ChoiceListForm.$inject = ["ChoiceLists", "Flash", "QuestionAttributes", "QuestionOptions"];

  function ChoiceListForm(ChoiceLists, Flash, QuestionAttributes, QuestionOptions){

    var directive = {
      link:link,
      replace:true,
      restrict:"A",
      scope:{
        languages: "=",
        list: "=",
        group: "@"
      },
      templateUrl: "choice_lists/_form.html"
    };
    return directive;

    function link(scope, el){

      scope.choiceType = QuestionOptions.get_by_name("choice");
      scope.delete = deleteList;
      scope.submit = submitList;

      scope.$watch("list", function(newVal){
        if (newVal && newVal.hasOwnProperty("choices") && newVal.choices.length == 0){
          newVal.choices.push(QuestionAttributes.make({order: 0}));
        }
      });

      scope.$on("set-choice-list-form", function(res,list){
        if (el.parent().hasClass("modal-body")){
          scope.list = list;
        }
      });

      function submitList(){
        var choiceString = scope.list.choices.filter(function (d) { return !d.markForDeletion }).map(function(d){
          return [d.value, d.coded_value].join("_");
        }).join(",");
        if (scope.list.hasOwnProperty("id")){
          return scope.list.$update({id:scope.list.id, list_options:choiceString}, function(res){
            scope.$emit("choice-list-updated",scope.list);
            scope.choiceListForm.$setPristine();
            scope.choiceListForm.$setUntouched();
          }, function(err){
            console.log(err);
            Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error updating Choice List. Choice List "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
          });
        }else{
          return scope.list.$save({list_options:choiceString}, function(res){
            scope.$emit("choice-list-created",scope.list);
            scope.choiceListForm.$setPristine();
            scope.choiceListForm.$setUntouched();
            scope.list = ChoiceLists.make({survey_group_id: scope.group, choices: [] });
          }, function(err){
            console.log(err);
            Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error saving Choice List. Choice List "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
          });
        }
      }

      function deleteList(){
        scope.list.$delete({id: scope.list.id}, function(res){
          scope.$emit("choice-list-deleted", scope.list);
        }, function(err){
          console.log(err);
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error deleting Choice List. Choice List "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        })
      }

    }

  }
}())
