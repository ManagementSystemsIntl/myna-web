"use strict";

(function(){
  angular
  .module("questions")
  .directive("questionForm", QuestionForm)

  QuestionForm.$inject = [
    "$q", "$stateParams", "Flash",
    "ChoiceLists", "QuestionAttributes", "QuestionOptions", "QuestionTypes", "Questions", "Utils"
  ];

  function QuestionForm(
    $q, $stateParams, Flash,
    ChoiceLists, QuestionAttributes, QuestionOptions, QuestionTypes, Questions, Utils
  ){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        code: "@",
        direction: "@",
        question: "=",
        section: "@",
        survey: "@"
      },
      templateUrl: "questions/_form.html"
    };
    return directive;

    function link(scope, el){

      scope.gridinput = 'builder';
      scope.choiceLists = ChoiceLists.get($stateParams.group_id);
      scope.choice_types = QuestionTypes.question_types.filter(function(d){
        return ["reading_question","single_choice","multiple_choice"].indexOf(d.name) > -1;
      }).map(function(d){
        return d.id;
      });

      scope.csv = { header:true, separator:",", result:"", content:"", accept:".csv" };
      scope.csvCallback = csvCallback;
      scope.delete = deleteQuestion;
      scope.display_options = [
        {name:"Radio Buttons",value:"radios"},
        {name:"Inline Buttons",value:"radiobuttons"},
        {name:"Checkboxes",value:"checkboxes"},
        {name:"Dropdown",value:"select"}
      ];
      scope.gridAsText = true;
      scope.grid_widths = ["5","10","Auto"];
      scope.question_types = getQuestionTypes();
      scope.readonly_types = QuestionTypes.question_types.filter(function(d){
        return ["reaonly_text"].indexOf(d.name) > -1;
      }).map(function(d){
        return d.id;
      });
      scope.setQuestion = setQuestion;
      scope.submit = submitQuestion;

      // listeners

      scope.$on("got-question-parts", function(res, survey_id, question_id, opts, choiceList){
        setForm(survey_id, question_id, opts, choiceList, true);
      });

      scope.$on("question-cancel-edit",function(res, question_type_id){
        setQuestion(question_type_id, true);
      });

      scope.$on("grid-update", function (res, grid_string) {
        scope.attributes.grid_string.value = grid_string;
      });

      ////////////////////

      function setForm(survey_id, question_id, opts, choiceList, originals){
        // scope.useChoiceList = choiceList ? "true" : "false";
        scope.useChoiceList = choiceList ? true : false;

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
          scope.$broadcast("update-grid", attributes.grid_string.value);
        }

        if (originals){
          scope.originalOptions = angular.copy(options);
          scope.originalAttributes = angular.copy(attributes);
        }
      }

      function setQuestion(type_id, cancelEdit, updated){
        var opts = QuestionTypes.get(type_id).question_options.map(function(d){
          return QuestionOptions.get(d.id);
        });

        if (cancelEdit){
          var atts = Object.keys(scope.attributes).map(function(k){ return scope.attributes[k] });
          var flatAtts = [].concat.apply([], atts).filter(function(d){ return d.hasOwnProperty("id") });

          var orig = Object.keys(scope.originalAttributes).map(function(k){ return scope.originalAttributes[k] });
          var flatOrig = [].concat.apply([], orig);

          flatAtts.forEach(function(a){
            var o = flatOrig.find(function(d){ return d.id == a.id });
            Utils.matchOriginal(a, o, ["value", "coded_value", "order"]);
          });
        }
        var originals = cancelEdit || updated;
        setForm(scope.question.survey_id, scope.question.id, opts, scope.question.choice_list_id, originals);
      }

      ////////////////////

      function csvCallback(){
        var list = []
        scope.csv.result.forEach(function(row){
          var keys = Object.keys(row);
          list.push(keys.map(function(k){ return row[k] }));
        })
        var orderedList = [].concat.apply([], list);
        scope.grid_preview = list.join("\n");
        scope.attributes.grid_string.value = orderedList.join("--")
        scope.$apply();
        // this needs to be here for the csv upload directive to work, strange
      }

      function getQuestionTypes(){
        return QuestionTypes.question_types.sort(function(a,b){
          var cat1 = a.question_category_id;
          var cat2 = b.question_category_id;
          var name1 = a.name;
          var name2 = b.name;
          if (cat1 > cat2) return -1;
          if (cat1 < cat2) return 1;
          if (name1 < name2) return -1;
          if (name1 > name2) return 1;
          return 0;
        })
      }

      function submitQuestion(){
        var removeCustomOptions;
        // if (scope.useChoiceList == 'true'){
        if (scope.useChoiceList){
          removeCustomOptions = true;
        }else{
          scope.question.choice_list_id = null;
          removeCustomOptions = false;
        }
        if (scope.question.hasOwnProperty("id")){
          updateQuestion().then(function(res){
            return updateAttributes(removeCustomOptions);
          }).then(function(){
            scope.$emit("question-updated", scope.question);
          })
        }else{
          saveQuestion().then(function(res){
            return updateAttributes(removeCustomOptions);
          }).then(function(){
            scope.$emit("question-created", scope.question);
          })
        }
      }

      function updateQuestion(){
        return scope.question.$update({id: scope.question.id}, function(question){
          return question;
        }, function(err){
          console.log(err);
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error updating Question. Question "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        });
      }

      function saveQuestion(){
        return scope.question.$save({}, function(question){
          return question;
        }, function(err){
          console.log(err);
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error saving Question. Question "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        });
      }

      function deleteQuestion(){
        scope.question.$delete({id: scope.question.id}, function(resp){
          scope.$emit("question-deleted", scope.question);
          el.remove();
        }, function(err){
          console.log(err);
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error deleting Question. Question "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        })
      }

      function updateAttributes(removeCustomOptions){
        var attributes = flattenAttributes(scope.attributes);
        var promises = [];
        attributes.forEach(function(attribute){
          promises.push(updateAttribute(attribute, removeCustomOptions));
        });
        return $q.all(promises).then(function(attributes){
          // update attributes in service
          QuestionAttributes.updateAttributes(scope.question.survey_id, attributes, removeCustomOptions);
          setQuestion(scope.question.question_type_id, null, true);
        });
      }

      function updateAttribute(attribute, removeChoices){
        // delete choice attributes if a choice list is being used
        if (removeChoices && attribute.name == "choice"){
          if (attribute.hasOwnProperty("id")){
            return attribute.$delete({id: attribute.id});
          }else{
            return;
          }
        }

        // update existing attributes
        if (attribute.hasOwnProperty("id")){
          parseIntegers(attribute);
          return attribute.$update({id: attribute.id}, function(a){
            parseIntegers(a);
            return a;
          }, function(err){
            console.log(err);
            Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error updating Question Attribute. Question Attribute "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
          });
        }else{
        // save new attributes
          attribute.question_id = scope.question.id;
          return attribute.$save({}, function(a){
            parseIntegers(a);
            return a;
          }, function(err){
            console.log(err)
            Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error saving Question Attribute. Question Attribute "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
          });
        }
      }

      function flattenAttributes(attributes){
        // if not conditional, don't try to save undefined values
        // if show_if not true, set to false
        if (attributes.show_if && attributes.show_if.value != "true"){
          attributes.show_if.value = "false";
          delete attributes.show_if_value;
          delete attributes.show_if_question_number;
          delete attributes.show_if_qualifier;
        }
        var atts = Object.keys(attributes).map(function(d){
          return attributes[d];
        });
        return [].concat.apply([], atts);//.map(function(a){ return QuestionAttributes.make(a) });
      }

      function parseIntegers(attribute){
        var attributeNames = ["grid_timer", "grid_autostop", "minimum", "maximum", "show_after"];
        var idx = attributeNames.indexOf(attribute.name);
        if (idx > -1){
          var val = parseInt(attribute.value);
          attribute.value = val;
        }
      }

    }

  }
}())
