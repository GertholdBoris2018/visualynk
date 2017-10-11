(function () {
    'use strict';

    var controllerId = 'PanelController';
    var xPos = 0;
    var middle_paneright = 0;
    var middle_paneleft = 0;
    var delta_middle = 0;
    var delta_offset_middle = 54.375;
    var last_paneright = 0;
    var last_paneleft = 0;
    var delta_last = 0;
    var delta_offset_last = 19.75;

    var b, c, d, uri, compName,isim, compGUID, clean_guid, comp_drumbeat,
        clean_compGUID,GUID,bGUID,clicked, about_to_select, about_to_click,
        clicked_for_drumbeat;
    var ck_filter = false;

    var app = angular.module('app').controller(controllerId,
        ['$rootScope','$scope','$window', 'common', 'config','$route','UserService','ModelService','$http', PanelController]);

    function PanelController($rootScope, $scope,$window, common, config ,route,UserService,ModelService,$http) {
        $rootScope.loggedIn = false;

        var vm = this;
        initController();
        middle_paneright = $("#panel-2-resize").offset().left + $("#panel-2-resize").outerWidth();
        middle_paneleft = $("#panel-2-resize").offset().left;

        last_paneright = $("#panel-3-resize").offset().left + $("#panel-3-resize").outerWidth();
        last_paneleft = $("#panel-3-resize").offset().left;
        function initController() {
            loadCurrentUser();
        }
        function loadCurrentUser() {
            vm.user = $rootScope.globals.currentUser;
            //show the tostr notification
            setTimeout(function() {
                toastr.options = {
                    closeButton: true,
                    progressBar: true,
                    showMethod: 'slideDown',
                    timeOut: 4000
                };
                toastr.success('Welcome '+$rootScope.globals.currentUser.username);
            }, 100);
        }

        //call side bar
        var graph_height =  $(window).height()*0.75 + "px";
        $('#container_graph').css('height', graph_height);

        $scope.hoverIn = function(){
            $("#plandan_sola").hover(function() {
                var t, e = localStorage.getItem("normal_baglanti");
                var sola_name = {};
                sola_name.name = e;
                ModelService.get_plandan(sola_name)
                    .then(function (e){
                        var msg = e.data.responseData.msg;
                        if(msg != "empty"){
                            isim = e.data.responseData.msg[0].n.data.name;
                            t = ("" + e.data.responseData.msg[0]['labels(n)'][0]).replace(/[\][]/g, "");
                            $("#plandan_sola").attr("onclick", "selectInstance('" + t + "',{name:'" + isim + "'})")
                        }

                    });
            });
        }
        $scope.filter = function(){
            //search key
            var valueSystem = d3.select("#constraint")[0][0].value;
            //initialize
            var t = localStorage.getItem("graphGUID");
            inputValueGuid = t;
            d3.select("#" + visualynk.taxonomy.containerId).selectAll("ul").data([]).exit().remove();
            if(valueSystem != ""){
                ck_filter = false;
                ModelService.person_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.forEach(function(e) {
                                config_func(e.n.data.email,valueSystem);
                            })
                        }

                    });
                ModelService.system_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.forEach(function(e) {
                                config_func(e.n.data.name,valueSystem,'system_filter');
                            })
                        }

                    });
                ModelService.attribute_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.forEach(function(e) {
                                config_func(e.n.data.name,valueSystem,'attribute_filter');
                            });
                        }

                    });
                ModelService.company_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.forEach(function(e) {
                                config_func(e.n.data.name,valueSystem,'company_filter');
                            });
                        }
                    });
                ModelService.facility_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.forEach(function(e) {
                                config_func(e.n.data.name,valueSystem,'facility_filter');
                            });
                        }
                    });
                ModelService.floor_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.forEach(function(e) {
                                config_func(e.n.data.name,valueSystem,'floor_filter');
                            });
                        }
                    });
                ModelService.zone_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.forEach(function(e) {
                                config_func(e.n.data.name,valueSystem,'zone_filter');
                            })
                        }
                    });
                ModelService.space_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.forEach(function(e) {
                                config_func(e.n.data.name,valueSystem,'space_filter');
                            });
                        }
                    });
                ModelService.asset_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.forEach(function(e) {
                                config_func(e.n.data.name,valueSystem,'asset_filter');
                            });
                        }
                    });
                ModelService.component_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.forEach(function(e) {
                                config_func(e.n.data.name,valueSystem,'component_filter');
                            });
                        }
                    });
                ModelService.assembly_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.forEach(function(e) {
                                config_func(e.n.data.name,valueSystem,'assembly_filter');
                            });
                        }
                    });
                ModelService.connection_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.forEach(function(e) {
                                config_func(e.n.data.name,valueSystem,'connection_filter');
                            });
                        }
                    });
                ModelService.spare_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.forEach(function(e) {
                                config_func(e.n.data.name,valueSystem,'spare_filter');
                            });
                        }
                    });
                ModelService.resource_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.forEach(function(e) {
                                config_func(e.n.data.name,valueSystem,'resource_filter');
                            });
                        }
                    });
                ModelService.job_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.forEach(function(e) {
                                config_func(e.n.data.name,valueSystem,'job_filter');
                            });
                        }
                    });
                ModelService.sevicereq_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.forEach(function(e) {
                                config_func(e.n.data.message,valueSystem,'sevicereq_filter');
                            });
                        }
                    });
                ModelService.doc_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.forEach(function(e) {
                                config_func(e.n.data.name,valueSystem,'doc_filter');
                            });
                        }
                    });
            }
            else{
                inputValueSystem = "";
                d3.select("#" + visualynk.taxonomy.containerId).selectAll("ul").data([]).exit().remove();
                visualynk.taxonomy.createTaxonomyPanel();
            }/**/
            console.log("ck filter => " + ck_filter);
            if(!ck_filter){
                inputValueSystem = valueSystem;
                d3.select("#" + visualynk.taxonomy.containerId).selectAll("ul").data([]).exit().remove();
                visualynk.taxonomy.createTaxonomyPanel();
                visualynk.graph.mainLabel = 'Facility_Management';
            }
            visualynk.tools.reset();
        }
    };
    function config_func(t,valueSystem,provider) {
        var SystemData = [t];
        for ( var i = 0; i < SystemData.length; i++) {
            if(SystemData[i] == valueSystem){
                ck_filter = true;
                inputValueSystem = valueSystem;
                d3.select("#" + visualynk.taxonomy.containerId).selectAll("ul").data([]).exit().remove();
                visualynk.taxonomy.createTaxonomyPanel();
                break;
            }
        }
    }
    app.directive('resizer', function($document) {

        return function($scope, $element, $attrs) {

            $element.on('mousedown', function(event) {
                event.preventDefault();

                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {

                if ($attrs.id == 'panel-1-resizer') {
                    // Handle vertical resizer
                    var x = event.pageX;
                    if ($attrs.resizerMax && x > $attrs.resizerMax) {
                        x = parseInt($attrs.resizerMax);
                    }
                    if ($attrs.resizerMin && x < $attrs.resizerMin){
                        x = parseInt($attrs.resizerMin);
                    }
                    x = x - 61;
                    delta_middle = middle_paneleft - x - delta_offset_middle;
                    console.log("delta_middel => " + delta_middle);
                    $element.css({
                        left: x  + 50 + 'px'
                    });

                    $($attrs.resizerLeft).css({
                        width: x  + 'px'
                    });
                    $($attrs.resizerRight).css({
                        left: (x + parseInt($attrs.resizerWidth)) + 'px',
                        width : middle_paneright - delta_last + 9 - (x + parseInt($attrs.resizerWidth)) - 65 + 'px'
                    });
                }
                if($attrs.id == 'panel-2-resizer'){
                    // Handle vertical resizer
                    var x = event.pageX;
                    if ($attrs.resizerMax && x > $attrs.resizerMax) {
                        x = parseInt($attrs.resizerMax);
                    }
                    if ($attrs.resizerMin && x < $attrs.resizerMin){
                        x = parseInt($attrs.resizerMin);
                    }
                    x -= 9;
                    delta_last = last_paneleft - x - delta_offset_last;
                    console.log("last panel delta => " + delta_last);
                    $element.css({
                        left: x   + 'px'
                    });

                    $($attrs.resizerLeft).css({
                        width : x - middle_paneleft + delta_middle  + 'px'
                    });
                    $($attrs.resizerRight).css({
                        left: (x  + parseInt($attrs.resizerWidth)+ delta_middle +20) + 'px',
                        width: last_paneright  - (x  + parseInt($attrs.resizerWidth) +20) + 'px'
                    });
                }
            }

            function mouseup() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
            }
        };
    });
})();