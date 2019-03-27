"use strict";

(function(){
  angular
  .module("translations")
  .controller("TranslationController", TranslationController)

  TranslationController.$inject = ["$state","$stateParams","$scope","QuestionAttributeFactory", "TranslationFactory","LanguageFactory","SurveyFactory"];

  function TranslationController($state,$stateParams,$scope,QuestionAttributeFactory, TranslationFactory,LanguageFactory,SurveyFactory){
    var vm = this;

    vm.defaultLanguage = getDefaultLanguage();
    vm.edit = false;
    vm.otherLanguages = getOtherLanguages();
    vm.qa = getQAs();
    vm.survey = getSurvey();
    vm.toggleEdit = toggleEdit;

    ////////////////////

    function getDefaultLanguage(){
      return LanguageFactory.get({survey_id: $stateParams.survey_id, is_default: true})
    }

    function getOtherLanguages(){
      return LanguageFactory.query({survey_id: $stateParams.survey_id, is_default: false})
    }

    function getSurvey(){
      return SurveyFactory.get({id: $stateParams.survey_id});
    }

    function toggleEdit(){
      if (vm.edit){
        vm.survey = getSurvey();
        vm.edit = false;
      }else{
        vm.edit = true;
      }
    }

    function getQAs(){
      return QuestionAttributeFactory.query({survey_id: $stateParams.survey_id, translatable: true}, function(qa){
        var sections = qa.map(addTranslations).reduce(reduceSections,[]).map(mapSectionAttributes);
        return [].concat.apply([],sections);
      })
    }

    function addTranslations(q){
      q.translations = TranslationFactory.query({question_attribute_id: q.id}, function(t){
        return t.sort(function(a,b){return a.language_id - b.language_id});
      });
      return q;
    }

    function reduceSections(p,n){
      var obj = p.find(function(d){return d.section_id == n.question.section.id}) || {section_id: n.question.section.id, order: n.question.section.order, name: n.question.section.name, code: n.question.section.code, attributes:[]}
      obj.attributes.push(n)
      if (!p.find(function(d){return d.section_id == obj.section_id})){
        p.push(obj)
      }
      return p;
    }

    function mapSectionAttributes(s){
      s.attributes.sort(sortAttributes);
      s.attributes.map(function(a){
        a.section_code = s.code;
        a.section_name = s.name;
        a.section_id = s.section_id;
        a.section_order = s.order;
        return a;
      });
      return s.attributes;
    }

    function sortAttributes(a,b){
      if (a.question.order < b.question.order) return -1;
      if (a.question.order > b.question.order) return 1;
      if (a.question.question_option_id < b.question.question_option_id) return -1;
      if (a.question.question_option_id > b.question.question_option_id) return 1;
      return 0;
    }

  }
}())
