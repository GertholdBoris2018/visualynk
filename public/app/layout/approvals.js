(function () {
    'use strict';

    var controllerId = 'ApprovalsController';

    var app = angular.module('app');
    var modalInstance = null;

    app.controller(controllerId,
        ['$rootScope','$scope', '$modal','$window', '$location', 'common', 'config','$route','UserService','ModelService','$http','$log','$timeout', 'DTOptionsBuilder', 'DTColumnDefBuilder', ApprovalsController]);

    function ApprovalsController($rootScope, $scope, $modal, $window, $location, common, config ,route,UserService,ModelService,$http,$log,$timeout, DTOptionsBuilder, DTColumnDefBuilder) {

        $scope.usergroups = $rootScope.globals.usergroups;
        initController();

        function initController() {
            loadCurrentUser();
        }
        function loadCurrentUser() {
            $scope.user = $rootScope.globals.currentUser;
        }

        $scope.tab = 1;

        $scope.setTab = function(newTab){
            $scope.tab = newTab;
        };

        $scope.isSet = function(tabNum){
            return $scope.tab === tabNum;
        };

        UserService.GetNeedApprovalAssigns()
            .then(function (response) {

                var msg = response.data.msg;
                if (msg == "success" && response.data.responseData.length > 0) {
                    $scope.needapprovalassigns = JSON.parse(response.data.responseData[0]._fields[0].properties.assigns);
                }
                else {
                    $scope.needapprovalassigns = {};
                }
            });

        $scope.userneedapprovalassigns = {};

        $scope.userngcreateapprovals = {};
        $scope.userngupdateapprovals = {};
        $scope.userngdeleteapprovals = {};
        $scope.usernecreateapprovals = {};
        $scope.userneupdateapprovals = {};
        $scope.usernedeleteapprovals = {};


        /*UserService.GetNeedApprovalAssigns()
            .then(function (response) {

                var msg = response.data.msg;
                if (msg == "success" && response.data.responseData.length > 0) {
                    $scope.needapprovalassigns = JSON.parse(response.data.responseData[0]._fields[0].properties.assigns);

                    if($scope.needapprovalassigns.hasOwnProperty($scope.user.usergroup)) {
                        $scope.userneedapprovalassigns = $scope.needapprovalassigns[$scope.user.usergroup];
                    }
                }
                else {
                    $scope.needapprovalassigns = {};
                }
            });*/

        $scope.loadApprovalData = function(){

            var reqInfo = {};
            reqInfo.reqType = "ng_create";
            reqInfo.userGroup = $scope.user.usergroup;

            UserService.GetWaitingApprovals(reqInfo)
                .then(function (response) {

                    var msg = response.data.msg;
                    if (msg == "success") {
                        $scope.userngcreateapprovals = response.data.responseData;
                    }
                    else {
                        $scope.userngcreateapprovals = {};
                    }
                });

            var reqInfo = {};
            reqInfo.reqType = "ng_update";
            reqInfo.userGroup = $scope.user.usergroup;
            
            UserService.GetWaitingApprovals(reqInfo)
                .then(function (response) {

                    var msg = response.data.msg;
                    if (msg == "success") {
                        $scope.userngupdateapprovals = response.data.responseData;
                    }
                    else {
                        $scope.userngupdateapprovals = {};
                    }
                    console.log($scope.userngupdateapprovals)
                });

            var reqInfo = {};
            reqInfo.reqType = "ng_delete";
            reqInfo.userGroup = $scope.user.usergroup;

            UserService.GetWaitingApprovals(reqInfo)
                .then(function (response) {

                    var msg = response.data.msg;
                    if (msg == "success") {
                        $scope.userngdeleteapprovals = response.data.responseData;
                    }
                    else {
                        $scope.userngdeleteapprovals = {};
                    }
                });

            var reqInfo = {};
            reqInfo.reqType = "ne_create";
            reqInfo.userGroup = $scope.user.usergroup;

            UserService.GetWaitingApprovals(reqInfo)
                .then(function (response) {

                    var msg = response.data.msg;
                    if (msg == "success") {
                        $scope.usernecreateapprovals = response.data.responseData;
                    }
                    else {
                        $scope.usernecreateapprovals = {};
                    }
                });

            var reqInfo = {};
            reqInfo.reqType = "ne_update";
            reqInfo.userGroup = $scope.user.usergroup;

            UserService.GetWaitingApprovals(reqInfo)
                .then(function (response) {

                    var msg = response.data.msg;
                    if (msg == "success") {
                        $scope.userneupdateapprovals = response.data.responseData;
                    }
                    else {
                        $scope.userneupdateapprovals = {};
                    }
                });

            var reqInfo = {};
            reqInfo.reqType = "ne_delete";
            reqInfo.userGroup = $scope.user.usergroup;

            UserService.GetWaitingApprovals(reqInfo)
                .then(function (response) {

                    var msg = response.data.msg;
                    if (msg == "success") {
                        $scope.usernedeleteapprovals = response.data.responseData;
                    }
                    else {
                        $scope.usernedeleteapprovals = {};
                    }
                });

        }

        $scope.loadApprovalData();

        $scope.UpdateNGApproval = function (nodeId, currentGroup, updateType, ngLabel) {

            var ngInfo = {};
            ngInfo.nodeId = nodeId;
            ngInfo.parentGroup = "";
            ngInfo.reqType = updateType;
            ngInfo.ngLabel = ngLabel;

            if(updateType == "ng_create") {

                for (var key in $scope.needapprovalassigns) {
                    if ($scope.needapprovalassigns[key].hasOwnProperty(currentGroup) && $scope.needapprovalassigns[key][currentGroup].p_ng_c) {
                        ngInfo.parentGroup = key;
                    }
                }
            } else if(updateType == "ng_update"){
                for (var key in $scope.needapprovalassigns) {
                    if ($scope.needapprovalassigns[key].hasOwnProperty(currentGroup) && $scope.needapprovalassigns[key][currentGroup].p_ng_u) {
                        ngInfo.parentGroup = key;
                    }
                }
            } else if(updateType == "ng_delete"){
                for (var key in $scope.needapprovalassigns) {
                    if ($scope.needapprovalassigns[key].hasOwnProperty(currentGroup) && $scope.needapprovalassigns[key][currentGroup].p_ng_d) {
                        ngInfo.parentGroup = key;
                    }
                }
            } else if(updateType == "ne_create"){
                for (var key in $scope.needapprovalassigns) {
                    if ($scope.needapprovalassigns[key].hasOwnProperty(currentGroup) && $scope.needapprovalassigns[key][currentGroup].p_ne_c) {
                        ngInfo.parentGroup = key;
                    }
                }
            } else if(updateType == "ne_update"){
                for (var key in $scope.needapprovalassigns) {
                    if ($scope.needapprovalassigns[key].hasOwnProperty(currentGroup) && $scope.needapprovalassigns[key][currentGroup].p_ne_u) {
                        ngInfo.parentGroup = key;
                    }
                }
            } else if(updateType == "ne_delete"){
                for (var key in $scope.needapprovalassigns) {
                    if ($scope.needapprovalassigns[key].hasOwnProperty(currentGroup) && $scope.needapprovalassigns[key][currentGroup].p_ne_d) {
                        ngInfo.parentGroup = key;
                    }
                }
            }

            UserService.UpdateNGPendingApprovals(ngInfo)
                .then(function (response) {

                    var msg = response.data.msg;
                    if (msg == "success") {
                        $scope.loadApprovalData();
                    }
                    else {

                    }
                });

        }
        
        $scope.CancelNGApproval = function (nodeId, currentGroup, updateType, ngLabel) {

            var ngInfo = {};
            ngInfo.nodeId = nodeId;
            ngInfo.parentGroup = "";
            ngInfo.reqType = updateType;
            ngInfo.ngLabel = ngLabel;
/*

            if(updateType == "ng_create") {

                for (var key in $scope.needapprovalassigns) {
                    if ($scope.needapprovalassigns[key].hasOwnProperty(currentGroup) && $scope.needapprovalassigns[key][currentGroup].p_ng_c) {
                        ngInfo.parentGroup = key;
                    }
                }
            } else if(updateType == "ng_update"){
                for (var key in $scope.needapprovalassigns) {
                    if ($scope.needapprovalassigns[key].hasOwnProperty(currentGroup) && $scope.needapprovalassigns[key][currentGroup].p_ng_u) {
                        ngInfo.parentGroup = key;
                    }
                }
            } else if(updateType == "ng_delete"){
                for (var key in $scope.needapprovalassigns) {
                    if ($scope.needapprovalassigns[key].hasOwnProperty(currentGroup) && $scope.needapprovalassigns[key][currentGroup].p_ng_d) {
                        ngInfo.parentGroup = key;
                    }
                }
            } else if(updateType == "ne_create"){
                for (var key in $scope.needapprovalassigns) {
                    if ($scope.needapprovalassigns[key].hasOwnProperty(currentGroup) && $scope.needapprovalassigns[key][currentGroup].p_ne_c) {
                        ngInfo.parentGroup = key;
                    }
                }
            } else if(updateType == "ne_update"){
                for (var key in $scope.needapprovalassigns) {
                    if ($scope.needapprovalassigns[key].hasOwnProperty(currentGroup) && $scope.needapprovalassigns[key][currentGroup].p_ne_u) {
                        ngInfo.parentGroup = key;
                    }
                }
            } else if(updateType == "ne_delete"){
                for (var key in $scope.needapprovalassigns) {
                    if ($scope.needapprovalassigns[key].hasOwnProperty(currentGroup) && $scope.needapprovalassigns[key][currentGroup].p_ne_d) {
                        ngInfo.parentGroup = key;
                    }
                }
            }
*/

            UserService.CancelNGPendingApprovals(ngInfo)
                .then(function (response) {

                    var msg = response.data.msg;
                    if (msg == "success") {
                        $scope.loadApprovalData();
                    }
                    else {

                    }
                });

        }

        angular.element('body').removeClass("page-sidebar-closed");

    };

})();