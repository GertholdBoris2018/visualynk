(function () {
    'use strict';

    var app = angular.module('app', [
        // Angular modules
        'ngAnimate',        // animations
        'ngRoute',          // routing
        'ngSanitize',       // sanitizes html bindings (ex: sidebar.js)

        // Custom modules
        'common',           // common functions, logger, spinner
        'common.bootstrap', // bootstrap dialog wrapper functions

        // 3rd Party Modules
        'ui.bootstrap',      // ui-bootstrap (ex: carousel, pagination, dialog)
        //'ngDragDrop',
        'ngGrid','ngRoute', 'ngCookies', 'datatables'
        //'angularModalService'
        ,'thatisuday.dropzone'
        ,'ngProgress'
    ]);

    app.factory('authInterceptor', function ($rootScope, $q, $window, $location) {
        return {

            request: function (config) {
                config.headers = config.headers || {};
                if ($window.sessionStorage.token && $window.sessionStorage.isAuth) {
                    config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
                }
                return config;
            },
            responseError: function (rejection) {
                console.log(rejection);
                
                if (rejection.status === 401) {
                    // handle the case where the user is not authenticated
                    $window.sessionStorage.isAuth = false;
                    $location.path('/');
                }
                // if(rejection.status == -1){
                //     if($rootScope.globals.currentUser.usertype == "admin") $location.path('/admin/company');
                // }
                return $q.reject(rejection);
            }
        };
    });

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    });

    // Handle routing errors and success events
    app.run(['$rootScope', '$location', '$window', '$cookieStore', '$http', '$route','AuthenticationService', function ($rootScope, $location, $window, $cookieStore, $http , $route,AuthenticationService) {
            // Include $route to kick start the router.
            // keep user logged in after page refresh
            $rootScope.globals = $cookieStore.get('globals') || {};
            $rootScope.globals.usergroups = ["PortfolioOwner", "ProjectAdmin", "CompanyAdmin", "ProjectTeamAdmin", "CompanyTeamAdmin", "User"];
            /*if ($rootScope.globals.currentUser) {
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
            }*/

            $rootScope.$on('$locationChangeStart', function (event, next, current) {

                // redirect to login page if not logged in and trying to access a restricted page
                var restrictedPage = $.inArray($location.path(), ['/login', '/register', '/resetpwd']) === -1;
                var logOutState = $.inArray($location.path(), ['/login']) === -1;
                if(!logOutState){
                    //logout
                    (function initController() {
                        // reset login status
                        AuthenticationService.ClearCredentials();
                    })();
                }

                //check the user exist
                var loggedIn = $rootScope.globals.currentUser;

                if (!loggedIn) {
                    if(restrictedPage){
                        $location.path('/');
                    }
                        
                }
                else{
                    var loggedIn_user = loggedIn.username;
                    var loggedIn_pass = loggedIn.password;

                    AuthenticationService.Login(loggedIn_user, loggedIn_pass, function (response) {
                        if (response.responseData.msg == "success") {
                            $rootScope.globals.currentUser.username = loggedIn_user;
                            $rootScope.globals.currentUser.password = loggedIn_pass;
                            
                            // AuthenticationService.SetCredentials(loggedIn_user, loggedIn_pass, response.responseData.userCompany, response.responseData.userType, response.responseData.userGroup, response.responseData.crudPermissions, response.responseData.userId);
                            // $window.sessionStorage.token = response.responseData.token;
                            // $window.isAuthenticated = true;

                            // if (response.responseData.userType == "admin") {
                            //     $location.path('/admin/company');
                            // }
                            // else {
                            //     $location.path('/main');
                            // }
                    
                            //AuthenticationService.SetCredentials(loggedIn_user, loggedIn_pass, response.responseData.userCompany, response.responseData.userType, response.responseData.userGroup,'',response.responseData.userId);
                            // if(response.responseData.userType == "user")
                            //     $location.path('/main');
                            // else if(response.responseData.userType == "admin") {

                            //     if($location.path() == '/')
                            //         $location.path('/admin/company');

                            //     if($location.path() == '/main')
                            //         $location.path('/main');

                            //     if($location.path() == '/admin/company')
                            //         $location.path('/admin/company');

                            //     if($location.path() == '/admin/users')
                            //         $location.path('/admin/users');

                            //     if($location.path() == '/admin/permissions')
                            //         $location.path('/admin/permissions');
                            // }
                            console.log("auth => " + $window.sessionStorage.isAuth);
                            var jwt_auth = $window.sessionStorage.isAuth;
                            var location_url = $location.path();
                            if(location_url == "/"){
                                if(jwt_auth == 'false') $location.path('/');
                                else{
                                    if(response.responseData.userType == "admin"){
                                        $location.path("/admin/company");
                                    }
                                    else{
                                        $location.path("/main");
                                    }
                                }
                                
                            }
                            else{
                                if(jwt_auth == 'false') $location.path('/');
                                else{
                                    $location.path(location_url);
                                }
                                
                            }
                            
                        } else {
                            AuthenticationService.ClearCredentials();
                            $location.path('/');
                        }
                    });
                }
            });
        }]);
})();
