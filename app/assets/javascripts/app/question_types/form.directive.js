"use strict";

(function(){
  angular
  .module("questionTypes")
  .directive("questionTypeForm",QuestionTypeForm)

  QuestionTypeForm.$inject = ["$stateParams","$state","QuestionOptionFactory"];

  function QuestionTypeForm($stateParams,$state,QuestionOptionFactory){
    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        questionType: "=",
        questionCategories: "="
      },
      templateUrl: "question_types/_form.html"
    };
    return directive;

    function link(scope,el){

      scope.questionType;
      scope.questionOptions = getQuestionOptions();
      scope.questionCategories;
      scope.checklist = [];
      scope.check = check;
      scope.submit = submitQuestionType;

      scope.$watch('questionType', function(newVal){
        if (newVal && newVal.hasOwnProperty("id")){
          scope.questionType = newVal;
          scope.questionType.has_number += "";
        }
      })

      function check(option){
        if (option.checked){
          option.checked = true;
          scope.checklist.push(option.id);
        }else{
          option.checked = false;
          var checkIdx = scope.checklist.indexOf(option.id);
          scope.checklist.splice(checkIdx,1);
        }
      }

      function getQuestionOptions(){
        return QuestionOptionFactory.query({}, function(options){
          if (scope.questionType.question_options){
            var optionIds = scope.questionType.question_options.map(function(o){
              return o.id;
            })
          }else{
            var optionIds = [];
          }
          return options.map(function(o){
            o.checked = false;
            if (optionIds.indexOf(o.id) > -1){
              o.checked = true;
              scope.checklist.push(o.id);
            }
            return o;
          })
        });
      }

      function submitQuestionType(){
        el.hide();
        if (scope.questionType.hasOwnProperty("id")){
          updateType().then(function(type){
            console.log(type)
            $state.reload();
          })
        }else{
          saveType().then(function(type){
            console.log(type);
            $state.reload();
          })
        }
      }

      function updateType(){
        return scope.questionType.$update({id: scope.questionType.id, options: scope.checklist.join(",")}, function(type){
          return type;
        }, function(err){
          console.log(err);
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error in updating Question Type. Question Type "+err.statusText.toLowerCase()+".",3000,{class:"full-screen"})
        })
      }

      function saveType(){
        return scope.questionType.$save({options: scope.checklist.join(",")}, function(type){
          return type;
        }, function(err){
          console.log(err);
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error in saving Question Type. Question Type "+err.statusText.toLowerCase()+".",3000,{class:"full-screen"})
        })
      }

    }

  }
}())
