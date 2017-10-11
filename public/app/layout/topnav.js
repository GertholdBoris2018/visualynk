(function () {
    'use strict';
    var controllerId = 'topnav_dev';
    var app = angular.module('app');
    var modalInstance = null;

    angular.module('app').controller('topnav_dev', ['$rootScope','$scope', '$modal', topnav_dev_proc]);

    function topnav_dev_proc($rootScope,$scope,$modal) {
        $scope.firstClass = true;
        //this is used to parse the profile
        $rootScope.initFlash = true;

        // instantiate modal service
        $rootScope.login = function() {
            $rootScope.initFlash = false;
            $scope.opts = {
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'signin.html',
                controller : 'PopupCont_login',
                resolve: {} // empty storage
            };
            modalInstance = $modal.open($scope.opts);

        }
        $rootScope.register = function(){
            $rootScope.initFlash = false;
            modalInstance = $modal.open({
                templateUrl: 'signup.html',
                controller: 'PopupCont_register'
            });
        }

        $rootScope.showForgotPwdForm = function () {
            $('.cont-login-forgot').toggleClass('flipped');
        }
        
        $scope.close = function(){
        }
        $scope.showContent = function(tt){
            var target = $(tt);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top - 50
                }, 700);
                return false;
            }
        }
    }
    angular.module('app').controller('PopupCont_login', ['$scope','$modalInstance',function ($scope, $modalInstance) {
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
    angular.module('app').controller('PopupCont_register', ['$scope','$modalInstance',function ($scope, $modalInstance) {
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

//this is used to parse the profile
    function url_base64_decode(str) {
        var output = str.replace('-', '+').replace('_', '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw 'Illegal base64url string!';
        }
        return window.atob(output); //polifyll https://github.com/davidchambers/Base64.js
    }
    var signcontrillId = 'signin';
    angular.module('app').controller(signcontrillId, ['$rootScope','$scope','common', 'datacontext', '$window', '$location', 'AuthenticationService', 'FlashService',loginProc]);
    function loginProc($rootScope, $scope,common, datacontext, $window, $location,AuthenticationService, FlashService) {

        var vm = this;
        vm.signin = login;
        vm.forgotpwd = forgotpwd;

        function login() {
            vm.dataLoading = true;
            AuthenticationService.Login(vm.username, vm.password, function (response) {
                $rootScope.initFlash = true;

                if (response.responseData.msg == "success") {
                    AuthenticationService.SetCredentials(vm.username, vm.password, response.responseData.userCompany, response.responseData.userType, response.responseData.userGroup, response.responseData.crudPermissions, response.responseData.userId);
                    $window.sessionStorage.token = response.responseData.token;
                    $window.isAuthenticated = true;
                    $window.sessionStorage.isAuth = true;
                    var encodedProfile = response.responseData.token.split('.')[1];
                    common.$rootScope.$broadcast('loginSuccess', {});
                    modalInstance.dismiss('cancel');

                    if (response.responseData.userType == "admin") {
                        $location.path('/admin/company');
                    }
                    else {
                        $location.path('/main');
                    }
                    
                    vm.dataLoading = false;
                } else {
                    FlashService.Error(response.responseData.msg);
                    vm.dataLoading = false;
                }
            });
        };
        
        function forgotpwd() {
            vm.dataLoadingFP = true;
            AuthenticationService.Forgotpassword(vm.username, function (response) {
                $rootScope.initFlashFP = true;

                if (response.responseData.msg == "success") {

                    FlashService.Success("We've sent the email successfully! Please check your email.", true);

                    vm.dataLoadingFP = false;
                } else {
                    FlashService.Error(response.responseData.msg);
                    vm.dataLoadingFP = false;
                }
            });
        }
    }

    var signcontrillId = 'signup';
    angular.module('app').controller(signcontrillId, ['UserService', '$location', '$rootScope', '$scope', 'FlashService',registerProc]);
    function registerProc(UserService, $location, $rootScope, $scope, FlashService) {
        var su = this;
        $scope.companies = {};
        $scope.userCompany = '';

        su.register = register;
        UserService.GetCompanies().then(function(response){
            $scope.companies = response.data.companies;
        });

        function register() {
            var userInfo = {};
            userInfo.firstName = su.firstName;
            userInfo.lastName = su.lastName;
            userInfo.username = su.username;
            userInfo.password = su.password;
            userInfo.userEmail = su.userEmail;
            userInfo.userCompany = su.userCompany;
            userInfo.userGroup = su.userGroup;
            userInfo.userBimType = su.userBimType;
            console.log(userInfo.userBimType);
            su.dataLoading = true;
            UserService.Create(userInfo)
                .then(function (response) {
                    $rootScope.initFlash = true;
                    var msg = response.data.msg;
                    if(msg == "success"){
                        su.dataLoading = false;
                        //Create the BIMServer SetCredentials
                        UserService.CreateBimSeverAccont(userInfo)
                        .then(function (response) {
                            var msg = response.data.msg;
                            if(msg == "success"){
                                FlashService.Success('Registration successful', true);
                            }
                            else {
                                FlashService.Success('Registration successful, But not created on BIMServer because of Network to BIM Server.', true);
                                
                            }
                        });
                        
                        /*$location.path('/login');*/
                        /*modalInstance.dismiss('cancel');*/
                    }
                    else {
                        FlashService.Error(msg);
                        su.dataLoading = false;
                    }
                });
        }
    }


    app.directive("passwordVerify", function() {
        return {
            require: "ngModel",
            scope: {
                passwordVerify: '='
            },
            link: function(scope, element, attrs, ctrl) {
                scope.$watch(function() {
                    var combined;

                    if (scope.passwordVerify || ctrl.$viewValue) {
                        combined = scope.passwordVerify + '_' + ctrl.$viewValue;
                    }
                    return combined;
                }, function(value) {
                    if (value) {
                        ctrl.$parsers.unshift(function(viewValue) {
                            var origin = scope.passwordVerify;
                            if (origin !== viewValue) {
                                ctrl.$setValidity("passwordVerify", false);
                                return undefined;
                            } else {
                                ctrl.$setValidity("passwordVerify", true);
                                return viewValue;
                            }
                        });
                    }
                });
            }
        };
    });

})()
