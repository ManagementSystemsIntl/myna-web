"use strict";

(function(){
  angular
  .module("choiceLists")
  .service("ChoiceLists",ChoiceLists)

  ChoiceLists.$inject = ["ChoiceListFactory", "QuestionAttributeFactory"];

  function ChoiceLists(ChoiceListFactory, QuestionAttributeFactory){

    return {
      fetch: fetch,
      get: get,
      lists: {},
      make: make,
      mapList: mapList,
    };

    ////////////////////

    function get(group_id, list_id){
      return !list_id ? this.lists["g"+group_id] : this.lists["g"+group_id].find(function(d){ return d.id == list_id});
    }

    function fetch(type, params){
      var self = this;
      return ChoiceListFactory[type](params, function(res){
        self.lists["g"+params.survey_group_id] = res;
      }).$promise;
    }

    function make(params){
      return new ChoiceListFactory(params);
    }

    function mapQA(choice){
      return new QuestionAttributeFactory(choice);
    }

    function mapList(list){
      var choices = list.choices.map(mapQA);
      list.choices = choices;
      return list;
    }

  }
}())
