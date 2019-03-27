"use strict";

(function(){
  angular
  .module("formBuilder")
  .controller("SiteNavController", SiteNavController)

  SiteNavController.$inject = [
    "$rootScope", "$scope", "$state",
    "CurrentUser","trees"
  ];

  function SiteNavController(
    $rootScope, $scope, $state,
    CurrentUser,trees
  ){

    var ddStates = ["builder","dashboard"];
    var abilities = CurrentUser.parse_abilities();

    var all = abilities.indexOf("can manage all") > -1;
    $scope.showHelp = {
      fb: all || abilities.indexOf("can see builder") > -1,
      dash: all || abilities.indexOf("can see dashboards") > -1,
      data: all || abilities.indexOf("can download data") > -1,
      mgmt: all
    };

    $scope.dropdowns = {};
    $scope.lt = $state.current.name.split(".")[0];
    $scope.toggleDropdown = toggleDropdown;
    $scope.trees = trees;
    trees.forEach(function (tree) {
      $scope.dropdowns["sg"+tree.id] = {};
      ddStates.forEach(function(st){
        $scope.dropdowns["sg"+tree.id][st] = false;
      });
    });

    $scope.$on("nav:group-updated", function (res, group) {
      var tree = $scope.trees.find(function (d) { return d.id === group.id });
      tree.name = group.name;
    });

    $scope.$on("nav:group-deleted", function (res, group) {
      var tree = $scope.trees.find(function (d) { return d.id === group });
      var idx = $scope.trees.indexOf(tree);
      $scope.trees.splice(idx, 1);
    });

    $scope.$on("nav:survey-created", function (res, group, survey) {
      var tree = $scope.trees.find(function (d) { return d.id === group });
      tree.surveys.push(survey);
    });

    $scope.$on("nav:survey-updated", function (res, survey) {
      var tree = $scope.trees.find(function (d) { return d.id === survey.survey_group_id });
      var treeSurvey = tree.surveys.find(function (d) {return d.id === survey.id });
      var idx = tree.surveys.indexOf(treeSurvey);
      tree.surveys.splice(idx, 1, survey);
    });

    $scope.$on("nav:survey-deleted", function (res, survey) {
      var tree = $scope.trees.find(function (d) { return d.id === survey.survey_group_id });
      var treeSurvey = tree.surveys.find(function (d) {return d.id === survey.id });
      var idx = tree.surveys.indexOf(treeSurvey);
      tree.surveys.splice(idx, 1);
    });

    // $rootScope.$on("tree-update", function(evt, type, data){
    //   if (type == "client"){
    //     var client = $scope.trees.find(function(d){ return d.id == data.id});
    //     client.name = data.name;
    //   }else if (type == "clients"){
    //     $scope.trees.forEach(function(client){
    //       var match = data.find(function(d){ return d.id == client.id });
    //       client.name = match.name;
    //     });
    //   }
    // });

    function toggleDropdown(group_id, lt){
      $scope.dropdowns["sg"+group_id][lt] = !$scope.dropdowns["sg"+group_id][lt];
    }

  }
}())
