"use strict";

(function(){
  angular
  .module("sections")
  .service("Sections", Sections)

  Sections.$inject = ["SectionFactory"];

  function Sections(SectionFactory){

    return {
      get: get,
      fetch: fetch,
      make: make,
      mapSection: mapSection,
      model: { newSections: [], sections: [] },
      resetModels: resetModels,
      sections: []
    };

    /////////////////

    function get(survey_id, section_id){
      return !section_id ? this.sections.filter(function(d){ return d.survey_id == survey_id }) : this.sections.find(function(d){ return d.id == section_id});
    }

    function fetch(type, params){
      // return SectionFactory[type](params).$promise;
      var self = this;
      return SectionFactory[type](params, function(res){
        if (type == "query"){
          res.forEach(replaceSection.bind(self));
        }else if (type == "get"){
          replaceSection.call(self, res);
        };
        return res;
      }).$promise;
    }

    function replaceSection(section){
      var self = this;
      var match = self.sections.find(function(d){ return d.id == section.id });
      if (match){
        var idx = self.sections.indexOf(match);
        self.sections[idx] = section;
      }else{
        self.sections.push(section);
      }
    }

    function make(params){
      return new SectionFactory(params);
    }

    function mapSection(section){
      section.is_publishable += "";
      section.skippable += "";
      return section;
    }

    function resetModels(){
      this.model.newSections = [];
      this.model.sections = [];
    }

  }
}())
