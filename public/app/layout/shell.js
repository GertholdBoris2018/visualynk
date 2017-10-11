(function () { 
    'use strict';
    
    var controllerId = 'shell';
    angular.module('app').controller(controllerId,
        ['$rootScope', 'common', 'config','$route','$location', shell]);

    function shell($rootScope, common, config ,route,$location) {
        var vm = this;
        vm.topnavShow = true;
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
                console.log($location.path());
                var restrictedMainPage = $.inArray($location.path(), ['/main']) === -1;
                if(!restrictedMainPage){
                    vm.topnavShow = false;
                }
                else{
                    vm.topnavShow = true;
                }
                toggleSpinner(false);
            }
        );

        $rootScope.$on(events.spinnerToggle,
            function (data) {
                toggleSpinner(data.show);
            }
        );
    };
})();