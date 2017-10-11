(function () {
    'use strict';

    var controllerId = 'model3d';
    var b, c, d, uri, compName, compGUID, clean_guid, comp_drumbeat,
        clean_compGUID,GUID,bGUID,clicked, about_to_select, about_to_click,
        clicked_for_drumbeat;
    var grafik_baglanti = "http://localhost:7474/";

    angular.module('app').controller(controllerId,
        ['$rootScope','$scope', 'common', 'config','$route','UserService','$http','$window', model3d]);

    function model3d($rootScope,$scope, common, config ,route,UserService,$http,$window) {
        var svg_ele = angular.element( document.querySelector( '#svg_image' ) );
        var ele_id = svg_ele.attr("id");
        angular.element($window).bind('load', function() {
            init_3d_svg("#"+ele_id);
        });
        compose_svg($http,$rootScope);
        /*init_3d_svg(ele_id);*/

        $scope.activeTab = 1;

        $scope.setActiveTab = function(tabToSet) {
            $scope.activeTab = tabToSet;
        }
    };
    function init_3d_svg(ele){
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
    function compose_svg($http,$rootScope){
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
                            $(this).attr('class','deselected').attr('style', 'fill: #fbffd3; stroke:black; stroke-width:1.5;opacity:0.7; position:absolute')
                            ;
                        });
                    }
                    // MODELING USTUNE TIKLANDIGI ZAMAN YAPILACAK TUM ISLEMLER BURADA
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

                            //C NEO4J BAGLANTISI ONCESI GEREKLI DEGISKENLER BURDA
                            clean_guid = about_to_click.replace(/\"/g, "");
                            localStorage.setItem("MyValue",clean_guid);
                            clicked = JSON.parse(about_to_click);
                            console.log("MATCH (visualynk:`VisuaLynk`{`name`:"+about_to_click+"})-[:`BELONGS_TO`]->(n)-[r]->(m) RETURN DISTINCT n,type(r),m");
                        }
                    });
                    // SPACE UZERINE GELINDIGINDE ISMI GOSTEREN KOD
                    $(this).hover(function() {
                        $(this).tooltip({
                            container:'body',
                            placement:'top'
                        });
                    });
                    if(index == eles.length - 1){
                        var svg_ele = angular.element( document.querySelector( '#svg_image' ) );
                        var ele_id = svg_ele.attr("id");
                        init_3d_svg("#"+ele_id);
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
                    $('.selected').attr('style','fill:#dba96e; stroke-width:2; stroke:black; opacity:0.7');
                    $('.deselected').attr('style','fill: #faffc0; stroke-width:2; stroke:black; stroke-width:1;opacity:0.7');

                });
            });
        });
    }
})();