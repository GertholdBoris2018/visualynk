(function () {
    'use strict';

    angular
        .module('app')
        .factory('UserService', UserService);

    UserService.$inject = ['$http'];
    function UserService($http) {
        var service = {};

        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.CreateBimSeverAccont = CreateBimSeverAccont;
        service.getUserByUserName = getUserByUserName;
        service.deleteUserbyOid = deleteUserbyOid;
        service.GetLoadBimToken = GetLoadBimToken;
        service.GetLoadBimProject_Users = GetLoadBimProject_Users;
        service.addUserToProjectBim = addUserToProjectBim;
        service.removeUserFromProject = removeUserFromProject;
        service.createProjectBim = createProjectBim;
        service.createSubProjectBim = createSubProjectBim;
        service.GetSuggestedDeserializerForExtension = GetSuggestedDeserializerForExtension;
        service.deleteProjectBim = deleteProjectBim;
        service.ifcinitcheckin = ifcinitcheckin;
        service.getProgressOnProject = getProgressOnProject;
        service.GetAllDeserializersForProject = GetAllDeserializersForProject;
        service.getEntityByGUID = getEntityByGUID;
        service.getAllRelationsByGUIDs = getAllRelationsByGUIDs;
        service.GetCompanies = GetCompanies;
        service.GetCountries = GetCountries;
        service.AddCompany = AddCompany;
        service.UpdateCompany = UpdateCompany;
        service.DeleteCompany = DeleteCompany;
        service.GetCompany = GetCompany;

        service.GetUsers = GetUsers;
        service.GetProjects = GetProjects;
        service.GetUser = GetUser;
        service.UpdateUser = UpdateUser;
        service.UpdateUserPermission = UpdateUserPermission;
        service.DeleteUser = DeleteUser;
        service.UpdateUserGroupAssigns = UpdateUserGroupAssigns;
        service.UpdateNeedApprovalAssigns = UpdateNeedApprovalAssigns;
        service.GetUserGroupAssigns = GetUserGroupAssigns;
        service.GetNeedApprovalAssigns = GetNeedApprovalAssigns;

        service.CreateNodeGroup = CreateNodeGroup;
        service.UpdateNodeGroup = UpdateNodeGroup;
        service.UpdateRootGroup = UpdateRootGroup;
        service.CreateRootGroup = CreateRootGroup;
        service.GetNodeGroup = GetNodeGroup;
        service.GetEntitiesbyGroupNodeId = GetEntitiesbyGroupNodeId;
        service.GetAllEntitiesByGroupRootId = GetAllEntitiesByGroupRootId;
        service.GetNodeGroups = GetNodeGroups;
        service.GetRootGroups = GetRootGroups;
        service.DeleteNodeGroup = DeleteNodeGroup;

        service.CreateNodeEntity = CreateNodeEntity;
        service.UpdateNodeEntity = UpdateNodeEntity;
        service.GetNodeEntity = GetNodeEntity;
        service.DeleteNodeEntity = DeleteNodeEntity;
        service.GetNodeEntityRelations = GetNodeEntityRelations;
        service.GetNewRelationEnders = GetNewRelationEnders;
        service.CreateNewNERelation = CreateNewNERelation;
        service.DeleteNERelation = DeleteNERelation;

        service.GetWaitingApprovals = GetWaitingApprovals;
        service.UpdateNGPendingApprovals = UpdateNGPendingApprovals;
        service.CancelNGPendingApprovals = CancelNGPendingApprovals;

        service.SaveUserVisibility = SaveUserVisibility;
        service.Save2DModel = Save2DModel;
        service.Get2DModel = Get2DModel;

        return service;

        function GetAll() {
            return $http.get('/api/users').then(handleSuccess, handleError('Error getting all users'));
        }

        function GetById(id) {
            return $http.get('/api/users/' + id).then(handleSuccess, handleError('Error getting user by id'));
        }

        function GetByUsername(username) {
            return $http.get('/api/users/' + username).then(handleSuccess, handleError('Error getting user by username'));
        }

        function Create(user) {
            return $http.post('/register', user).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }
        function CreateBimSeverAccont(user) {
            return $http.post('/registerbimserver', user).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }
        function getUserByUserName(user){
            return $http.post('/getUserByUserName',user).success(function (response) {
                return response;
            }).error(function (response) {

            });
        }
        function deleteUserbyOid(user){
            return $http.post('/deleteUserbyOid',user).success(function (response) {
                return response;
            }).error(function (response) {

            });
        }

        function GetLoadBimToken(){
            return $http.get('/getLoadBimToken').success(function (response) {
                return response.token.response;
            }).error(function (response) {

            });
        }
        function GetLoadBimProject_Users(tokenInfo){
            return $http.post('/getLoadBimProject_Users', tokenInfo).success(function (response) {
                return response;
            }).error(function (response) {

            });
        }
        
        function addUserToProjectBim(info){
            return $http.post('/addUserToProjectBim', info).success(function (response) {
                return response;
            }).error(function (response) {

            });
        }
        function createProjectBim(info){
            return $http.post('/addProjectBim', info).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {
                return response;
            });
        }
        function GetAllDeserializersForProject(info){
            return $http.post('/getAllDeserializersForProject', info).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {
                return response;
            });
        }
        function GetSuggestedDeserializerForExtension(info){
            return $http.post('/getSuggestedDeserializerForExtension', info).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {
                return response;
            });
        }
        function ifcinitcheckin(info){
            return $http.post('/ifcinitcheckin', info).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {
                return response;
            });
        }

        function getProgressOnProject(info){
            return $http.post('/getProgressOnProject', info).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {
                return response;
            });
        }
        function createSubProjectBim(info){
            return $http.post('/addSubProjectBim', info).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {
                return response;
            });
        }

        function deleteProjectBim(info){
            return $http.post('/deleteProjectBim', info).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {
                return response;
            });
        }
        function removeUserFromProject(info){
            return $http.post('/removeUserFromProject', info).success(function (response) {
                return response;
            }).error(function (response) {

            });
        }
        function getEntityByGUID(info){
            return $http.post('/getEntityByGUID', info).success(function (response) {
                return response;
            }).error(function (response) {

            });
        }
        

        function GetCompanies() {
            return $http.get('/getCompanies').success(function (response) {
                return response.companies;
            }).error(function (response) {

            });
        }

        function GetCompany(company_id) {
            return $http.post('/getCompany', company_id).success(function (response) {
                return response.company;
            }).error(function (response) {

            });
        }

        function GetCountries(){
            return $http.get('/getCountries').success(function (response) {
                return response.data;
            }).error(function (response) {

            });
        }

        function AddCompany(company) {
            return $http.post('/addCompany', company).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }

        function UpdateCompany(company) {
            return $http.post('/updateCompany', company).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }
        
        function DeleteCompany(company) {
            return $http.post('/DeleteCompany', company).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }

        function GetUsers() {
            return $http.get('/getUsers').success(function (response) {
                return response.users;
            }).error(function (response) {

            });
        }
        function GetProjects(){
            return $http.get('/getProjects').success(function (response) {
                return response.projects;
            }).error(function (response) {

            });
        }

        function GetUser(user_id) {
            return $http.post('/getUser', user_id).success(function (response) {
                return response.user;
            }).error(function (response) {

            });
        }

        function UpdateUser(user) {
            return $http.post('/updateUser', user).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }

        function DeleteUser(user) {
            return $http.post('/deleteUser', user).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }

        function UpdateUserPermission(user) {
            return $http.post('/updateUserPermission', user).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }

        function GetUserGroupAssigns() {
            return $http.get('/getUserGroupAssigns').success(function (response) {
                return response;
            }).error(function (response) {

            });
        }

        function GetNeedApprovalAssigns() {
            return $http.get('/getNeedApprovalAssigns').success(function (response) {
                return response;
            }).error(function (response) {

            });
        }

        function UpdateUserGroupAssigns(assigns) {
            return $http.post('/updateUserGroupAssigns', assigns).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }

        function UpdateNeedApprovalAssigns(assigns) {
            return $http.post('/updateNeedApprovalAssigns', assigns).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }

        function CreateNodeGroup(ngInfo) {
            return $http.post('/createNodeGroup', ngInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function UpdateNodeGroup(ngInfo) {
            return $http.post('/updateNodeGroup', ngInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }
        function UpdateRootGroup(ngInfo){
            return $http.post('/updateRootGroup', ngInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }
        function CreateRootGroup(ngInfo){
            return $http.post('/createRootGroup', ngInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }
        function GetRootGroups(){
            return $http.post('/getRootGroups').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }
        function GetNodeGroups(info){
            return $http.post('/getNodeGroups',info).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }
        function GetEntitiesbyGroupNodeId(info){
            return $http.post('/getEntitiesbyGroupNodeId',info).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }
        function GetAllEntitiesByGroupRootId(info){
            return $http.post('/getAllEntitiesByGroupRootId',info).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }
        function GetNodeGroup(nodeId){
            return $http.get('/getNodeGroup/'+nodeId).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function DeleteNodeGroup(ngInfo){
            return $http.post('/deleteNodeGroup', ngInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function CreateNodeEntity(neInfo) {
            return $http.post('/createNodeEntity', neInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function UpdateNodeEntity(neInfo) {
            return $http.post('/updateNodeEntity', neInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function GetNodeEntity(nodeId){
            return $http.get('/getNodeGroup/'+nodeId).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function DeleteNodeEntity(neInfo){
            return $http.post('/deleteNodeEntity',neInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function GetNodeEntityRelations(nodeId) {
            return $http.get('/getNodeEntityRelations/'+nodeId).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }
        function getAllRelationsByGUIDs(info){
            return $http.post('/getAllRelationsByGUIDs', info).success(function (response) {
                return response;
            }).error(function (response) {

            });
        }
        function GetNewRelationEnders(neInfo) {
            return $http.post('/getNewRelationEnders',neInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function CreateNewNERelation(relInfo) {
            return $http.post('/createNewNERelationship', relInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function DeleteNERelation(relationID){
            return $http.get('/deleteNodeEntityRelations/'+relationID).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function GetWaitingApprovals(reqInfo) {
            return $http.post('/getWaitingApprovals', reqInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function UpdateNGPendingApprovals(ngInfo) {
            return $http.post('/updateNGPendingApprovals', ngInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function CancelNGPendingApprovals(ngInfo) {
            return $http.post('/cancelNGPendingApprovals', ngInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function SaveUserVisibility(userInfo) {
            return $http.post('/saveUserVisibility', userInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function Save2DModel(modelInfo) {
            return $http.post('/saveTDModel', modelInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function Get2DModel(modelInfo) {
            return $http.post('/getTDModels', modelInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }





        function Update(user) {
            return $http.put('/api/users/' + user.id, user).then(handleSuccess, handleError('Error updating user'));
        }

        function Delete(id) {
            return $http.delete('/api/users/' + id).then(handleSuccess, handleError('Error deleting user'));
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(error) {
            return function () {
                return { success: false, message: error };
            };
        }
    }

})();
