"use strict";

(function(){
  angular
  .module("dashboard")
  .directive("monitoringRedflags", MonitoringRedflags)

  MonitoringRedflags.$inject = [];

  function MonitoringRedflags(){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope:{
        pouch: "=",
        flags: "="
      },
      templateUrl: "dashboard/monitoring/_monitoring_redflags.html"
    };
    return directive;

    function link(scope,el){

      scope.date;
      scope.flag;
      scope.has_flags;
      scope.queryBuilder = {query:undefined};
      scope.queryFlag = queryFlag;
      scope.querying = true;
      scope.records;
      scope.showTooltipModal = showTooltipModal;

      scope.$on("update-red-flags", function(evt, date){
        scope.date = date;
        if (!scope.queryBuilder.query){
          scope.queryBuilder.query = Object.keys(scope.flags)[0];
        }
        scope.has_flags = Object.keys(scope.flags).length > 0;
        if (scope.has_flags){
          queryFlag();
        }
      });

      function queryFlag(){
        scope.flag = scope.flags[scope.queryBuilder.query];
        var options = {include_docs: false, reduce: true, group_level: 2};
        options.startkey = [scope.date];
        options.endkey = [scope.date+"\uffff",{}];
        scope.querying = true;
        scope.pouch.queryResponses("red-flags/"+scope.queryBuilder.query, options).then(function(res){
          scope.records = res.filter(function(d){
            if (scope.flag.hasOwnProperty("show_threshold")){
              return d.value >= scope.flag.show_threshold;
            }else{
              return true;
            }
          });
          scope.querying = false;
          scope.$digest();
        });
      }

      function showTooltipModal(data){
        var flag = scope.flags[scope.queryBuilder.query];
        var options = {include_docs: true, reduce: false, key: data.key};
        var title = "Enumerator "+data.key[1]+" - "+(flag.alias || scope.queryBuilder.query);
        return scope.pouch.queryResponses("red-flags/"+scope.queryBuilder.query, options).then(function(res){
          return scope.$emit("mon-table-click", res, title, flag);
        });
      }

    }

  }

}())
