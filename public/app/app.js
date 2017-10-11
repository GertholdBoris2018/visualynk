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
        'ngDragDrop',
        'ngGrid','ngRoute', 'ngCookies'
        //'angularModalService'

    ]);
    
    // Handle routing errors and success events
    app.run(['$rootScope', '$location', '$cookieStore', '$http', '$route','AuthenticationService', function ($rootScope, $location, $cookieStore, $http , $route,AuthenticationService) {
            // Include $route to kick start the router.
            // keep user logged in after page refresh
            $rootScope.globals = $cookieStore.get('globals') || {};
            if ($rootScope.globals.currentUser) {
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
            }

            $rootScope.$on('$locationChangeStart', function (event, next, current) {

                // redirect to login page if not logged in and trying to access a restricted page
                var restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;
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
                    if(restrictedPage)
                        $location.path('/');
                }
                else{
                    var loggedIn_user = loggedIn.username;
                    var loggedIn_pass = loggedIn.password;
                    AuthenticationService.Login(loggedIn_user, loggedIn_pass, function (response) {
                        if (response.responseData.msg == "success") {
                            $location.path('/main');
                        } else {
                            AuthenticationService.ClearCredentials();
                            $location.path('/');
                        }
                    });
                }
            });
        }]);
    
    /*app.factory('authInterceptor', function ($rootScope, $q, $window, $location) {
      return {
          request: function (config) {
              config.headers = config.headers || {};
              if ($window.sessionStorage.token) {
                  config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
              }
              return config;
          },
          responseError: function (rejection) {
              if (rejection.status === 401) {
                  // handle the case where the user is not authenticated
              }
              $location.path('/login/unauth');
              return $q.reject(rejection);
          }
      };
  });
  app.config(function ($httpProvider) {
      $httpProvider.interceptors.push('authInterceptor');
  });*/
})();

