(function () {
    'use strict';

    var controllerId = 'AdminController';

    var app = angular.module('app');

    app.controller(controllerId,
        ['$rootScope','$scope','$window', '$location', 'common', 'config','$route','UserService','ModelService','$http','$log','$timeout', AdminController]);

    function AdminController($rootScope, $scope,$window, $location, common, config ,route,UserService,ModelService,$http,$log,$timeout) {
        $rootScope.loggedIn = false;
        angular.element('body').removeClass("page-sidebar-closed");
        var vm = this;

        initController();

        function initController() {
            loadCurrentUser();
        }
        function loadCurrentUser() {
            vm.user = $rootScope.globals.currentUser;
            if (vm.user.usertype != "admin") {
                $location.path("/main");
            }
        }
        //initialize the panel

    };

})();