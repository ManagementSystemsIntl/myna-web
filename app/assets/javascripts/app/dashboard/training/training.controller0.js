"use strict";

(function(){
  angular
  .module("dashboard")
  .controller("TrainingController",TrainingController)

  TrainingController.$inject = [
    "$q","$scope","$state","$stateParams",
    "pdb","dataService", "Scorer",
    "surveygroup", "pouchkey", "surveys", "surveyfamilies"
  ];

  function TrainingController(
    $q,$scope,$state,$stateParams,
    pdb, dataService, Scorer,
    surveygroup, pouchkey, surveys, surveyfamilies
  ){

    var vm = this;

    vm.blockCharts = true;
    vm.group = surveygroup;
    vm.key = pouchkey;
    vm.families = surveyfamilies;
    vm.pouch = pdb.getGroup(surveygroup.id, pouchkey.username, pouchkey.pwd, pouchkey.db_name, pouchkey.db_address);
    vm.sync = sync;
    vm.syncing = false;
    vm.fetchingSurveys = false;
    vm.fetchingGolds = false;
    vm.fetchingSubtasks = false;
    vm.searchEnumerator = searchEnumerator;
    vm.enumerator_search = {
      search: undefined,
      results: []
    }

    vm.updateChart = updateChart;
    vm.updateDataset = updateDataset;
    vm.updateGold = updateGold;
    vm.resetFilters = resetFilters;

    vm.activeSurveys = [];
    vm.focusGolds = [];
    vm.subtasks = [];

    $scope.$on("clicked-modal", function(e,d){
      vm.focusData = d;
      $scope.$digest();
      $scope.$broadcast("update-modal",d,null,true);
    });

    $scope.$on("clicked-cluster", function(e, data){
      $scope.$broadcast("update-chart", data, vm.subtask);
    });

    $scope.$on("reset-cluster", function(){
      $scope.$broadcast("update-chart", vm.chartData, vm.subtask);
    });

    init();

    //////////////////////////////////////

    function init(sync){
      vm.fetchingSurveys = true;

      vm.pouch.localSurveyDB.allDocs({include_docs: true}).then(function(surveys){
        return pdb.mapDocs(surveys);
      }).then(function(surveys){
        vm.allSurveys = surveys;
        var options = {include_docs: false, reduce: true, group_level: 2};
        return vm.pouch.queryResponses("training/survey-gold", options);
      }).then(function(with_gold){
        var active = with_gold.reduce(function(p,n,i,a){
          if (p.hasOwnProperty(n.key[0])){
            p[n.key[0]].push(n.key[1]);
          }else{
            p[n.key[0]] = [n.key[1]];
          }
          return p;
        },{});
        vm.activeSurveys = Object.keys(active).map(function(k){
          var match = vm.allSurveys.find(function(d){return d._id == k});
          match.active_golds = active[k];
          return match;
        }).sort(surveySort);

        vm.fetchingSurveys = false;
        vm.fetchingGolds = false;

        if (!sync && !vm.focusSurvey){
          $scope.$digest();
        }

        if (sync && vm.focusSurvey){
          var newFocus = vm.activeSurveys.find(function(d){ return d._id == vm.focusSurvey._id });
          if (newFocus){
            vm.focusSurvey = newFocus;
            vm.focusGolds = vm.focusSurvey.active_golds;
            var newGold = vm.focusGolds.indexOf(vm.focusGold) > -1;
            if (!newGold){
              vm.focusGold = undefined;
            }else{
              updateGold(vm.focusGold);
            }
          }
        }

      });
    }

    function surveySort(a,b){
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
    }

    function sync(){
      vm.syncing = true;
      return vm.pouch.syncDBs().then(function(res){
        var errors = res.map(function(d){
          return d.errors;
        });
        var allErrors = [].concat.apply([],errors);
        if (allErrors.length == 0){
          console.log("sync successful");
        }else{
          console.log("sync errors", allErrors);
        }
        return init(true);
      }).then(function(){
        vm.syncing = false;
      }).catch(function(err){
        console.log("err",err);
        vm.syncing = false;
      })
    }

    function resetFilters(){
      vm.enumerator_search = {
        search: undefined,
        results: []
      };

      if (vm.focusSurvey){
        var newFocus = vm.activeSurveys.find(function(d){ return d._id == vm.focusSurvey._id });
        if (newFocus){
          vm.focusSurvey = newFocus;
          vm.focusGolds = vm.focusSurvey.active_golds;
          var newGold = vm.focusGolds.indexOf(vm.focusGold) > -1;
          if (!newGold){
            vm.focusGold = undefined;
          }else{
            updateGold(vm.focusGold);
          }
        }
      }else{
        updateDataset();
      }
    }

    function updateDataset(survey){
      vm.focusGolds = [];
      vm.focusGold = undefined;
      vm.subtasks = [];
      vm.subtask = undefined;
      blockCharts();
      if (!survey) return;
      vm.focusGolds = survey.active_golds;
    }

    function updateGold(gold_id){
      var gs;
      vm.fetchingSubtasks = true;
      var options = {include_docs: true, reduce: false, key: [vm.focusSurvey._id, gold_id]};
      vm.pouch.queryResponses("training/find-gold", options).then(function(gold){
        gs = gold[0];
        return vm.pouch.queryResponses("training/survey-gold",options);
      }).then(function(docs){
        var data = getChartData(gs, docs, ["Consent_", "$time"]);
        vm.subtasks = data.subtasks;
        if (!vm.subtask || (vm.subtask && vm.subtasks.indexOf(vm.subtask) == -1)){
          vm.subtask = "All Subtasks";
        }
        vm.fetchingSubtasks = false;
        vm.chartData = data.data;

        updateChart();
        $scope.$digest();
      });
    }

    function updateChart(){
      vm.clusterData = Scorer.formatForClusterChart(vm.chartData, vm.subtask);
      $scope.$broadcast("update-cluster-chart", vm.clusterData);
      $scope.$broadcast("update-chart", vm.chartData, vm.subtask);
    }

    function blockCharts(){
      $scope.$broadcast("block-charts", true);
    }

    function reduceByGS(p,n,i,a){
      if (p[n.response_info.gold_standard]){
        p[n.response_info.gold_standard].push(n);
      }else{
        p[n.response_info.gold_standard] = [n];
      }
      return p;
    }

    function getChartData(gs, dataset, dontScore){
      var chartData;
      gs.direction = getSurveyDirection(gs);
      var flatGS = dataService.flattenData(gs,false);
      var consentKeys = Object.keys(flatGS).filter(function(d){ return d.match("_consent") });

      if (consentKeys.length > 0){
        chartData = dataset.filter(function(d){
          var hasConsents = consentKeys.map(function(k){
            var path = k.split(".");
            return Scorer.checkNestedFieldType(path, d, 0, "boolean");
          });
          return hasConsents.indexOf(false) == -1;
        }).map(function(d){
          var s = Scorer.formatForTrainingChart([gs,d], dontScore);
          delete s.family;
          return s;
        });
      }else{
        chartData = dataset.map(function(d){
          var s = Scorer.formatForTrainingChart([gs,d], dontScore);
          delete s.family;
          return s;
        });
      }

      var subtasks = Object.keys(chartData[0].sections);
      subtasks.unshift("All Subtasks");

      return {data: chartData, subtasks: subtasks};
    }

    function getSurveyDirection(doc){
      var uuid = doc.response_info.survey_uuid;
      var language = doc.response_info.language || "language";
      var schema = vm.allSurveys.find(function(d){ return d._id == uuid });

      if (doc.hasOwnProperty("surveys")){
        var survey_uuid = schema.survey_info.surveys[0].uuid;
        schema = vm.allSurveys.find(function(d){ return d._id == survey_uuid });
        return schema.translations[language].survey_direction;
      }else{
        return schema.translations[language].survey_direction;
      }
    }

    function searchEnumerator(){
      var options = {include_docs: true, reduce: false, startkey: [vm.enumerator_search.search], endkey: [vm.enumerator_search.search,{}]};
      vm.pouch.queryResponses("training/enumerator-gold", options).then(function(results){
        vm.enumerator_search.results = results;
        return vm.pouch.queryResponses("training/find-gold", {include_docs: true, reduce: false});
      }).then(function(golds){
        if (vm.enumerator_search.results.length == 0){
          resetFilters();
          return $scope.$digest();
        }
        var uglyData = vm.enumerator_search.results.map(function(d){
          var gs = golds.find(function(g){return d.response_info.survey_id == g.response_info.survey_id && d.response_info.gold_standard ==  g.response_info.gold_standard });
          return getChartData(gs, [d], ["Consent_"]);
        });

        var allSubtasks = [].concat.apply([],uglyData.map(function(d){return d.subtasks}));
        var subtasks = allSubtasks.filter(function(d, i, self){return self.indexOf(d) == i}).sort();
        var prettyData = [].concat.apply([],uglyData.map(function(d){return d.data}));

        vm.chartData = prettyData;
        vm.subtasks = subtasks;
        if (!vm.subtask || (vm.subtask && vm.subtasks.indexOf(vm.subtask) == -1)){
          vm.subtask = "All Subtasks";
        }
        updateChart();
        $scope.$digest();
      });
    }

  }
}())
