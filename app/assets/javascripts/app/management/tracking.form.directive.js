"use strict";

(function(){
  angular
  .module("management")
  .directive("trackingForm", TrackingForm)

  TrackingForm.$inject = ["pdb"];

  function TrackingForm(pdb){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {},
      templateUrl: "management/_tracking_form.html"
    };
    return directive;

    function link(scope, el){
      scope.$on("update-tracking-fields", function(evt, form){
        scope.form = form;
        scope.original_tracking = angular.copy(scope.form.trackable_fields);
        updateCount();
      });

      scope.reset = reset;
      scope.saving = false;
      scope.submit = submit;
      scope.updateCount = updateCount;

      function submit(){
        scope.saving = true;
        var track_these = scope.form.trackable_fields.filter(function(d){return d.is_tracked}).map(function(d){ return d.path });
        scope.form.pouchSchema.tracking = track_these;

        var pouch = pdb.getGroup(scope.form.survey_group_id);
        return pouch.remoteSurveyDB.get(scope.form.uuid).then(function(doc){
          doc.tracking = track_these;
          return pouch.remoteSurveyDB.put(doc);
        }).then(function(res){
          scope.$emit("close-tracking-modal");
          scope.saving = false;
        })
      }

      function updateCount(){
        scope.count = scope.form.trackable_fields.filter(function(d){return d.is_tracked}).length;
      }

      function reset(){
        scope.form.trackable_fields = scope.original_tracking;
      }

    }

  }
}())
