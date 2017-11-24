'use strict';

define([
    'app/components/bunnies/module',
    'app/components/dataServices/ojnApiService',
], function (module) {
    module.controller('bunniesCtrl', function ($scope, ojnApiService, $interval, $cookies) {
        console.log("bunniesCtrl Controller reporting for duty.");
        /*
        // contains the data of city and bunnies retrieved from cityInfoService
        $scope.cityName = undefined;
        $scope.globalbunnies = undefined;
        $scope.allbunnies = undefined

        // bunnies map contains the list of all bunniess by name
        // it is used by selection drop down box
        $scope.DistricMap = {};
        // contains as many object as primary panel tab
        // each object contains data about currently selected bunniess
        // in each tab.
        $scope.bunniesSelectionsTabs = {};

        // select combobox settings
        // all combobox uses the same settings and the same data source (city DistricMap)
        // but use a different selected item list
        $scope.selectBoxSettings = {
            idProp: 'bunniesID',
            displayProp: 'bunniesName',
            externalIdProp: '',
            scrollable: true,
            scrollableHeight: 450,
        };


        ///////////////////////////////////////////////////////////////////////
        // create a new $scope.bunniesSelectionsTabs content
        ///////////////////////////////////////////////////////////////////////
        var preparebunniesSelectionTab = function () {
            $scope.bunniesSelectionsTabs = {};
            // creating the object list of bunnies tabs
            for (var i = 0; i < 6; i++) {
                var PrepareTab = function () {
                    // base structure
                    var bunniesSelectionTab = {
                        TabTitle: "No Selection",
                        selectedbunniess: []
                    };

                    var selectionChange = function () {
                        var nbbunniesSelected = bunniesSelectionTab.selectedbunniess.length;
                        bunniesSelectionTab.TabTitle = nbbunniesSelected == 0 ? "No Selection" : (nbbunniesSelected + " Selected");
                        $scope.selectActivebunnies(nbbunniesSelected == 0 ? 0 : bunniesSelectionTab.selectedbunniess[0].bunniesID);
                        storeSelectionToCookie();
                    }
                    // adding events
                    bunniesSelectionTab.events = {
                        onItemSelect: selectionChange,
                        onItemDeselect: selectionChange,
                        onSelectAll: selectionChange,
                        onUnselectAll: selectionChange,
                    };
                    return bunniesSelectionTab;
                }

                $scope.bunniesSelectionsTabs[i] = PrepareTab();
            }
        }

        ///////////////////////////////////////////////////////////////////////
        // set the current active bunnies in cityInfoService
        //
        ///////////////////////////////////////////////////////////////////////
        $scope.selectActivebunnies = function (id)
        {
            //console.log("setting active bunnies = " + JSON.stringify(id));
            cityInfoService.setActivebunniesId(id);
        }

        ///////////////////////////////////////////////////////////////////////
        //
        ///////////////////////////////////////////////////////////////////////
        $scope.selectMostlyOfCategory = function (bunniesSelectionsTab, categoryName) {
            var getMostPresentTypeFromService = function (service) {
                var greatestValue = 0;
                var greatestCat="";
                for (var buildingcat in service.Categories) {
                    if (service.Categories[buildingcat].Current > greatestValue) {
                        greatestValue = service.Categories[buildingcat].Current;
                        greatestCat = bunnies.Consumptions.Building.Categories[buildingcat].Name;
                    }
                }
                return greatestCat;
            }
            bunniesSelectionsTab.selectedbunniess = [];
            for (var bunniesIdx in $scope.allbunnies) {
                var bunnies = $scope.allbunnies[bunniesIdx];
                if (getMostPresentTypeFromService(bunnies.Consumptions.Building) == categoryName){
                    bunniesSelectionsTab.selectedbunniess.push(bunnies);
                }
            }
            $scope.selectActivebunnies(bunniesSelectionsTab.length == 0 ? 0 : bunniesSelectionsTab.selectedbunniess[0].bunniesID);
            bunniesSelectionsTab.TabTitle = "Mostly " + categoryName;
            storeSelectionToCookie();
        }

        ///////////////////////////////////////////////////////////////////////
        //
        ///////////////////////////////////////////////////////////////////////
        var update = function () {
            var flag = false;
            if ($scope.cityName == undefined && cityInfoService.getCityData().Name != undefined) {
                // restore old selection on first update
                flag = true;
            }

            $scope.cityName = cityInfoService.getCityData().Name;
            $scope.globalbunnies = cityInfoService.getCityData().Globalbunnies;
            $scope.allbunnies = cityInfoService.getCityData().bunniess;
            // scope data must be initialized before restoring data from cookie
            if (flag) { restoreSelectionFromCookie(); }
            updatebunniesMap();
            // update the copy of bunniess that are displayed in currently visible bunnies tab only
            // (ignore not displayed tabs)
            for (var idx in $scope.bunniesSelectionsTabs) {
                // not an active tab => ignore
                if ($scope.bunniesSelectionsTabs[idx].active != true)
                    continue;

                // check in current bunnies selection
                var selectedIndexToRemove = [];
                for (var selectedIdx in $scope.bunniesSelectionsTabs[idx].selectedbunniess) {
                    var selectedbunnies = $scope.bunniesSelectionsTabs[idx].selectedbunniess[selectedIdx];
                    // if selected bunnies does not exist anymore 
                    var sourceDatabunnies = findbunniesById(selectedbunnies.bunniesID);
                    if (sourceDatabunnies == undefined) {
                        // add it to remove list
                        selectedIndexToRemove.push(selectedIdx);
                    }
                    else {
                        if (selectedbunnies.bunniesVisible != undefined && selectedbunnies.bunniesVisible == true) {
                            // updating each field of bunnies independantly to avoid angular rebuilding the whole tab set
                            for (var propertyName in sourceDatabunnies) {
                                $scope.bunniesSelectionsTabs[idx].selectedbunniess[selectedIdx][propertyName] = sourceDatabunnies[propertyName];
                            }
                        }
                    }
                }
                // remove bunnies that does not exist anymore in city
                for (var i = selectedIndexToRemove.length - 1 ; i >= 0; i--) {
                    $scope.bunniesSelectionsTabs[idx].selectedbunniess.splice(selectedIndexToRemove[i], 1);
                }
            }
        }

        ///////////////////////////////////////////////////////////////////////
        // store current user bunnies selection in cookie
        ///////////////////////////////////////////////////////////////////////
        var findbunniesById = function (searchId) {
            for (var elem in $scope.allbunnies) {
                if ($scope.allbunnies[elem].bunniesID == searchId)
                    return $scope.allbunnies[elem];
            }
            return undefined;
        }

        ///////////////////////////////////////////////////////////////////////
        // store current user bunnies selection in cookie
        ///////////////////////////////////////////////////////////////////////
        var updatebunniesMap = function () {
            // first remove elements that are not present anymore
            for (var key in $scope.DistricMap) {
                var found = false;
                var name = key;
                for (var elem in $scope.allbunnies) {
                    if ($scope.allbunnies[elem].bunniesName == name) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    delete $scope.DistricMap[name];
                }
            }

            for (var elem in $scope.allbunnies) {
                $scope.DistricMap[$scope.allbunnies[elem].bunniesName] = $scope.allbunnies[elem];
            }

        }

        ///////////////////////////////////////////////////////////////////////
        // store current user bunnies selection in cookie
        ///////////////////////////////////////////////////////////////////////
        var storeSelectionToCookie = function () {
            // we must clean up the bunnies data and keep only selected bunnies IDs
            // because bunnies data are too big for cookie
            var storableSelection = [];
            for (var tab in $scope.bunniesSelectionsTabs) {
                var tabObj = {
                    TabTitle: $scope.bunniesSelectionsTabs[tab].TabTitle,
                    selectedbunniess: []
                };
                for (var sel in $scope.bunniesSelectionsTabs[tab].selectedbunniess)
                {
                    tabObj.selectedbunniess.push({ bunniesID: $scope.bunniesSelectionsTabs[tab].selectedbunniess[sel].bunniesID });
                }
                storableSelection.push(tabObj);

            }
            $cookies.bunniesSelection =JSON.stringify({
                CityName:$scope.cityName,
                bunniesSelectionsTabs:storableSelection
            });
        }

        ///////////////////////////////////////////////////////////////////////
        // restore user selection from cookie
        ///////////////////////////////////////////////////////////////////////
        var restoreSelectionFromCookie = function () {
            // always create the default structure
            // it also create the default handlers for selection change
            preparebunniesSelectionTab();
            var previousSelection = undefined;
            try{
                previousSelection = JSON.parse($cookies['bunniesSelection']);
            }
            catch (ex) {
            }
            if (previousSelection == undefined) {
                // no existing cookie
                return;
            }
            if ($scope.cityName != undefined) {
                // if city name is different, cancel restore
                if (previousSelection.CityName != $scope.cityName) {
                    return;
                }

                // check selected bunnies still exist in city data
                for (var elem in previousSelection.bunniesSelectionsTabs) {
                    for (var i = 0; i < previousSelection.bunniesSelectionsTabs[elem].selectedbunniess.length;) {
                        // note that stored structure only contains the bunnies ids
                        var distId = previousSelection.bunniesSelectionsTabs[elem].selectedbunniess[i].bunniesID;
                        // if the stored id does not exist in city data, remove selected item
                        var origbunnies = findbunniesById(distId)
                        if (origbunnies == undefined) {
                            console.log("bunnies with id = " + distId + " does not exist anymore");
                            previousSelection.bunniesSelectionsTabs[elem].selectedbunniess.splice(i, 1);
                            // one item have been remove, restart from begining
                            i = 0;
                            continue;
                        }
                        else {
                            // bunnies strill exist, restore it
                            previousSelection.bunniesSelectionsTabs[elem].selectedbunniess[i] = origbunnies;
                        }
                        i++;
                    }
                }
                // all is ok, use the saved selection
                $scope.bunniesSelectionsTabs = previousSelection.bunniesSelectionsTabs;
                // if there is not selected bunnies, set city as active bunnies 
                if ($scope.bunniesSelectionsTabs[0].selectedbunniess.length == 0)
                    $scope.selectActivebunnies(0);
                else
                    $scope.selectActivebunnies($scope.bunniesSelectionsTabs[0].selectedbunniess[0].bunniesID);
            }
        }

        ///////////////////////////////////////////////////////////////////////
        // used for auto sizing panel in dynamic view
        // @param : first argument is the size factor to apply for bootstrap column size
        // @param : other arguments should be serviceDataObject or boolean
        ///////////////////////////////////////////////////////////////////////
        $scope.SmartColumnLayoutPanel = function () {
            if (arguments.length < 2)
                return 24;
            var coeff = arguments[0];
            var count = 0;
            for (var index = 1 ; index < arguments.length; index++) {
                if ($scope.IsServiceInfoValuable(arguments[index]))
                    count++;
            }
            return count*coeff;
        }

        ///////////////////////////////////////////////////////////////////////
        // used for auto sizing elements in dynamic panels
        // @params : (...) arguments must be serviceData Object or boolean
        ///////////////////////////////////////////////////////////////////////
        $scope.SmartColumnLayoutElement = function () {
            var count = 0;
            for (var index = 0 ; index < arguments.length; index++) {
                if ($scope.IsServiceInfoValuable(arguments[index]))
                    count++;
            }
            if (count == 0)
                return 1;
            return parseInt(24 / count);
        }

        ///////////////////////////////////////////////////////////////////////
        // return true if service data is defined and its values are valuables
        ///////////////////////////////////////////////////////////////////////
        $scope.IsServiceInfoValuable = function (serviceData)
        {
            if (typeof (serviceData) == "boolean") {
                return serviceData;
            }
            if (serviceData.TotalCurrent != 0)
                return true;
            return false;
        }

        ///////////////////////////////////////////////////////////////////////
        // return true if service data is defined and its values are valuables
        // @params : (...) arguments must be serviceData Object or boolean
        ///////////////////////////////////////////////////////////////////////
        $scope.IsPanelInfoValuable = function () //(...)
        {
            // arguments are services datas
            for (var index in arguments) {
                if ($scope.IsServiceInfoValuable(arguments[index]))
                    return true;
            }
            return false;
        }

        // register itself in cityInfoService in order to update
        // when data are retrieved
        cityInfoService.registerSubscriber(function () {
            update();
        });
        */
    });
});
