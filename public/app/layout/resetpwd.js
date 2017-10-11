(function () {
    'use strict';

    var resetpwdcontrillId = 'resetpwd';
    angular.module('app').controller(resetpwdcontrillId, ['$rootScope','$scope','common', 'datacontext', '$window', '$location', '$routeParams', '$timeout', 'AuthenticationService', 'FlashService',resetPwdProc]);
    function resetPwdProc($rootScope, $scope, common, datacontext, $window, $location, $routeParams, $timeout, AuthenticationService, FlashService) {

        var vm = this;
        vm.resetPwd = resetPwd;
        vm.resetPwd = resetPwd;
        $rootScope.loggedIn = true;
        vm.isTokenChecked = false;
        vm.pwdChanged = false;
        vm.isValidToken = false;

        var pwdToken = $routeParams.token;
        AuthenticationService.CheckResetPwdToken(pwdToken, function (response) {
            $rootScope.initFlash = true;

            if (response.responseData.msg == "success") {
                vm.isTokenChecked = true;
            } else {
                FlashService.Error(response.responseData.msg);
                vm.isTokenChecked = false;
            }
        });

        function resetPwd() {
            vm.dataLoading = true;
            AuthenticationService.ResetPassword(vm.new_pwd, pwdToken, function (response) {
                $rootScope.initFlash = true;

                if (response.responseData.msg == "success") {

                    FlashService.Success("Your new password was reset correctly. Please login with your new password", true);

                    vm.dataLoading = false;
                    vm.pwdChanged = true;
                    $timeout(function(){
                        $window.location.href = '/';
                    }, 1000)
                } else {
                    FlashService.Error(response.responseData.msg);
                    vm.dataLoading = false;
                }
            });
        }
    }

})();