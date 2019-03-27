"use strict";

(function(){
  angular
  .module("management")
  .service("Users", Users)

  Users.$inject = ["UserFactory"];

  function Users(UserFactory){

    return {
      get: get,
      fetch: fetch,
      users: [],
      removeUser: removeUser,
      replaceUser: replaceUser
    };

    ////////

    function get(user_id){
      return !user_id ? this.users : this.users.find(function(d){ return d.id == user_id });
    }

    function fetch(type, params){
      var self = this;
      return UserFactory[type](params, function(res){
        if (type == "query"){
          self.users = res;
        }else if (type == "get"){
          self.replaceUser(res);
        }
        return res;
      }).$promise;
    }

    function replaceUser(user){
      var idx = this.users.map(function(d){ return d.id }).indexOf(user.id);
      if (idx > -1){
        this.users[idx] = user;
      }else{
        this.users.push(user);
      }
    }

    function removeUser(user){
      var idx = this.users.map(function(d) {return d.id }).indexOf(user.id);
      this.users.splice(idx, 1);
    }

  }
}())
