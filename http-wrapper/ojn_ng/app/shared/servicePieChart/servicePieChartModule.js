'use strict';

define([
    'angular',
    'd3',
    'nvd3',
    'nvd3directives',
    'app/shared/servicePieChart/consumptionIndicator',
    

], function (angular, angularRoute) {
    angular.module('servicePieChartDirective', ['nvd3ChartDirectives', 'indicator'])
    .directive('servicePieChart', function () {
        return {
            scope: {
                data: '=',
                colorFamily: "@",
                description: "@",
            },
            controller: [
                '$scope',
                '$element',
                '$attrs',
                function ($scope, $element, $attrs) {
                    var colorFamilies = {
                        service: {
                            Residential: "#459f35",
                            Industrial: "#eeb41c",
                            Commercial: "#008bdc",
                            Office: "#00e6f0",
                            Player: "#7a7a7a",
                            Forestry: "#086147",
                            Goods: "#aa38b6",
                            Ore: "#2080a9",
                            Oil: "#322642",
                            Agricultural: "#a6600f",
                        },
                        populationages: {
                            Childs: "#feb253",
                            Teens: "#9bdc47",
                            Youngs: "#809cd3",
                            Adults: "#8c0000",
                            Seniors: "#1cbe9c",
                        },
                        education:{
                            No: "#f08686",
                            Low: "#fad300",
                            Medium: "#8b9435",
                            High: "#81d38b",
                        },
                        birthdeath:{
                            Births: "#36c452",
                            Deaths: "#c42739",
                        }
                    };
                    $scope.xFunction = function () {
                        return function (d) {
                            // capitalize first letter
                            return d.Name;
                        };
                    };
                    $scope.yFunction = function () {
                        return function (d) {
                            return d.Current;
                        };
                    };
                    $scope.colorFunction = function () {
                        return function (d, i) {
                            //console.log(JSON.stringify(d.data), i, $attrs.colorFamily);
                            if (colorFamilies[$attrs.colorFamily])
                                return colorFamilies[$attrs.colorFamily][d.data.Name];
                            else
                                return "#000000";
                        };
                    };

                    $scope.toolTipContentFunction = function () {
                        return function (name, x, y, e, graph) {
                            //console.log(name + ' '+ x + ' '+ JSON.stringify(y));
                            if ($scope.data != undefined) {
                                var PercentValue = $scope.data.TotalCurrent != 0 ? (y.point.Current / $scope.data.TotalCurrent * 100).toFixed(1) : 'NA';
                                return '<h3>' + name + '</h3>' + '<p>' + PercentValue + ' % </p>'+
                                       '<p>(' + y.point.Current + '/'+ $scope.data.TotalCurrent+ ')</p>';
                            }
                            else
                                return 'Error';
                        }
                    }

                }
            ],
            transclude: true,
            bindToController: true,
            restrict: 'E',
            templateUrl: './app/shared/servicePieChart/servicePieChartView.html'
        }
    })
    .directive('trafficPieChart', function () {
        return {
            scope: {
                trafficdata: '=',
                colorFamily: "@",
                description: "@",
            },
            controller: [
                '$scope',
                '$element',
                '$attrs',
                function ($scope, $element, $attrs) {
                    var colorFamilies = {
                        importsexports:{
                            Goods: "#aa38b6",
                            Logs: "#086147",
                            Lumber: "#086147",
                            Food: "#a6600f",
                            Grain: "#a6600f",
                            Coal: "#322642",
                            Ore: "#2080a9",
                            Petrol: "#322642",
                        }
                    };
                    $scope.xFunction = function () {
                        return function (d) {
                            // capitalize first letter
                            return d.Name;
                        };
                    };
                    $scope.yFunction = function () {
                        return function (d) {
                            return d.Count;
                        };
                    };
                    $scope.colorFunction = function () {
                        return function (d, i) {
                            //console.log(JSON.stringify(d.data), i, $attrs.colorFamily);
                            if (colorFamilies[$attrs.colorFamily])
                                return colorFamilies[$attrs.colorFamily][d.data.Name];
                            else
                                return "#000000";
                        };
                    };

                    var totalCount = function (elemList) {
                        if (elemList == undefined)
                            return 0;
                        var total = 0;
                        for (var elem in elemList) {
                            total += elemList[elem].Count;
                        }
                        return total;
                    }

                    $scope.toolTipContentFunction = function () {
                        return function (name, x, y, e, graph) {
                            //console.log(name + ' '+ x + ' '+ JSON.stringify(y));
                            var total = totalCount($scope.trafficdata);
                            if ($scope.trafficdata != undefined) {
                                var PercentValue = total != 0 ? (y.point.Count / total * 100).toFixed(1) : 'NA';
                                return '<h3>' + name + '</h3>' + '<p>' + PercentValue + ' % </p>' +
                                       '<p>(' + y.point.Count + '/' + total + ')</p>';
                            }
                            else
                                return 'Error';
                        }
                    }

                }
            ],
            transclude: true,
            bindToController: true,
            restrict: 'E',
            templateUrl: './app/shared/servicePieChart/trafficPieChartView.html'
        }
    })
    .directive('serviceImportExportRepartitionChart', function () {
        return {
            scope: {
                importTotal:"@",
                exportTotal:"@",
                colorFamily:"@",
                description:"@",
            },
            controller: [
                '$scope',
                '$element',
                '$attrs',
                function ($scope, $element, $attrs) {

                    var colorFamilies = {
                        service: {
                            'import': "#459f35",
                            'export': "#eeb41c"
                        },
                    };
                    $scope.$watch('importTotal + exportTotal', function () {
                        if  (!$attrs.importTotal || !$attrs.exportTotal){
                            $scope.data=[];
                            return;
                        }
                        $scope.data = [
                            { Name: 'import', Current: $attrs.importTotal },
                            { Name: 'export', Current: $attrs.exportTotal },
                        ];
                    });
                    $scope.xFunction = function () {
                        return function (d) {
                            // capitalize first letter
                            return d.Name.charAt(0).toUpperCase() + d.Name.slice(1);
                        };
                    };
                    $scope.yFunction = function () {
                        return function (d) {
                            return d.Current;
                        };
                    };
                    $scope.colorFunction = function () {
                        return function (d, i) {
                            //console.log(JSON.stringify(d.data), i, $attrs.colorFamily);
                            if (colorFamilies[$attrs.colorFamily])
                                return colorFamilies[$attrs.colorFamily][d.data.Name];
                            else
                                return "#000000";
                        };
                    };

                    $scope.toolTipContentFunction = function () {
                        return function (name, x, y, e, graph) {
                            //console.log(name + ' '+ x + ' '+ JSON.stringify(y));
                            if ($scope.data != undefined) {
                                var total = parseInt($scope.data[1].Current) + parseInt($scope.data[0].Current);
                                var PercentValue = total != 0 ? (y.point.Current / (total) * 100).toFixed(1) : 'NA';
                                return '<h3>' + name + '</h3>' + '<p>' + PercentValue + ' % </p>' +
                                       '<p>(' + y.point.Current + '/' + total + ')</p>';
                            }
                            else
                                return 'Error';
                        }
                    }

                }
            ],
            transclude: true,
            bindToController: true,
            restrict: 'E',
            templateUrl: './app/shared/servicePieChart/serviceImportExportPieChartView.html'
        }
    })
    .directive('servicePieChartUsage', function () {
        return {
            scope: {
                productionData: '=',
                consumptionData: '=',
                colorFamily: '@',
                description:'@',
            },
            controller: [
                '$scope',
                '$element',
                '$attrs',
                function ($scope, $element, $attrs) {
                    
                    var colorFamilies = {
                        power: "#f3e012",
                        water: "#1912f3",
                        health: "#ef4d4d",
                        death: "#5a53e7",
                        sewage: "#af6728",
                        garbage: "#796a5d",
                        workers: "#61d147",
                        unumployed: "#d14747",
                        education1: "#fad300",
                        education2: "#8b9435",
                        education3: "#81d38b",
                    };
                    $scope.colorFunction = function () {
                        return function () {
                            if (colorFamilies[$attrs.colorFamily])
                                return colorFamilies[$attrs.colorFamily];
                            else
                                return "#000000";
                        }
                    };
                }
            ],
            transclude: true,
            bindToController: true,
            restrict: 'E',
            templateUrl: './app/shared/servicePieChart/servicePieChartUsage.html'
        }
    });
});