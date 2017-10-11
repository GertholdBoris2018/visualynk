(function () {
    'use strict';

    angular
        .module('app')
        .controller('RegisterController', RegisterController);

    RegisterController.$inject = ['UserService', 'common','config', '$location', '$rootScope', 'FlashService'];
    function RegisterController(UserService, common , config,$location, $rootScope, FlashService) {

        /* for dev */
        $rootScope.reasonToShow = false;
        var vm = this;
        vm.register = register;
        function register() {
            vm.dataLoading = true;
            UserService.Create(vm.user)
                .then(function (response) {
                    if (response.success) {
                        FlashService.Success('Registration successful', true);
                        $location.path('/login');
                    } else {
                        FlashService.Error(response.message);
                        vm.dataLoading = false;
                    }
                });
        }

        var vm = this;
        var logSuccess = common.logger.getLogFn('RegisterController', 'success');
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
            common.activateController([], 'RegisterController');
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
    }

})();
