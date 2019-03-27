"use strict";

(function(){
  angular
  .module("dashboard")
  .service("dataService",dataService)

  dataService.$inject = [];

  function dataService(){

    var ds = {};

    ds.flattenData = flattenData;
    ds.unflattenData = unflattenData;
    ds.prepareForExport = prepareForExport;

    return ds;

    //////////////////////////

    function flattenData(target, shortKeys){
      var delimiter = ".";
      var output = {};

      function step(object, prev, currentDepth){
        currentDepth = currentDepth ? currentDepth : 1;
        Object.keys(object).forEach(function(key){
          var value = object[key];
          var isarray = Array.isArray(value);
          var type = Object.prototype.toString.call(value);
          var isobject = (
            type === "[object Object]" ||
            type === "[object Array]"
          )
          // var newkey = prev ? prev + delimiter + key : key;
          // var newkey = key;
          if (shortKeys){
            var newkey = key;
          }else{
            var newkey = prev ? prev + delimiter + key : key;
          }
          if (!isarray && isobject && Object.keys(value).length){
            return step(value, newkey, currentDepth + 1);
          }else if (isarray && newkey.match("_Incorrect_Response_Index")){
            var fullgridlength = object[key.replace("_Incorrect_Response_Index", "_Full_Response_Grid")].length;
            var lastRead = object[key.replace("_Incorrect_Response_Index", "_Attempted")];
            for (var i = 0; i < fullgridlength; i++){
              var gkey = newkey.replace("_Incorrect_Response_Index", "_grid_item_"+(i+1));
              output[gkey] = value.indexOf((i+1).toString()) > -1 ? 0 :
                i >= lastRead ? -999 : 1;
            }
            
            value = value.join("|");
          }else if (isarray && newkey.match("_Incorrect_Index")){
            var fullgridlength = object[key.replace("_Incorrect_Index", "_Full_Grid")].length;
            var lastRead = object[key.replace("_Incorrect_Index", "_Attempted")];
            for (var i = 0; i < fullgridlength; i++){
              var gkey = newkey.replace("_Incorrect_Index", "_grid_item_"+(i+1));
              output[gkey] = value.indexOf((i+1).toString()) > -1 ? 0 :
                i >= lastRead ? -999 : 1;
            }

            value = value.join("|");
          }else if (isarray){
            for (var i = 0; i < value.length; i++) {
              var gkey = [newkey, value[i]].join("_");
              output[gkey] = 1;
            }
            value = value.join("|");
          }
          output[newkey] = value;
        })
      }
      step(target);
      return output;
    }

    function unflattenData(target) {

      var delimiter = ".";
      var result = {}

      if (Object.prototype.toString.call(target) !== '[object Object]') {
        return target
      }

      // safely ensure that the key is
      // an integer.
      function getkey(key) {
        var parsedKey = Number(key)

        return (
          isNaN(parsedKey) ||
          key.indexOf('.') !== -1
        ) ? key
          : parsedKey
      }

      Object.keys(target).forEach(function(key) {
        var split = key.split(delimiter)
        var key1 = getkey(split.shift())
        var key2 = getkey(split[0])
        var recipient = result

        while (key2 !== undefined) {
          var type = Object.prototype.toString.call(recipient[key1])
          var isobject = (
            type === "[object Object]" ||
            type === "[object Array]"
          )

          // do not write over falsey, non-undefined values if overwrite is false
          if (!isobject && typeof recipient[key1] !== 'undefined') {
            return
          }

          if ( recipient[key1] == null) {
            recipient[key1] = (
              typeof key2 === 'number' ? [] : {}
            )
          }

          recipient = recipient[key1]
          if (split.length > 0) {
            key1 = getkey(split.shift())
            key2 = getkey(split[0])
          }
        }

        // unflatten again for 'messy objects'
        recipient[key1] = unflattenData(target[key])
      })

      return result
    }

    function prepareForExport(dataset, template){
      // var flatData = dataset.map(function(d){return ds.flattenData(d, true)});
      var flatData = dataset.map(function (d) { return flattenData2(d, true) }).map(function (d) {
        return Object.keys(d).filter(function (k) { return template.indexOf(k) > -1}).reduce(function (p,n) {
          p[n] = d[n];
          return p;
        }, {});
      });
      var tempRecord = template.reduce(function (p,n) {
        p[n] = '';
        return p;
      }, {});
      flatData.splice(0, 0, tempRecord);
      var formattedCSV = d3.csv.format(flatData);
      // format csv so that all the keys are included in each,
      // then re-parse to json so they are all included in export
      return d3.csv.parse(formattedCSV);
    }

    function flattenData2(target, shortKeys) {
      var delimiter = ".";
      var output = {};

      function step(object, prev, currentDepth){
        currentDepth = currentDepth ? currentDepth : 1;
        Object.keys(object).forEach(function(key){
          var value = object[key];
          var isarray = Array.isArray(value);
          var type = Object.prototype.toString.call(value);
          var isobject = (
            type === "[object Object]" ||
            type === "[object Array]"
          )
          if (shortKeys){
            var newkey = key;
          }
          if (!isarray && isobject && key.match(/\$time/)) {
            Object.keys(value).forEach(function (k) {
              var timekey = [prev,key,k].join(".")
              output[timekey] = value[k];
            });
          }
          if (!isarray && isobject && key.match(/response_info$/) && !value.hasOwnProperty('doc_id')) {
            ["iteration", "survey_order"].forEach(function (k) {
              var infokey = [prev, k].join(".");
              output[infokey] = value[k];
            });
          }
          if (!isarray && isobject && Object.keys(value).length){
            return step(value, newkey, currentDepth + 1);
          }else if (isarray && newkey.match("_Incorrect_Response_Index")){
            var fullgridlength = object[key.replace("_Incorrect_Response_Index", "_Full_Response_Grid")].length;
            var lastRead = object[key.replace("_Incorrect_Response_Index", "_Attempted")];
            for (var i = 0; i < fullgridlength; i++){
              var gkey = newkey.replace("_Incorrect_Response_Index", "_item_"+(i+1));
              output[gkey] = value.indexOf((i+1).toString()) > -1 ? 0 :
                i >= lastRead ? -999 : 1;
            }
            value = value.join("|");
          }else if (isarray && newkey.match("_Incorrect_Index")){
            var fullgridlength = object[key.replace("_Incorrect_Index", "_Full_Grid")].length;
            var lastRead = object[key.replace("_Incorrect_Index", "_Attempted")];
            for (var i = 0; i < fullgridlength; i++){
              var gkey = newkey.replace("_Incorrect_Index", "_item_"+(i+1));
              output[gkey] = value.indexOf((i+1).toString()) > -1 ? 0 :
                i >= lastRead ? -999 : 1;
            }
            value = value.join("|");
          }else if (isarray){
            for (var i = 0; i < value.length; i++) {
              var gkey = [newkey, "item", value[i]].join("_");
              output[gkey] = 1;
            }
            value = value.join("|");
          }
          output[newkey] = value;
        })
      }
      step(target);
      return output;
    }

  }
}())
