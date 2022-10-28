"use strict";

(function(){
  angular
  .module("dashboard")
  .controller("MonitoringController",MonitoringController)

  MonitoringController.$inject = ["$q", "$scope", "pdb", "monitoring", "surveygroup", "CurrentUser", "downloadService"];

  function MonitoringController($q, $scope, pdb, monitoring, surveygroup, CurrentUser, downloadService){

    var vm = this;
    vm.abilities = CurrentUser.parse_abilities();
    vm.surveygroup = surveygroup;
    vm.schemas = monitoring.schemas;
    vm.active = monitoring.active;
    vm.counts = monitoring.active.filter(function (r) { return r.response_count > 0 });
    vm.schoolCount = monitoring.schoolCount;
    vm.pouch = monitoring.pouch;
    vm.calendar = monitoring.calendar;
    vm.flags = monitoring.flags;
    vm.showFlags = Object.keys(monitoring.flags).length > 0;
    vm.dataDate = monitoring.calendar[0] ? monitoring.calendar[0].key : null;
    vm.dayData = monitoring.dayData;
    vm.syncing = false;
    vm.sync = sync;
    vm.changeDate = updateTable;
    vm.hideDownload = vm.abilities.indexOf("cannot download dashboards") > -1;
    vm.isSelectable = isSelectable;
    vm.data = {};
    vm.downloadDay = downloadDay;
    vm.noData = vm.calendar.length === 0;
    vm.allDays = false;
    setSchoolTarget();
    


    $scope.$on("mon-table-click", function(evt, data, title, flag){
      $scope.$broadcast("update-mon-modal", data, title, flag);
    });

    $scope.$on("individual-survey-clicked", function(evt, data, field){
      $scope.$broadcast("mon-survey-clicked", data, field);
    });

    $scope.$on("update-irr-modal", function(evt, data){
      $scope.$broadcast("update-modal", data, "All Subtasks", true);
    });

    function init() {
      return $q.all([
        vm.pouch.localSurveyDB.allDocs({include_docs: true}),
        vm.pouch.localResponseDB.get("_design/red-flags"),
        vm.pouch.queryResponses("monitoring/operational-date-survey", {group_level: 1}),
        vm.pouch.queryResponses("monitoring/operational-schools", {reduce: true, include_docs: false, group_level: 1}),
        vm.pouch.localSurveyDB.get("schools").catch(function (err) { return null })
      ]).then(function (res) {
        var schoolReduce = res[3];
        var schoolList = res[4];
        vm.schoolCount = {
          count: schoolReduce.length,
          target: schoolList ? schoolList.schools.filter(schoolFilter).length : 0
        };
        vm.flags = res[1].views;
        vm.showFlags = Object.keys(vm.flags).length > 0;
        vm.calendar = res[2].map(function(d){
          var key = d.key[0];
          d.date = new Date(key);
          d.key = key;
          return d;
        }).sort(function(b,a){
          return a.date - b.date;
        });
        vm.schemas = pdb.mapDocs(res[0]);
        vm.active = vm.schemas.filter(function (d) { return d.active });
        return $q.all(vm.active.map(function (d) {
          var options = {include_docs: false, reduce: true, startkey: [d._id], endkey: [d._id,{}], group_level: 2};
          return vm.pouch.queryResponses("monitoring/operational-survey", options);
        })).then(function (countsRes) {
          var counts = [].concat.apply([], countsRes);
          vm.active.forEach(function(d){
            var response_count = counts.find(function(b){ return b.key[0] == d._id && b.key[1] === false});
            var irr_count = counts.find(function(b){ return b.key[0] == d._id && b.key[1] === true});
            d.response_count = response_count ? response_count.value : 0;
            d.irr_count = irr_count ? irr_count.value : 0;
          });
          return vm.pouch.queryResponses("monitoring/operational-date-survey", {startkey: [vm.calendar[0]], endkey:[vm.calendar[0], {}], include_docs: true, reduce: false}).then(function (dayData) {
            vm.dayData = dayData;
            vm.counts = vm.active.filter(function (r) { return r.response_count > 0 });
            vm.dayDate = vm.calendar[0].key;
            vm.noData = vm.calendar.length === 0;
            updateTable();
            $scope.$apply();
          });
        });
      });

      function schoolFilter(d){
        var no_desc = !d.school_name && !d.location_description;
        var schoolFilter = d.school_name && (d.school_name.match("Training School") || d.school_name.match("Dry Run"));
        var locationFilter = d.location_description && (d.location_description.match("Practice") || d.location_description.match("Dry Run"));
        return no_desc || (!schoolFilter && !locationFilter);
      }
    }

    function sync(){
      vm.syncing = true;
      return vm.pouch.syncDBs().then(function(res){
        var errors = res.map(function(d){
          return d.errors;
        });
        var allErrors = [].concat.apply([],errors);
        if (allErrors.length === 0){
          console.log("sync successful");
        }else{
          console.log("sync errors", allErrors);
        }
        return init();
      }).then(function(){
        vm.syncing = false;
      }).catch(function(err){
        console.log("err",err);
        vm.syncing = false;
      });
    }

    function updateTable(){
      if (vm.allDays) {
        var options = {include_docs: true, reduce: false};
      } else {
        var options = {startkey: [vm.dataDate], endkey:[vm.dataDate, {}], include_docs: true, reduce: false};
      }
      return vm.pouch.queryResponses("monitoring/operational-date-survey", options).then(function(res){
        vm.dayData = res;
        $scope.$broadcast("update-monitoring-table", res);
        $scope.$broadcast("update-red-flags", vm.dataDate);
        $scope.$broadcast("update-monitoring-progress");
        $scope.$broadcast("update-irr", vm.dataDate);
        $scope.$digest();
      });
    }

    function isSelectable(date, type) {
      var modDate = date._d+"";
      return vm.calendar.find(function (d) { return d.key === modDate.split(" ").slice(1,4).join(" ") }) ? true : false;
    }

    function downloadDay(){
      if (vm.hideDownload) return;

      vm.downloading = true;
      var name = "operational-"+vm.dataDate.replace(" ", "-");
      var promises = vm.active.map(function(d){
        var options = {reduce:false, include_docs:true, key: [vm.dataDate, d._id]};
        return vm.pouch.queryResponses("monitoring/operational-date-survey", options);
      });

      return downloadService.download(name, promises, vm.active, vm.schemas).then(function(){
        vm.downloading = false;
      });

    }

    function setSchoolTarget() {
      if ( vm.surveygroup.school_count && vm.surveygroup.school_count > 0 ) {
        vm.schoolCount["target"] = vm.surveygroup.school_count;
      }
    }

  }

}())
