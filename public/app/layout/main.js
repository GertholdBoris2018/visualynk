(function () {
    'use strict';

    var controllerId = 'main';
    angular.module('app').controller(controllerId,
        ['$rootScope','$scope', 'common', 'config', 'AuthenticationService','$window' , '$http', main]);

    function main($rootScope,$scope, common, config,AuthenticationService,$window,$http) {
        /* */
        var vm = this;
        vm.dataLoading = false;
        $rootScope.loggedIn = true;
        $rootScope.initMailSucessFlash = false;
        $rootScope.initMailerrorFlash = false;
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

        /* contact form */
        $scope.showContactForm = function(){
            $('.cont-flip').toggleClass('flipped');
        }

        $scope.sendMail = function(){
            vm.dataLoading = true;
            vm.alert = false;
            $rootScope.initMailSucessFlash = false;
            $rootScope.initMailerrorFlash = false;
            var data = {
                contactName: vm.contactName,
                contactCompany : vm.contactCompany,
                contactPhone : vm.contactPhone,
                contactEmail : vm.contactEmail,
                contactMsg : vm.contactMsg
            };
            $http.post('/contactform', data).success(function (response) {
                // If successful we assign the response to the global user model
                var result = response.result;
                if(result == "success"){
                    $rootScope.initMailSucessFlash = true;
                    console.log("success");
                }
                else{
                    $rootScope.initMailerrorFlash = true;
                }
                vm.dataLoading = false;

            }).error(function (response) {
                $rootScope.initMailerrorFlash = true;
                vm.dataLoading = false;
            });


        }
        /* end contact form*/
    };
})();