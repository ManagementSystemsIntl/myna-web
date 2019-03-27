"use strict";

(function(){
  angular
  .module("management")
  .controller("FormsController", FormsController)

  FormsController.$inject = ["surveygroups", "surveys", "surveyfamilies", "pdb", "PouchKeys", "$scope", "$q"];

  function FormsController(surveygroups, surveys, surveyfamilies, pdb, PouchKeys, $scope, $q){

    var vm = this;
    vm.manageViews = manageViews;
    vm.pouches = {};
    vm.schemas;
    vm.tableData;
    vm.toggleActive = toggleActive;
    vm.updateTarget = updateTarget;
    vm.updateEditableModal = updateEditableModal;
    vm.updateTrackingModal = updateTrackingModal;

    $scope.$on("close-tracking-modal", function(evt){
      angular.element("#fieldTrackingModal").modal("hide");
    });

    $scope.$on("close-editable-modal", function(evt){
      angular.element("#fieldEditableModal").modal("hide");
    });

    init();

    function init(){
      var syncPromises = [];
      surveygroups.forEach(function (sg) {
        vm.pouches["g"+sg.id] = pdb.getGroup(sg.id, sg.key.username, sg.key.pwd, sg.key.db_name, sg.key.db_address);
        syncPromises.push(vm.pouches["g"+sg.id].getSurveys());
      });
      return $q.all(syncPromises).then(function () {
        var schemaPromises = [];
        angular.forEach(vm.pouches, function (pouch) {
          schemaPromises.push(pouch.localSurveyDB.allDocs({include_docs: true}).then(function (res) { return  pdb.mapDocs(res) }));
        });
        return $q.all(schemaPromises);
      }).then(function (docs) {
        vm.schemas = [].concat.apply([], docs);
        var allSurveys = surveys.concat(surveyfamilies).map(map_pouch_onto_pg);
        vm.tableData = surveygroups.map(function(d){
          d.surveys = allSurveys.filter(function (f) { return f.survey_group_id === d.id });
          return d;
        });
      });
    }

    function map_pouch_onto_pg(d){
      d.pouchSchema = vm.schemas.find(function(s){ return s._id == d.uuid });
      if (d.is_a == "survey_family"){
        d.surveys.map(function(survey){
          survey.pouchSchema = vm.schemas.find(function(s){ return s._id == survey.uuid });
          survey.trackable_fields = getTrackableFields(survey.pouchSchema, false);
          survey.editable_fields = getTrackableFields(survey.pouchSchema, true);
          return survey;
        });
        d.trackable_fields = [].concat.apply([],d.surveys.map(function(s){ return s.trackable_fields }));
        d.editable_fields = [].concat.apply([],d.surveys.map(function(s){ return s.editable_fields }));
      }else{
        d.trackable_fields = getTrackableFields(d.pouchSchema, false);
        d.editable_fields = getTrackableFields(d.pouchSchema, true);
      }
      d.trackable_fields.map(function(f){
        if (d.pouchSchema.hasOwnProperty("tracking")){
          f.is_tracked = d.pouchSchema.tracking.find(function(t){ return t.survey_uuid == f.path.survey_uuid && t.question_code == f.path.question_code}) ? true : false;
        }else{
          f.is_tracked = false;
        }
        return f;
      });
      return d;
    }

    function getTrackableFields(doc,editable){
      if (!doc) return [];
      var tracks = doc.sections.map(function(section){
        section.trackable = Object.keys(section.questions.schema.properties).map(function(d){
          return {
            key: d,
            schema: section.questions.schema.properties[d],
            path: {survey_uuid: doc._id, section_code: section.code, question_code: d}
          }
        }).filter(function(d){
          if (editable){
            return true;
          }else{
            return (d.schema.type == "string" && d.schema.hasOwnProperty("enum")) || (d.schema.type == "boolean");
          }
        }).map(function(d){
          d.form = section.questions.form.find(function(f){ return d.key == f.key });
          return d;
        })
        return section;
      }).map(function(section){
        return section.trackable;
      });

      return [].concat.apply([],tracks);
    }

    function toggleActive(form){
      var pouch = pdb.getGroup(form.survey_group_id);
      return pouch.changeStatus(form.uuid, !form.is_active, false).then(function(res){
        return form.$update_active({id: form.id, is_active: !form.is_active})
      }).then(function(res){
        map_pouch_onto_pg(res);
        $scope.$digest();
      })
    }

    function updateTarget(form, target_type){
      var otherfield = target_type == "target" ? "irr_target" : "target";
      var frozen = angular.copy(form[otherfield]);
      var pouch = pdb.getGroup(form.survey_group_id);
      return form.$update_target({id: form.id, type: target_type, value: form[target_type]}, function(res){
        res[otherfield] = frozen;
        return pouch.remoteSurveyDB.get(res.uuid).then(function (survey) {
          if (!survey.survey_info.hasOwnProperty("targets")) {
            survey.survey_info.targets = { irr_target: null, target: null };
          };
          survey.survey_info.targets[target_type] = form[target_type];
          return pouch.remoteSurveyDB.put(survey);
        });
      });
    }

    function updateTrackingModal(form){
      $scope.$broadcast("update-tracking-fields", form);
    }

    function updateEditableModal(form){
      $scope.$broadcast("update-editable-fields", form);
    }

    function manageViews(cohort){
      var pouch = vm.pouches["g"+cohort.id];
      $scope.$broadcast("update-views-modal", cohort, pouch);
    }

  }
}())
