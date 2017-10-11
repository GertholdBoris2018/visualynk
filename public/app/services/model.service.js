(function () {
    'use strict';

    angular
        .module('app')
        .factory('ModelService', ModelService);

    ModelService.$inject = ['$http'];
    function ModelService($http) {
        var service = {};
        service.get_plandan = get_plandan;
        service.system_filter = system_filter;
        service.attribute_filter = attribute_filter;
        service.person_filter = person_filter;
        service.company_filter = company_filter;
        service.facility_filter = facility_filter;
        service.floor_filter = floor_filter;
        service.zone_filter = zone_filter;
        service.space_filter = space_filter;
        service.asset_filter = asset_filter;
        service.component_filter = component_filter;
        service.assembly_filter = assembly_filter;
        service.connection_filter = connection_filter;
        service.spare_filter = spare_filter;
        service.resource_filter = resource_filter;
        service.job_filter = job_filter;
        service.sevicereq_filter = sevicereq_filter;
        service.doc_filter = doc_filter;



        return service;

        function get_plandan(e) {
            return $http.post('/getPlanDan', e).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }

        //SYSTEM FILTER
        function system_filter(){
            return $http.post('/systemfilter').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }
        //ATTRIBUTE FILTER
        function attribute_filter(){
            return $http.post('/attributefilter').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }
        //COMPNAY FILTER
        function company_filter(){
            return $http.post('/companyfilter').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }
        //FACILITY FILTER
        function facility_filter(){
            return $http.post('/facilityfilter').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }
        //FLOOR FILTER
        function floor_filter(){
            return $http.post('/floorfilter').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }

        //PERSON FILTER
        function person_filter(){
            return $http.post('/personfilter').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }
        //ZONE FILTER
        function zone_filter(){
            return $http.post('/zonefilter').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }
        //SPACE FILTER
        function space_filter(){
            return $http.post('/spacefilter').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }
        //ASSET FILTER
        function asset_filter(){
            return $http.post('/assetfilter').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }
        //COMPONENT FILTER
        function component_filter(){
            return $http.post('/componentfilter').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }
        //ASSEMBLY FILTER
        function assembly_filter(){
            return $http.post('/assemblyfilter').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }
        //CONNECTION FILTER
        function connection_filter(){
            return $http.post('/connectionfilter').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }
        //SPARE FILTER spare_filter
        function spare_filter(){
            return $http.post('/sparefilter').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }
        //RESOURCE FILTER
        function resource_filter(){
            return $http.post('/resourcefilter').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }
        //JOB FILTER
        function job_filter(){
            return $http.post('/jobfilter').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }
        //sevicereq_filter
        function sevicereq_filter(){
            return $http.post('/sevicereqfilter').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }
        //document filter
        function doc_filter(){
            return $http.post('/docfilter').success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
        }
    }

})();
