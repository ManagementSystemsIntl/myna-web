"use strict";

(function(){
  angular
  .module("surveyGroups")
  .service("SurveyGroups", SurveyGroups)

  SurveyGroups.$inject = ["SurveyGroupFactory"];

  function SurveyGroups(SurveyGroupFactory){

    return {
      get: get,
      groups: [],
      fetch: fetch,
      make: make,
      replaceGroup: replaceGroup,
      removeGroup: removeGroup
    };

    //////////////////

    function get(group_id){
      return this.groups.find(function(d){ return d.id == group_id});
    }

    function fetch(type, params){
      var self = this;
      return SurveyGroupFactory[type](params, function(res){
        if (type == "query"){
          // res.forEach(self.replaceGroup);
          self.groups = res;
        }else if (type == "get"){
          self.replaceGroup(res);//.bind(self);
        }
        return res;
      }).$promise;
    }

    function replaceGroup(group){
      var idx = this.groups.map(function(d){ return d.id }).indexOf(group.id);
      if (idx > -1){
        this.groups[idx] = group;
      }else{
        this.groups.push(group);
      }
    }

    function removeGroup(group){
      var idx = this.groups.map(function(d) {return d.id }).indexOf(group.id);
      this.groups.splice(idx, 1);
    }

    function make(params){
      return new SurveyGroupFactory(params);
    }

  }
}())
