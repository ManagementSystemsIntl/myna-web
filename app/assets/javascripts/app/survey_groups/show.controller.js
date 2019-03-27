"use strict";

(function(){
  angular
  .module("surveyGroups")
  .controller("GroupShowController", GroupShowController)

  GroupShowController.$inject = [
    "$scope", "$stateParams", "$state", "Flash", "$rootScope",// angular services
    "ChoiceLists", "csvService", "Languages", "pdb", "SchemaFactory", "SurveyFamilies", "SurveyGroups", "Surveys", "Utils", // my services
    "choicelists", "languages", "pouchkey", "questionoptions", "surveyfamilies", "surveygroup", "surveys" // route resolved values
  ];

  function GroupShowController(
    $scope, $stateParams, $state, Flash, $rootScope,
    ChoiceLists, csvService, Languages, pdb, SchemaFactory, SurveyFamilies, SurveyGroups, Surveys, Utils,
    choicelists, languages, pouchkey, questionoptions, surveyfamilies, surveygroup, surveys
  ){

    var vm = this;
    vm.group = surveygroup;
    vm.languages = languages;
    vm.key = pouchkey;
    vm.pouch = pdb.getGroup(vm.group.id, vm.key.username, vm.key.pwd, vm.key.db_name, vm.key.db_address);

    // surveygroup form
    vm.edit = false;
    vm.originalGroup = angular.copy(surveygroup);
    vm.originalLanguages = angular.copy(languages);
    vm.toggleEdit = toggleEdit;

    $scope.$on("survey-group-updated", function(res, group, languages){
      $rootScope.$broadcast("nav:group-updated", group);
      angular.element("#groupFormModal").modal("hide");
      vm.edit = false;
      vm.originalGroup = angular.copy(group);
      vm.group = group;

      SurveyGroups.replaceGroup(group);
      languages.forEach(function(language){
        if (language.markForDeletion){
          Languages.removeLanguage(group.id, language);
        }else{
          Languages.replaceLanguage(group.id, language);
        }
      });
      vm.languages = Languages.get(group.id);
      vm.originalLanguages = angular.copy(vm.languages);
      $scope.$broadcast("languages-updated", vm.languages);
    });

    $scope.$on("survey-group-deleted", function(res, group){
      $rootScope.$broadcast("nav:group-deleted", group.id);
      angular.element("#groupFormModal").modal("hide");
      angular.element("body").removeClass("modal-open");
      angular.element("body").css("padding-right",0)
      angular.element(".modal-backdrop").hide();

      SurveyGroups.removeGroup(group);
      Languages.removeGroup(group.id);

      $state.go("builder.index", {}, {reload: true});
    });

    function toggleEdit(){
      if (vm.edit){
        vm.group = Utils.matchOriginal(vm.group, vm.originalGroup, ["name"]);
        vm.languages = vm.originalLanguages.map(function(d,i){
          return Utils.matchOriginal(vm.languages[i], d, ["name", "survey_group_id", "direction", "markForDeletion"]);
        });
      }
      vm.edit = Utils.toggleEdit(vm.edit);
    }

    // surveys
    vm.surveys = surveys;
    vm.newSurvey = Surveys.make({survey_group_id: surveygroup.id});

    $scope.$on("survey-created", function (res, survey) {
      $rootScope.$broadcast("nav:survey-created", vm.group.id, survey);
      Surveys.replaceSurvey(survey);
      vm.surveys.push(survey);
    });

    //surveyfamilies
    vm.families = surveyfamilies;
    vm.newFamily = SurveyFamilies.make({survey_group_id: surveygroup.id});
    vm.editFamily;
    vm.originalEditFamily;
    vm.closeFamilyEdit = closeFamilyEdit;

    $scope.$on("family-created", function (res, family) {
      vm.families.push(family);
      return saveToPouch(family, false);
    });

    $scope.$on("family-updated", function (res, family) {
      var fam = vm.families.find(function (d) { return d.id === family.id });
      var idx = vm.families.indexOf(fam);
      vm.families.splice(idx, 1, fam);
      angular.element("#familyFormModal").modal("hide");
      return saveToPouch(family, true);
    });

    $scope.$on("family-deleted", function (res, family) {
      var fam = vm.families.find(function (d) { return d.id === family.id });
      var idx = vm.families.indexOf(fam);
      vm.families.splice(idx, 1);
      angular.element("#familyFormModal").modal("hide");
      return deleteDoc(family.uuid);
    });

    $scope.$on("family-open-edit", function (res, family) {
      vm.editFamily = family;
      vm.originalEditFamily = angular.copy(family);
      $scope.$broadcast("set-family-form", family);
    });

    $scope.$on("family-activity-toggle", function (res, family) {
      return saveToPouch(family, true);
    });

    function closeFamilyEdit() {
      vm.editFamily = Utils.matchOriginal(vm.editFamily, vm.originalEditFamily, ["name"]);
    }

    function deleteDoc(id) {
      return vm.pouch.remoteSurveyDB.get(id).then(function (res) {
        res._deleted = true;
        res.active = false;
        return vm.pouch.remoteSurveyDB.put(res);
      });
    }

    function saveToPouch(family, updating) {
      var schema = JSON.parse(family.schema);
      if (updating) {
        return vm.pouch.remoteSurveyDB.get(family.uuid).then(function (res) {
          schema._id = family.uuid;
          schema._rev = res._rev;
          return vm.pouch.remoteSurveyDB.put(schema);
        }).then(function (res) {
          return generateSchema(family, schema);
        });
      } else {
        schema._id = family.uuid;
        return vm.pouch.remoteSurveyDB.put(schema).then(function (res) {
          return generateSchema(family, schema);
        });
      }
    }

    function generateSchema(family, json_schema) {
      var schema = new SchemaFactory();
      schema.json_schema = JSON.stringify(json_schema);
      schema.pouch_id = family.uuid;
      schema.publishing_id = family.id;
      schema.publishing_type = "SurveyFamily";
      schema.$save({}, null, function(err){
        Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error in saving Schema. Schema"+err.statusText.toLowerCase()+".",3000,{class:"full-screen"});
      });
    }

    // ChoiceLists
    vm.choiceLists = choicelists.map(ChoiceLists.mapList);
    vm.newChoiceList = ChoiceLists.make({survey_group_id: surveygroup.id, choices: [] });
    vm.editChoiceList;
    vm.originalEditChoiceList;
    vm.closeChoiceListEdit = closeChoiceListEdit;

    $scope.$on("choice-list-created", function (res, list) {
      vm.choiceLists.push(list);
    });

    $scope.$on("choice-list-updated", function (res, list) {
      var cl = vm.choiceLists.find(function (d) { return d.id === list.id });
      var idx = vm.choiceLists.indexOf(cl);
      vm.choiceLists.splice(idx, 1, list);
      angular.element("#choiceFormModal").modal("hide");
    });

    $scope.$on("choice-list-deleted", function (res, list) {
      var cl = vm.choiceLists.find(function (d) { return d.id === list.id });
      var idx = vm.choiceLists.indexOf(cl);
      vm.choiceLists.splice(idx, 1);
      angular.element("#choiceFormModal").modal("hide");
    });

    $scope.$on("choice-list-open-edit", function (res, list) {
      vm.editChoiceList = list;
      vm.originalEditChoiceList = angular.copy(list);
      $scope.$broadcast("set-choice-list-form", list);
    });

    function closeChoiceListEdit() {
      vm.editChoiceList = angular.copy(vm.originalEditChoiceList);
      $scope.$broadcast("choice-list-cancel-edit")
    }

    // DB config
    vm.originalKey = angular.copy(vm.key);
    vm.cancelPouchKeyEdit = cancelPouchKeyEdit;

    $scope.$on("pouch-key-updated", function (res, key) {
      vm.key = key;
      vm.originalKey = angular.copy(key);
      angular.element("#pouchFormModal").modal("hide");
    });

    function cancelPouchKeyEdit() {
      vm.key = angular.copy(vm.originalKey);
    }

    // type-aheads
    vm.csv = {
      schools: { header:true, separator:",", result:"", content:"", accept:".csv", loading: true },
      pupils: { header:true, separator:",", result:"", content:"", accept:".csv", loading: true }
    };
    vm.csvCallback = csvService.callback;
    vm.schools = getTypeAhead('schools');
    vm.pupils = getTypeAhead('pupils');
    vm.updateTypeAhead = updateTypeAhead;
    vm.removeTypeAhead = removeTypeAhead;

    function removeTypeAhead(type) {
      var doc = vm[type];
      doc._deleted = true;
      return vm.remoteSurveyDB.put(doc).then(function () {
        vm[type] = null;
        resetCSV(type);
      });
    }

    function updateTypeAhead(type) {
      vm[type][type] = vm.csv[type].result.map(type === 'schools' ? mapSchools : mapPupils);
      return vm.pouch.remoteSurveyDB.put(vm[type]).then(function (res) {
        vm.csv[type].loading = true;
        resetCSV(type);
        return getTypeAhead(type);
      });

      function mapSchools(d){
        d.school_id = appendZeros(d.school_id);
        d.latitude = parseFloat(d.latitude);
        d.longitude = parseFloat(d.longitude);
        d.location_description = d.location_description.replace(/"/g, "");
        return d;

        function appendZeros(id){
          var id_len = id.toString().length;
          var zc = 6-id_len;
          var mod = "";
          for(var i=0;i<zc;i++){
            mod+="0";
          }
          return mod += id;
        }
      }

      function mapPupils(d){
        d.gender = d.gender == "0" ? "f" : "m";
        d.age = parseInt(d.age);
        return d;
      }
    }

    function getTypeAhead(type) {
      return vm.pouch.remoteSurveyDB.get(type).then(function(doc){
        vm.csv[type].loading = false;
        vm[type] = doc;
        return;
      }).catch(function(err){
        vm.csv[type].loading = false;
        var doc = {_id: type, doc_type: type};
        doc[type] = [];
        vm[type] = doc;
        return;
      }).then(function () {
        $scope.$digest();
      });
    }

    function resetCSV(type){
      vm.csv[type].result = "";
      vm.csv[type].content = "";
    }

  }
}())
