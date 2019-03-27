"use strict";

(function(){
  angular
  .module("languages")
  .service("Languages", Languages)

  Languages.$inject = ["LanguageFactory"];

  function Languages(LanguageFactory){

    return {
      get: get,
      fetch: fetch,
      languages: {},
      make: make,
      removeGroup: removeGroup,
      replaceLanguage: replaceLanguage,
      removeLanguage: removeLanguage
    };

    ///////////////

    function get(group_id, language_id){
      return !language_id ? this.languages["g"+group_id] : this.languages["g"+group_id].find(function(d){ return d.id == language_id });
    }

    function fetch(type, params){
      var self = this;
      return LanguageFactory[type](params, function(res){
        if (type == "query"){
          self.languages["g"+params.survey_group_id] = res;
        }
      }).$promise;
    }

    function make(params){
      return new LanguageFactory(params);
    }

    function removeGroup(group_id){
      delete this.languages["g"+group_id];
    }

    function replaceLanguage(group_id, language){
      if (!this.languages.hasOwnProperty("g"+group_id)){
        this.languages["g"+group_id] = [];
      }
      var g = this.languages["g"+group_id];
      var idx = g.map(function(d){ return d.id }).indexOf(language.id);
      if (idx > -1){
        g[idx] = language;
      }else{
        g.push(language);
      }
    }

    function removeLanguage(group_id, language){
      var g = this.languages["g"+group_id];
      var idx = g.map(function(d){ return d.id }).indexOf(language.id);
      g.splice(idx, 1);
    }

  }
}())
