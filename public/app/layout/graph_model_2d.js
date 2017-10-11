(function () {
    'use strict';

    var controllerId = 'model2d';

    angular.module('app').controller(controllerId,
        ['$rootScope','$scope', 'common', 'config','$route','ModelService','$http', model2d]);

    function model2d($rootScope,$scope, common, config ,route,ModelService,$http) {
        App.init();
        $rootScope.isGraph = false;
    };
})();