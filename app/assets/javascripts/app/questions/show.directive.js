"use strict";

(function(){
  angular
  .module("questions")
  .directive("questionShow", QuestionShow)

  QuestionShow.$inject = [
    "$sce", "$stateParams",
    "ChoiceLists", "QuestionAttributes", "QuestionOptions", "Questions", "QuestionTypes", "Utils"
  ];

  function QuestionShow(
    $sce, $stateParams,
    ChoiceLists, QuestionAttributes, QuestionOptions, Questions, QuestionTypes, Utils
  ){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope:{
        code: "@",
        question: "="
      },
      templateUrl: "questions/_show.html"
    };
    return directive;

    function link(scope,el){

      var choiceLists = ChoiceLists.get($stateParams.group_id);

      scope.display_names = {
        "radios": "Radio Buttons",
        "radiobuttons": "Inline Buttons",
        "select": "Dropdown",
        "checkboxes": "Checkboxes"
      };

      scope.$on("got-question-parts", function(res, survey_id, question_id, opts, choiceList){
        setShow(survey_id, question_id, opts, choiceList, true);
      })

      scope.$on("update-question-show", function(res, type_id){
        setQuestion(type_id, null, true);
      })

      scope.$on("question-cancel-edit", function(res, type_id){
        setQuestion(type_id, true);
      })

      //////////////////////////

      function setShow(survey_id, question_id, opts, choiceList, originals){
        scope.choice_list = choiceLists.find(function(d){return d.id == scope.question.choice_list_id});
        scope.question_type = QuestionTypes.get(scope.question.question_type_id);

        var options = Questions.mapOptions(opts);
        scope.options = options;
        scope.choiceOption = options.choice;

        var atts = QuestionAttributes.get(survey_id).filter(function(d){
          var d_id = d.hasOwnProperty("question") ? d.question.id : d.question_id;
          return d_id == question_id;
        });

        var attributes = Questions.mapAttributes(opts, atts);
        if (attributes.hasOwnProperty("show_if")){
          attributes.show_if.value = attributes.show_if.value ? attributes.show_if.value : "false";
        }
        scope.attributes = attributes;
        scope.customOptions = attributes.choice;
        if (attributes.grid_string) {
          scope.gridRender = formatGrid(attributes.grid_string.value);
        }

        if (originals){
          scope.originalOptions = angular.copy(options);
          scope.originalAttributes = angular.copy(attributes);
        }
      }

      function setQuestion(type_id, cancelEdit, updated){
        scope.question_type = QuestionTypes.get(type_id);

        var opts = QuestionTypes.get(type_id).question_options.map(function(d){
          return QuestionOptions.get(d.id);
        });

        if (cancelEdit){
          var atts = Object.keys(scope.attributes).map(function(k){ return scope.attributes[k] });
          var flatAtts = [].concat.apply([],atts).filter(function(d){ return d.hasOwnProperty("id") });

          var orig = Object.keys(scope.originalAttributes).map(function(k){ return scope.originalAttributes[k] });
          var flatOrig = [].concat.apply([],orig);

          flatAtts.forEach(function(a){
            var o = flatOrig.find(function(d){ return d.id == a.id });
            Utils.matchOriginal(a, o, ["value", "coded_value", "order"]);
          })
        }
        var originals = cancelEdit || updated;
        setShow(scope.question.survey_id, scope.question.id, opts, scope.question.choice_list_id, originals);
      }

      function formatGrid(string, width) {
        var delimeter = string.match("--") ? "--" : " ";
        var gl = 5;
        return string.split(delimeter).reduce(function (p, n, i, a) {
          if (i === 0 || i%gl === 0) {
            var row = [n];
            p.push(row);
          } else {
            var row = p[p.length - 1];
            row.push(n);
          }
          return p;
        }, []);
      }

    }

  }
}())
