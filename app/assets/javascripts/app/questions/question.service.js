"use strict";

(function(){
  angular
  .module("questions")
  .service("Questions",Questions)

  Questions.$inject = ["QuestionFactory", "QuestionAttributeFactory", "QuestionOptionFactory"];

  function Questions(QuestionFactory, QuestionAttributeFactory, QuestionOptionFactory){

    return {
      get: get,
      fetch: fetch,
      make: make,
      mapAttributes: mapAttributes,
      mapOptions: mapOptions,
      mapQuestion: mapQuestion,
      model: { newQuestions: [], questions: [] },
      questions: {},
      removeQuestions: removeQuestions,
      replaceQuestion: replaceQuestion,
      resetModels: resetModels
    };

    /////////////////

    function get(survey_id, section_id){
      if (!this.questions["s"+survey_id]) return;
      return !section_id ? this.questions["s"+survey_id] : this.questions["s"+survey_id].filter(function(d){ return d.section_id == section_id });
    }

    function fetch(type, params){
      var self = this;
      return QuestionFactory[type](params, function(res){
        if (type == "query"){
          res.forEach(replaceQuestion.bind(self));
        }else if (type == "get"){
          replaceQuestion(res).bind(self);
        }
      }).$promise;
    }

    function replaceQuestion(question){
      var self = this;
      var surveySet = self.questions["s"+question.survey_id];
      if (!surveySet){
        self.questions["s"+question.survey_id] = [question];
        return;
      }
      var match = surveySet.find(function(d){ d.id == question.id });
      if (match){
        var idx = surveySet.indexOf(match);
        surveySet[idx] = question;
      }else{
        surveySet.push(question);
      }
    }

    function removeQuestions(survey_id, section_id, question_id){
      var self = this;
      var surveySet = self.questions["s"+survey_id];
      if (!section_id && !question_id){
        delete self.questions["s"+survey_id];
      }else if (section_id && !question_id){
        var sections = surveySet.filter(function(d){ return d.section_id == section_id })
        .map(function(d){
          return surveySet.indexOf(d);
        })
        sections.reverse().forEach(function(idx){
          surveySet.splice(idx, 1);
        })
      }else if (section_id && question_id){
        var idx = surveySet.indexOf(function(d){ return d.id == question_id });
        console.log(surveySet, idx);
        surveySet.splice(idx, 1);
      }
    }

    function make(params){
      return new QuestionFactory(params);
    }

    function mapQuestion(question){
      question.attributes.map(function(a){
        return new QuestionAttributeFactory(a);
      })
      return question;
    }

    function mapAttributes(options, attributes){
      return options.reduce(function(p,n){
        if (n.name == "choice"){
          p[n.name] = attributes.filter(function(a){ return a.name == n.name });
          if (p[n.name].length == 0){
            p[n.name] = [new QuestionAttributeFactory({question_option_id: n.id, name: n.name, order: 0})];
          }
        }else{
          p[n.name] = attributes.find(function(a){ return a.name == n.name }) || new QuestionAttributeFactory();
          p[n.name].question_option_id = n.id;
          p[n.name].name = n.name;
          p[n.name].value = n.option_type == "integer" ? parseInt(p[n.name].value) : p[n.name].value;
        }
        return p;
      },{});
    }

    function mapOptions(options){
      return options.reduce(function(p,n){
        p[n.name] = n;
        return p;
      },{});
    }

    function resetModels(){
      this.model.newQuestions = [];
      this.model.questions = [];
    }

  }
}())
