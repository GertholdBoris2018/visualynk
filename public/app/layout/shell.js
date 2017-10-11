(function () { 
    'use strict';
    
    var controllerId = 'shell';
    angular.module('app').controller(controllerId,
        ['$scope','$rootScope', 'common', 'config','$route','$location','$window', shell]);

    function shell($scope,$rootScope, common, config ,route,$location,$window) {

    };
})();