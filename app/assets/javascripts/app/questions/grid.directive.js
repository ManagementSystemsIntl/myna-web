"use strict";

(function () {
  angular
  .module("questions")
  .directive("gridInput", GridInput)

  GridInput.$inject = [];

  function GridInput(){

    var directive = {
      link: link,
      replace: true,
      restrict: "A",
      scope: {
        gridString: "@",
        direction: "@",
        inputtype: "@"
      },
      templateUrl: "questions/_grid.html"
    };
    return directive;

    function link(scope, el){
      scope.grid;
      scope.items = 5;
      scope.addRow = addRow;
      scope.removeRow = removeRow;
      scope.emitUpdate = emitUpdate;

      scope.$watch("inputtype", function (n,o) {
        scope.grid = hydrateGrid(scope.gridString);
      }, true);

      var gridWatch = scope.$watch("gridString", function (n,o) {
        if (n == "")  {
          scope.grid = [Array.apply(null, Array(scope.items)).map(function () {})];
        } else {
          scope.grid = hydrateGrid(n);
        }
        gridWatch();
      });

      scope.$on("update-grid", function (res, gridString) {
        console.log("here")
        scope.grid = gridString ? hydrateGrid(gridString) : [Array.apply(null, Array(scope.items)).map(function () {})];
      });

      function addRow() {
        scope.grid.push(Array.apply(null, Array(scope.items)).map(function () {}));
      }

      function removeRow(idx) {
        scope.grid.splice(idx, 1);
        emitUpdate();
      }

      function emitUpdate(cell, cIdx, pIdx) {
        if (cell) {
          scope.grid[pIdx][cIdx] = cell;
        } else if (cIdx) {
          scope.grid[pIdx][cIdx] = undefined;
        }
        return scope.$emit("grid-update", concatGrid(scope.grid));
      }

      function concatGrid(grid) {
        return grid.map(function (row) { return row.filter(function (d){ return d }).join("--") }).filter(function (d) { return d.length > 0 }).join("--");
      }

      function hydrateGrid(grid) {
        var delimeter = grid.match("--") ? "--" : " ";
        return grid.split(delimeter).reduce(function (p,n,i,a) {
          if (i === 0 || i%scope.items === 0) {
            var row = [n];
            p.push(row);
          } else {
            var row = p[p.length - 1];
            row.push(n);
          }
          if (i === a.length-1 && row.length !== scope.items) {
            var diff = scope.items - row.length;
            for (var b = 0; b<diff; b++) {
              row.push(undefined);
            }
          }
          return p;
        }, []);
      }

    }
  }
}())
