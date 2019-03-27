"use strict";

(function(){
  angular
  .module("dashboard")
  .directive("monitoringProgress", MonitoringProgress)

  MonitoringProgress.$inject = [];

  function MonitoringProgress(){

    var directive = {
      link: link,
      restrict: "A",
      replace: true,
      scope: {
        surveys: "=",
        schools: "="
      },
      templateUrl: "dashboard/monitoring/_monitoring_progress.html"
    };
    return directive;

    function link(scope, el){
      scope.$on("update-monitoring-progress", function(){
        // do something
      });

    }

  }
}())
