"use strict";

(function(){
  angular
  .module("surveyGroups")
  .controller("GroupShowController", GroupShowController)

  GroupShowController.$inject = [
    "$scope", "$stateParams", "$state", "Flash", "$rootScope",// angular services
    "ChoiceLists", "csvService", "Languages", "pdb", "SurveyFamilies", "SurveyGroups", "Surveys", "Utils", // my services
    "choicelists", "languages", "pouchkey", "questionoptions", "surveyfamilies", "surveygroup", "surveys" // route resolved values
  ];

  function GroupShowController(
    $scope, $stateParams, $state, Flash, $rootScope,
    ChoiceLists, csvService, Languages, pdb, SurveyFamilies, SurveyGroups, Surveys, Utils,
    choicelists, languages, pouchkey, questionoptions, surveyfamilies, surveygroup, surveys
  ){

    var vm = this;

    // vm.choiceLists = choicelists.map(ChoiceLists.mapList);
    // vm.csv = {
    //   schools: { header:true, separator:",", result:"", content:"", accept:".csv" },
    //   pupils: { header:true, separator:",", result:"", content:"", accept:".csv" }
    // };
    // vm.csvCallback = csvService.callback;
    vm.edit = false;
    // vm.editFamily;
    // vm.editPouch = false;
    // vm.families = surveyfamilies;
    vm.group = surveygroup;
    // vm.key = pouchkey;
    vm.languages = languages;
    // vm.newChoiceList = ChoiceLists.make({survey_group_id: surveygroup.id, choices: [] });
    // vm.newSurvey = Surveys.make({client_id: surveygroup.client_id, survey_group_id: surveygroup.id});
    // vm.newSurveyFamily = SurveyFamilies.make({survey_group_id: surveygroup.id});
    vm.originalGroup = angular.copy(surveygroup);
    // vm.originalKey = angular.copy(pouchkey);
    vm.originalLanguages = angular.copy(languages);
    // vm.pouch = pdb.getGroup(surveygroup.id, pouchkey.username, pouchkey.pwd, pouchkey.db_name, pouchkey.db_address);
    // vm.surveys = surveys;
    vm.toggleEdit = toggleEdit;
    // vm.toggleChoiceListEdit = toggleChoiceListEdit;
    // vm.toggleFamilyEdit = toggleFamilyEdit;
    // vm.togglePouchKeyEdit = togglePouchKeyEdit;

    // vm.updateSchools = updateSchools;
    // vm.pouchSchools;
    // vm.pouchSchoolsLoading = true;
    // vm.removeSchools = removeSchools;
    //
    // vm.updatePupils = updatePupils;
    // vm.pouchPupils;
    // vm.pouchPupilsLoading = true;
    // vm.removePupils = removePupils;

    // getPouchSchools().then(function(schools){
    //   vm.pouchSchools = schools;
    //   vm.pouchSchoolsLoading = false;
    //   $scope.$digest();
    // });
    // getPouchPupils().then(function(pupils){
    //   vm.pouchPupils = pupils;
    //   vm.pouchPupilsLoading = false;
    //   $scope.$digest();
    // });

    // listeners
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

    // $scope.$on("family-created", function(res, family){
    //   vm.families.push(family);
    //   vm.newSurveyFamily = SurveyFamilies.make({survey_group_id: surveygroup.id});
    //   $scope.$broadcast("reset-family", vm.newSurveyFamily);
    // })
    //
    // $scope.$on("family-updated", function(res, family){
    //   angular.element("#familyFormModal").modal("hide");
    //   $scope.$broadcast("family-updated-li", family)
    // })
    //
    // $scope.$on("family-deleted", function(res, family){
    //   var match = vm.families.find(function(d){return d.id == family.id});
    //   var idx = vm.families.indexOf(match);
    //   vm.families.splice(idx, 1);
    //
    //   var uuid = JSON.parse(family.schema).survey_info.uuid;
    //   vm.pouch.changeStatus(uuid, false, true).then(function(doc){
    //     angular.element("#familyFormModal").modal("hide");
    //   })
    // })
    //
    // $scope.$on("family-activated", function(res, family){
    //   var uuid = JSON.parse(family.schema).survey_info.uuid;
    //   vm.pouch.changeStatus(uuid, true, false);
    // })
    //
    // $scope.$on("family-deactivated", function(res, family){
    //   var uuid = JSON.parse(family.schema).survey_info.uuid;
    //   vm.pouch.changeStatus(uuid, false, false);
    // })
    //
    // $scope.$on("family-open-edit", function(res, family){
    //   vm.editFamily = family;
    //   vm.originalEditFamily = angular.copy(family);
    //   $scope.$broadcast("update-form-family", family);
    // })
    //
    // $scope.$on("choice-list-created", function(res, list){
    //   vm.choiceLists.push(ChoiceLists.mapList(list));
    //   vm.newChoiceList = ChoiceLists.make({survey_group_id: surveygroup.id, choices: [] });
    // })
    //
    // $scope.$on("choice-list-updated", function(res, list){
    //   angular.element("#choiceFormModal").modal("hide");
    //   $scope.$broadcast("choice-list-updated-li", list)
    // })
    //
    // $scope.$on("choice-list-deleted", function(res, list){
    //   var match = vm.choiceLists.find(function(d){return d.id == list.id});
    //   var idx = vm.choiceLists.indexOf(match);
    //   vm.choiceLists.splice(idx, 1);
    //   angular.element("#choiceFormModal").modal("hide");
    // })
    //
    // $scope.$on("choice-list-open-edit", function(res, list){
    //   vm.editChoiceList = list;
    //   vm.originalEditChoiceList = angular.copy(list);
    //   $scope.$broadcast("update-form-choice-list", list);
    // })
    //
    // $scope.$on("pouch-key-updated", function(res, key){
    //   vm.key = key;
    //   vm.originalKey = angular.copy(key);
    //   angular.element("#pouchFormModal").modal("hide");
    // })

    ///////////////////////////

    function toggleEdit(){
      if (vm.edit){
        vm.group = Utils.matchOriginal(vm.group, vm.originalGroup, ["name"]);
        vm.languages = vm.originalLanguages.map(function(d,i){
          return Utils.matchOriginal(vm.languages[i], d, ["name", "survey_group_id", "direction", "markForDeletion"]);
        })
      }
      vm.edit = Utils.toggleEdit(vm.edit);
    }

    // function togglePouchKeyEdit(){
    //   if (vm.editPouch){
    //     vm.key = Utils.matchOriginal(vm.key, vm.originalKey, ["pwd", "username", "db_name"]);
    //   }
    //   vm.editPouch = Utils.toggleEdit(vm.editPouch);
    // }
    //
    // function toggleFamilyEdit(){
    //   vm.editFamily = undefined;
    //   $scope.$broadcast("family-cancel-edit");
    // }
    //
    // function toggleChoiceListEdit(){
    //   vm.editChoiceList = undefined;
    //   $scope.$broadcast("choice-list-cancel-edit");
    // }
    //
    // ////////////////////
    //
    // function removeSchools(){
    //   var start = Flash.create('info', "<div class=\"margin-center text-center\"><i class=\"fa fa-fw fa-refresh fa-spin fa-5x text-info\"></i></div><div class=\"margin-top-15 text-center\">Removing Schools from Cloudant</div>",0,{class:"full-screen"});
    //   vm.pouchSchools._deleted = true;
    //   return vm.pouch.remoteSurveyDB.put(vm.pouchSchools).then(function(){
    //     getPouchSchools();
    //     resetCSV('schools');
    //     Flash.dismiss(start);
    //     $scope.digest();
    //   });
    // }
    //
    // function removePupils(){
    //   var start = Flash.create('info', "<div class=\"margin-center text-center\"><i class=\"fa fa-fw fa-refresh fa-spin fa-5x text-info\"></i></div><div class=\"margin-top-15 text-center\">Removing Pupils from Cloudant</div>",0,{class:"full-screen"});
    //   vm.pouchPupils._deleted = true;
    //   return vm.pouch.remoteSurveyDB.put(vm.pouchPupils).then(function(){
    //     getPouchPupils();
    //     resetCSV('pupils');
    //     Flash.dismiss(start);
    //     $scope.digest();
    //   });
    // }
    //
    // function updateSchools(){
    //   var start = Flash.create('info', "<div class=\"margin-center text-center\"><i class=\"fa fa-fw fa-refresh fa-spin fa-5x text-info\"></i></div><div class=\"margin-top-15 text-center\">Updating Schools in Cloudant</div>", 0, {class:"full-screen"});
    //
    //   if (vm.pouchSchools == undefined || !vm.pouchSchools.hasOwnProperty("_rev")){
    //     vm.pouchSchools = {_id:"schools", doc_type:"schools", schools:[]};
    //   };
    //
    //   vm.pouchSchools.schools = vm.csv.schools.result.map(mapSchools);
    //   console.log(vm.pouchSchools.schools)
    //   return vm.pouch.remoteSurveyDB.put(vm.pouchSchools).then(function(res){
    //     vm.pouchSchoolsLoading = true;
    //     return getPouchSchools();
    //   }).then(function(schools){
    //     vm.pouchSchools = schools;
    //     vm.pouchSchoolsLoading = false;
    //     resetCSV('schools')
    //     Flash.dismiss(start);
    //     $scope.$apply();
    //   }).catch(function(err){
    //     Flash.dismiss(start);
    //     Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error saving Schools. "+err+".", 3000, {class:"full-screen"});
    //     $scope.$apply();
    //   });
    // }
    //
    // function updatePupils(){
    //   var start = Flash.create('info', "<div class=\"margin-center text-center\"><i class=\"fa fa-fw fa-refresh fa-spin fa-5x text-info\"></i></div><div class=\"margin-top-15 text-center\">Updating Pupils in Cloudant</div>", 0, {class:"full-screen"});
    //
    //   if (vm.pouchPupils == undefined || !vm.pouchPupils.hasOwnProperty("_rev")){
    //     vm.pouchPupils = {_id:"pupils", doc_type:"pupils", pupils:[]};
    //   };
    //
    //   vm.pouchPupils.pupils = vm.csv.pupils.result.map(mapPupils);
    //   return vm.pouch.remoteSurveyDB.put(vm.pouchPupils).then(function(res){
    //     vm.pouchPupilsLoading = true;
    //     return getPouchPupils();
    //   }).then(function(pupils){
    //     vm.pouchPupils = pupils;
    //     vm.pouchPupilsLoading = false;
    //     resetCSV('pupils');
    //     Flash.dismiss(start);
    //     $scope.$apply();
    //   }).catch(function(err){
    //     Flash.dismiss(start);
    //     Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error saving Pupils. "+err+".", 3000, {class:"full-screen"});
    //     $scope.$apply();
    //   });
    // }
    //
    // function mapSchools(d){
    //   d.school_id = appendZeros(d.school_id);
    //   d.latitude = parseFloat(d.latitude);
    //   d.longitude = parseFloat(d.longitude);
    //   d.location_description = d.location_description.replace(/"/g, "");
    //   return d;
    // }
    //
    //
    // function appendZeros(id){
    //   var id_len = id.toString().length;
    //   var zc = 6-id_len;
    //   var mod = "";
    //   for(var i=0;i<zc;i++){
    //     mod+="0";
    //   }
    //   return mod += id;
    // }
    //
    // function mapPupils(d){
    //   d.gender = d.gender == "0" ? "f" : "m";
    //   d.age = parseInt(d.age);
    //   return d;
    // }
    //
    // function resetCSV(type){
    //   vm.csv[type].result = "";
    //   vm.csv[type].content = "";
    // }
    //
    // function getPouchSchools(){
    //   return vm.pouch.remoteSurveyDB.get("schools").then(function(doc){
    //     return doc;
    //   }).catch(function(err){
    //     vm.pouchSchoolsLoading = false;
    //     if (err.message == "missing"){
    //       console.log("pouch schools haven't been made yet")
    //     }else{
    //       console.log("err", err);
    //     }
    //   });
    // }
    //
    // function getPouchPupils(){
    //   return vm.pouch.remoteSurveyDB.get("pupils").then(function(doc){
    //     return doc;
    //   }).catch(function(err){
    //     vm.pouchSchoolsLoading = false;
    //     if (err.message == "missing"){
    //       console.log("pouch pupils haven't been made yet")
    //     }else{
    //       console.log("err", err);
    //     }
    //   });
    // }

  }
}())
