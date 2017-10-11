(function () {
    'use strict';

    var controllerId = 'model3d';
    var uri,compName, compGUID, clean_guid, comp_drumbeat,clean_compGUID , GUID, bGUID , clicked;

    angular.module('app').controller(controllerId,
        ['$rootScope','$scope', '$compile','common', 'config','$route','UserService','FlashService','$http','$window','$element', model3d]);

    function model3d($rootScope,$scope, $compile, common, config ,route,UserService,FlashService,$http,$window,$element) {

        $scope.user = $rootScope.globals.currentUser;
        $scope.is_new_2d_model = false;

        //combo list
        //$scope.course = "Granlund_ARK_MEP";
        $scope.courses = [{ course: "Granlund_ARK_MEP" }];
        $scope.course = "";

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

            $("#daire_menu").html("");
            currentModel = $scope.course;
            if($scope.course == "Granlund_ARK_MEP"){
                var object = "<object class='svg' id='svg_image' src='app/models/Granlund_ARK_MEP.svg'></object>";
            }
            else{
                var object = "<object class='svg' id='svg_image' src='./files/"+$scope.course+"'></object>";

            }
            $("#daire_menu").html(object);
            compose_svg();
        }

        $scope.dzOptions = {
            url : '/twoDimentionModelUpload',
            method: 'post',
            paramName : 'filename',
            maxFilesize : '10',
            acceptedFiles : '.svg',
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
            var elem = angular.element(e.srcElement);
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
                        localStorage.setItem('normal_baglanti', GUID);
                        localStorage.setItem("noktaIsim", compName);
                    }
                })
                // SECILEN ALANI YESIL RENGE BOYA VE SECILMEYENLERI ESKI HALINE DONDUR
                $('g>g>path').click(function() {

                    if ($(this).hasClass('class','selected')) {
                        $(this).attr('class','deselected');
                    }
                    else {
                        $('g>g>path').each(function() {
                            $(this).attr('class','deselected');
                        });
                        $(this).attr('class','selected');
                    };
                    $('.selected').attr('style','fill:#2ECC71; stroke-width:1; stroke:black; opacity:0.7');
                    //$('.deselected').attr('style','fill: #faffc0; stroke-width:1; stroke:black; stroke-width:1;opacity:0.7');

                    // For YIT Hack following settings applied
                      $('.deselected').attr('style','fill: #CCCCCC; stroke-width:0.5; stroke:white; stroke-width:1;opacity:1');



                });
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
})();
