"use strict";

(function(){
  angular
  .module("dashboard")
  .controller("DashboardShowController", DashboardShowController)

  DashboardShowController.$inject = ["$scope", "$stateParams", "CurrentUser", "dataService", "downloadService", "dashboard", "pdb", "surveygroup"];

  function DashboardShowController($scope, $stateParams, CurrentUser, dataService, downloadService, dashboard, pdb, surveygroup){

    var vm = this;

    vm.abilities = CurrentUser.parse_abilities();
    vm.group = surveygroup;
    vm.dataUpdated = false;
    vm.downloadData = downloadData;
    vm.downloadOptions = {
      downloading: false,
      types: []
    }
    vm.findResponses = findResponses;
    vm.hideDownload = vm.abilities.indexOf("cannot download dashboards") > -1;
    vm.makeResult = makeResult;
    vm.omitRecords = omitRecords;
    vm.omitString;
    vm.omittedCount;
    vm.pouch = dashboard.pouch;
    vm.responseSearch;
    vm.responseSearchId;
    vm.responseSearchResults = [];
    vm.restoreRecords = restoreRecords;
    vm.restoreString;
    vm.schemas = dashboard.schemas;
    vm.surveys;
    vm.sync = sync;
    vm.syncing = false;
    vm.updateMetadata = updateMetadata;

    init();

    /////////////////////////////

    function init(){
      return sync();
    }

    function downloadData(){
      vm.downloadOptions.downloading = true;
      var name = vm.downloadOptions.filename;
      var dlSurveys = vm.surveys.filter(function(d){return d.checked});
      var promises = dlSurveys.map(function(d){
        var options = {reduce:false, include_docs:true, key: d._id};
        var queries = vm.downloadOptions.types.filter(function(d){return d.checked})
          .map(function(d){return d.query});
        return vm.pouch.bulkQuery(queries,options);
      });

      return downloadService.download(name, promises, dlSurveys, vm.schemas).then(function(){
        vm.downloadOptions.downloading = false;
        vm.downloadOptions.filename = null;
        vm.surveys.map(function(d){d.checked = false; return d;});
        vm.downloadOptions.types.map(function(d){d.checked = false; return d;});

        $scope.downloadForm.$setPristine();
        $scope.downloadForm.$setUntouched();
      });
    }

    function omitRecords(){
      fetchIDs(vm.omitString).then(function(docs){
        docs.map(function(d){
          d.response_info.omit = true;
          return d;
        })
        return vm.pouch.bulkUpdate(docs);
      }).then(function(res){
        vm.omitString = "";
        return countOmitted();
      })
    }

    function restoreRecords(){
      fetchIDs(vm.restoreString).then(function(docs){
        docs.map(function(d){
          d.response_info.omit = false;
          return d;
        })
        return vm.pouch.bulkUpdate(docs);
      }).then(function(res){
        vm.restoreString = "";
        return countOmitted();
      })
    }

    function fetchIDs(idString){
      var ids = idString.replace(/[^0-9$,]/g,"").split(",").map(function(d){return {id: d}});
      return vm.pouch.localResponseDB.bulkGet({docs: ids}).then(function(res){
        return pdb.mapDocs(res);
      })
    }

    function updateMetadata(){
      try{
        var responseJson = JSON.parse(vm.responseSearchResult);
        vm.pouch.localResponseDB.get(vm.responseSearchId).then(function(doc){
          // enable alternative id, will be most useful for gold standards
          // could also be useful to look up docs by flags
          if (doc.alt_id && !vm.responseSearchIdCopy){
            delete doc.alt_id;
          }else if (vm.responseSearchIdCopy && vm.responseSearchIdCopy !== vm.responseSearchId){
            doc.alt_id = vm.responseSearchIdCopy;
          }

          if (vm.responseSearchIsGold){
            responseJson.is_gold = true;
          }else{
            delete responseJson.is_gold;
          }

          if (vm.responseSearchGS){
            responseJson.gold_standard = vm.responseSearchGS;
          }

          doc.response_info = responseJson;
          return vm.pouch.localResponseDB.put(doc);
        }).then(function(res){
          vm.responseSearch = undefined;
          vm.responseSearchId;
          vm.responseSearchResults = [];
          $scope.$digest();
          vm.pouch.localResponseDB.replicate.to(vm.pouch.remoteResponseDB, {
            retry: true
          }).on("complete", function(info){
            console.log("change replicated in remote",info)
          }).on("error", function(err){
            console.log(err)
          })
          console.log("local save", res);
        })
      }
      catch(err){
        // make this a flash alert or something nicer
        window.alert("Invalid JSON")
      }
    }

    function makeResult(id){
      vm.responseSearch = id;
      findResponses();
    }

    function findResponses(){
      var options = {
        reduce: false,
        startkey: vm.responseSearch,
        endkey: vm.responseSearch+"\uffff",
        // limit:50,
        include_docs:true
      }
      vm.pouch.queryResponses("monitoring/search-id",options).then(function(res){
        vm.responseSearchResults = res;
        if (vm.responseSearchResults.length == 1){
          vm.responseSearchId = vm.responseSearchResults[0]._id;
          vm.responseSearchIdCopy = vm.responseSearchResults[0].alt_id || undefined;
          vm.responseSearchIsGold = vm.responseSearchResults[0].response_info.is_gold || false;
          vm.responseSearchGS = vm.responseSearchResults[0].response_info.gold_standard || undefined;
          vm.responseSearchResult = JSON.stringify(vm.responseSearchResults[0].response_info, null, 2);
          var responseSurvey = vm.surveys.find(function(d){ return d._id == vm.responseSearchResults[0].response_info.survey_uuid });
          var responseGolds = responseSurvey.survey_info.gold_standards ? responseSurvey.survey_info.gold_standards.split(",").map(function(d){ return "Gold "+d}) : [];
          responseGolds.unshift("Practice");
          vm.responseSearchGolds = responseGolds;
        }
        $scope.$digest();
      })
    }

    function countOmitted(){
      return vm.pouch.queryResponses("download/omitted", {reduce: true})
      .then(function(res){
        vm.omittedCount = res[0] ? res[0].value : 0;
        $scope.$digest();
      })
    }

    function sync(){
      vm.syncing = true;
      return vm.pouch.syncDBs().then(function(res){
        var errors = res.map(function(d){
          return d.errors;
        });
        var allErrors = [].concat.apply([],errors);
        if (allErrors.length == 0){
          console.log("sync successful")
        }else{
          console.log("sync errors", allErrors)
        }
        return vm.pouch.localSurveyDB.allDocs({include_docs:true});
      }).then(function(docs){
        vm.surveys = pdb.mapDocs(docs)
        .filter(function(d){return d.hasOwnProperty("survey_info") && d.active})
        .sort(function(a,b){
          // alphabetize list, families on top
          var cat1 = a.doc_type;
          var cat2 = b.doc_type;
          var name1 = a.survey_info.name;
          var name2 = b.survey_info.name;
          if (cat1 > cat2) return -1;
          if (cat1 < cat2) return 1;
          if (name1 < name2) return -1;
          if (name1 > name2) return 1;
          return 0;
        });

        return vm.pouch.localResponseDB.get("_design/download");
      }).then(function(download){
        vm.downloadOptions.types = Object.keys(download.views).map(function(d){
          var view = download.views[d];
          view.query = "download/"+d;
          view.checked = false;
          return view;
        });
        vm.syncing = false;
        return countOmitted();
      }).catch(function(err){
        console.log("err",err);
        vm.syncing = false;
      })
    }

  }

}())
