"use strict";

(function(){
  angular
  .module("formBuilder")
  .service("pdb", pdb)

  pdb.$inject = ["$q", "pouchDB"];

  function pdb($q, pouchDB){

    return {
      getGroup: getGroup,
      groups: {},
      mapDocs: mapDocs,
      viewTemplates: viewTemplates
    };

    //////////////////////

    function getGroup(group_id, pouch_user, pouch_pwd, db_name, db_address){
      if (!this.groups.hasOwnProperty("g"+group_id)){
        this.groups["g"+group_id] = setUpGroup(group_id, pouch_user, pouch_pwd, db_name, db_address);
      }
      return this.groups["g"+group_id];
    }

    function setUpGroup(group_id, pouch_user, pouch_pwd, db_name, db_address){
      var g = {};
      g.localSurveyDB = new PouchDB("surveyDB_"+group_id);
      g.localResponseDB = new PouchDB("responseDB_"+group_id);
      g.remoteSurveyDB = new PouchDB("https://"+pouch_user+":"+pouch_pwd+"@"+db_address+"/"+db_name+"_schemas");
      g.remoteResponseDB = new PouchDB("https://"+pouch_user+":"+pouch_pwd+"@"+db_address+"/"+db_name+"_responses");

      g.getSurveys = getSurveys;
      g.getResponses = getResponses;
      g.getDesginDocs = getDesginDocs;
      g.syncDBs = syncDBs;
      g.changeStatus = changeStatus;
      g.allDocsResponses = allDocsResponses;
      g.queryResponses = queryResponses;
      g.querySurveys = querySurveys;
      g.bulkUpdate = bulkUpdate;
      g.bulkQuery = bulkQuery;

      return g;
    }

    function getSurveys(){
      var g = this;
      return g.remoteSurveyDB.replicate.to(g.localSurveyDB, {
        retry:true
      }).on("complete", function(res){
        console.log("surveys updated", res);
        return "ok";
      }).on("error", function(err){
        console.log("error syncing surveys", err);
        return err;
      })
    }

    function getResponses(){
      var g = this;
      return g.remoteResponseDB.replicate.to(g.localResponseDB, {
        retry:true
      }).on("complete", function(res){
        console.log("responses updated", res);
        return "ok";
      }).on("error", function(err){
        console.log("error syncing responses", err);
        return err;
      })
    }

    function getDesginDocs(){
      var g = this;
      var params = {startkey:"_design",endkey:"_design0",include_docs:true};
      var promises = [g.remoteSurveyDB.allDocs(params),g.remoteResponseDB.allDocs(params)];
      return $q.all(promises).then(function(res){
        return res.map(mapDocs).reduce(function(p,n,i){
          if (i==0){
            p.surveys = n;
          }else if(i==1){
            p.responses = n;
          }
          return p;
        },{})
      })
    }

    function syncDBs(){
      var g = this;
      var promises = [g.getResponses(), g.getSurveys()];
      return $q.all(promises);
    }

    function bulkQuery(queries, options){
      var g = this;
      var promises = [];
      angular.forEach(queries,function(query){
        promises.push(g.queryResponses(query, options));
      })
      return $q.all(promises);
    }

    function changeStatus(uuid, active, deleted){
      var g = this;
      return g.remoteSurveyDB.get(uuid).then(function(doc){
        doc.active = active;
        if (deleted){
          doc.deleted = true;
        }
        return g.remoteSurveyDB.put(doc);
      })
    }

    function queryResponses(view,options,attach_view){
      var g = this;
      return g.localResponseDB.query(view,options)
      .then(function(res){
        if (attach_view){
          var a = view.split("/")[1];
          var o = {};
          o[a] = mapDocs(res);
          return o;
        }else{
          return mapDocs(res);
        }
      }).catch(function(err){
        console.log("err", err, view, options);
        return err;
      })
    }

    function querySurveys(view,options){
      var g = this;
      return g.localSurveyDB.query(view,options)
      .then(function(res){
        return mapDocs(res);
      }).catch(function(err){
        console.log("err", err, view, options);
        return err;
      })
    }

    function allDocsResponses(options){
      var g = this;
      return g.localResponseDB.allDocs(options)
      .then(function(res){
        return mapDocs(res);
      }).catch(function(err){
        console.log("err", err);
        return err;
      })
    }

    function bulkUpdate(docs){
      var g = this;
      return g.localResponseDB.bulkDocs(docs).then(function(res){
        g.localResponseDB.replicate.to(g.remoteResponseDB, {
          retry: true
        }).on("complete", function(info){
          console.log("change replicated in remote");
        }).on("error", function(err){
          console.log(err);
        })
      })
    }

    function mapDocs(response){
      if (response.hasOwnProperty("results")){
        return response.results.map(function(d){ return d.docs[0].ok });
      }else{
        return response.rows.map(function(d){
          return d.hasOwnProperty("doc") ? d.doc : d;
        });
      }
    }

    function viewTemplates(){
      return [
        {
          "_id": "_design/download",
            "language": "javascript",
            "views": {
              "omitted": {
                "map": "function (doc) {\n   if (doc.response_info.omit){\n        emit(doc.response_info.survey_uuid, 1);\n   }\n}",
                "reduce": "_count",
                "alias": "Omitted Records"
              },
              "gold": {
                "map": "function (doc) {\n    if (doc.response_info.is_gold && !doc.response_info.omit){\n        emit(doc.response_info.survey_uuid, 1);\n    }\n}",
                "reduce": "_count",
                "alias": "Gold Standards"
              },
              "operational": {
                "alias": "Operational Data",
                "map": "function (doc) {\n    var not_training = !doc.response_info.training_entry;\n    var not_omitted = !doc.response_info.omit;\n    var not_gold = !doc.response_info.is_gold;\n    var not_exited = !doc.response_info.exit;\n    var has_consent = doc.response_info.has_consent;\n    if (not_training && not_omitted && not_gold && not_exited && has_consent){\n        emit(doc.response_info.survey_uuid, 1);\n    }\n}",
                "reduce": "_count"
              },
              "training-practice": {
                "alias": "Training (Practice)",
                "map": "function (doc) {\n    var is_training = doc.response_info.training_entry;\n    var not_omitted = !doc.response_info.omit;\n    var not_gold = !doc.response_info.is_gold;\n    var not_exited = !doc.response_info.exit;\n    var has_consent = doc.response_info.has_consent;\n    if (is_training && not_omitted && not_gold && not_exited && has_consent){\n        if (doc.response_info.gold_standard == \"Practice\"){\n            emit(doc.response_info.survey_uuid, 1);\n        }\n    }\n}",
                "reduce": "_count"
              },
              "training-gold": {
                "map": "function (doc) {\n    var is_training = doc.response_info.training_entry;\n    var not_omitted = !doc.response_info.omit;\n    var not_gold = !doc.response_info.is_gold;\n    var not_exited = !doc.response_info.exit;\n    var has_consent = doc.response_info.has_consent;\n    if (is_training && not_omitted && not_gold && not_exited && has_consent){\n        if (doc.response_info.gold_standard !== \"Practice\"){\n            emit(doc.response_info.survey_uuid, 1);\n        }\n    }\n}",
                "alias": "Training (against Gold Standards)",
                "reduce": "_count"
              },
              "incomplete": {
                "alias": "Incomplete Records",
                "map": "function (doc) {\n    var not_omitted = !doc.response_info.omit;\n    var exited = doc.response_info.exit;\n    var unfinished = !doc.response_info.survey_finished;\n    if ((not_omitted && exited) || (not_omitted && unfinished)){\n        emit(doc.response_info.survey_uuid, 1);\n    }\n}",
                "reduce": "_count"
              }
            }
        },
        {
          "_id": "_design/monitoring",
          "language": "javascript",
          "views": {
            "operational-date-survey": {
              "alias": "Operational by Date",
              "reduce": "_count",
              "map": "function (doc) {\n    var not_training = !doc.response_info.training_entry;\n    var not_omitted = !doc.response_info.omit;\n    var not_gold = !doc.response_info.is_gold;\n    var not_exited = !doc.response_info.exit;\n    var has_consent = doc.response_info.has_consent;\n    if (not_training && not_omitted && not_gold && not_exited && has_consent){\n        emit([doc.response_info.survey_started.split(\" \").slice(1,4).join(\" \"), doc.response_info.survey_uuid], 1);\n    }\n}"
            },
            "operational-survey": {
              "alias": "Operational by Survey",
              "map": "function (doc) {\n    var not_training = !doc.response_info.training_entry;\n    var not_omitted = !doc.response_info.omit;\n    var not_gold = !doc.response_info.is_gold;\n    var not_exited = !doc.response_info.exit;\n    var has_consent = doc.response_info.has_consent;\n    var is_irr = doc.response_info.irr_entry || false;\n    if (not_training && not_omitted && not_gold && not_exited && has_consent){\n        emit([doc.response_info.survey_uuid, is_irr], 1);\n    }\n}",
              "reduce": "_count"
            },
            "search-id": {
              "alias": "Search by ID or Alternate ID",
              "map": "function(doc) {\r\n    if (doc.alt_id) {\r\n        emit(doc.alt_id, 1);\r\n    } else {\r\n        emit(doc._id, 1);\r\n    }\r\n}"
            },
            "operational-student-irr": {
              "map": "function (doc) {\n    var not_training = !doc.response_info.training_entry;\n    var not_omitted = !doc.response_info.omit;\n    var not_gold = !doc.response_info.is_gold;\n    var not_exited = !doc.response_info.exit;\n    var has_consent = doc.response_info.has_consent;\n    var is_irr = doc.response_info.irr_entry || false;\n    if (not_training && not_omitted && not_gold && not_exited && has_consent){\n        emit([is_irr, doc.response_info.survey_started.split(\" \").slice(1,4).join(\" \"), doc.response_info.student_unique_id], 1);\n    }\n}",
              "alias": "Operational by Student Unique ID and IRR"
            },
            "operational-date-student": {
              "reduce": "_count",
              "map": "function (doc) {\n    var not_training = !doc.response_info.training_entry;\n    var not_omitted = !doc.response_info.omit;\n    var not_gold = !doc.response_info.is_gold;\n    var not_exited = !doc.response_info.exit;\n    var has_consent = doc.response_info.has_consent;\n    var is_irr = doc.response_info.irr_entry || false;\n    if (not_training && not_omitted && not_gold && not_exited && has_consent){\n        var student_code = is_irr ? doc.response_info.irr_student_code : doc.response_info.student_unique_code;\n        emit([doc.response_info.survey_started.split(\" \").slice(1,4).join(\" \"), student_code], 1);\n    }\n}"
            },
            "operational-schools": {
              "reduce": "_count",
              "map": "function (doc) {\r\n    var not_training = !doc.response_info.training_entry;\r\n    var not_omitted = !doc.response_info.omit;\r\n    var not_gold = !doc.response_info.is_gold;\r\n    var not_exited = !doc.response_info.exit;\r\n    var has_consent = doc.response_info.has_consent;\r\n    if (not_training && not_omitted && not_gold && not_exited && has_consent){\r\n        emit(doc.response_info.school_code, 1);\r\n    }\r\n}"
            }
          }
        },
        {
          "_id": "_design/red-flags",
          "language": "javascript",
          "views": {}
        },
        {
          "_id": "_design/training",
          "language": "javascript",
          "views": {
            "survey-gold": {
              "map": "function (doc) {\n    var training = doc.response_info.training_entry;\n    var not_omitted = !doc.response_info.omit;\n    var not_gold = !doc.response_info.is_gold;\n    var not_exited = !doc.response_info.exit;\n    if (training && not_omitted && not_gold && not_exited){\n        if (doc.response_info.gold_standard !== \"Practice\"){\n            emit([doc.response_info.survey_uuid, doc.response_info.gold_standard], 1);\n        }\n    }\n}",
              "alias": "Training by Survey and Gold",
              "reduce": "_count"
            },
            "find-gold": {
              "alias": "Find Gold Standard by Survey",
              "map": "function (doc) {\n    if (doc.response_info.is_gold && !doc.response_info.omit){\n        emit([doc.response_info.survey_uuid, doc.response_info.gold_standard], 1);\n    }\n}",
              "reduce": "_count"
            },
            "enumerator-gold": {
              "alias": "Find GS Trainings by Enumerator",
              "map": "function (doc) {\n    var training = doc.response_info.training_entry;\n    var not_omitted = !doc.response_info.omit;\n    var not_gold = !doc.response_info.is_gold;\n    var not_exited = !doc.response_info.exit;\n    if (training && not_omitted && not_gold && not_exited){\n        if (doc.response_info.gold_standard !== \"Practice\"){\n            emit([doc.response_info.enumerator_id, doc.response_info.survey_uuid, doc.response_info.gold_standard], 1);\n        }\n    }\n}",
              "reduce": "_count"
            }
          }
        }
      ];
    }

  }
}())
