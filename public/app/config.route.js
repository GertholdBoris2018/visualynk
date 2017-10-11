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
                url: '/main',
                config: {
                    controller: 'PanelController',
                    templateUrl: 'app/layout/panel.html',
                    controllerAs: 'vm'
                }
            },
            {
                url: '/admin/create',
                config: {
                    title: 'create',
                    templateUrl: 'app/admin/create.html',
                    settings: {
                        nav: 2,
                        content: '<i class="fa fa-tasks"></i> Manage Drugs'
                    }
                }
            },
            {
                url: '/admin/query',
                config: {
                    title: 'query',
                    templateUrl: 'app/admin/query.html',
                    settings: {
                        nav: 5,
                        content: '<i class="fa fa-crosshairs"></i> Run Ad-hoc queries'
                    }
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
