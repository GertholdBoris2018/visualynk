(function () {
    'use strict';

    var app = angular.module('app');

    // Collect the routes
    app.constant('routes', getRoutes());
    
    // Configure the routes and route resolvers
    app.config(['$routeProvider', 'routes', routeConfigurator]);
    function routeConfigurator($routeProvider, routes) {

        routes.forEach(function (r) {
            $routeProvider.when(r.url, r.config);
        });
        $routeProvider.otherwise({ redirectTo: '/#' });
    }

    // Define the routes 
    function getRoutes() {
        return [
            {
                url: '/',
                config: {
                    controller: 'main',
                    templateUrl: 'app/layout/main.html',
                    title: 'main'
                }
            },
            {
                url: '/resetpwd',
                config: {
                    controller: 'resetpwd',
                    templateUrl: 'app/layout/resetpwd.html',
                    title: 'main'
                }
            },
            {
                url: '/main',
                config: {
                    controller: 'PanelController',
                    templateUrl: 'app/layout/panel.html',
                    controllerAs: 'vm'
                }
            }
            ,
            {
                url: '/admin',
                config: {
                    controller: 'AdminController',
                    templateUrl: 'app/layout/admin.html',
                    controllerAs: 'vm'
                }
            }
            ,
            {
                url: '/admin/company',
                config: {
                    controller: 'CompanyController',
                    templateUrl: 'app/layout/company.html',
                    controllerAs: 'vm'
                }
            }
            ,
            {
                url: '/admin/users',
                config: {
                    controller: 'UserController',
                    templateUrl: 'app/layout/users.html',
                    controllerAs: 'vm'
                }
            }
            ,
            {
                url: '/admin/projects',
                config: {
                    controller: 'ProjectController',
                    templateUrl: 'app/layout/projects.html',
                    controllerAs: 'vm'
                }
            }
            ,
            {
                url: '/admin/permissions',
                config: {
                    controller: 'PermissionController',
                    templateUrl: 'app/layout/permissions.html',
                    controllerAs: 'vm'
                }
            }
            ,
            {
                url: '/admin/waitingapprovals',
                config: {
                    controller: 'ApprovalsController',
                    templateUrl: 'app/layout/approvals.html',
                    controllerAs: 'vm'
                }
            }
            ,
            {
                url: '/register',
                config: {
                    controller: 'RegisterController',
                    templateUrl: 'app/register/register.view.html',
                    controllerAs: 'vm'
                }
            }
        ];
    }
})()
