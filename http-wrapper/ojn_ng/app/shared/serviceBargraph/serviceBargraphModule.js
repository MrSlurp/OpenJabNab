'use strict';

define([
    'angular',
    'd3',
    'nvd3',
    'nvd3directives',
    

], function (angular, angularRoute) {
    angular.module('serviceBargraphDirective', ['nvd3ChartDirectives'])
    .directive('serviceBargraphPercent', function () {
        return {
            scope: {
                serviceData: "=",
                xaxisLabel:"@",
            },
            controller: [
                '$scope',
                '$element',
                '$attrs',
                function ($scope, $element, $attrs) {
                    var colorFamilies = {
                        Residential: "#459f35",
                        Industrial: "#eeb41c",
                        Commercial: "#008bdc",
                        Office: "#00e6f0",
                        Player: "#7a7a7a",
                    };

                    $scope.xAxisTickFormatFunction = function () {
                        return function (d) {
                            return d;
                        }
                    }
                    $scope.xFunction = function () {
                        return function (d) {
                            return d[0];
                        };
                    }
                    $scope.yFunction = function () {
                        return function (d) {
                            return d[1];
                        };
                    }
                    $scope.colorFunction = function () {
                        return function (d, i) {
                            var color = "#000000";
                            if (colorFamilies[d.key])
                                color = colorFamilies[d.key];
                            return color;
                        };
                    }
                    $scope.toolTipContentFunction = function () {
                        return function (name, x, y, e, graph) {
                            return '<h3>' + name + '</h3>' + '<p>' + y + ' % </p>' +
                                    '<p>' + e.series.tooltipDetail + '</p>';
                        }
                    }

                    $scope.$watch('serviceData', function () {
                        $scope.adaptedData = [];
                        if (!$scope.serviceData
                            || !$scope.serviceData.Categories) {
                            return;
                        }
                        //console.log(JSON.stringify($scope.jobData));
                        for (var cat in $scope.serviceData.Categories) {
                            var category = $scope.serviceData.Categories[cat];
                            var newEntry = {
                                key: $scope.serviceData.Categories[cat].Name,
                                values: [
                                    [$attrs.xaxisLabel != undefined ? $attrs.xaxisLabel : "x%", category.Current]
                                ],
                                tooltipDetail: "(" + category.Current + "%)",
                            };
                            $scope.adaptedData.push(newEntry);
                        }
                    });
                }
            ],
            transclude: true,
            restrict: 'E',
            templateUrl: './app/shared/serviceBargraph/serviceBargraphView.html'
        }
    });
});