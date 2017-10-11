(function () {
    'use strict';

    var controllerId = 'UserController';

    var app = angular.module('app');
    var modalInstance = null;
    var bimserverUrl = 'http://localhost:8082';
    
    app.controller(controllerId,
        ['$rootScope','$scope', '$filter','$modal','$window', '$location', 'common', 'config','$route','UserService','ModelService','$http','$log','$timeout', 'DTOptionsBuilder', 'DTColumnDefBuilder', UserController]);

    function UserController($rootScope, $scope, $filter, $modal, $window, $location, common, config ,route,UserService,ModelService,$http,$log,$timeout, DTOptionsBuilder, DTColumnDefBuilder) {

        $rootScope.loggedIn = false;
        $scope.bimusers = [];
        $scope.bimuser = "";
        angular.element('body').removeClass("page-sidebar-closed");
        var vm = this;

        initController();

        function initController() {
            loadCurrentUser();
            loadBimAccountToken();
            
        }
        function loadCurrentUser() {
            $scope.user = $rootScope.globals.currentUser;
            if ($scope.user.usertype != "admin") {
                $location.path("/main");
            }
        }
        function loadBimAccountToken(){
            UserService.GetLoadBimToken().then(function(response){
                var token = -1;
                var msg = response.data.token;
                if(typeof msg.response != "undefined"){
                    token = response.data.token.response.result;
                    loadBimProject_Users(token);
                }
                    
                if(response.data.token.code == "ECONNREFUSED"){
                    token = -2;
                }
                //save BimToken
                $rootScope.globals.bimToken = token;
                console.log($rootScope.globals.bimToken);
            });
        }
        function loadBimProject_Users(token){
            var tokenInfo = {};
            tokenInfo.token = token;
            UserService.GetLoadBimProject_Users(tokenInfo).then(function(response){
                console.log(response);
                var projects = response.data.projects;
                var users = response.data.users;
                var msg = response.data.msg;
                if(msg == "success"){
                    var totalFound = 0;
                    users.forEach(function(user){
                            var tmp = {};
                            tmp.uoid = user.oid;
                            tmp.name = user.username;
                            $scope.bimusers.push(tmp);
                    });
                    projects.forEach(function(project){
                            var tmp = {};
                            tmp.poid = project.oid;
                            tmp.roid = project.lastRevisionId;
                            tmp.name = project.name;
                            tmp.users = [];
                            project.hasAuthorizedUsers.forEach(function(uid){
                                var user = {};
                                user.id = uid;
                                var newTemp = $filter("filter")($scope.bimusers,{uoid:uid});
                                user.name = newTemp[0].name;
                                tmp.users.push(user);
                            });
                            $scope.projects.push(tmp);
                            totalFound++;
                    });
                    
                    if (totalFound == 0) {
						$scope.message = "No projects with revisions found on this server";
					} else {
						$scope.message = "";
					}
                }
                else if(msg == "tokenerror"){
                    $scope.message = "The Visualynk's bim admin account does not match with the one on the Bim Server.";
                }
                else{
                    $scope.message = "Error when getting project and users from Bim server";
                }
            });
        }

        //add user to BimServer's loadBimProject_Users
        $scope.addUsertoProject = function(){
            if($scope.project == "" || $scope.bimuser == ""){
                $scope.message = "Please select project and user";
            }
            else{
                $scope.message = "";
                var info = {};
                info.poid = $scope.project;
                info.uoid = $scope.bimuser;
                info.token = $rootScope.globals.bimToken;
                UserService.addUserToProjectBim(info).then(function(response){
                    console.log(response);
                    var msg = response.data.msg;
                    if(msg == "success"){
                        $scope.message = "Successfully assign to the Project.";
                        $scope.projects = [];
                        $scope.users = [];
                        loadBimAccountToken();
                    }
                    else if(msg == "tokenerror"){
                        $scope.message = "The Visualynk's bim admin account does not match with the one on the Bim Server.";
                    }
                    else{
                        $scope.message = "Error occured when add User to Project on BimServer.";
                    }
                });
            }
        }
        $scope.removeUserFromProject = function(poid, uoid){
            var info = {};
            info.poid = poid;
            info.uoid = uoid;
            info.token = $rootScope.globals.bimToken;
            UserService.removeUserFromProject(info).then(function(response){
                console.log(response);
                var msg = response.data.msg;
                if(msg == "success"){
                    $scope.message = "Successfully revoke user from the Project.";
                    $scope.projects = [];
                    $scope.users = [];
                    loadBimAccountToken();
                }
                else if(msg == "tokenerror"){
                    $scope.message = "The Visualynk's bim admin account does not match with the one on the Bim Server.";
                }
                else{
                    $scope.message = "Error occured when revoke User from Project on BimServer.";
                }
            });
        }
        $scope.uservisibilities = {};

        $scope.tab = 1;

        $scope.setTab = function(newTab){
            if(newTab == 3){
                var gottoken = $rootScope.globals.bimToken;
                if(gottoken == -2){
                    $scope.conrefused = true;
                    $scope.confailed = false;
                    $scope.projectAssignment = false;
                }
                else if(gottoken == -1){
                    $scope.confailed = true;
                    $scope.conrefused = false;
                    $scope.projectAssignment = false;
                }
                else{
                    $scope.confailed = false;
                    $scope.conrefused = false;
                    $scope.projectAssignment = true;
                }
            }
            $scope.tab = newTab;
        };

        $scope.isSet = function(tabNum){
            return $scope.tab === tabNum;
        };

        $rootScope.reload_user_list = function(){
            UserService.GetUsers().then(function(response){
                $scope.users = response.data.users;
            });
        }

        UserService.GetCompanies().then(function(response){
            $scope.companies = response.data.companies;
            $scope.companies.forEach(function(company,index){
                $scope.companies[index]._fields[0].properties.departments = JSON.parse($scope.companies[index]._fields[0].properties.departments);
            })
        });

        UserService.GetUsers().then(function(response){
            $scope.users = response.data.users;

            $scope.users.forEach(function (user, index) {

                if(user._fields[0].properties.hasOwnProperty("restrictGroups"))
                    var user_visibility = JSON.parse(user._fields[0].properties.restrictGroups);
                else
                    var user_visibility = [];

                $scope.uservisibilities[user._fields[0].identity.low] = {}

                for(var i=0; i<user_visibility.length; i++){
                    $scope.uservisibilities[user._fields[0].identity.low][user_visibility[i]] = true;
                }
            })

        });

        $scope.saveUserVisibilities = function (userId, ngId) {

            var userInfo = {};
            userInfo.userId = userId;

            var visibilities = [];
            for(var k in $scope.uservisibilities[userId]) {
                if($scope.uservisibilities[userId][k])
                    visibilities.push(k);
            }
            userInfo.restrictGroups = JSON.stringify(visibilities);

            UserService.SaveUserVisibility(userInfo)
                .then(function (response) {

                    var msg = response.data.msg;
                    if (msg == "success") {

                    }
                    else {

                    }

                });
        }

        var ngInfo = {};
        ngInfo.companyId = "";
        ngInfo.userId = "";
        UserService.GetNodeGroups(ngInfo).then(function (response) {
            $scope.nodegroups = response.data.responseData.data;
        })

        $scope.open_new_user_modal = function() {
            $rootScope.initFlash = false;
            $scope.opts = {
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'add_new_user.html',
                controller : 'PopupCont_Manage_User',
                resolve: {} // empty storage
            };
            modalInstance = $modal.open($scope.opts);
        }

        $scope.open_edit_user_modal = function(user_id){

            $rootScope.edit_user_id = user_id;
            $rootScope.is_user_edit = true;

            $rootScope.initFlash = false;
            $scope.opts = {
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'add_new_user.html',
                controller : 'PopupCont_Manage_User',
                resolve: {} // empty storage
            };
            modalInstance = $modal.open($scope.opts);
        }

        $scope.open_delete_user_confirm_modal = function(company_id){
            $rootScope.delete_user_id = company_id;
            $rootScope.is_user_delete = true;

            $rootScope.initFlash = false;
            $scope.opts = {
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'delete_user.html',
                controller : 'PopupCont_Delete_User',
                resolve: {} // empty storage
            };
            modalInstance = $modal.open($scope.opts);
        }

        //bim Server
        //scope bim projects
        $scope.projects = [];
        $scope.project = "";
    };

    angular.module('app').controller('PopupCont_Manage_User', ['$scope','$modalInstance',function ($scope, $modalInstance) {
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

    angular.module('app').controller('PopupCont_Delete_User', ['$scope','$modalInstance',function ($scope, $modalInstance) {
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

    angular.module('app').controller('AddUserCtrl', ['$rootScope','$scope','common', 'datacontext', '$window', '$location', 'FlashService', 'UserService',addUserProc]);
    function addUserProc($rootScope, $scope, common, datacontext, $window, $location, FlashService, UserService) {
        $scope.add_user_submit = addUserSubmit;

        modalInstance.result.finally(function(){
            $rootScope.edit_user_id = "";
            $rootScope.is_user_edit = false;

            $scope.title_text = "Add";
            $scope.firstName = '';
            $scope.lastName = '';
            $scope.username = '';
            $scope.userEmail = "";
            $scope.password = "";
            $scope.userCompany = "";
            $scope.userGroup = "";
        })

        if($rootScope.is_user_edit){
            $scope.title_text = "Update";
            var user_id = $rootScope.edit_user_id;

            var userInfo = {};
            userInfo.user_id = user_id;
            UserService.GetUser(userInfo).then(function(response){
                var user = response.data.user;

                $scope.firstName = user[0]._fields[0].properties.firstName;
                $scope.lastName = user[0]._fields[0].properties.lastName;
                $scope.username = user[0]._fields[0].properties.username;
                $scope.password = user[0]._fields[0].properties.password;
                $scope.userEmail = user[0]._fields[0].properties.emailaddress;
                $scope.userCompany = user[0]._fields[0].properties.userCompany;
                $scope.userGroup = user[0]._fields[0].properties.userGroup;

            });
        } else {
            $scope.title_text = "Add";
            $scope.firstName = '';
            $scope.lastName = '';
            $scope.username = '';
            $scope.userEmail = "";
            $scope.password = "";
            $scope.userCompany = "";
            $scope.userGroup = "";
        }

        UserService.GetCompanies().then(function(response){
            $scope.companies = response.data.companies;
        });

        function addUserSubmit() {
            $scope.dataLoading = true;
            var userInfo = {};
            userInfo.firstName = $scope.firstName;
            userInfo.lastName = $scope.lastName;
            userInfo.username = $scope.username;
            userInfo.password = $scope.password;
            userInfo.userEmail = $scope.userEmail;
            userInfo.userCompany = $scope.userCompany;
            userInfo.userGroup = $scope.userGroup;

            if ($rootScope.is_user_edit) {
                userInfo.user_id = $rootScope.edit_user_id;

                UserService.UpdateUser(userInfo)
                    .then(function (response) {
                        $rootScope.initFlash = true;
                        var msg = response.data.msg;
                        if (msg == "success") {
                            //FlashService.Success('Registration successful', true);
                            $rootScope.is_user_edit = false;
                            $scope.dataLoading = false;
                            modalInstance.close();

                            //get User from user emailaddress from BIMServer
                            var user = {};
                            user.username = userInfo.userEmail;
                            user.token = $rootScope.globals.bimToken;
                            UserService.getUserByUserName(user)
                            .then(function (response){
                                var poid = response.data.response.response.result;
                                if(typeof poid != 'undefined'){
                                    var oid = poid.oid;
                                    console.log("oid => " + oid );
                                    var duser = {};
                                    duser.oid = oid;
                                    duser.token = $rootScope.globals.bimToken;
                                    //delete user by oid from BIM Server
                                    UserService.deleteUserbyOid(duser)
                                    .then(function (response){
                                        
                                        //delete user by oid from BIM Server
                                        console.log(response);
                                        var msg = response.data.msg;
                                        if(msg == "success"){
                                            //create the BIM Server user
                                            UserService.CreateBimSeverAccont(userInfo)
                                            .then(function (response) {
                                                var msg = response.data.msg;
                                                if(msg == "success"){
                                                    FlashService.Success('Registration successful', true);
                                                }
                                                else {
                                                    FlashService.Success('Registration successful, But not updated on BIMServer because of Network to BIM Server.', true);
                                                }
                                                
                                            });
                                        }
                                        else{
                                            
                                        }
                                        $rootScope.reload_user_list();
                                    });
                                }
                                else{
                                    UserService.CreateBimSeverAccont(userInfo)
                                    .then(function (response) {
                                        var msg = response.data.msg;
                                        if(msg == "success"){
                                            FlashService.Success('Registration successful', true);
                                        }
                                        else {
                                            FlashService.Success('Registration successful, But not created on BIMServer because of Network to BIM Server.', true);
                                        }
                                        $rootScope.reload_user_list();
                                    });
                                }
                                
                            });
                            //Update BIM Server User
                            $rootScope.reload_user_list();
                        }
                        else {
                            FlashService.Error(msg);
                            $scope.dataLoading = false;
                        }
                    });
            } else {
                UserService.Create(userInfo)
                    .then(function (response) {
                        $rootScope.initFlash = true;
                        var msg = response.data.msg;
                        if (msg == "success") {
                            //FlashService.Success('Registration successful', true);

                            $scope.dataLoading = false;
                            modalInstance.close();

                            //create the BIM Server user
                            UserService.CreateBimSeverAccont(userInfo)
                            .then(function (response) {
                                var msg = response.data.msg;
                                if(msg == "success"){
                                    FlashService.Success('Registration successful', true);
                                }
                                else {
                                    FlashService.Success('Registration successful, But not created on BIMServer because of Network to BIM Server.', true);
                                    
                                }
                                $rootScope.reload_user_list();
                            });
                        }
                        else {
                            FlashService.Error(msg);
                            $scope.dataLoading = false;
                        }
                    });
            }
        };

    }

    angular.module('app').controller('DeleteUserCtrl', ['$rootScope','$scope','common', 'datacontext', '$window', '$location', 'FlashService', 'UserService',deleteUserProc]);
    function deleteUserProc($rootScope, $scope, common, datacontext, $window, $location, FlashService, UserService){
        $scope.delete_user_submit = deleteUserSubmit;

        function deleteUserSubmit(){

            var userInfo = {};
            userInfo.user_id = $rootScope.delete_user_id;

            UserService.DeleteUser(userInfo)
                .then(function (response) {
                    $rootScope.initFlash = true;
                    var msg = response.data.msg;
                    if (msg == "success") {
                        FlashService.Success('Delete successful', true);
                        $scope.dataLoading = false;
                        modalInstance.close();
                        $rootScope.reload_user_list();
                    }
                    else {
                        FlashService.Error(response.data.responseData.fields[0].message);
                        $scope.dataLoading = false;
                    }
                });
        }
    }

})();
