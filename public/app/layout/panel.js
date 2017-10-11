(function () {
    'use strict';

    var controllerId = 'PanelController';
    angular.module('app').controller(controllerId,
        ['$rootScope', 'common', 'config','$route','UserService', PanelController]);

    function PanelController($rootScope, common, config ,route,UserService) {
        var vm = this;
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var events = config.events;
        vm.busyMessage = 'Please wait ...';
        vm.isBusy = true;
        vm.spinnerOptions = {
            radius: 40,
            lines: 7,
            length: 0,
            width: 30,
            speed: 1.7,
            corners: 1.0,
            trail: 100,
            color: '#F58A00'
        };

        activate();

        function activate() {
            /*logSuccess('Angular App loaded!', null, true);*/
            common.activateController([], controllerId);
        }

        function toggleSpinner(on) { vm.isBusy = on; }

        $rootScope.$on('$routeChangeStart',
            function (event, next, current) {
                toggleSpinner(true);
            }
        );

        $rootScope.$on(events.controllerActivateSuccess,
            function (data) {
                toggleSpinner(false);

            }
        );

        $rootScope.$on(events.spinnerToggle,
            function (data) {
                toggleSpinner(data.show);
            }
        );

        vm.user = null;
        vm.allUsers = [];
        vm.deleteUser = deleteUser;

        initController();

        function initController() {
            loadCurrentUser();
            //loadAllUsers();
        }

        function loadCurrentUser() {
            /*UserService.GetByUsername($rootScope.globals.currentUser.username)
                .then(function (user) {
                    vm.user = user;
                });*/
            vm.user = $rootScope.globals.currentUser;
        }

        function loadAllUsers() {
            UserService.GetAll()
                .then(function (users) {
                    vm.allUsers = users;
                });
        }

        function deleteUser(id) {
            UserService.Delete(id)
                .then(function () {
                    loadAllUsers();
                });
        }
    };
})();