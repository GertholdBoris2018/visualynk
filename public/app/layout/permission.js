(function () {
    'use strict';

    var controllerId = 'PermissionController';

    var app = angular.module('app');
    var modalInstance = null;

    app.controller(controllerId,
        ['$rootScope','$scope', '$modal','$window', '$location', 'common', 'config','$route','UserService','ModelService','$http','$log','$timeout', 'DTOptionsBuilder', 'DTColumnDefBuilder', PermissionController]);

    function PermissionController($rootScope, $scope, $modal, $window, $location, common, config ,route,UserService,ModelService,$http,$log,$timeout, DTOptionsBuilder, DTColumnDefBuilder) {

        $rootScope.loggedIn = false;
        $scope.usergroups = $rootScope.globals.usergroups;
        if($scope.usergroups === undefined)
            $scope.usergroups = ["PortfolioOwner", "ProjectAdmin", "CompanyAdmin", "ProjectTeamAdmin", "CompanyTeamAdmin", "User"];

        $scope.reload_user_group_assigns = function(){
            UserService.GetUserGroupAssigns()
                .then(function (response) {
                    var msg = response.data.msg;
                    if (msg == "success" && response.data.responseData.length > 0) {
                        $scope.usergroupassigns = JSON.parse(response.data.responseData[0]._fields[0].properties.assigns);
                    }
                    else {
                        $scope.usergroupassigns = {};
                    }
                });

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
        }

        UserService.GetUserGroupAssigns()
            .then(function (response) {

                var msg = response.data.msg;
                if (msg == "success" && response.data.responseData.length > 0) {
                    $scope.usergroupassigns = JSON.parse(response.data.responseData[0]._fields[0].properties.assigns);
                }
                else {
                    $scope.usergroupassigns = {};
                }
            });

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

        angular.element('body').removeClass("page-sidebar-closed");
        var vm = this;

        $scope.tab = 1;

        $scope.setTab = function(newTab){
            $scope.tab = newTab;
        };

        $scope.isSet = function(tabNum){
            return $scope.tab === tabNum;
        };

        initController();

        function initController() {
            loadCurrentUser();
        }
        function loadCurrentUser() {
            $scope.user = $rootScope.globals.currentUser;
            /*if ($scope.user.usertype != "admin") {
                $location.path("/main");
            }*/
        }

        $scope.reload_users_list = function(){
            UserService.GetUsers().then(function(response){
                $scope.users = response.data.users;
            });
        }

        UserService.GetUsers().then(function(response){
            $scope.users = response.data.users;
        });

        $scope.saveAssigns = function(){

            var _assignsInfo = {};
            _assignsInfo.assigns = JSON.stringify($scope.usergroupassigns);

            UserService.UpdateUserGroupAssigns(_assignsInfo)
                .then(function (response) {
                    var msg = response.data.msg;
                    if (msg == "success") {
                        $scope.reload_user_group_assigns();
                    }
                    else {

                    }
                });
        }

        $scope.saveApprovalAssigns = function(group, subgroup, pm){

            var _assignsInfo = {};
            _assignsInfo.assigns = JSON.stringify($scope.needapprovalassigns);
            console.log(JSON.stringify(_assignsInfo));
            UserService.UpdateNeedApprovalAssigns(_assignsInfo)
                .then(function (response) {
                    var msg = response.data.msg;
                    if (msg == "success") {
                        $scope.reload_user_group_assigns();
                    }
                    else {

                    }
                });
        }

        $scope.saveUserPermissions = function(permission_type, ind){
            console.log(permission_type);
            var userInfo = {};
            userInfo.user_id = $scope.users[ind]._fields[1].low;
            userInfo.permission_type = permission_type;
            userInfo.permission_value = $scope.users[ind]._fields[0].properties[permission_type];

            UserService.UpdateUserPermission(userInfo)
                .then(function (response) {
                    var msg = response.data.msg;
                    if (msg == "success") {
                        $scope.reload_users_list();
                    }
                    else {

                    }
                });
        }

    };

})();