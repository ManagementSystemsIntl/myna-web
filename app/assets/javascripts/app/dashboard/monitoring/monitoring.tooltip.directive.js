"use strict";

(function(){
  angular
  .module("dashboard")
  .directive("monitoringTooltip", MonitoringTooltipFunction)

  MonitoringTooltipFunction.$inject = ["$stateParams","pdb"];

  function MonitoringTooltipFunction($stateParams,pdb){
    var directive = {
      link: link,
      templateUrl:"dashboard/monitoring/_monitoring_tooltip.html",
      scope:{
        surveys: "="
      },
      restrict: "A",
      replace: true
    };
    return directive;

    function link(scope,el){
      scope.$on("update-mon-modal", function(evt, data, title, flag){
        scope.responses = data;
        scope.title = title;
        var grouped = data.reduce(function(p,n,i,a){
          if (p.hasOwnProperty(n.response_info.survey_uuid)){
            p[n.response_info.survey_uuid].push(n);
          }else{
            p[n.response_info.survey_uuid] = [n];
          }
          return p;
        },{});
        scope.listedSurveys = Object.keys(grouped).map(function(d){
          var survey = scope.surveys.find(function(s){ return s._id === d});
          if (survey) {
            survey.modal_responses = grouped[d];
            return survey;
          }
          return {uuid: d, modal_responses: grouped[d]};
        });
        if (flag){
          scope.field = flag.section;
          scope.$digest();
        }
      });

      scope.updateModal = updateModal;
      scope.saveEdit = saveEdit;

      function updateModal(survey){
        scope.$emit("individual-survey-clicked",survey,scope.field);
      }

      function saveEdit(response, schema){
        var g = pdb.groups["g"+$stateParams.id];
        response.saving = true;

        return g.localResponseDB.get(response._id).then(function(res){
          var school_code = response.response_info.school_code;
          var enumerator_id = response.response_info.enumerator_id;
          var enumerator_name = response.response_info.enumerator_name;
          res.response_info.school_code = school_code;
          res.response_info.enumerator_id = enumerator_id;
          res.response_info.enumerator_name = enumerator_name;

          if (schema.doc_type == "schema" && schema.hasOwnProperty("editable")){
            schema.editable.forEach(function(field){
              var value = response.sections[field.section_code][field.question_code];
              if (res.sections.hasOwnProperty(field.section_code) && res.sections[field.section_code].hasOwnProperty(field.question_code)){
                res.sections[field.section_code][field.question_code] = value;
              }
            });
          }else if(schema.doc_type == "schema-family" && schema.hasOwnProperty("editable")){
            schema.editable.forEach(function(field){
              var value = response.surveys[field.survey_uuid].sections[field.section_code][field.question_code];
              if (res.surveys.hasOwnProperty(field.survey_uuid) && res.surveys[field.survey_uuid].hasOwnProperty(field.section_code) && res.surveys[field.survey_uuid].sections[field.section_code].hasOwnProperty(field.question_code)){
                res.surveys[field.survey_uuid].sections[field.section_code][field.question_code] = value;
              }
            });
          }

          return g.localResponseDB.put(res);
        }).then(function(res){
          return g.localResponseDB.replicate.to(g.remoteResponseDB, {
            retry: true
          }).on("complete", function(info){
            console.log("change replicated in remote")
          }).on("error", function(err){
            console.log(err)
          })
        }).then(function(res){
          response.saving = false;
          scope.$digest();
        })
      }

    }

  }
}())
