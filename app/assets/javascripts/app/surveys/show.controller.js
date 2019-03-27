"use strict";

(function(){
  angular
  .module("surveys")
  .controller("SurveyShowController",SurveyShowController)

  SurveyShowController.$inject = [
    "$q", "$rootScope", "$scope", "$stateParams", "$state", "$timeout", "Flash",
    "pdb", "SchemaFactory", "Sections", "Surveys", "Utils",
    "languages", "pouchkey", "sections", "survey"
  ];

  function SurveyShowController(
    $q, $rootScope, $scope, $stateParams, $state, $timeout, Flash,
    pdb, SchemaFactory, Sections, Surveys, Utils,
    languages, pouchkey, sections, survey
  ){

    var vm = this;
    vm.languages = languages;
    vm.addNewSection = addNewSection;
    vm.copySchema = copySchema;
    vm.dndListeners = {
      clone: {
        itemMoved: function(evt){
          vm.models.newSections = [Sections.make({survey_id: $stateParams.id})];
          moveCallback();
        }
      },
      drag: {
        orderChanged: function(evt){
          moveCallback();
        }
      }
    };
    vm.edit = false;
    vm.group = $stateParams.group_id;
    vm.key = pouchkey;
    vm.models = Sections.model;
    vm.moved = moveCallback;
    vm.originalSurvey = angular.copy(survey);
    vm.pouch = pdb.getGroup($stateParams.group_id, pouchkey.username, pouchkey.pwd, pouchkey.db_name, pouchkey.db_address);
    vm.publishSchema = publishSchema;
    vm.schemaUpload;
    vm.sections = sections;
    vm.survey = survey;
    vm.toggleEdit = toggleEdit;
    vm.toggleActive = toggleActive;
    vm.uploadSchema = uploadSchema;

    // listeners
    $scope.$on("section-created", function(res,section){
      vm.sections.splice(section.order, 1, section);
      vm.models.sections.splice(section.order, 1, section);
      moveCallback(true);
    });

    $scope.$on("section-updated", function(res,section){
      vm.sections[section.order] = section;
      vm.models.sections[section.order] = section;
      moveCallback(true);
    });

    $scope.$on("section-deleted", function(res,section){
      vm.sections.splice(section.order,1);
      vm.models.sections.splice(section.order,1);
      moveCallback();
    });

    $scope.$on("unsaved-section-removed", function(res,section){
      vm.models.sections.splice(section.order,1);
      moveCallback();
    });

    $scope.$on("survey-updated", function(res, survey){
      angular.element("#surveyFormModal").modal("hide");
      vm.edit = false;
      vm.originalSurvey = angular.copy(survey);
      vm.survey = survey;
      $rootScope.$broadcast("nav:survey-updated", angular.copy(survey));
    });

    $scope.$on("survey-deleted",function(res){
      angular.element("#surveyFormModal").modal("hide");
      angular.element("body").removeClass("modal-open");
      angular.element("body").css("padding-right",0)
      angular.element(".modal-backdrop").hide();
      $rootScope.$broadcast("nav:survey-deleted", angular.copy(vm.survey));
      if (vm.survey.is_active){
        return activateInPouch(vm.survey.uuid,false,true).then(function(){
          return $state.go("builder.groupShow", {id:$stateParams.group_id});
        });
      }else{
        return $state.go("builder.groupShow", {id: $stateParams.group_id});
      }
    });

    init();

    ////////////////////

    function init(){
      Sections.resetModels();
      vm.models.newSections.push(Sections.make({survey_id: $stateParams.id}));
      vm.models.sections = vm.sections.map(Sections.mapSection);
      moveCallback();
    }

    function addNewSection(){
      vm.models.sections.push(Sections.make({survey_id: $stateParams.id}));
      moveCallback();
    }

    function moveCallback(closeEdit){
      if (vm.models.sections.length === 0){
        vm.models.sections = [Sections.make({survey_id: $stateParams.id})];
      }
      return moved().then(function(res){
        $scope.$broadcast("sections-renumbered", vm.models.sections, closeEdit);
        return res;
      });
    }

    function moved(){
      var promises = [];
      vm.models.sections.forEach(function(section, i){
        promises.push(updateOrder(section, i));
      })
      return $q.all(promises);
    }

    function updateOrder(section, i){
      section.order = i;
      if (section.id){
        return section.$update({id: section.id}, function(section){
          return Sections.mapSection(section);
        })
      }else{
        return section;
      }
    }

    // could afford to be refactored
    function publishSchema(){
      var rendering = Flash.create('info', "<div class=\"margin-center text-center\"><i class=\"fa fa-fw fa-refresh fa-spin fa-5x\"></i></div><div class=\"margin-top-15 text-center\">Rendering Survey Schema...</div>", 0, {class:"full-screen"});
      vm.survey.$publish_schema({id:$stateParams.id}, function(res){
        vm.models.sections = vm.sections;
        Flash.dismiss(rendering);
        try {
          var json_schema = JSON.parse(res.schema);
          json_schema._id = json_schema.survey_info.uuid;
          json_schema.active = vm.survey.is_active;
          json_schema.survey_info.gold_standards = vm.survey.gold_standards;
        } catch(err) {
          console.log(res.schema)
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Survey Schema is not valid JSON.", 3000, {class:"full-screen"});
          return;
        }
        var posting = Flash.create('info', "<div class=\"margin-center text-center\"><i class=\"fa fa-fw fa-refresh fa-spin fa-5x\"></i></div><div class=\"margin-top-15 text-center\">Posting Schema to CouchDB...</div>", 0, {class:"full-screen"});
        vm.pouch.remoteSurveyDB.get(json_schema.survey_info.uuid).then(function(doc){
          json_schema._rev = doc._rev;
          if (doc.hasOwnProperty("editable")) {
            json_schema.editable = doc.editable;
          }
          return vm.pouch.remoteSurveyDB.put(json_schema);
        }).catch(function(err){
          if (err.message == "missing"){
            return vm.pouch.remoteSurveyDB.put(json_schema);
          }
        }).then(function(doc){
          Flash.dismiss(posting);
          var schema = new SchemaFactory();
          schema.json_schema = JSON.stringify(json_schema);
          schema.pouch_id = doc.id;
          schema.publishing_id = $stateParams.id;
          schema.publishing_type = "Survey";
          schema.$save({}, function(schema){
            vm.survey.last_published = schema.published_at;
            vm.survey.last_version = schema.iteration;
          }, function(err){
            Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error in saving Schema. Schema"+err.statusText.toLowerCase()+".",3000,{class:"full-screen"});
          });
        });
      });
    }

    function uploadSchema(){
      var parsing = Flash.create('info', "<div class=\"margin-center text-center\"><i class=\"fa fa-fw fa-refresh fa-spin fa-5x\"></i></div><div class=\"margin-top-15 text-center\">Parsing Survey Schema...</div>", 0, {class:"full-screen"});
      try {
        var json = JSON.parse(vm.schemaUpload);
        var s = new SchemaFactory({json_schema: vm.schemaUpload, survey_id: vm.survey.id}).$upload_schema({}, function(survey){
          Flash.dismiss(parsing);
          return survey;
        }, function(err){
          console.log("err", err);
          Flash.dismiss(parsing);
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error in uploading Survey. "+err.statusText.toLowerCase()+".",3000,{class:"full-screen"});
        }).then(function(survey){
          return Surveys.fetch("get", {id: vm.survey.id});
        }).then(function(survey){
          vm.survey = survey;
          vm.originalSurvey = angular.copy(survey);
          return Sections.fetch("query", {survey_id: survey.id});
        }).then(function(sections){
          vm.sections = sections.map(Sections.mapSection);
          vm.schemaUpload = undefined;
          vm.models.sections = vm.sections;
          angular.element("#uploadSchemaModal").modal("hide");
        });
      } catch(err) {
        Flash.dismiss(parsing);
        Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error in uploading Survey. "+err+".",3000,{class:"full-screen"});
      }
    }

    function copySchema(){
      return Surveys.make().$latest_schema({id: vm.survey.id}).then(function(res){
        vm.copy_schema = JSON.stringify(JSON.parse(res.json_schema),2);
      });
    }

    function toggleEdit(){
      if (vm.edit){
        vm.survey = Utils.matchOriginal(vm.survey ,vm.originalSurvey, ["survey_type", "name", "grade", "languages", "gold_standards"]);
        $scope.$broadcast("survey-cancel-edit", vm.survey);
      }
      vm.edit = Utils.toggleEdit(vm.edit);
    }

    function toggleActive(){
      if (vm.survey.is_active){
        return vm.pouch.changeStatus(vm.survey.uuid, false).then(function(res){
          vm.survey.is_active = false;
          vm.originalSurvey.is_active = false;
          return updateSurvey();
        }).then(function(survey){
          $scope.$broadcast("changed-active-status",false);
        });
      }else{
        return vm.pouch.changeStatus(vm.survey.uuid, true).then(function(res){
          vm.survey.is_active = true;
          vm.originalSurvey.is_active = true;
          return updateSurvey();
        }).then(function(survey){
          $scope.$broadcast("changed-active-status",true);
        });
      }
    }

    function updateSurvey(){
      return vm.survey.$update({id: vm.survey.id}, function(survey){
        return survey;
      }, function(err){
        Flash.create('warning', "<i class=\"fa fa-fw fa-warning\"></i> Error in updating Survey. Survey "+err.statusText.toLowerCase()+".",3000,{class:"full-screen"});
      })
    }

  }
}())
