"use strict";

(function(){
  angular
  .module("dashboard")
  .service("downloadService", downloadService)

  downloadService.$inject = ["$q", "dataService"];

  function downloadService($q, dataService){
    return {
      download: download
    };

    function download(name, promises, surveys, schemas){
      return $q.all(promises).then(function(datasets){
        var zip = new JSZip();
        datasets.forEach(function(dataset, i){
          var ds = [].concat.apply([], dataset);
          if (ds.length > 0){
            var schema = schemas.find(function (d) { return ds[0].response_info.survey_uuid === d._id});
            var td = flattenSchema(schema, schemas);
            var data = dataService.prepareForExport(ds, td.t);
            var blob = alasql('SELECT * INTO CSV("'+surveys[i].survey_info.name+'.csv",{headers:true,separator:","}) FROM?', [data]);
            var dictionary = alasql('SELECT * INTO CSV("DICTIONARY '+surveys[i].survey_info.name+'.csv",{headers:true,separator:","}) FROM?', [d3.csv.parse(d3.csv.format(td.d))]);
            zip.file(surveys[i].survey_info.name+".csv", blob);
            zip.file("DICTIONARY "+surveys[i].survey_info.name+".csv", dictionary);
          }
        });

        return zip.generateAsync({type: "blob"}).then(function(content){
          saveAs(content, name+".zip");
        });
      });
    }

    function flattenSchema(schema, schemas) {
      var template = ["doc_id", "student_unique_code", "school_code", "survey_uuid", "survey_name", "survey_iteration", "enumerator_id", "enumerator_name", "app_version", "longitude", "latitude", "accuracy", "has_consent", "grade", "training_entry", "gold_standard", "irr_entry", "irr_student_code", "survey_started", "survey_finished", "exit"];
      var dictionary = [];
      if (schema.survey_info.hasOwnProperty("surveys")) {
        var surveys = schema.survey_info.surveys.map(function (d) {
          return schemas.find(function (s) { return s._id === d.uuid });
        });
        surveys.forEach(function (s) {
          appendSurveyToTemplate(s, template, dictionary);
        });
      } else {
        appendSurveyToTemplate(schema, template, dictionary);
      }
      return {t: template, d: dictionary};
    }

    function appendSurveyToTemplate(survey, template, dictionary) {
      template.push([survey._id, "iteration"].join("."));
      template.push([survey._id, "survey_order"].join("."));
      survey.sections.forEach(function (section) {
        appendSectionToTemplate(section, survey, template, dictionary);
      });
    }

    function appendSectionToTemplate(section, survey, template, dictionary) {
      var translations = survey.translations.language;
      var formTranslated = parseTranslations(section.questions.form, translations);
      var schemaTranslated = parseTranslations(section.questions.schema, translations);

      Object.keys(section.questions.schema.properties).forEach(function (key) {
        var schema = schemaTranslated.properties[key];
        var form = formTranslated.find(function (f) { return f.key === key });
        if (schema.type === "array") {
          var grid = form && form.fieldHtmlClass === "grid-item";
          if (grid) {
            ["Attempted", "Autostopped", "Manual_Stop", "Time_Elapsed", "Incorrect_Count"].forEach(function (k) {
              var gridkey = [key, k].join("_")
              template.push(gridkey);
              dictionary.push({
                key: gridkey,
                type: k === "Autostopped" || k === "Manual_Stop" ? "boolean" : "integer",
                label: schema.title
              });
            });
            form.titleMap.forEach(function (t) {
              var itemkey = [key, "item", t.value].join("_");
              template.push(itemkey);
              dictionary.push({
                key: itemkey,
                type: "gridcell",
                label: t.name,
                option_1_value: "1",
                option_1_label: "correct",
                option_2_value: "0",
                option_2_label: "incorrect",
                option_3_value: "-999",
                option_3_label: "not attempted"
              });
            });
          } else {
            var dObj = {
              key: key,
              type: schema.type,
              label: schema.title
            };
            if (form.hasOwnProperty("titleMap")) {
              form.titleMap.forEach(function (t, i) {
                dObj["option_"+(i+1)+"_value"] = t.value;
                dObj["option_"+(i+1)+"_label"] = t.name;
              });
            }
            dictionary.push(dObj);
            form.titleMap.forEach(function (t) {
              var itemkey = [key, "item", t.value].join("_");
              template.push(itemkey);
              dictionary.push({
                key: itemkey,
                type: "binary",
                label: t.name,
                option_1_value: "1",
                option_1_label: "selected"
              });
            });
          }
        } else {
          template.push(key);
          var dObj = {
            key: key,
            type: schema.type,
            label: schema.title
          };
          if (form.hasOwnProperty("titleMap")) {
            form.titleMap.forEach(function (t, i) {
              dObj["option_"+(i+1)+"_value"] = t.value;
              dObj["option_"+(i+1)+"_label"] = t.name;
            });
          }
          dictionary.push(dObj);
        }
      });
      ["Auto_Stop", "Skipped"].forEach(function (k) {
        var skey = [section.code, k].join("_")
        template.push(skey);
        var dObj = {key: skey, type: "boolean"};
      });
      ["$time.start", "$time.end", "$time.duration"].forEach(function (k) {
        template.push([section.code, k].join("."));
      });
    }

    function parseTranslations(item, translations) {
      // this regex will match all the keys from the translations, whole word only
      // used to substitute translation placeholders with the content they should have
      var translationKeys = Object.keys(translations);
      var keyRegex = new RegExp("\\b(" + translationKeys.join("|") + ")\\b", "g");
      var stripHtml = new RegExp(/(<)(.*?)(>)/g);

      return JSON.parse(JSON.stringify(item), function (k, v) {
        if (typeof v === "string") {
          var matched = v.match(keyRegex);
          if (matched) {
            for (var i = 0; i < matched.length; i++) {
              v = v.replace(matched[i], translations[matched[i]]).replace(stripHtml, "");
            }
          }
        }
        return v;
      });
    }

  }
}())
