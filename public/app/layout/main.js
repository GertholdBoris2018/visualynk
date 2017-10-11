(function () {
    'use strict';

    var controllerId = 'main';
    angular.module('app').controller(controllerId,
        ['$rootScope','$scope', 'common', 'config', 'AuthenticationService','$window' , main]);

    function main($rootScope,$scope, common, config,$window,AuthenticationService) {
        /* */
        $rootScope.loggedIn = true;
        $scope.showContent = function(tt){
            var target = $(tt);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top - 285
                }, 700);
                return false;
            }
        }
    };
})();