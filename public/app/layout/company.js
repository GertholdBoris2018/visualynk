(function () {
    'use strict';
    var controllerId = 'CompanyController';

    var app = angular.module('app');
    var modalInstance = null;

    app.controller(controllerId,
        ['$rootScope','$scope', '$modal','$window', '$location', 'common', 'config','$route','UserService','ModelService','$http','$log','$timeout', 'DTOptionsBuilder', 'DTColumnDefBuilder', CompanyController]);

    function CompanyController($rootScope, $scope, $modal, $window, $location, common, config ,route,UserService,ModelService,$http,$log,$timeout, DTOptionsBuilder, DTColumnDefBuilder) {

        $rootScope.loggedIn = false;
        angular.element('body').removeClass("page-sidebar-closed");
        var vm = this;

        initController();

        function initController() {
            loadCurrentUser();
        }
        function loadCurrentUser() {
            $scope.user = $rootScope.globals.currentUser;
            if ($scope.user.usertype != "admin") {
                $location.path("/main");
            }
        }

        $rootScope.reload_company_list = function(){
            UserService.GetCompanies().then(function(response){
                $scope.companies = response.data.companies;
                $scope.companies.forEach(function(company,index){
                    $scope.companies[index]._fields[0].properties.departments = JSON.parse($scope.companies[index]._fields[0].properties.departments);
                })
            });
        }

        UserService.GetCompanies().then(function(response){
            $scope.companies = response.data.companies;
            $scope.companies.forEach(function(company,index){
                $scope.companies[index]._fields[0].properties.departments = JSON.parse($scope.companies[index]._fields[0].properties.departments);
            })
        });

        UserService.GetCountries().then(function(response){
            $scope.countries = response.data;
        });

        $scope.open_new_company_modal = function() {
            $rootScope.initFlash = false;
            $scope.opts = {
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'add_new_company.html',
                controller : 'PopupCont_Add_New_Company',
                resolve: {} // empty storage
            };
            modalInstance = $modal.open($scope.opts);
        }

        $scope.open_edit_company_modal = function(company_id){

            $rootScope.edit_company_id = company_id;
            $rootScope.is_company_edit = true;

            $rootScope.initFlash = false;
            $scope.opts = {
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'add_new_company.html',
                controller : 'PopupCont_Add_New_Company',
                resolve: {} // empty storage
            };
            modalInstance = $modal.open($scope.opts);
        }

        $scope.open_delete_company_confirm_modal = function(company_id){
            $rootScope.delete_company_id = company_id;
            $rootScope.is_company_delete = true;

            $rootScope.initFlash = false;
            $scope.opts = {
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'delete_company.html',
                controller : 'PopupCont_Delete_Company',
                resolve: {} // empty storage
            };
            modalInstance = $modal.open($scope.opts);
        }
    };

    angular.module('app').controller('PopupCont_Add_New_Company', ['$scope','$modalInstance',function ($scope, $modalInstance) {
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

    angular.module('app').controller('PopupCont_Delete_Company', ['$scope','$modalInstance',function ($scope, $modalInstance) {
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

    angular.module('app').controller('AddCompanyCtrl', ['$rootScope','$scope','common', 'datacontext', '$window', '$location', 'FlashService', 'UserService',addCompanyProc]);
    function addCompanyProc($rootScope, $scope, common, datacontext, $window, $location, FlashService, UserService) {
        $scope.add_company_submit = addCompanySubmit;

        modalInstance.result.finally(function(){
            $rootScope.edit_company_id = "";
            $rootScope.is_company_edit = false;

            $scope.departments = [];
            $scope.role = 'Portfolio Owner';
            $scope.country = 'United States';
            $scope.title_text = "Add";
            $scope.companyname = "";
            $scope.description = "";
            $scope.email = "";
            $scope.phone = "";
            $scope.street = "";
            $scope.postalbox = "";
            $scope.zipcode = "";
            $scope.citytown = "";
            $scope.state = "";
            $scope.works_for = "";
        })

        if($rootScope.is_company_edit){
            $scope.title_text = "Update";
            var company_id = $rootScope.edit_company_id;
            var companyInfo = {};
            companyInfo.company_id = company_id
            UserService.GetCompany(companyInfo).then(function(response){
                var company = response.data.company;

                $scope.companyname = company[0]._fields[0].properties.companyname;
                $scope.description = company[0]._fields[0].properties.description;
                $scope.departments = JSON.parse(company[0]._fields[0].properties.departments);
                $scope.role = company[0]._fields[0].properties.role;
                $scope.email = company[0]._fields[0].properties.email;
                $scope.phone = parseFloat(company[0]._fields[0].properties.phone);
                $scope.street = company[0]._fields[0].properties.street;
                $scope.postalbox = company[0]._fields[0].properties.postalbox;
                $scope.zipcode = company[0]._fields[0].properties.zipcode;
                $scope.citytown = company[0]._fields[0].properties.citytown;
                $scope.state = company[0]._fields[0].properties.state;
                $scope.country = company[0]._fields[0].properties.country;
                $scope.works_for = company[0]._fields[0].properties.works_for;
            });
        } else {
            $scope.departments = [];
            $scope.role = 'Portfolio Owner';
            $scope.country = 'United States';
            $scope.title_text = "Add";
        }

        UserService.GetCountries().then(function(response){
            $scope.countries = response.data;
        });

        UserService.GetCompanies().then(function(response){
            $scope.companies = response.data.companies;
        });

        function addCompanySubmit() {
            $scope.dataLoading = true;
            var companyInfo = {};
            companyInfo.companyname = $scope.companyname;
            companyInfo.description = $scope.description;
            companyInfo.departments = JSON.stringify($scope.departments);
            companyInfo.role = $scope.role;
            companyInfo.email = $scope.email;
            companyInfo.phone = $scope.phone;
            companyInfo.street = $scope.street;
            companyInfo.postalbox = $scope.postalbox;
            companyInfo.zipcode = $scope.zipcode;
            companyInfo.citytown = $scope.citytown;
            companyInfo.state = $scope.state;
            companyInfo.country = $scope.country;
            companyInfo.works_for = $scope.works_for;

            if(companyInfo.role == "Portfolio Owner")
                companyInfo.works_for = "";

            if ($rootScope.is_company_edit){
                companyInfo.company_id = $rootScope.edit_company_id;

                UserService.UpdateCompany(companyInfo)
                    .then(function (response) {
                        $rootScope.initFlash = true;

                        $scope.companyname = "";
                        $scope.description = "";
                        $scope.departments = [];
                        $scope.role = 'Portfolio Owner';
                        $scope.email = "";
                        $scope.phone = "";
                        $scope.street = "";
                        $scope.postalbox = "";
                        $scope.zipcode = "";
                        $scope.citytown = "";
                        $scope.state = "";
                        $scope.country = "United States";
                        $scope.works_for = "";
                        $scope.title_text = "Add";

                        var msg = response.data.msg;
                        if (msg == "success") {
                            $rootScope.is_company_edit = false;
                            FlashService.Success('Update successful', true);
                            $scope.dataLoading = false;
                            modalInstance.close();
                            $rootScope.reload_company_list();
                        }
                        else {
                            FlashService.Error(msg);
                            $scope.dataLoading = false;
                        }
                    });
            } else {
                UserService.AddCompany(companyInfo)
                    .then(function (response) {
                        $rootScope.initFlash = true;
                        var msg = response.data.msg;
                        if (msg == "success") {
                            FlashService.Success('Registration successful', true);
                            $scope.dataLoading = false;
                            modalInstance.close();
                            $rootScope.reload_company_list();
                        }
                        else {
                            FlashService.Error(msg);
                            $scope.dataLoading = false;
                        }
                    });
            }
        };

        $scope.addDepartment = function () {
            if($scope.department != undefined && $scope.department != "") {
                $scope.departments.push($scope.department);
                $scope.department = "";
            }
        };

        $scope.delDepartment = function (ind) {
            $scope.departments.splice(ind, 1);
        };
    }

    angular.module('app').controller('DeleteCompanyCtrl', ['$rootScope','$scope','common', 'datacontext', '$window', '$location', 'FlashService', 'UserService',deleteCompanyProc]);
    function deleteCompanyProc($rootScope, $scope, common, datacontext, $window, $location, FlashService, UserService){
        $scope.delete_company_submit = deleteCompanySubmit;

        function deleteCompanySubmit(){

            var companyInfo = {};
            companyInfo.company_id = $rootScope.delete_company_id;

            UserService.DeleteCompany(companyInfo)
                .then(function (response) {
                    $rootScope.initFlash = true;
                    var msg = response.data.msg;
                    if (msg == "success") {
                        FlashService.Success('Delete successful', true);
                        $scope.dataLoading = false;
                        modalInstance.close();
                        $rootScope.reload_company_list();
                    }
                    else {
                        FlashService.Error(response.data.responseData.fields[0].message);
                        $scope.dataLoading = false;
                    }
                });
        }
    }

})();
