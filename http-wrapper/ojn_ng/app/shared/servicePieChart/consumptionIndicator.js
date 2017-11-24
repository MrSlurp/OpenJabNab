'use strict';

define([
    'angular',
    'd3',
], function (angular, angularRoute) {

var indicator = angular.module('indicator', []);
    indicator.directive('indicatorWidget', [function () {
        return {
            scope: {
                actual: '=',
                expected: '=',
                total:'=',
                centerBgColor: '&',
                innerColor: '&',
                outerColor: '&',
                labelColor: '&',
                descriptionTip:'@',
            },
            controller: function($scope, $element, $attrs){
                var canvasWidth = 200, 
                    canvasHeight = 200,
                    circle = $element.find('circle')[0],
                    radius = circle.r.baseVal.value;

                $scope.radius = radius;
                $scope.canvasWidth = canvasWidth;
                $scope.canvasHeight = canvasHeight;
                $scope.spacing = 0.9;
                $scope.actual_formatted = "";
            
                function convertToRads(angle){
                    return angle * (Math.PI / 180);
                }

                function findDegress(percentage){
                    return 360 * percentage;
                }

                function getArcValues(index, radius, spacing){
                    return {
                        innerRadius: (index + spacing) * radius,
                        outerRadius: (index + spacing) * radius
                    };
                }
            

                $scope.buildArc = function(){
                    return d3
                            .svg
                            .arc()
                            .innerRadius(function(d){
                                return d.innerRadius;
                            })
                            .outerRadius(function(d){
                                return d.outerRadius;
                            })
                            .startAngle(0)
                            .endAngle(function(d){
                                return d.endAngle;
                            });
                };

                $scope.getArcInfo = function (index, value, radius, spacing) {
                    var pct = $scope.total != 0 ? (value != undefined ? value : 0) / $scope.total : 0;
                    var end = findDegress(pct);
                    var arcValues = getArcValues(index, radius, spacing);
                    return {
                        innerRadius: arcValues.innerRadius,
                        outerRadius: arcValues.outerRadius,
                        endAngle: convertToRads(end),
                    };
                };

                $scope.tweenArc = function(b, arc){
                    return function(a) {
                        var i = d3.interpolate(a, b);
                        for(var key in b){
                            a[key] = b[key];
                        }
                        return function(t) {
                            return arc(i(t));
                        };
                    };
                }

                $scope.updateStatus = function () {
                    var value = 0;
                    if ($scope.total != undefined
                        && $scope.actual != undefined
                        && $scope.total != 0) {
                        value = $scope.total != 0 ? (($scope.actual ? $scope.actual : 0) / $scope.total) : 0;
                        //console.log("data = " + value + "(" + $scope.total + " , " + JSON.stringify($scope.actual) + ")");
                    }
                    else {
                        //console.log("invalid data");
                    }
                    
                    if ($attrs.centerBgColor != undefined)
                        $scope.centerColor = $scope.centerBgColor()(value)
                    if ($attrs.innerColor != undefined)
                        $scope.innerPathColor = $scope.innerColor()(value)
                    if ($attrs.outerColor != undefined)
                        $scope.outerPathColor = $scope.outerColor()(value)
                    if ($attrs.labelColor != undefined)
                        $scope.lblColor = $scope.labelColor()(value)
                    $scope.actual_formatted = (value * 100).toFixed(1);
                }

            },
            restrict: 'EA',
            replace: true,
            transclude: true,
            templateUrl: './app/shared/servicePieChart/consumptionIndicator.html',
            link: function(scope, element, attrs){
                // default values
                scope.innerPathColor = "#00FF00";
                scope.outerPathColor = "#0000FF";
                scope.centerColor = "#f1f1f1";
                scope.lblColor = "#5D5D5D";
            
                scope.$watch('actual + expected + total', function () {
                    scope.updateStatus();
                });

            }
        };
    }]);

    indicator.directive('pathGroup', function(){
        return {
            requires: '^indicatorWidget',
            link: function(scope, element, attrs, ctrl){
                element
                    .attr(
                        "transform", 
                        "translate("+ scope.canvasWidth/2 + "," + scope.canvasHeight/2 + ")"
                    );
            }
        };
    });
    
    indicator.directive('innerPath', function(){
        return {
            restrict: 'A',
            transclude: true,
            requires: '^pathGroup',
            link: function(scope, element, attrs, ctrl){
                var arc = d3.select(element[0]),
                    arcObject = scope.buildArc(),
                    innerArc = scope.getArcInfo(1.1, scope.expected, scope.radius, 0.05),
                    end = innerArc.endAngle;/*,
                    color = (scope.diff < 0.25) ? 'all-good' :
                            ((scope.diff >= 0.25 && scope.diff < 0.5) ? 'not-so-good' :
                            'way-behind');*/
            
                innerArc.endAngle = 0;
                arc
                    .datum(innerArc)
                    .attr('d', arcObject)
                    .transition()
                    .duration(500)
                    .attrTween("d", scope.tweenArc({
                        endAngle: end
                    }, arcObject));
            }
        };
    });
    
    indicator.directive('bgPath', function () {
        return {
            restrict: 'A',
            transclude: true,
            requires: '^pathGroup',
            link: function (scope, element, attrs, ctrl) {
                var arc = d3.select(element[0]),
                    arcObject = scope.buildArc(),
                    bgArc = scope.getArcInfo(1.3, scope.actual, scope.radius, 0.1);

                bgArc.endAngle = Math.PI * 2;
                arc
                    .datum(bgArc)
                    .attr('d', arcObject);
            }
        };
    });

    indicator.directive('outerPath', function(){
        return {
            restrict: 'A',
            transclude: true,
            requires: '^pathGroup',
            link: function (scope, element, attrs) {
                var previousAngle = 0;
                var updateArc = function () {
                    if (scope.actual != undefined && scope.total != undefined) {
                        var arc = d3.select(element[0]),
                        arcObject = scope.buildArc(),
                        outerArc = scope.getArcInfo(1.3, scope.actual, scope.radius, 0.1),
                        end = outerArc.endAngle;
                        //console.log(scope.descriptionTip + "=>" + scope.actual);
                        outerArc.endAngle = previousAngle;
                        arc
                            .datum(outerArc)
                            .attr('d', arcObject)
                            .transition()
                            .delay(50)
                            .duration(500)
                            .attrTween("d", scope.tweenArc({
                                endAngle: end
                            }, arcObject));
                        previousAngle = end;
                    }
                };

                scope.$watch(function (scope) {
                    return scope.actual;
                },
                function () {
                    updateArc();
                });
                scope.$watch(function (scope) {
                    return scope.total;
                },
                function () {
                    updateArc();
                });
                updateArc();
            }
        }; 
    });
});