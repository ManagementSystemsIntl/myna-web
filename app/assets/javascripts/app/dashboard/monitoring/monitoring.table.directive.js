"use strict";

(function(){
  angular
  .module("dashboard")
  .directive("monitoringTable",MonitoringTableFunction)

  MonitoringTableFunction.$inject = [];

  function MonitoringTableFunction(){
    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope:{
        surveys: "="
      },
      templateUrl: "dashboard/monitoring/_monitoring_table.html"
    }
    return directive;

    function link(scope,el){

      scope.loading = true;
      scope.showTooltipModal = showTooltipModal;

      scope.$on("update-monitoring-table", function(evt, data){
        var schools = reduceByField(data, "school_code");
        scope.schools = Object.keys(schools).map(function(d){
          var enumerators = reduceByField(schools[d], "enumerator_id");
          var survey_uuids = reduceByField(schools[d], "survey_uuid");
          var surveys = Object.keys(survey_uuids).map(function (d) {
            var s = survey_uuids[d];
            var count = s.filter(function (r) { return !r.response_info.irr_entry }).length;
            return { key: d, data: s, count: count, irr: s.length - count };
          }).reduce(function (p,n) {
            p[n.key] = n;
            return p;
          }, {});
          return {
            school_code: d,
            data: surveys,
            enumerators: Object.keys(enumerators).sort().map(function(b){
              return {enumerator_id: b, data: enumerators[b]};
            })
          }
        }).sort(function (a,b) {
          return a.enumerators[0].enumerator_id - b.enumerators[0].enumerator_id;
        });
        scope.loading = false;
        scope.$digest();
      });

      function reduceByField(data, field){
        return data.reduce(function(p,n,i,a){
          if (!p.hasOwnProperty(n.response_info[field])){
            p[n.response_info[field]] = [n];
          }else{
            p[n.response_info[field]].push(n);
          }
          return p;
        }, {})
      }

      function showTooltipModal(data, title){
        scope.$emit("mon-table-click", data, title);
      }

    }

  }
}())
