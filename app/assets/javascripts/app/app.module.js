"use strict";

(function(){
  angular
  .module("formBuilder",[
    "ui.router",
    "templates",
    "ng-rails-csrf",
    "pouchdb",
    "textAngular",
    "ngFlash",
    "as.sortable",
    "ngCsvImport",
    "moment-picker",
    "ui.ace",
    "surveyGroups", "languages", "surveys", "surveyFamilies", "sections",
    "questions", "translations", "questionTypes", "choiceLists", "management","dashboard"
  ])
  .config(StateConfig)
  .config(TextAngularConfig)
  .config(FlashConfig)
  .run(Run)

  StateConfig.$inject = ["$stateProvider", "$locationProvider"];
  function StateConfig($stateProvider, $locationProvider){
    $locationProvider.html5Mode(true);

    $stateProvider
    .state("unauthorized", {
      url: "/unauthorized",
      views: {
        "main": {
          template: "<h1>You are not authorized to go here.</h1>"
        }
      }
    })
    .state("builder", {
      url:"/builder",
      cache: true,
      abstract: true,
      template: "<ui-view></ui-view>",
      resolve: {
        current_user: current_user,
        trees: trees
      },
      views: {
        "nav":{
          templateUrl: "shared/_nav.html",
          controller: "SiteNavController",
          cache: true
        },
        "main":{
          template: "<ui-view></ui-view>"
        }
      }
    })
    .state("builder.index", {
      url:"/home",
      templateUrl: "builder/index.html",
      controller: "BuilderIndexController",
      controllerAs: "vm",
      icon: "wrench",
      resolve: {
        surveygroups: surveygroups
      }
    })
    .state("builder.groupShow", {
      url:"/survey_groups/:id",
      templateUrl: "survey_groups/show.html",
      controller: "GroupShowController",
      controllerAs: "vm",
      icon: "users",
      resolve: {
        choicelists: choicelists,
        languages: languages,
        pouchkey: pouchkey,
        questionoptions: questionoptions,
        surveyfamilies: surveyfamilies,
        surveygroup: surveygroup,
        surveys: surveys
      }
    })
    .state("builder.surveyShow", {
      url:"/survey_groups/:group_id/surveys/:id",
      templateUrl: "surveys/show.html",
      controller: "SurveyShowController",
      controllerAs: "vm",
      icon: "file-o",
      resolve: {
        languages: languages,
        pouchkey: pouchkey,
        questions: questions,
        sections: sections,
        survey: survey
      }
    })
    .state("builder.sectionShow", {
      url:"/survey_groups/:group_id/surveys/:survey_id/sections/:id",
      templateUrl: "sections/show.html",
      controller: "SectionShowController",
      controllerAs: "SectionShowVM",
      icon: "list",
      resolve: {
        choicelists: choicelists,
        questions: questions,
        questionattributes: questionattributes,
        questionoptions: questionoptions,
        questiontypes: questiontypes,
        section: section,
        survey: survey
      }
    })
    // .state("builder.translateSurvey", {
    //   url:"/clients/:client_id/survey_groups/:group_id/surveys/:survey_id/translations",
    //   templateUrl: "translations/index.html",
    //   controller: "TranslationController",
    //   controllerAs: "TranslationVM",
    //   icon: "language"
    // })
    // .state("builder.questionTypeIndex", {
    //   url:"/question_types",
    //   templateUrl: "question_types/index.html",
    //   controller: "QuestionTypeIndexController",
    //   controllerAs: "QuestionTypeIndexVM",
    //   icon: "wrench"
    // })

    .state("dashboard", {
      url:"/dashboard",
      abstract: true,
      cache: true,
      template: "<ui-view></ui-view>",
      resolve: {
        current_user: current_user,
        trees: trees
      },
      views: {
        "nav":{
          templateUrl: "shared/_nav.html",
          controller: "SiteNavController",
          cache: true
        },
        "main":{
          template: "<ui-view></ui-view>"
        }
      }
    })
    .state("dashboard.index", {
      url:"/home",
      templateUrl: "dashboard/index.html",
      controller: "DashboardIndexController",
      controllerAs: "vm",
      icon: "dashboard",
      resolve: {
        surveygroups: surveygroups
      }
    })
    .state("dashboard.groupShow", {
      url:"/survey_groups/:id",
      templateUrl: "dashboard/show.html",
      controller: "DashboardShowController",
      controllerAs: "vm",
      icon: "dashboard",
      resolve: {
        surveygroup: surveygroup,
        dashboard: dashboard
      }
    })
    .state("dashboard.training",{
      url:"/survey_groups/:id/training",
      templateUrl: "dashboard/training/training.html",
      controller: "TrainingController",
      controllerAs: "vm",
      icon: "bell-o",
      resolve: {
        training: training
      }
    })
    .state("dashboard.monitoring",{
      url:"/survey_groups/:id/monitoring",
      templateUrl: "dashboard/monitoring/monitoring.html",
      controller: "MonitoringController",
      controllerAs: "vm",
      icon: "eye",
      resolve: {
        surveygroup: surveygroup,
        monitoring: monitoring
      }
    })

    .state("manage", {
      url:"/manage",
      abstract: true,
      cache: true,
      template: "<ui-view></ui-view>",
      resolve: {
        current_user: current_user,
        trees: trees
      },
      views: {
        "nav":{
          templateUrl: "shared/_nav.html",
          controller: "SiteNavController",
          cache: true
        },
        "main":{
          template: "<ui-view></ui-view>"
        }
      }
    })
    .state("manage.users", {
      url:"/users",
      templateUrl: "management/users.html",
      controller: "UsersIndexController",
      controllerAs: "vm",
      icon: "user",
      resolve: {
        users: users,
        roles: roles
      }
    })
    .state("manage.devices", {
      url:"/devices",
      templateUrl: "management/devices.html",
      controller: "DevicesController",
      controllerAs: "vm",
      icon: "tablet",
      resolve: {
        devices: devices
      }
    })
    .state("manage.forms", {
      url:"/forms",
      templateUrl: "management/forms.html",
      controller: "FormsController",
      controllerAs: "vm",
      icon: "files-o",
      resolve: {
        surveys: surveys_with_info,
        surveyfamilies: survey_families_with_info,
        surveygroups: survey_groups_with_info
      }
    })

    .state("help", {
      url: "/help",
      resolve: {
        current_user: current_user,
        trees: trees
      },
      views: {
        "nav":{
          templateUrl: "shared/_nav.html",
          controller: "SiteNavController",
          cache: true
        },
        "main": {
          templateUrl: "help/index.html",
          controller: "HelpController",
          controllerAs: "vm"
        }
      }
    })

  }

  TextAngularConfig.$inject = ["$provide"];
  function TextAngularConfig($provide){
    $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions){
      // $delegate is the taOptions we are decorating
      // register the tool with textAngular
      taRegisterTool('colorBlack', {
        class: 'btn btn-default active',
        iconclass: "fa fa-square black",
        tooltiptext: "Black text",
        action: function(){
          var el = angular.element(this.$element[0]);
          var parent = el.parent();
          var active = parent.find(".active");
          active.removeClass("active");
          el.addClass("active");
          this.$editor().wrapSelection('forecolor', '#555');
        }
      });
      taRegisterTool('colorRed', {
          iconclass: "fa fa-square red",
          tooltiptext: "Red text",
          action: function(){
            var el = angular.element(this.$element[0]);
            var parent = el.parent();
            if (el.hasClass("active")){
              el.removeClass("active");
              this.$editor().wrapSelection('forecolor','#555');
            }else{
              var active = parent.find(".active");
              active.removeClass("active");
              el.addClass("active");
              this.$editor().wrapSelection('forecolor', 'red');
            }
          }
      });
      taRegisterTool('colorBlue', {
          iconclass: "fa fa-square blue",
          tooltiptext: "Blue text",
          action: function(){
            var el = angular.element(this.$element[0]);
            var parent = el.parent();
            if (el.hasClass("active")){
              el.removeClass("active");
              this.$editor().wrapSelection('forecolor','#555');
            }else{
              var active = parent.find(".active");
              active.removeClass("active");
              el.addClass("active");
              this.$editor().wrapSelection('forecolor', 'blue');
            }
          }
      });
      taRegisterTool('colorGreen', {
          iconclass: "fa fa-square green",
          tooltiptext: "Green text",
          action: function(){
            var el = angular.element(this.$element[0]);
            var parent = el.parent();
            if (el.hasClass("active")){
              el.removeClass("active");
              this.$editor().wrapSelection('forecolor','#555');
            }else{
              var active = parent.find(".active");
              active.removeClass("active");
              el.addClass("active");
              this.$editor().wrapSelection('forecolor', 'green');
            }
          }
      });

      // taOptions.toolbar = [
      //   ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
      //   ['bold', 'italics', 'underline', 'ul', 'ol', 'redo', 'undo', 'clear'],
      //   ['justifyLeft','justifyCenter','justifyRight', 'justifyFull'],
      //   ['html', 'insertImage', 'insertLink', 'wordcount', 'charcount']
      // ];

      taOptions.toolbar = [
          ['h1', 'h2', 'h3', 'p'],
          ['bold', 'italics', 'underline'],
          ['ul', 'ol', 'redo', 'undo', 'clear'],
          ['justifyLeft','justifyCenter','justifyRight', 'justifyFull'],
          ['colorBlack', 'colorRed', 'colorBlue', 'colorGreen']
        ];
      return taOptions;
    }]);
  }

  FlashConfig.$inject = ["FlashProvider"];
  function FlashConfig(FlashProvider){
    FlashProvider.setTimeout(3000);
    FlashProvider.setShowClose(true);
    FlashProvider.setTemplatePreset("transclude");
  }

  Run.$inject = ["$rootScope", "$state", "CurrentUser"];
  function Run($rootScope, $state, CurrentUser){
    var permissions = {
      admin: ["manage.", "dashboard.", "builder.", "help"],
      "form-builder-admin": ["builder.", "help"],
      "dashboard-admin": ["dashboard.", "help"],
      "dashboard-viewer": ["dashboard.", "help"],
      user: ["help"]
    };

    $rootScope.$on("$stateChangeStart", function(evt, to_s, to_p, from_s, from_p){
      $rootScope.pageLoading = true;
      var cu = CurrentUser.current_user;
      if (!cu){
        var cuWatch = $rootScope.$watch("current_user", function(u){
          if (u && u.$resolved){
            cu = u;
            checkNavigation(cu);
            cuWatch();
          }
        });
      }else{
        checkNavigation(cu);
      }

      function checkNavigation(user){
        var roles = user.roles.map(function(d){
          return permissions[d.name];
        });
        roles.push("unauthorized");
        var allowed = [].concat.apply([], roles).map(function(d){ return to_s.name.match(d) ? true : false });
        if (allowed.indexOf(true) == -1){
          evt.preventDefault();
          $state.go("unauthorized");
        }
      }
    });

    $rootScope.$on("$stateChangeSuccess", function(evt, to_s){
      var mod = to_s.name.split(".")[0];
      $rootScope.pageLoading = false;
      angular.element("html").scrollTop(0);
    });

    $rootScope.$on("$stateChangeError", function(evt, to_s, to_p, from_s, from_p, error){
      $rootScope.pageLoading = false;
      console.error(error);
      evt.preventDefault();
    });

    $rootScope.$on("$stateNotFound", function(evt, unfound, from_s, from_p){
      $rootScope.pageLoading = false;
      console.log("state does not exist", unfound);
      evt.preventDefault();
    });
  }

  // resolves --------------------

  choicelists.$inject = ["$stateParams", "ChoiceLists"];
  function choicelists($stateParams, ChoiceLists){
    var id = $stateParams.group_id || $stateParams.id;
    return ChoiceLists.fetch("query", {survey_group_id: id});
  }

  current_user.$inject = ["CurrentUser"];
  function current_user(CurrentUser){
    if (CurrentUser.resolved) return;
    return CurrentUser.fetch();
  }

  devices.$inject = ["$stateParams", "Devices"];
  function devices($stateParams, Devices){
    return Devices.fetch("query", {});
  }

  languages.$inject = ["$stateParams", "Languages"];
  function languages($stateParams, Languages){
    var id = $stateParams.group_id || $stateParams.id;
    return Languages.fetch("query", {survey_group_id: id});
  }

  pouchkey.$inject = ["$stateParams", "PouchKeys"];
  function pouchkey($stateParams, PouchKeys){
    var id = $stateParams.group_id || $stateParams.id;
    return PouchKeys.fetch("get", {survey_group_id: id});
  }

  training.$inject = ["$q", "$stateParams", "PouchKeys", "pdb"];
  function training($q, $stateParams, PouchKeys, pdb) {
    var id = $stateParams.group_id || $stateParams.id;
    return PouchKeys.fetch("get", {survey_group_id: id}).then(function (key) {
      var pouch = pdb.getGroup(id, key.username, key.pwd, key.db_name, key.db_address);

      return pouch.syncDBs().then(function () {
        return $q.all([
          pouch.localSurveyDB.allDocs({include_docs: true}),
          pouch.queryResponses("training/survey-gold", {include_docs: false, reduce: true, group_level: 2})
        ]);
      }).then(function (res) {
        var allSurveys = pdb.mapDocs(res[0]);
        var active = res[1].reduce(function (p,n) {
          if (p.hasOwnProperty(n.key[0])) {
            p[n.key[0]].push(n.key[1]);
          } else {
            p[n.key[0]] = [n.key[1]];
          }
          return p;
        }, {});
        var activeSurveys = Object.keys(active).map(function (d) {
          var match = allSurveys.find(function (b) { return b._id === d });
          match.active_golds = active[d];
          return match;
        });
        return {active: activeSurveys, surveys: allSurveys, pouch: pouch};
      });
    });
  }

  monitoring.$inject = ["$q", "$stateParams", "PouchKeys", "pdb"];
  function monitoring($q, $stateParams, PouchKeys, pdb) {
    var id = $stateParams.group_id || $stateParams.id;
    return PouchKeys.fetch("get", {survey_group_id: id}).then(function (key) {
      var pouch = pdb.getGroup(id, key.username, key.pwd, key.db_name, key.db_address);
      return pouch.syncDBs().then(function () {
        return $q.all([
          pouch.localSurveyDB.allDocs({include_docs: true}),
          pouch.localResponseDB.get("_design/red-flags"),
          pouch.queryResponses("monitoring/operational-date-survey", {group_level: 1}),
          pouch.queryResponses("monitoring/operational-schools", {reduce: true, include_docs: false, group_level: 1}),
          pouch.localSurveyDB.get("schools").catch(function (err) { return null })
        ]);
      }).then(function (res) {
        var schoolReduce = res[3];
        var schoolList = res[4];
        var schoolCount = {
          count: schoolReduce.length,
          target: schoolList ? schoolList.schools.filter(schoolFilter).length : 0
        };
        var flags = res[1].views;
        var calendar = res[2].map(function(d){
          var key = d.key[0];
          d.date = new Date(key);
          d.key = key;
          return d;
        }).sort(function(b,a){
          return a.date - b.date;
        });
        var schemas = pdb.mapDocs(res[0]);
        var active = schemas.filter(function (d) { return d.active });
        return $q.all(active.map(function (d) {
          var options = {include_docs: false, reduce: true, startkey: [d._id], endkey: [d._id,{}], group_level: 2};
          return pouch.queryResponses("monitoring/operational-survey", options);
        })).then(function (countsRes) {
          var counts = [].concat.apply([], countsRes);
          active.forEach(function(d){
            var response_count = counts.find(function(b){ return b.key[0] == d._id && b.key[1] === false});
            var irr_count = counts.find(function(b){ return b.key[0] == d._id && b.key[1] === true});
            d.response_count = response_count ? response_count.value : 0;
            d.irr_count = irr_count ? irr_count.value : 0;
          });
          return pouch.queryResponses("monitoring/operational-date-survey", {startkey: [calendar[0]], endkey:[calendar[0], {}], include_docs: true, reduce: false}).then(function (dayData) {
            return {active: active, schemas: schemas, flags: flags, calendar: calendar, pouch: pouch, dayData: dayData, schoolCount: schoolCount};
          });
        });
      });
    });

    function schoolFilter(d){
      var no_desc = !d.school_name && !d.location_description;
      var schoolFilter = d.school_name && (d.school_name.match("Training School") || d.school_name.match("Dry Run"));
      var locationFilter = d.location_description && (d.location_description.match("Practice") || d.location_description.match("Dry Run"));
      return no_desc || (!schoolFilter && !locationFilter);
      //return (!d.school_name.match("Training School") && !d.school_name.match("Dry Run")) &&
      //(!d.location_description.match !== "Practice" && d.location_description !== "Dry Run");
    }
  }

  dashboard.$inject = ["$q", "$stateParams", "PouchKeys", "pdb"];
  function dashboard($q, $stateParams, PouchKeys, pdb) {
    var id = $stateParams.group_id || $stateParams.id;
    return PouchKeys.fetch("get", {survey_group_id: id}).then(function (key) {
      var pouch = pdb.getGroup(id, key.username, key.pwd, key.db_name, key.db_address);

      return pouch.remoteSurveyDB.allDocs({include_docs: true}).then(function (res) {
        var schemas = pdb.mapDocs(res);
        return {schemas: schemas, pouch: pouch};
      });
    });
  }

  questions.$inject = ["$stateParams", "Questions"];
  function questions($stateParams, Questions){
    if ($stateParams.hasOwnProperty("survey_id")){
      var params = {survey_id: $stateParams.survey_id, section_id: $stateParams.section_id || $stateParams.id, full:true};
    }else{
      var params = {survey_id: $stateParams.id, full:true};
    }
    return Questions.fetch("query", params);
  }

  questionattributes.$inject = ["$stateParams", "QuestionAttributes"];
  function questionattributes($stateParams, QuestionAttributes){
    return QuestionAttributes.fetch("query", { survey_id: $stateParams.survey_id || $stateParams.id });
  }

  questionoptions.$inject = ["$stateParams", "QuestionOptions"];
  function questionoptions($stateParams, QuestionOptions){
    return QuestionOptions.fetch("query", {});
  }

  questiontypes.$inject = ["$stateParams", "QuestionTypes"];
  function questiontypes($stateParams, QuestionTypes){
    return QuestionTypes.fetch("query", {});
  }

  roles.$inject = ["$stateParams", "Roles"];
  function roles($stateParams, Roles){
    return Roles.fetch("query", {});
  }

  section.$inject = ["$stateParams", "Sections"];
  function section($stateParams, Sections){
    var id = $stateParams.section_id || $stateParams.id;
    return Sections.fetch("get", {id: id});
  }

  sections.$inject = ["$stateParams", "Sections"];
  function sections($stateParams, Sections){
    var id = $stateParams.survey_id || $stateParams.id;
    return Sections.fetch("query", {survey_id: id});
  }

  surveyfamilies.$inject = ["$stateParams", "SurveyFamilies"];
  function surveyfamilies($stateParams, SurveyFamilies){
    var id = $stateParams.group_id || $stateParams.id;
    return SurveyFamilies.fetch("query", {survey_group_id: id});
  }

  survey_families_with_info.$inject = ["SurveyFamilies"];
  function survey_families_with_info(SurveyFamilies){
    return SurveyFamilies.fetch("query_all", {all: true});
  }

  surveygroup.$inject = ["$stateParams", "SurveyGroups"];
  function surveygroup($stateParams, SurveyGroups){
    var params = {id: $stateParams.group_id || $stateParams.id};
    return SurveyGroups.fetch("get", params);
  }

  surveygroups.$inject = ["$stateParams", "SurveyGroups"];
  function surveygroups($stateParams, SurveyGroups){
    var id = $stateParams.client_id || $stateParams.id;
    return SurveyGroups.fetch("query", {});
  }

  survey_groups_with_info.$inject = ["$q", "SurveyGroups", "PouchKeys"];
  function survey_groups_with_info($q, SurveyGroups, PouchKeys){
    return SurveyGroups.fetch("query_all", {all: true}).then(function (res) {
      return $q.all(res.map(function (d) {
        return PouchKeys.fetch("get", {survey_group_id: d.id}).then(function (key) {
          d.key = key;
          return d;
        });
      }));
    });
  }

  survey.$inject = ["$stateParams", "Surveys"];
  function survey($stateParams, Surveys){
    var id = $stateParams.survey_id || $stateParams.id;
    return Surveys.fetch("get", {id: id});
  }

  surveys.$inject = ["$stateParams", "Surveys"];
  function surveys($stateParams, Surveys){
    var params = {client_id: $stateParams.client_id, survey_group_id: $stateParams.group_id || $stateParams.id};
    return Surveys.fetch("query", params);
  }

  surveys_with_info.$inject = ["Surveys"];
  function surveys_with_info(Surveys){
    return Surveys.fetch("query_all", {all: true});
  }

  trees.$inject = ["SurveyGroups"];
  function trees(SurveyGroups){
    return SurveyGroups.fetch("query_tree", {tree: true});
  }

  users.$inject = ["$stateParams", "Users"];
  function users($stateParams, Users){
    return Users.fetch("query", {});
  }

}())
