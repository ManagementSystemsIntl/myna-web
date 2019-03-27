"use strict";

(function(){
  angular
  .module("surveyGroups")
  .directive("pouchKeyForm", PouchKeyForm)

  PouchKeyForm.$inject = ["Flash"];

  function PouchKeyForm(Flash){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope:{
        key: "="
      },
      templateUrl: "survey_groups/_db_form.html"
    };
    return directive;

    function link(scope, el){

      scope.submit = updateKey;

      ////////////////////

      function updateKey(){
        return scope.key.$update({id: scope.key.id}, function(key){
          scope.$emit("pouch-key-updated", key);
          return key;
        }, function(err){
          console.log(err);
          Flash.create('warning', "<i class=\"fa fa-fw fa-warning\"></i> Error updating Cloudant Key. Cloudant Key "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        })
      }

    }

  }
}())
