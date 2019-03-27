"use strict";

(function(){
  angular
  .module("formBuilder")
  .service("CurrentUser", CurrentUser)

  CurrentUser.$inject = ["$resource", "$rootScope"];

  function CurrentUser($resource, $rootScope){

    return {
      current_user: null,
      fetch: fetch,
      resolved: false,
      update_current_user: update_current_user,
      parse_abilities: parse_abilities
    };

    function fetch(){
      var self = this;
      return $resource("/api/current_user").get({}, function(res){
        self.resolved = true;
        self.current_user = res;
        $rootScope.current_user = res;
        return res;
      }).$promise;
    }

    function update_current_user(user){
      this.current_user = user;
      $rootScope.current_user = user;
    }

    function parse_abilities(){
      var abilities = this.current_user.abilities.map(function(ab){
        var actions = ab.actions.map(function(ac){
          var verb = ab.can ? "can" : "cannot";
          var subjects = ab.subjects.map(function(sub){
            return [verb, ac, sub].join(" ");
          });
          return [].concat.apply([],subjects);
        });
        return [].concat.apply([],actions);
      });
      return [].concat.apply([],abilities);
    }

  }
}())
