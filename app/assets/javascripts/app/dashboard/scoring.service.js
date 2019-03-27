"use strict";

(function(){
  angular
  .module("dashboard")
  .service("Scorer", Scorer)

  Scorer.$inject = ["dataService"];

  function Scorer(dataService){

    var domain = [0,50,50.0001,70,70.0001,80,80.0001,85,85.0001,90,90.0001,95,95.0001,100];
    var colors = ['#cd5c5c','#cd5c5c','#e89b46','#e89b46','#ffd700','#ffd700','#a2b142','#a2b142' ,'#2e8b57','#2e8b57','#71b19c','#71b19c','#add8e6','#add8e6'];
    // var colors = ["indianred","indianred","sandybrown","sandybrown", "gold","gold","lightgreen","lightgreen","mediumseagreen","mediumseagreen","aquamarine", "aquamarine","lightblue","lightblue"];

    return {
      checkNestedFieldType: checkNestedFieldType,
      formatForTrainingChart: formatForTrainingChart,
      formatForClusterChart: formatForClusterChart,
      colorScale: d3.scale.linear().domain(domain).range(colors),
      rgbaify: rgbaify
    };

    /////////////

    function checkNestedFieldType(path, data, index, shouldBe){
      if (typeof data[path[index]] == shouldBe){
        return data[path[index]];
      }else if (path.length > index){
        data = data[path[index]];
        index++;
        return data ? checkNestedFieldType(path, data, index, shouldBe) : false;
      }else{
        return false;
      }
    }

    function rgbaify(hex, opacity){
      var rgb = d3.rgb(hex);
      return "rgba("+rgb.r+","+rgb.g+","+rgb.b+","+opacity+")";
    }

    function formatForClusterChart(formattedData, task){
      var breaks = this.colorScale.domain().filter(function(d,i){ return (i+1)%2 == 0});
      if (task == "All Subtasks"){
        return breaks.map(function(b, i){
          var dt = formattedData.filter(function(d){ return d.summary.avg <= b/100 && d.summary.avg > (breaks[i-1]/100 || -1) });
          return {
            b: b,
            data: dt,
            count: dt.length
          };
        })
      }else{
        return breaks.map(function(b, i){
          var dt = formattedData.filter(function(d){ return d.sections.hasOwnProperty(task) })
          .filter(function(d){ return d.sections[task].summary.avg <= b/100 &&
             d.sections[task].summary.avg > (breaks[i-1]/100 || -1) });
          return {
            b: b,
            data: dt,
            count: dt.length
          };
        })
      }
    }

    function formatForTrainingChart(dataset, excludeFields){
      var diff = compareData(dataset, excludeFields);
      // if we're comparing survey families
      if (diff.hasOwnProperty("surveys")){
        var sections = {};
        angular.forEach(diff.surveys, function(survey){
          var surveyName = survey.response_info.name//.values[0];

          Object.keys(survey.sections).map(function(s){
            return [ surveyName+": "+s, survey.sections[s] ];
          }).forEach(function(sec){
            sections[sec[0]] = sec[1];
          });

        });
        diff.sections = sections;
        delete diff.surveys;
      // if we're comparing standalone, non-family surveys
      }else{
        var sections = {};
        var surveyName = diff.response_info.survey_name;//.values[0];
        angular.forEach(diff.sections, function(section, sectionName){
          sections[ surveyName+": "+sectionName] = section;
        });
        diff.sections = sections;
      }
      diff.direction = diff.direction.values[0];

      return scoreSurvey(diff);
    }

    function compareData(dataset, excludeFields){
      // get arrays of flattened records, and unique long keys for each object in dataset
      // transform into mashup object
      var flats = dataset.map(function(d){ return dataService.flattenData(d, false) });
      var keystore = flats.map(function(d){ return Object.keys(d) });
      var allKeys = [].concat.apply([], keystore);
      var uniqueKeys = allKeys.filter(function(d,i,self){ return self.indexOf(d) === i });
      var mashup = uniqueKeys.reduce(function(p,n){
        p[n] = {values:[], scores:{}};
        return p;
      }, { names: [], enumids: [] });

      // populate mashup object
      flats.forEach(function(flat){
        var oName = flat["response_info.is_gold"] ? flat["response_info.gold_standard"] : flat["response_info.enumerator_name"];
        mashup.names.push(oName);
        mashup.enumids.push(flat["response_info.enumerator_id"]);
        uniqueKeys.forEach(function(key){
          mashup[key].values.push(flat[key]);
        });
      })

      // remove unneeded keys from mashup here before unflattening
      var dropFields = ["response_info", "doc_type", "modified", "alt_id", "_rev"];
      excludeFields.forEach(function(d){ dropFields.push(d) });
      var keepFields = ["irr_student_code", "school_code", "student_unique_code", "enumerator_id",
          "enumerator_name", "names", "enumids", "survey_uuid", "survey_name", "name", "uuid", "language"];
      var dropThese = new RegExp("("+dropFields.join("|")+")","i");
      var keepThese = new RegExp("("+keepFields.join("|")+")","i");

      uniqueKeys.forEach(function(key){
        if (key.match(dropThese) && !key.match(keepThese)){
          delete mashup[key];
        }
      });
      // reset values after deleting fields
      uniqueKeys = Object.keys(mashup);

      return dataService.unflattenData(scoreData(mashup,uniqueKeys));
    }

    function scoreData(flat, keys){
      // dont score items that end with these strings
      var dontScoreFields = ["_id$", "Full_Response_Grid", "Full_Grid", "Incorrect_Response_Grid", "Incorrect_Count$", "Incorrect_Grid", "_grid_item_", "irr_student_code$", "irr_student_code_confirm$", "student_unique_code$", "school_code$", "enumerator_id$", "enumerator_name$","names$", "enumids$", "survey_uuid$", "survey_name$", "name$", "uuid$", "language$", "_grid_\\d+$", "_grid$"];
      var dontScoreThese = new RegExp("("+dontScoreFields.map(function(d){return d}).join("|")+")", "i");
      var gridKeyMatch = keys.find(function (d) { return d.match("_Incorrect_Response_Index") || d.match("_Incorrect_Index") });
      var gridKey = gridKeyMatch && gridKeyMatch.match("_Incorrect_Response_Index") ? "_Incorrect_Response_Index" : "_Incorrect_Index";
      keys.forEach(function(key){
        // if its not supposed to be scored, set it to enumerators response
        if (key.match(dontScoreThese)){
          flat[key] = flat[key].hasOwnProperty("values") ? (flat[key].values[1] || flat[key].values[0]) : flat[key];
          return;
        };

        if (Array.isArray(flat[key].values[0]) || key.match(gridKey)){
          flat[key].scores = scoreArray(flat[key].values, key, flat, gridKey);
        } else if (key.match("Time_Elapsed$")) {
          flat[key].scores = {
            score: Math.abs(flat[key].values[0] - flat[key].values[1]) < 3 ? 1 : 0,
            outOf:1
          };
        } else {
          flat[key].scores = scoreSimple(flat[key].values);
        }
      });
      return flat;
    }

    function scoreArray(values, key, flat, gridKey){
      if (key.match(gridKey)){
        var fullKey = gridKey === "_Incorrect_Response_Index" ? "_Full_Response_Grid$" : "_Full_Grid$";
        var flatKeys = Object.keys(flat);
        var code = key.split(".").pop().split(gridKey)[0];
        var fullGridCode = flatKeys.find(function(d){return d.match(code+fullKey)});
        var fullGrid = flat[fullGridCode];//.values[0];

        if (!Array.isArray(fullGrid)){
          fullGrid = fullGrid.split("|");
        }
        var lastWordCode = flatKeys.find(function(d){return d.match(code+"_Attempted")});
        var lastWords = flat[lastWordCode].values.map(function(d){return parseInt(d) || -1});
        // ^^^ -1 in case there is no last word

        var moddedArrays = values.map(function(d){
          return Array.isArray(d) ? d :
            d ? d.split("|") : []; // to make sure we're working with arrays
        }).map(function(d){
          return d.map(function(e){
            return parseInt(e) - 1;
          })
        });

        var aLength = Math.max.apply(null,lastWords);
        var gridArray = Array(aLength).fill({});
        return gridArray.map(function(d,i){
          var values = moddedArrays.map(function(b){ return b.indexOf(i) > -1 ? 1 : 0 });
          var score = scoreSimple(values);
          return {
            idx: i,
            character: fullGrid[i],
            values: values,
            score: score
          };
        });

      }else{
        return scoreSimple(values.map(function(d){return d.join("|")}));
        // this could be done better, but good enough for now
        // if not a grid? maybe if a normal multiple choice? unless those get concatenated
      }
    }

    function scoreSimple(values){
      var uniqueValues = values.filter(function(d,i,self){ return self.indexOf(d) === i }).length;
      return {
        score:(uniqueValues == values.length) ? 0 : (values.length/uniqueValues)/values.length,
        outOf:1
      }
    }

    function scoreSurvey(doc){
      scoreSections(doc.sections);
      return summarizeScores(doc);
    }

    function summarizeScores(doc){
      var score = 0, outOf = 0;
      angular.forEach(doc.sections, function(section, k){
        score += section.summary.score;
        outOf += section.summary.outOf;
      });
      doc.summary = {score: score, outOf: outOf, avg:score/outOf};
      return doc;
    }

    function scoreSections(sections){
      angular.forEach(sections, function(section, k){
        var score = 0, outOf = 0;
        if (!section) return;
        angular.forEach(section, function(question){
          if (!question) return;
          if (question.hasOwnProperty("scores") && (Array.isArray(question.scores) || Object.keys(question.scores).length > 0)){
            if (Array.isArray(question.scores)){
              angular.forEach(question.scores,function(s){
                score += s.score.score;
                outOf += s.score.outOf;
              });
            }else{
              score += question.scores.score;
              outOf += question.scores.outOf;
            }
          }
        });
        section.summary = {score: score, outOf: outOf, avg:score/outOf};
      })
      return sections;
    }

  }
}())
