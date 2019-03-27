"use strict";

(function(){
  angular
  .module("surveys")
  .factory("SchemaFactory", SchemaFactory)

  SchemaFactory.$inject = ["$resource"];

  function SchemaFactory($resource){
    return $resource("/api/schemas/:id.json",{},{
      update:{method:"PUT"},
      upload_schema: {
        method: "POST",
        url: "/api/schemas/upload_schema.json"
      }
    })
  }

}())
