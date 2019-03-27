"use strict";

(function(){
  angular
  .module("surveyGroups")
  .directive("surveyGroupForm", SurveyGroupForm)

  SurveyGroupForm.$inject = ["$q", "Flash", "pdb"];

  function SurveyGroupForm($q, Flash, pdb){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope:{
        group: "=",
        languages: "="
      },
      templateUrl: "survey_groups/_form.html"
    };
    return directive;

    function link(scope, el){

      scope.delete = deleteGroup;
      scope.submit = submitGroup;

      function submitGroup(){
        if (scope.group.hasOwnProperty("id")){
          updateGroup().then(function(group){
            return updateLanguages(group.id);
          }).then(function(languages){
            scope.$emit("survey-group-updated", scope.group, scope.languages);
          });
        }else{
          saveGroup().then(function(group){
            scope.group = group;
            return updateLanguages(group.id);
          }).then(function(languages){
            scope.$emit("survey-group-created", scope.group, languages)
          });
        }
      }

      function deleteGroup(){
        scope.group.$delete({id: scope.group.id}, function(group){
          scope.$emit("survey-group-deleted", group);
        }, function(err){
          console.log(err);
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error deleting Cohort. Survey Group "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        });
      }

      function updateGroup(){
        return scope.group.$update({id: scope.group.id}, function(group){
          return group;
        }, function(err){
          console.log(err);
          Flash.create("danger", "<i class=\"fa fa-fw fa-warning\"></i> Error updating Cohort. Survey Group "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
        });
      }

      function saveGroup(){
        var start = Flash.create('info', "<div class=\"margin-center text-center\"><i class=\"fa fa-fw fa-refresh fa-spin fa-5x\"></i></div><div class=\"margin-top-15 text-center\">Creating Cohort</div>", 0, {class:"full-screen"});
        return scope.group.$save({}, function(group){
          Flash.dismiss(start);
          if (!group.messages) return group;
          var cloudantMessages = Object.keys(group.messages).map(function(k){
            var g = group.messages[k];
            g.where = k;
            return g;
          }).filter(function(g){
            return !g.body.hasOwnProperty("ok");
          }).map(function(d){
            return "<i class=\"fa fa-fw fa-warning\"></i> "+d.code+" error in "+d.where+": "+d.body.reason;
          });
          if (cloudantMessages.length > 0){
            Flash.create('warning', cloudantMessages.join("<br>"), 3000, {class:"full-screen"});
          }
          return group;
        }).then(function(group){
          var pouch = pdb.getGroup(group.id, group.pouch_key.username, group.pouch_key.pwd, group.pouch_key.db_name, group.pouch_key.db_address);
          var ddocs = pdb.viewTemplates().map(function(ddoc){
            return pouch.remoteResponseDB.put(ddoc);
          });
          return $q.all(ddocs).then(function(){
            return group;
          }).catch(function (err) {
            console.log(err);
            return group;
          });
        });
      }

      function updateLanguages(group_id){
        var promises = [];
        scope.languages.forEach(function(language){
          language.survey_group_id = group_id;
          promises.push(updateLanguage(language));
        });
        return $q.all(promises);
      }

      function updateLanguage(language){
        if (language.markForDeletion){
          return language.$delete({id: language.id}, function(l){
            return l;
          }, function(err){
            console.log(err);
            Flash.create('warning', "<i class=\"fa fa-fw fa-warning\"></i> Error deleting Language \""+language.name+"\". Language "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
          });
        }else if (language.hasOwnProperty("id")){
          return language.$update({id: language.id}, function(l){
            return l;
          }, function(err){
            console.log(err);
            Flash.create('warning', "<i class=\"fa fa-fw fa-warning\"></i> Error updating Language \""+language.name+"\". Language "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
          });
        }else{
          return language.$save({}, function(l){
            return l;
          }, function(err){
            console.log(err);
            Flash.create('warning', "<i class=\"fa fa-fw fa-warning\"></i> Error saving Language \""+language.name+"\". Language "+err.statusText.toLowerCase()+".", 3000, {class:"full-screen"});
          });
        }
      }

    }

  }
}())
