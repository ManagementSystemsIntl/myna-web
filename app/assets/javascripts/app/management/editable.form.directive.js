"use strict";

(function(){
  angular
  .module("management")
  .directive("editableForm", EditableForm)

  EditableForm.$inject = ["pdb"];

  function EditableForm(pdb){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {},
      templateUrl: "management/_editable_form.html"
    };
    return directive;

    function link(scope, el){
      scope.$on("update-editable-fields", function(evt, form){
        scope.form = form;
        scope.form.editable_fields.forEach(function (f) {
          if (form.pouchSchema && form.pouchSchema.editable) {
            f.is_editable = form.pouchSchema.editable.find(function (d) {
              return f.path.survey_uuid === d.survey_uuid && f.path.section_code === d.section_code && f.path.question_code === d.question_code;
            }) ? true : false;
          }
        });
        scope.original_editable = angular.copy(scope.form.editable_fields);
        updateCount();
      });

      scope.reset = reset;
      scope.saving = false;
      scope.submit = submit;
      scope.updateCount = updateCount;

      function submit(){
        scope.saving = true;
        var track_these = scope.form.editable_fields.filter(function(d){return d.is_editable}).map(function(d){ return d.path });
        scope.form.pouchSchema.editable = track_these;

        var pouch = pdb.getGroup(scope.form.survey_group_id);
        return pouch.remoteSurveyDB.get(scope.form.uuid).then(function(doc){
          doc.editable = track_these;
          return pouch.remoteSurveyDB.put(doc);
        }).then(function(res){
          scope.$emit("close-editable-modal");
          scope.saving = false;
        })
      }

      function updateCount(){
        scope.count = scope.form.editable_fields.filter(function(d){return d.is_editable}).length;
      }

      function reset(){
        scope.form.editable_fields = scope.original_editable;
      }

    }

  }
}())
