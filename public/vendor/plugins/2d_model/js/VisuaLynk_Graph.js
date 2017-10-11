function selectInstance(t, e) {
    visualynk.graph.mainLabel = t;
    instanceData = {
        label: t,
        attributes: e
    };
    visualynk.graph.addRootNode(t);
    visualynk.tools.reset();
    instanceData = null
    visualynk.resel = true;
    visualynk.preventeffect = true;
}
var aa, bb, cc, dd, ee, inputValueSystem,  inputValueGuid, companyId;
var topRoot = "Visualynk";
visualynk.rest.CYPHER_URL = "http://localhost:7474/db/data/transaction/commit", visualynk.rest.AUTHORIZATION = "Basic " + btoa("neo4j:qq");

var instanceData, rootNodeListener = function(t) {
    if(instanceData){
        // Change root node type and label with instanceData
        t.value = {
            type: visualynk.graph.node.NodeTypes.VALUE,
            label: instanceData.label
        };

        t.value.attributes = instanceData.attributes;

        // Set node as immutable, in this state the value cannot be deselected.
        //t.immutable = true;
    }
};
function clickMenu(e){
    alert(e);
}
function download(e){
    /*alert(e);*/
    //download file
    console.log(e);
    /*$.ajax({
            method: "POST",
            url: "/download",
            data: { fname: e }
        })
        .done(function( msg ) {

        });*/
    /*window.location='/download/' + e;*/
    window.open('/files/' + e , '_blank');
}

function setNodeProviders() {
    var sel = '#panel-wrapper';
    $scope = angular.element(sel).scope();
    var companyId = $scope.user.usercompany;
    var userId = $scope.user.userId;

    if(companyId == "undefined")
        companyId = "";

    var child_node_groups = [];
    var child_node_groups_providers = [];

    visualynk.provider.nodeProviders = {};

    var reqInfo = {};
    reqInfo.companyId = companyId;
    reqInfo.userId = userId;

    $.ajax({
            method: "POST",
            url: "/getNodeGroups",
            data: {companyId: companyId, userId: userId},
            async: false
        })
        .done(function (data) {
            console.log(data.responseData.data);
            console.log(data.responseData.children);
            
            data.responseData.data.forEach(function (ngind) {
                var p = [];
                var node_children = [];
                var gtype = "";
                var pId = "";
                child_node_groups.push(ngind._fields[0].properties.name);
                if(ngind._fields[0].properties.properties !== undefined )
                    p = JSON.parse(ngind._fields[0].properties.properties);

                    if(ngind._fields[0].properties.children != undefined ){
                        node_children = ngind._fields[0].properties.children;
                    }
                    console.log(node_children);
                    if(ngind._fields[0].properties.gType != undefined ){
                        gtype = ngind._fields[0].properties.gType;
                    }
                    if(ngind._fields[0].properties.parentRoot != undefined){
                        pId = ngind._fields[0].properties.parentRoot;
                    }
                child_node_groups_providers.push({
                    name: ngind._fields[0].properties.name,
                    id: ngind._fields[0].identity.low,
                    icon: ngind._fields[0].properties.icon,
                    properties: p,
                    companyId: ngind._fields[0].properties.companyId,
                    children: node_children,
                    gtype: gtype,
                    parentId : pId
                })
            })
            console.log("child node groups");
        });
    
    visualynk.provider.nodeProviders = {
        Visualynk : {
            children: child_node_groups,
            returnAttributes: ["name", "link","guid","isEntity"],
            constraintAttribute: "name",
            resultOrderByAttribute: "name",
            nodeId: -1,
            companyId: -1,
            gtype: "",
            parentId : "",
            displayResults: function (t) {
                var ele = t[0][0];
                var e = t.append("div").attr("style", "display: flex;");
                var n = e.append("div").attr("style", "font-size:12px;text-align:left;width:100%;overflow: hidden;text-overflow: ellipsis;").text(function (t) {
                    if (t.attributes.link != "") {
                        $(ele).find("div>div").css("color", "blue").css("cursor", "pointer").css("text-decoration", "underline");
                        $(ele).find("div>div").attr("onClick", "download('" + t.attributes.link + "')");
                    }
                    return t.attributes.name != "" ? t.attributes.name : " empty";
                });
                e.append("i").attr("class", "halflings-icon tasks").attr("onClick", "clickMenu('" + t[0][0].id + "')");
            },
            getDisplayType: function () {
                return visualynk.provider.NodeDisplayTypes.IMAGE
            },
            getImagePath: function (t) {
                return "vendor/plugins/2d_model/img/3DtoGraph.png"
            },
            getImageWidth: function () {
                return 50
            },
            getImageHeight: function () {
                return 50
            },
            getPredefinedConstraints: function () {
                var ret_val = [];
                ret_val.push('$identifier.is_full_show=true');

                if (companyId !== undefined && companyId != "")
                    ret_val.push('$identifier.companyId="' + companyId+'"');

                if (inputValueSystem)
                    ret_val.push("$identifier.name =~ '(?i).*" + inputValueSystem.replace("|", "\\\\|").replace("(", "\\\\(").replace(")", "\\\\)") + ".*'");

                return ret_val;
                //return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
            }
        }
    }

    child_node_groups_providers.forEach(function (group) {
        group.properties.push('name');
        visualynk.provider.nodeProviders[group.name] = {
            parent: "Visualynk",
            returnAttributes: group.properties,
            constraintAttribute: "name",
            resultOrderByAttribute: "name",
            nodeId: group.id,
            companyId: group.companyId,
            gtype : group.gtype,
            parentId : group.parentId,
            getDisplayType: function () {
                return visualynk.provider.NodeDisplayTypes.IMAGE
            },
            getImagePath: function () {
                return "/files/"+group.icon
            },
            displayResults: function (t) {
                if($scope.user.crudpermissions.p_ne_r) {
                    var e = t.append("div").attr("style", "display: flex;");
                    var n = e.append("div").attr("style", "font-size:12px;text-align:left;margin-left:0px;width:100%");

                    var table_tbody = n.append("table").attr("class", "tree-2 table-condensed").attr("style", "width:100%").append("tbody");
                    var table_tr = table_tbody.append("tr").attr("class", "treegrid-1");
                    var table_td = table_tr.append("td");

                    var ele = t[0][0];
                    table_td.append("span").attr("class", "treegrid-expander halflings-icon plus");
                    table_td.append("span").text(function (t) {
                        if (t.attributes.link != "") {
                            $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color", "blue").css("cursor", "pointer").css("text-decoration", "underline");
                            $(ele).find("div>div .treegrid-1 td span:nth-child(2)").attr("onClick", "download('" + t.attributes.link + "')");
                        } else {
                          $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color", "#F62459").css("font-family", "Raleway-Medium").css('font-size','13px');
                        }
                        return t.attributes.name;
                    });

                    table_td.append("span").attr("class", "eye eyeopen pull-left entityeye").attr("ng-click", function(t){
                                return "visible_element_entity($event, '"+t.attributes.guid+"')";
                            }).attr('mode','0').attr('style','margin:0;cursor:pointer;').attr('guid',function(t){
                                return t.attributes.guid;
                            });

                    if ($scope.user.crudpermissions.p_ne_d) {
                        table_td.append("span").attr("class", "halflings-icon remove-circle pull-right").attr("ng-click", function (t) {
                            return "deleteNE($event," + t.attributes.id + ", '"+t.label+"')";

                        });
                    }

                    if ($scope.user.crudpermissions.p_ne_u) {
                        table_td.append("span").attr("class", "halflings-icon edit pull-right").attr("ng-click", function (t) {
                            return "openNEUpdate($event," + t.attributes.id + ")";
                        });
                    }

                    if ($scope.user.crudpermissions.p_ne_u) {
                        table_td.append("span").attr("class", "halflings-icon link pull-right").attr("ng-click", function (t) {
                            var d = visualynk.provider.getProvider(t.label);
                            var companyId = d.companyId;
                            return "openNERelations($event," + t.attributes.id + ", '"+t.attributes.name+"', '"+companyId+"')";
                        });
                    }

                    angular.element(document).injector().invoke(function ($compile, $rootScope) {
                        var scope = angular.element("#panel-wrapper").scope();
                        e.each(function (d, i) {
                            $compile(this)(scope);
                        });
                    });

                    group.properties.forEach(function (prop) {
                        if (prop != "name") {
                            var td1 = table_tbody.append("tr").attr("class", "treegrid-2 treegrid-parent-1").append("td");
                            var row_fluid1 = td1.append("div").attr("class", "row-fluid").attr("style", "width:calc(100% - 16px);float:right;");
                            row_fluid1.append("div").attr("class", "span5").attr("style", "text-align:left; font-family:Raleway-Medium").text(function (t) {
                                return prop + ": ";
                            });

                            row_fluid1.append("div").attr("class", "span7").text(function (t) {
                                return t.attributes[prop];
                            });
                        }

                    })
                }
            },
            getImageWidth: function () {
                return 50
            },
            getImageHeight: function () {
                return 50
            },
            getPredefinedConstraints: function () {
                var ret_val = [];
                ret_val.push('$identifier.is_full_show=true');

                if (companyId !== undefined && companyId != "")
                    ret_val.push('$identifier.companyId="' + companyId+'"');

                if (inputValueSystem)
                    ret_val.push("$identifier.name =~ '(?i).*" + inputValueSystem.replace("|", "\\\\|").replace("(", "\\\\(").replace(")", "\\\\)") + ".*'");

                return ret_val;
                //return inputValueSystem ? ["$identifier.email =~ '(?i).*" + inputValueSystem.replace("|", "\\\\|").replace("(", "\\\\(").replace(")", "\\\\)") + ".*'"] : []
            }
        }
    });
}

setNodeProviders();

visualynk.graph.on(visualynk.graph.Events.NODE_ROOT_ADD, rootNodeListener), visualynk.provider.nodeProviders1 = {


}, visualynk.graph.LINK_DISTANCE = 100, visualynk.graph.node.BACK_CIRCLE_R = 30, visualynk.graph.node.TEXT_Y = -30, visualynk.graph.node.NODE_MAX_CHARS = 60, visualynk.result.onTotalResultCount(function(t) {
    d3.select("#rescount").text(function() {
        return "(" + t + ")"
    })
}),

    visualynk.query.RESULTS_PAGE_SIZE = 1e3;
    visualynk.logger.LEVEL = visualynk.logger.LogLevels.INFO;

visualynk.start("");
//visualynk.start("Facility_Management");
