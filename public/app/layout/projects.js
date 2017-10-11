(function () {
    'use strict';

    var controllerId = 'ProjectController';

    var app = angular.module('app');
    var modalInstance = null;
    var bimserverUrl = 'http://localhost:8082';
    
    app.controller(controllerId,
        ['$rootScope','$scope', '$filter','$modal','$window', '$location', 'common', 'config','$route','UserService','ModelService','$http','$log','$timeout', 'DTOptionsBuilder', 'DTColumnDefBuilder', ProjectController]);

    function ProjectController($rootScope, $scope, $filter, $modal, $window, $location, common, config ,route,UserService,ModelService,$http,$log,$timeout, DTOptionsBuilder, DTColumnDefBuilder) {

        $rootScope.loggedIn = false;
        $scope.bimusers = [];
        $scope.bimuser = "";
        $scope.message = "";
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
                var smallprojects = response.data.smallprojects;
                var users = response.data.users;
                var msg = response.data.msg;
                if(msg == "success"){
                    var totalFound = 0;
                    $scope.projects = [];
                    $scope.bimusers = [];
                    $scope.allprojects = [];
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
                            tmp.description = project.description;
                            tmp.state = project.state;
                            tmp.schema = project.schema;
                            tmp.subprojects = project.subProjects.length;
                            tmp.revisions = project.revisions.length;
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
                        
                        smallprojects.forEach(function(project){
                            var parent_id = project.parentId;
                            if(parent_id == -1){
                                project.indent = 0;
                                project.name = project.name;
                            }
                            else{
                                var parent = $filter('filter')(smallprojects, { oid: parent_id });
                                project.indent = parent[0].indent + 1;
                                var prefix = "";
                                for(var i = 0; i < project.indent ; i++){
                                    prefix += "&nbsp;&nbsp;&nbsp;&nbsp;";
                                }
                                project.name = prefix + project.name;
                            }
                        })
                        $scope.allprojects = smallprojects;
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
                        $scope.allprojects = [];
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
                    $scope.allprojects = [];
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
            if(newTab == 2){
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

        $rootScope.reload_project_list = function(){
            loadBimAccountToken();
        }

        UserService.GetCompanies().then(function(response){
            $scope.companies = response.data.companies;
            $scope.companies.forEach(function(company,index){
                $scope.companies[index]._fields[0].properties.departments = JSON.parse($scope.companies[index]._fields[0].properties.departments);
            })
        });

        var tokenInfo = {};
        tokenInfo.token = $rootScope.globals.bimToken;
        UserService.GetProjects(tokenInfo).then(function(response){
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

        $scope.open_new_project_modal = function() {
            $rootScope.initFlash = false;
            $scope.opts = {
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'add_new_project.html',
                controller : 'PopupCont_Manage_Project',
                resolve: {} // empty storage
            };
            modalInstance = $modal.open($scope.opts);
        }
        $scope.open_new_subproject_modal = function(poid){
            $rootScope.ppoid = poid;
            $rootScope.initFlash = false;
            $scope.opts = {
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'add_new_subproject.html',
                controller : 'PopupCont_Manage_Project',
                resolve: {} // empty storage
            };
            modalInstance = $modal.open($scope.opts);
        }
        $scope.open_new_ifc_upload = function(poid,pname){
            $rootScope.ifc_poid = poid;
            $rootScope.initFlash = false;
            $rootScope.comment = '';
            $rootScope.d_serialize = '';
            $rootScope.projectTitle = pname.replace(/&nbsp;/g,'');
            $scope.opts = {
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'checkin_ifc.html',
                controller : 'PopupCont_Manage_Project',
                resolve: {} // empty storage
            };
            //get all deserializers for project
            var Info = {};
            Info.poid = poid;
            Info.token = $rootScope.globals.bimToken;

            UserService.GetAllDeserializersForProject(Info).then(function(response){
                $rootScope.deserializes = [];
                $rootScope.initFlash = true;
                    var msg = response.data.msg;
                        
                    $scope.dataLoading = false;
                    var msg = response.data.msg;
                    if(msg == "success"){
                        var data = response.data.result.response.result;
                        $rootScope.deserializes = data;
                        $rootScope.d_serialize = data[1].oid.toString();
                        
                        modalInstance = $modal.open($scope.opts);
                    }
                    else if(msg == "tokenerror"){
                        $scope.checkInmsg = "The Visualynk's bim admin account does not match with the one on the Bim Server.";
                    }
                    else{
                        $scope.checkInmsg = "Error when getting project and users from Bim server";
                    }
            });

            
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

        $scope.open_delete_project_confirm_modal = function(poid){
            $rootScope.delete_project_id = poid;
            //$rootScope.is_user_delete = true;

            $rootScope.initFlash = false;
            $scope.opts = {
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'delete_project.html',
                controller : 'PopupCont_Delete_Project',
                resolve: {} // empty storage
            };
            modalInstance = $modal.open($scope.opts);
        }

        //bim Server
        //scope bim projects
        $scope.projects = [];
        $scope.allprojects = [];
        $scope.project = "";

        //define DTOptionsBuilder
        $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('order',[]);
        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0).notSortable(),
            DTColumnDefBuilder.newColumnDef(1).notSortable(),
            DTColumnDefBuilder.newColumnDef(2).notSortable(),
            DTColumnDefBuilder.newColumnDef(3).notSortable()
        ];

        $scope.isShown = function(project){
            //console.log(project);
            if(project.state == 'ACTIVE')
                return true;
            else
                return false;
        }
    };

    angular.module('app').controller('PopupCont_Manage_Project', ['$scope','$modalInstance',function ($scope, $modalInstance) {
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

    angular.module('app').controller('PopupCont_Delete_Project', ['$scope','$modalInstance',function ($scope, $modalInstance) {
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

    angular.module('app').controller('AddProjectCtrl', ['$rootScope','$scope','common', 'datacontext', '$window', '$location', 'FlashService', 'UserService',addUserProc]);
    function addUserProc($rootScope, $scope, common, datacontext, $window, $location, FlashService, UserService) {
        $scope.add_project_submit = addProjectSubmit;
        $scope.initFlash = false;
        $scope.add_subproject_submit = addSubProjectSubmit;
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

        function addProjectSubmit() {
            $scope.dataLoading = true;
            var $spcope = $scope;
            var userInfo = {};
            userInfo.name = $scope.projectname;
            userInfo.token = $rootScope.globals.bimToken;

            if ($rootScope.is_user_edit) {
                
            } else {
                UserService.createProjectBim(userInfo)
                    .then(function (response) {
                        $rootScope.initFlash = true;
                        var msg = response.data.msg;
                            
                        $scope.dataLoading = false;
                        $scope.initFlash = true;
                        var msg = response.data.msg;
                        if(msg == "success"){
                            var result = response.data.result.response;
                            if(typeof result.exception != 'undefined'){
                                FlashService.Error(result.exception.message, true);
                            }
                            else{
                                var totalFound = 0;
                                $scope.message = "The project is created successfully.";
                                FlashService.Success('The project is created successfully', true);
                                $rootScope.reload_project_list();
                                modalInstance.close();
                            }
                            
                        }
                        else if(msg == "tokenerror"){
                            FlashService.Error("The Visualynk's bim admin account does not match with the one on the Bim Server.", true);
                            $scope.message = "The Visualynk's bim admin account does not match with the one on the Bim Server.";
                        }
                        else{
                            FlashService.Error('Error when getting project and users from Bim server', true);
                            $scope.message = "Error when getting project and users from Bim server";
                        }
                    });
            }
        };
        function addSubProjectSubmit(){
            var ppoid = $rootScope.ppoid;
            $scope.dataLoading = true;
            var pInfo = {};
            pInfo.ppoid = ppoid;
            pInfo.name = $scope.sprojectname;
            pInfo.token = $rootScope.globals.bimToken;

            
            UserService.createSubProjectBim(pInfo)
                .then(function (response) {
                    $rootScope.initFlash = true;
                    var msg = response.data.msg;
                    
                    $scope.dataLoading = false;
                    $scope.initFlash = true;
                    if(msg == "success"){
                        var result = response.data.result.response;
                        if(typeof result.exception != 'undefined'){
                            FlashService.Error(result.exception.message, true);
                        }
                        else{
                            var totalFound = 0;
                            $scope.message = "The sub project is created successfully.";
                            FlashService.Success('The sub project is created successfully', true);
                            $rootScope.reload_project_list();
                            modalInstance.close();
                        }
                        
                    }
                    else if(msg == "tokenerror"){
                        FlashService.Error("The Visualynk's bim admin account does not match with the one on the Bim Server.", true);
                        $scope.message = "The Visualynk's bim admin account does not match with the one on the Bim Server.";
                    }
                    else{
                        FlashService.Error('Error when getting project and users from Bim server', true);
                        $scope.message = "Error when getting project and users from Bim server";
                    }
                    
                });
            
        }
    }

    angular.module('app').controller('DeleteProjectCtrl', ['$rootScope','$scope','common', 'datacontext', '$window', '$location', 'FlashService', 'UserService',deleteProjectProc]);
    function deleteProjectProc($rootScope, $scope, common, datacontext, $window, $location, FlashService, UserService){
        $scope.delete_project_submit = deleteProjectSubmit;

        function deleteProjectSubmit(){

            var projectInfo = {};
            projectInfo.poid = $rootScope.delete_project_id;
            projectInfo.token = $rootScope.globals.bimToken;
            UserService.deleteProjectBim(projectInfo)
                .then(function (response) {
                    $rootScope.initFlash = true;
                    var msg = response.data.msg;
                    $scope.dataLoading = false;
                    var msg = response.data.msg;
                    if(msg == "success"){
                        var totalFound = 0;
                        $scope.message = "The project is deleted successfully.";
                        FlashService.Success('The project is deleted successfully', true);
                        $rootScope.reload_project_list();
                    }
                    else if(msg == "tokenerror"){
                        FlashService.Error("The Visualynk's bim admin account does not match with the one on the Bim Server.", true);
                        $scope.message = "The Visualynk's bim admin account does not match with the one on the Bim Server.";
                    }
                    else{
                        FlashService.Error('Error when getting project and users from Bim server', true);
                        $scope.message = "Error when getting project and users from Bim server";
                    }
                    modalInstance.close();
                });
        }
    }
    var ngdropzoneCtrl = angular.module('app').controller('CheckInCtrl', ['$rootScope','$scope','common', 'datacontext', '$window', '$location','$interval', 'FlashService', 'UserService','ngProgressFactory',checkinProc]);
    ngdropzoneCtrl.config(function(dropzoneOpsProvider){
        dropzoneOpsProvider.setOptions({
            url : '/upload_1.php',
            acceptedFiles : '*',
            addRemoveLinks : true,
            dictDefaultMessage : 'Click to add or drop photos',
            dictRemoveFile : 'Remove photo',
            dictResponseError : 'Could not upload this photo'
        });
    });
    function checkinProc($rootScope, $scope, common, datacontext, $window, $location,$interval, FlashService, UserService,ngProgressFactory){
        Dropzone.autoDiscover = false;
        $scope.showBtns = false;
        $scope.lastFile = null;
        $scope.fileExt = null;
        $scope.interval = null;
        $scope.oid = null;
        $scope.submitdisabled = false;
        $scope.geometryLoadingState = false;
        $scope.getDropzone = function(){
            console.log($scope.dzMethods.getDropzone());
            alert('Check console log.');
        };
        $scope.getFiles = function(){
            console.log($scope.dzMethods.getAllFiles());
            alert('Check console log.');
        };
        
        $scope.dzOptions = {
            url : '/uploadifcToProject',
            // params:{token:$rootScope.globals.bimToken, poid : $rootScope.ifc_poid , ext: $scope.fileExt , oid: $scope.oid},
            dictDefaultMessage : 'Add ifc file for project',
            acceptedFiles : '.ifc',
            parallelUploads : 1,
            paramName : 'file',
            autoProcessQueue : false,
            maxFiles:1,
            init:function(){
                this.on('sending', function(file, xhr , formData){

                    formData.append('token', $rootScope.globals.bimToken);
                    formData.append('poid', $rootScope.ifc_poid);
                    formData.append('ext', $scope.fileExt);
                    formData.append('oid', $scope.oid);
                    formData.append('comment',$rootScope.comment);
                    // var info = {};
                    // info.token = $rootScope.globals.bimToken;
                    // info.poid = $rootScope.ifc_poid;
                    // info.ext = $scope.fileExt;
                    // info.oid = $scope.oid;
                    // info.comment = $rootScope.comment;
                    // UserService.ifcinitcheckin(info).then(function(response){
                    //     console.log(response);
                    // });
                }),
                this.on("maxfilesexceeded", function(file) {
                        this.removeAllFiles();
                        this.addFile(file);
                });
            }
        };
        
        $scope.dzMethods = {};
        
        $scope.dzCallbacks = {
            'addedfile' : function(file){
                $scope.showBtns = true;
                $scope.lastFile = file;
                var filename = file.name;
                $scope.fileExt = file.name.split('.')[1];
                var Info = {};
                Info.token = $rootScope.globals.bimToken;
                Info.extension = $scope.fileExt;
                Info.poid = $rootScope.ifc_poid;
                UserService.GetSuggestedDeserializerForExtension(Info).then(function(response){
                    $rootScope.initFlash = true;
                        var msg = response.data.msg;
                            
                        $scope.dataLoading = false;
                        var msg = response.data.msg;
                        if(msg == "success"){
                            var result = response.data.result.response.result;
                            var name = result.name;
                            $scope.oid = result.oid;
                            var oid = result.oid;
                            $rootScope.d_serialize = oid.toString();
                            $rootScope.comment = filename;
                        }
                        else if(msg == "tokenerror"){
                            FlashService.Error("The Visualynk's bim admin account does not match with the one on the Bim Server.", true);
                            $scope.checkInmsg = "The Visualynk's bim admin account does not match with the one on the Bim Server.";
                        }
                        else{
                            FlashService.Error('Error when getting project and users from Bim server', true);
                            $scope.checkInmsg = "Error when getting project and users from Bim server";
                        }
                });
            },
            'success': function(file,xhr){
                console.log(file);
                // $scope.checkInmsg = "Generating the Geometries...";

                //ng progress working for the generating geometry
                $scope.contained_progressbar = ngProgressFactory.createInstance();
				$scope.contained_progressbar.setParent(document.getElementById('ifcmodalCont'));
				$scope.contained_progressbar.setAbsolute();
                $scope.checkInmsg = "";
                //$scope.contained_progressbar.start();
                
                if($scope.interval != null){
                    $interval.cancel($scope.interval);
                    //initial progress bar start
                    // $scope.contained_progressbar.reset();
                    $scope.checkInmsg = "";
                }
                //initial progress bar start
                // $scope.contained_progressbar.start();
                // $scope.checkInmsg = "initializing...";
                $scope.contained_progressbar.start();
                $scope.getProgress();
                $scope.interval  = $interval(function(){
                    $scope.getProgress();
                }, 1000);
                // modalInstance.dismiss('cancel');
                // $rootScope.reload_project_list();
            },
            'error' : function(file, xhr){
                console.warn('File failed to upload from dropzone 2.', file, xhr);
                $scope.checkInmsg = "File failed to upload from dropzone.";
            }
        };
        $scope.getProgress = function(){
            
            var poid = $rootScope.ifc_poid;
            //get progress of topic for project
            var info = {};
            info.token = $rootScope.globals.bimToken;
            info.poid = poid;
            UserService.getProgressOnProject(info).then(function(response){
                var msg = response.data.msg;
                // $scope.contained_progressbar.reset();
                $scope.checkInmsg = "";
                if(msg == "success"){
                    $scope.submitdisabled = true;
                    var result = response.data.result;
                    var alarm_flag = false;
                    var alarm_title = "";
                    var alarm_progress = 0;
                    result.forEach(function(progress){
                        var state = progress.response.result;
                        var progress_status = state.state;
                        if(progress_status != "FINISHED"){
                            alarm_flag = true;
                            alarm_title = state.title;
                            alarm_progress = state.progress;

                            if(alarm_title == "Deserializing...") console.log(alarm_progress);
                        }
                    });
                    if(alarm_flag == false){
                        $scope.contained_progressbar.complete();
                        $scope.checkInmsg = "IFC checked in successfully!";
                        $scope.submitdisabled = false;
                        $interval.cancel($scope.interval);
                        modalInstance.dismiss('cancel');
                        $rootScope.reload_project_list();
                    }
                    else{
                        if(alarm_title != "Generating geometry...") {}
                        else{
                            if(!$scope.geometryLoadingState) $scope.contained_progressbar.complete();
                            $scope.geometryLoadingState = true;
                            //$scope.contained_progressbar.start();
                            $scope.contained_progressbar.set(alarm_progress);
                        }
                        
                        $scope.checkInmsg = alarm_title;
                    }
                }
                else if(msg == "tokenerror"){
                    $scope.checkInmsg = "The Visualynk's bim admin account does not match with the one on the Bim Server.";
                    $scope.contained_progressbar.set(0);
                    $scope.submitdisabled = false;
                }
                else{
                    $scope.checkInmsg = "Error occured because network is interrupted.";
                    $scope.contained_progressbar.set(0);
                    $scope.submitdisabled = false;
                }
            });
        }
    }
})();
