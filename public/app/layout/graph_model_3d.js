(function () {
    'use strict';

    var controllerId = 'model3d';
    var uri,compName, compGUID, clean_guid, comp_drumbeat,clean_compGUID , GUID, bGUID , clicked;
    
    var scope = null;
    var token = null;

    angular.module('app').controller(controllerId,
        ['$rootScope','$scope', '$compile','common', 'config','$route','UserService','FlashService','$http','$window','$element', model3d]);

    function model3d($rootScope,$scope, $compile, common, config ,route,UserService,FlashService,$http,$window,$element) {
        
        $scope.user = $rootScope.globals.currentUser;
        $scope.is_new_2d_model = false;
        scope = $scope;
        //combo list
        //$scope.course = "Granlund_ARK_MEP";
        $scope.courses = [{ course: "" }];
        $scope.course = "";

        //scope bim projects
        $scope.projects = [];
        $scope.project = "";
        $rootScope.bimSurfer = null;
        $rootScope.bimSurferClient = null;
        $rootScope.bimSurferViewer = null;
        $rootScope.bimSurferScene = null;
        $rootScope.roid = null;
        $rootScope.GUID = null;
        $rootScope.datametadata = null;
        $rootScope.select2dGraph = false;
        $rootScope.id_2dGraph = "";
        $rootScope.bookmarkModel = {};
        $scope.bimserverUrl = "";
        $http.get('/config/bimconfig.json').
            success(function(data, status, headers, config) {
                $scope.bimserverUrl = "http://" + data.domain + ":" + data.port ;
                //get bim projects
                loadFromBimserver($rootScope,$scope.bimserverUrl, $rootScope.globals.currentUser.username , $rootScope.globals.currentUser.password);
            }).error(function(data, status, headers, config) {          
        });
        //$scope.message = "loading...";
        var loadModelInfo = {};
        loadModelInfo.companyId = $scope.user.usercompany;

        UserService.Get2DModel(loadModelInfo)
            .then(function (response) {
                var msg = response.data.msg;
                if (msg == "success") {
                    var models = response.data.responseData;
                    for(var i=0; i<models.length; i++){

                        var tmp = {};
                        tmp.course = models[i]._fields[0].properties.filename
                        $scope.courses.push(tmp);
                    }
                    $scope.course = $scope.courses[0].course;
                }
                else {
                    FlashService.Error(msg);
                    $scope.dataLoading = false;
                }
            });

        
        
        var currentModel;
        $scope.changeSVG = function () {

            // In addition to SVG, HTML files are also added. Code configured as the following. For HTML uploads, compose_svg() function disabled
            $("#daire_menu").html("");
            currentModel = $scope.course;
            var fileFormat = currentModel.split('.').pop();
            if($scope.course == "Granlund_ARK_MEP"){
                var object = "<object class='svg' id='svg_image' src='app/models/Granlund_ARK_MEP.svg'></object>";
            } else if (fileFormat === 'svg') {
              var object = "<object class='svg' id='svg_image' src='./files/"+$scope.course+"'></object>";
              $("#daire_menu").html(object);
              compose_svg();
            } else if (fileFormat === 'html'){
              // First line is the original code.
                //var object = "<object class='svg' id='svg_image' src='./files/"+$scope.course+"'></object>";

              // Second and Third line of codes are the  YIT_Hack
                //var object = "<div style='padding-top:20px; position: relative; z-index:10; width:50%; height:1%' id='dataShow'></div> <object style='position:absolute; z-index:-1;'class='svg' id='svg_image' src='./files/"+$scope.course+"'></object> ";
                var object = "<div style='padding-top:20px; position: relative; z-index:10; width:50%; height:1%' id='dataShow'></div> <iframe style='overflow-y:hidden; position:relative; border:none; z-index:10; width:100%; height:100% 'class='svg' id='svg_image' src='http://localhost:8087/"+$scope.course+"'></iframe> ";
                $("#daire_menu").html(object);
                // xdLocalStorage.getItem(key, function (data) { console.log(data); });
            }
        }

        $scope.dzOptions = {
            url : '/twoDimentionModelUpload',
            method: 'post',
            paramName : 'filename',
            maxFilesize : '10',
            acceptedFiles : '.html, .svg',
            addRemoveLinks : false,
            dictDefaultMessage: 'Upload 2D Model',
            maxFiles : 1,
            previewsContainer: '#two_dimention_model_preview',
        };

        $scope.dzCallbacks = {
            'addedfile' : function(file){
                if(file.isMock){
                    $scope.myDz.createThumbnailFromUrl(file, file.serverImgUrl, null, true);
                }
                $scope.newFile = file;
            },
            'success' : function(file, xhr){
                $scope.is_new_2d_model = true;
                $scope.new2DModelPath = xhr.filename;
                var $el = $("<div style='text-align:center'><button class='btn' style='display:inline-block;margin-bottom:10px; margin-right:5px' ng-click='Save2DModel()'>Save</button><button class='btn btn-warning' style='display:inline-block;margin-bottom:10px;' ng-click='Cancel2DModel()'>Cancel</button></div>").appendTo("#two_dimention_model_preview");
                $compile($el)($scope);
            }
        };

        $scope.dzMethods = {};

        $scope.Save2DModel = function () {

            var modelInfo = {};
            modelInfo.companyId = $scope.user.usercompany;
            modelInfo.filename = $scope.new2DModelPath;

            UserService.Save2DModel(modelInfo)
                .then(function (response) {
                    var msg = response.data.msg;
                    if (msg == "success") {
                        $scope.is_new_2d_model = false;
                        $scope.new2DModelPath = "";
                        $scope.dzMethods.removeAllFiles();

                        UserService.Get2DModel(loadModelInfo)
                            .then(function (response) {
                                var msg = response.data.msg;
                                if (msg == "success") {
                                    $scope.courses = [{ course: "Granlund_ARK_MEP" }];

                                    var models = response.data.responseData;
                                    for(var i=0; i<models.length; i++){

                                        var tmp = {};
                                        tmp.course = models[i]._fields[0].properties.filename
                                        $scope.courses.push(tmp);
                                    }
                                }
                                else {
                                    FlashService.Error(msg);
                                    $scope.dataLoading = false;
                                }
                            });
                    }
                    else {
                        FlashService.Error(msg);
                        $scope.dataLoading = false;
                    }
                });
        }

        $scope.Cancel2DModel = function () {
            $scope.is_new_2d_model = false;
            $scope.new2DModelPath = "";
            $scope.dzMethods.removeAllFiles();
            angular.element("#two_dimention_model_preview").html("");
        }

        var svg_ele = angular.element( document.querySelector( '#svg_image' ) );
        var ele_id = svg_ele.attr("id");
        angular.element($window).bind('load', function() {
            init_2d_svg("#"+ele_id);
        });
        compose_svg();
        /*init_3d_svg(ele_id);*/

        $scope.activeTab = 1;
        App.init();
        /*$scope.setActiveTab = function(tabToSet) {
            $scope.activeTab = tabToSet;
        }*/
        $(".div-2d").attr("style","height:100%;");
        $scope.setActiveTab = function(e){
            var myEvent = ((window.event)?(event):e);
            var elem = ((window.event))?angular.element(e.srcElement):angular.element(e.currentTarget);
            elem.toggleClass('btn-down');
            if(elem.hasClass("btn-down")){
                elem.attr("style","background-color: white; !important; color:#1d943b !important;");
            }
            else{
                elem.attr("style","background-color: transparent !important; color:white !important");
            }
            if($('#btn-2d').hasClass('btn-down') && $('#btn-3d').hasClass('btn-down')){
                $('.div-2d').attr('style','display:block;');
                $('.div-3d').attr('style','display:block;');
            }
            else if($('#btn-2d').hasClass('btn-down')){
                $('.div-3d').attr('style','height:50%;display:none;');
                $('.div-2d').attr('style','height:100%;display:block;');
            }
            else if($('#btn-3d').hasClass('btn-down')){
                $('.div-2d').attr('style','height:50%;display:none;');
                $('.div-3d').attr('style','height:100%;display:block;');
            }
            else {
                $('.div-2d').attr('style','height:50%;display:none;');
                $('.div-3d').attr('style','height:50%;display:none;');
            }
        }
       
        $scope.get3dModel = function(e){
            console.log("$scope.project", $scope.project);
            var project = $scope.project;
            var oids = project.split(",");
            var poid = oids[0];
            var roid = oids[1];
            $rootScope.roid = roid;
            $("#viewerContainer").html('');
            loadScripts($scope.bimserverUrl + "/apps/bimserverjavascriptapi/js/", [
                "bimserverclient.js",
                "model.js",
                "bimserverapiwebsocket.js",
                "bimserverapipromise.js",
                "geometry.js",
                "ifc2x3tc1.js",
                "ifc4.js",
                "translations_en.js",
            ], function(){
                
                require(["media/js/bimsurfer/src/BimSurfer","media/js/bimsurfer/src/MetaDataRenderer"],
                    function (BimSurfer, MetaDataRenderer) {
        
                        var bimSurfer = new BimSurfer({
                            domNode: "viewerContainer"
                        });
                        $rootScope.bimSurfer = bimSurfer;
                        
                        //$rootScope.bimSurferViewer = new BIMSURFER.Viewer($rootScope.bimSurferClient,'viewport');
                        //console.log("bim viewer => " + $rootScope.bimSurferViewer);

                        bimSurfer.on("loading-finished", function(e){
                            //$scope.message = "";
                            var viewer = bimSurfer.viewer;
                            console.log(bimSurfer);
                            $rootScope.bookmarkModel = bimSurfer.getColorOpacityBookmark();
                        });
                        bimSurfer.on("loading-started", function(){
                            // $scope.message = "Loading...";
                            $scope.rendered3d = 1;
                        });
                        
                        // Lets us play with the Surfer in the console
                        window.bimSurfer = bimSurfer;
        
                        // Load a model from BIMServer
                        bimSurfer.load({
                            bimserver: $scope.bimserverUrl,
                            token: token,
                            poid: poid,
                            roid: roid,
                            schema: "ifc2x3tc1" // < TODO: Deduce automatically
                        }).then(function (models) {
                            var metadata = new MetaDataRenderer({
                                domNode: 'dataContainer'
                            });
                             var height = $("#dataContainer").height() - 30;
                            $rootScope.datametadata = metadata;
                            $rootScope.roids = [];
                            for(var index in models) {
                                $rootScope.datametadata.addModel({name: "", id:models[index].model.roid, model:models[index]});
                                $rootScope.roids.push(models[index].model.roid);
                            }
                            bimSurfer.on("selection-changed", function(selected) {
                              
                                //domtree.setSelected(selected, domtree.SELECT_EXCLUSIVE);
                                var sel = '#panel-wrapper';
                                $scope = angular.element(sel).scope();
                                $scope.is_ne_create = false;
                                $scope.is_ne_update = false;
                                $scope.is_ng_update = false;
                                $scope.is_ng_create = false;
                                $scope.is_with_entity = false;
                                $scope.is_with_entity = true;
                                $scope.is_ne_datacontainer = true;
                                $scope.is_rs_datacontainer = false;
                                $("#visualynk-results").attr("style","height:auto;" );
                                $("#dataContainer").attr("style","height:" +height + "px;");
                                
                                $rootScope.datametadata.setSelected(selected);

                                //get GUID from id
                                if(selected.length == 1){
                                    $("#visualynk-results").show();
                                    var temp = selected[0].split(":");
                                    var roid = temp[0];
                                    var poid = temp[1];
                                    var selectedGuid = bimSurfer.toGuid([poid])[0];

                                    //get node from GUID
                                    var info = {};
                                    info.guid = selectedGuid;
                                    UserService.getEntityByGUID(info).then(function(response){
                                        console.log(response);
                                        var node = response.data.node;
                                        //$rootScope.isGraph = true;
                                            if(node.length > 0){
                                                $rootScope.isGraph = false;
                                                
                                                var label = node[0]._fields[0].properties.name;
                                                var parentNode = node[0]._fields[0].properties.parentNode;
                                                if(visualynk.resel == true){
                                                    $rootScope.isGraph = false
                                                }
                                                else {
                                                    $rootScope.isGraph = true
                                                    $scope.is_with_entity = false;
                                                }
                                                
                                                    $rootScope.id_2dGraph = parentNode+":"+label;
                                                    setNodeProviders();
                                                    $("#plandan_sola").removeAttr('disabled');
                                                    $("#plandan_sola").attr("onclick", "selectInstance('" + parentNode + "',{name:'" + label + "', guid: '" + selectedGuid + "'})");
                                                    // selectInstance(parentNode,{name:label,guid:selectedGuid});
                                                    visualynk.resel = false;
                                                    visualynk.graph.centerRootNode();
                                                    $rootScope.GUID = selectedGuid;
                                                
                                            }
                                            else{
                                                $rootScope.isGraph = true;
                                                //visualynk.resel = true;
                                                $scope.is_with_entity = false;
                                                $("#plandan_sola").attr('disabled','disabled');
                                            }
                                            
                                        
                                    });
                                    
                                }
                                
                                if(selected.length >= 2){
                                    console.log('multi selected');
                                   
                                    //multi selected
                                    $("#visualynk-results").hide();
                                    $scope.is_rs_datacontainer = true;
                                    $scope.is_ne_datacontainer = false;
                                    
                                    $scope.is_nr_create = false;
                                    $scope.is_nr_update = false;
                                    $scope.is_ng_create = false;
                                    $scope.is_ng_update = false;
                                    $scope.is_ne_create = false;
                                    $scope.is_ne_relation = false;
                                    $scope.neListRelations = [];
                                    //get node from selected GUID
                                    var selectedItems = selected;
                                    var iTems = [];
                                    selectedItems.forEach(function(item){
                                        var temp = item.split(":");
                                        var roid = temp[0];
                                        var poid = temp[1];
                                        iTems.push(poid);
                                    });
                                    var guids = bimSurfer.toGuid(iTems);
                                    var str_guids = guids.join(',');
                                    var info = {};
                                    info.guids = str_guids;
                                    info.token = $rootScope.globals.bimToken;
                                    $scope.limessage = "";
                                    UserService.getAllRelationsByGUIDs(info).then(function(response){
                                        var msg = response.data.msg;
                                        if(msg == "success"){
                                            var relations_data = response.data.data;
                                            relations_data.forEach(function(rel){
                                                rel.forEach(function(item){
                                                    var tmp = {};
                                                    tmp["startNode"] = item._fields[0].properties.name;
                                                    tmp['direction'] = "->";
                                                    tmp['relationName'] = item._fields[2];
                                                    tmp['endNode'] = item._fields[1].properties.name;
                                                    tmp['relationID'] = item._fields[3].low;
                                                    $scope.neListRelations.push(tmp);
                                                });
                                                    
                                                    
                                            });
                                        }
                                        else if(msg == "empty"){
                                            $scope.limessage = "There is not relations between selected items";
                                        }
                                        else{

                                        }
                                        
                                    });
                                }
                                $scope.$apply();
                            });
                        });
                        
                    });
            });
        }
    };
    function init_2d_svg(ele){
        svgPanZoom(ele, {
            zoomEnabled: true,
            controlIconsEnabled: false,
            enableMouseWheelZoom: true,
            zoomAtPoint:true,
            isDblClickZoomEnabled: true,
            resize:true,
            fit: true,
            center: true,
            minZoom: 0.1
        });
    }
    function compose_svg(){
        angular.element('object.svg').each(function(){
            var $img = $(this);
            var imgID = $img.attr('id');
            var imgClass = $img.attr('class');
            var imgURL = $img.attr('src');

            jQuery.get(imgURL, function(data) {
                var $svg = jQuery(data).find('svg');
                if(typeof imgID !== 'undefined') {
                    $svg = $svg.attr('id', imgID);
                }
                if(typeof imgClass !== 'undefined') {
                    $svg = $svg.attr('class', imgClass+'_replaced-svg');
                }
                $svg = $svg.removeAttr('xmlns:a');
                $img.replaceWith($svg);

                var eles = $('g>g');
                eles.each(function(index) {
                    compName = ($(this).attr('title'));
                    compGUID = ($(this).attr('comp_guid'));
                    if(compGUID == "" || typeof compGUID === 'undefined') compGUID = null;
                    if(compName == "" || typeof compName === 'undefined') compName = null;
                    if(compName != null || compGUID != null){
                        GUID = ($(this).attr('id'));
                        var clean_guid1 = GUID.replace(/\"/g, "");
                        compName = ($(this).attr('title'));
                        $(this).tooltip({
                            container:'body',
                            placement:'top'})
                        $('g>g>path').each(function() {
                            $(this).attr('class','deselected').attr('style', 'fill: #fbffd3; stroke:black; stroke-width:1.0;opacity:0.7; position:absolute')
                            ;
                        });
                    }
                    // When the components of SVG file is clicked...
                    $(this).click(function() {
                        // DRUMBEAT e BAGLAN
                        compGUID = $(this).attr('comp_guid');
                        compName = ($(this).attr('title'));
                        if(compGUID == "" || typeof compGUID === 'undefined') compGUID = null;
                        if(compName == "" || typeof compName === 'undefined') compName = null;
                        if(compName != null || compGUID != null){
                            compGUID = compGUID.replace("product-", "");
                            clean_compGUID = compGUID.replace("-body", "");
                            uri = clean_compGUID.toUpperCase();

                            // NORMAL GUID NUMARALARI BURADAN. GEREKIRSE KULLAN
                            bGUID =($(this).attr('id'));
                            var about_to_click = JSON.stringify(bGUID,null,4);
                            comp_drumbeat = bGUID;

                            //Necessary parameters for Neo4j connections
                            clean_guid = about_to_click.replace(/\"/g, "");
                            localStorage.setItem("MyValue",clean_guid);
                            clicked = JSON.parse(about_to_click);
                        }
                    });
                    // Tooltip the names of Spaces
                    $(this).hover(function() {
                        $(this).tooltip({
                            container:'body',
                            placement:'top'
                        });
                    });
                    if(index == eles.length - 1){
                        var svg_ele = angular.element( document.querySelector( '#svg_image' ) );
                        var ele_id = svg_ele.attr("id");
                        init_2d_svg("#"+ele_id);
                    }
                });

                $('g>g').click(function() {
                    compName = ($(this).attr('data-original-title'));
                    GUID = ($(this).attr('id'));
                    if(GUID == "" || typeof GUID === 'undefined') GUID = null;
                    if(compName == "" || typeof compName === 'undefined') compName = null;
                    if(compName != null || GUID != null){

                      // Enable after YIT Hack
                        //localStorage.setItem('normal_baglanti', GUID);
                        //localStorage.setItem("noktaIsim", compName);

                      // Disable after YIT Hack
                        localStorage.setItem('noktaIsim', GUID);
                    }

                    // DELETE AFTER YIT_HACK
                    var infoTitle = ($(this).attr('id'));
                    var infoDesc = $('g>g>desc').text()
                    var infoImg = $('g>g>desc>image').attr('xlink:href')
                    var infoAlt = $('g>g>desc>image').attr('alt')
                    var spaceInfo = document.getElementById("dataShow");

                  // YIT_Hack will be changed after the hack
                    //var infoPage = "<img style='opacity:1; background:rgba(0, 0, 0, 0.6)' src="+infoImg+"></img><h3 style='font-family:Raleway; background:rgba(5, 24, 73, 0.8); color:#36D7B7'>"+infoTitle+"</h3> <p style='text-align:justify; font-family:Raleway; font-size:14px; background:rgba(5, 24, 73, 0.8); color:#F9BF3B'>"+infoDesc+"</p>";
                    //$("#dataShow").html(infoPage);

                })

                //ENABLE AFTER YIT_HACK
                // SECILEN ALANI YESIL RENGE BOYA VE SECILMEYENLERI ESKI HALINE DONDUR
                // $('g>g>path').click(function() {
                //
                //     if ($(this).hasClass('class','selected')) {
                //         $(this).attr('class','deselected');
                //     }
                //     else {
                //         $('g>g>path').each(function() {
                //             $(this).attr('class','deselected');
                //         });
                //         $(this).attr('class','selected');
                //     };
                //     $('.selected').attr('style','fill:#2ECC71; stroke-width:1; stroke:black; opacity:0.7');
                //     //$('.deselected').attr('style','fill: #faffc0; stroke-width:1; stroke:black; stroke-width:1;opacity:0.7');
                //
                //     // For YIT Hack following settings applied
                //       $('.deselected').attr('style','fill: #CCCCCC; stroke-width:0.5; stroke:white; stroke-width:1;opacity:1');
                //
                //
                //
                // });

                $('g>g>path').hover(function() {
                  $(this).hover(function() {
                      $(this).tooltip({
                          container:'body',
                          placement:'top'
                      });
                  });
                })
            });
        });
    }

    function loadFromBimserver($rootScope, address, username, password){
        var client = new BimServerClient(address);
        $rootScope.bimSurferClient = client;
        client.init(function(){
			client.login(username, password, function(){
				client.call("ServiceInterface", "getAllProjects", {
					onlyTopLevel: true,
					onlyActive: true
				}, function(projects){
                    token = client.token;
					var totalFound = 0;
					projects.forEach(function(project){
						if (project.lastRevisionId != -1) {
                            var tmp = {};
                            tmp.poid = project.oid;
                            tmp.roid = project.lastRevisionId;
                            tmp.name = project.name;
                            scope.projects.push(tmp);
							totalFound++;
						}
					});
					if (totalFound == 0) {
						scope.message = "No projects with revisions found on this server";
					} else {
						scope.message = "";
					}
				});
			}, function(error){
				console.error(error);
				scope.message = error.message;
			});
		});
    }
    
})();
