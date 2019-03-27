"use strict";

(function(){
  angular
  .module("questions")
  .service("QuestionAttributes", QuestionAttributes)

  QuestionAttributes.$inject = ["QuestionAttributeFactory"];

  function QuestionAttributes(QuestionAttributeFactory){

    return {
      atts: {},
      fetch: fetch,
      get: get,
      make: make,
      removeAttributes: removeAttributes,
      updateAttributes: updateAttributes
    };

    ////////////////////////////

    function fetch(type, params){
      var self = this;
      return QuestionAttributeFactory[type](params, function(res){
        if (type == "query"){
          self.atts["s"+params.survey_id] = res;
        }
        return res;
      }).$promise;
    }

    function make(params){
      return new QuestionAttributeFactory(params);
    }

    function get(survey_id, att_id){
      return !att_id ? this.atts["s"+survey_id] : this.atts["s"+survey_id].find(function(d){ return d.id == att_id});
    }

    function removeAttributes(survey_id, question_id){
      var sAtts = this.atts["s"+survey_id];
      var qAtts = sAtts.filter(function(d){
        var d_id = d.hasOwnProperty("question") ? d.question.id : d.question_id;
        return d_id == question_id;
      }).map(function(d){
        return sAtts.indexOf(d);
      });
      // go backwards in removing attributes from array
      qAtts.reverse().forEach(function(idx){
        sAtts.splice(idx, 1);
      });
    }

    function updateAttributes(survey_id, attributes, removeChoices){
      // remove choice attributes from store if using choice list
      if (removeChoices){
        var choices = attributes.filter(function(d){return d !== undefined}).filter(function(d){ return d.name == "choice" });
        var sAtts = this.atts["s"+survey_id];
        choices.forEach(function(c){
          var idx = sAtts.indexOf(c);
          sAtts.splice(idx, 1);
          var idx = attributes.indexOf(c);
          attributes.splice(idx, 1);
        });
      }

      var abutes = attributes.filter(function(d){return d!== undefined});
      var atts = this.get(survey_id);
      if (typeof attributes == "Object"){
        abutes = Object.keys(attributes).map(function(d){ return attributes[d] });
      }
      abutes.forEach(function(d){
        var match = atts.filter(function(d){return d !== undefined}).find(function(b){ return b.id == d.id});
        if (match){
          match = new QuestionAttributeFactory(d);
        }else{
          atts.push(new QuestionAttributeFactory(d));
        }
      });
    }

  }
}())
