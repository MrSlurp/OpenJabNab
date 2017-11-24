'use strict';

define([
    'angular',
    'app/shared/servicePieChart/index',

], function (angular, angularRoute) {
    angular.module('servicePanelDirectives', ['servicePieChartDirective'])
    .directive('panelConsoDistrib', function () {
        return {
            scope: {
                productionService: "=",
                consumptionService: "=",
                description: "@",
                distributionDescription: "@",
                distributionService: "=",
                panelTitle: "@",
                percentColorFamily: "@",
                distribColorFamily:"@",
                distribIcon:"@",
                serviceIcon:"@",
            },
            controller: [
                '$scope',
                '$element',
                '$attrs',
                function ($scope, $element, $attr) {
                    $scope.outerColorfunction = function () {
                        return function (value) {
                            if (value >= 1.05) {
                                return "#0000FF";
                            }
                            if (value >= 1) {
                                return "#f4cf15";
                            }
                            if (value < 1) {
                                return "#FF0000";
                            }
                        }
                    }
                }
            ],
            transclude: true,
            restrict: 'E',
            templateUrl: './app/shared/servicePanel/panelConsoDistribView.html'
        }
    })
    .directive('panelConsoConso', function () {
        return {
            scope: {
                panelTitle: "@",
                productionServiceA: "=",
                consumptionServiceA: "=",
                percentColorFamilyA: "@",
                productionServiceB: "=",
                consumptionServiceB: "=",
                percentColorFamilyB: "@",

                descriptionServiceA: "@",
                descriptionServiceB: "@",

                serviceIconA:"@",
                serviceIconB:"@",
            },
            transclude: true,
            restrict: 'E',
            templateUrl: './app/shared/servicePanel/panel2ConsoView.html'
        }
    })
    .directive('panelJob', function () {
        return {
            scope: {
                panelTitle: "@",
                jobData: "=",
                percentageOfLabel:"@",
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

                    $scope.$watch('jobData', function () {
                        $scope.occupiedData = [];
                        $scope.availableData = [];
                        if (!$scope.jobData || !$scope.jobData.Categories) {
                            return;
                        }
                        //console.log(JSON.stringify($scope.jobData));
                        for (var cat in $scope.jobData.Categories) {
                            var category = $scope.jobData.Categories[cat];
                            var newEntry = {
                                key: $scope.jobData.Categories[cat].Name,
                                values: [
                                    [
                                        "Occupied " + ($scope.percentageOfLabel ? $scope.percentageOfLabel : ""),
                                        ((category.Current) / $scope.jobData.TotalAvailable * 100).toFixed(1)
                                    ]
                                ],
                                tooltipDetail:"("+category.Current +"/" +$scope.jobData.TotalAvailable+")",
                            };
                            $scope.occupiedData.push(newEntry);
                            var newEntry2 = {
                                key: $scope.jobData.Categories[cat].Name,
                                values: [
                                    [
                                        "Available " + ($scope.percentageOfLabel ? $scope.percentageOfLabel : ""),
                                        ((category.Available - category.Current) / $scope.jobData.TotalAvailable * 100).toFixed(1)
                                    ]
                                ],
                                tooltipDetail: "(" + (category.Available - category.Current) + "/" + $scope.jobData.TotalAvailable+")",
                            };
                            $scope.availableData.push(newEntry2);
                        }
                    });
                }
            ],
            transclude: true,
            restrict: 'E',
            templateUrl: './app/shared/servicePanel/panelJobView.html'
        }
    })
    .directive('panelConsoDistribConso', function () {
        return {
            scope: {
                panelTitle: "@",
                productionServiceA: "=",
                consumptionServiceA: "=",
                percentColorFamilyA: "@",
                serviceIconA: "@",
                productionServiceB: "=",
                consumptionServiceB: "=",
                percentColorFamilyB: "@",
                serviceIconB: "@",
                distributionService: "=",
                distribColorFamily: "@",
                distribIcon: "@",
                descriptionServiceA: "@",
                descriptionServiceB: "@",
                distributionDescription: "@",
            },
            transclude: true,
            restrict: 'E',
            templateUrl: './app/shared/servicePanel/panelConsoDistribConsoView.html'
        }
    })
    .directive('panelPolicies', function () {
        return {
            scope: {
                policies: "=",
            },
            controller: [
                '$scope',
                '$element',
                '$attrs',
                function ($scope, $element, $attrs) {
                    $scope.getPolicyIconFromName = function (policyName) {
                        return "IconPolicy" + policyName + ".png";
                    }
                }
            ],
            transclude: true,
            restrict: 'E',
            templateUrl: './app/shared/servicePanel/panelPolicies.html'
        }
    });
});