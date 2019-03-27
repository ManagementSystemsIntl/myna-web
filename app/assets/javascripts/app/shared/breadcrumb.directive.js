"use strict";

(function(){
  angular
  .module("formBuilder")
  .directive("breadcrumb", Breadcrumb)

  Breadcrumb.$inject = ["$q", "$rootScope", "$state", "SurveyGroups", "Surveys", "Sections"];

  function Breadcrumb($q, $rootScope, $state, SurveyGroups, Surveys, Sections){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      templateUrl: "shared/_breadcrumb.html"
    };
    return directive;

    function link(scope, el){
      var appStates = $state.get();

      scope.$on('$stateChangeSuccess', function() {
        setCrumbs();
      });

      scope.$on("nav:group-updated", function (res, group) {
        var crumb = scope.crumbs.find(function (d) { return d.name.match("groupShow") });
        crumb.resource = group;
      });

      scope.$on("nav:survey-updated", function (res, survey) {
        var crumb = scope.crumbs.find(function (d) { return d.name.match("surveyShow") });
        crumb.resource = survey;
      });

      scope.$on("nav:section-updated", function (res, section) {
        var crumb = scope.crumbs.find(function (d) { return d.name.match("sectionShow") });
        crumb.resource = section;
      });

      function setCrumbs(){
        $q.all([SurveyGroups.fetch("query"), Surveys.fetch("query"), Sections.fetch("query")]).then(function (res) {
          var abstract = $state.current.name.split(".")[0];
          var crumbs = Object.keys($state.params).reduce(reduceParams, []);
          scope.crumbs = mapCrumbs(crumbs, abstract);

          if (!scope.crumbs.find(function (b) { return b.name === $state.current.name })) {
            var params = scope.crumbs.length > 0 ? scope.crumbs[scope.crumbs.length -1].params : {};
            var resource = $state.current.name === "dashboard.training" ? "Training" : $state.current.name === "dashboard.monitoring" ? "Monitoring" : null;
            if (!resource) return;
            scope.crumbs.push({params: params, resource: {name: resource}, name: $state.current.name, icon: $state.current.icon});
          }
        });
      }

      function reduceParams(p,n,i,a){
        var keys = [];
        for (var b=0; b<i; b++){
          keys.push(a[b]);
        }
        var params= keys.map(function(d){
          return {name:d, val:parseInt($state.params[d])};
        })
        params.push({name:"id", val:parseInt($state.params[n])});
        keys.push("id");
        var segments = $state.$current.url.segments.slice(0, params.length).map(function(d){
          return d.replace("/builder","").replace("/dashboard","");
        })
        var url = segments.reduce(function(p,n,i,a){
          return p+= n+":"+keys[i];
        },"");

        p[i] = {
          params: params,
          segments: segments,
          url: url
        };
        return p;
      }

      function mapCrumbs(crumbs, abstract){

        return crumbs.map(function(d,i){
          var appState = appStates.find(function(b){
            return b.url === d.url && abstract === b.name.split(".")[0];
          });
          d.name = appState.name;
          var group_id = findParam(d.params, "group_id") || findParam(d.params,"id");
          var group = SurveyGroups.get(group_id);
          if (findParam(d.params, "group_id")) {
            var survey = Surveys.get(null, (findParam(d.params, "survey_id") || findParam(d.params,"id")))
          }
          if (findParam(d.params, "survey_id")) {
            var section = Sections.get(null, findParam(d.params, "id"));
          }

          var kl = d.params.length;
          d.resource = kl === 1 ? group : kl == 2 ? survey : section;
          d.paramsString = "{"+d.params.map(function(n){ return '"'+n.name+'":'+n.val }).join(",")+"}";
          d.paramObj = JSON.parse(d.paramsString);
          d.icon = appState.icon;

          return d;
        });
      }

      function findParam(params,paramName){
        var param = params.find(function(d){ return d.name == paramName });
        if (param){
          return param.val;
        }
      }

    }

  }
}())
