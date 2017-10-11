function selectInstance(t, e) {
    visualynk.graph.mainLabel = t, instanceData = {
        label: t,
        attributes: e
    }, visualynk.tools.reset(), instanceData = null
}
var aa, bb, cc, dd, ee, EmailData, FloorData, SpaceData, ZoneData, SystemData, AssetData, ComponentData, SpareData, ResourceData, JobData, DocumentData, AttributeData, GuidData, inputValueEmail,inputValueCompany,inputValueFacility, inputValueFloor, inputValueSpace, inputValueSystem, inputValueZone, inputValueAsset, inputValueComponent, inputValueSpare,inputValueConnection,inputValueAssembly, inputValueResource, inputValueJob, inputValueDocument, inputValueAttribute, inputValueGuid, inputValueServiceRequest, valueEmail, valueFloor, valueSpace, valueSystem, valueZone, valueAsset, valueComponent, valueSpare, valueResource, valueJob, valueDocument, valueAttribute, valueGuid, instanceData;
visualynk.rest.CYPHER_URL = "http://localhost:7474/db/data/transaction/commit", visualynk.rest.AUTHORIZATION = "Basic " + btoa("neo4j:meh_nam");

var instanceData, rootNodeListener = function(t) {
    console.log("AAA");
    instanceData && (t.value = {
        type: visualynk.graph.node.NodeTypes.VALUE,
        label: instanceData.label
    }, t.value.attributes = instanceData.attributes, t.immutable = !1)
};
visualynk.graph.on(visualynk.graph.Events.NODE_ROOT_ADD, rootNodeListener), visualynk.provider.nodeProviders = {
    Facility_Management: {
        children: ["PERSON", "COMPANY", "FACILITY", "FLOOR", "ZONE", "SPACE", "ASSET","COMPONENT","SYSTEM", "ASSEMBLY", "CONNECTION", "SPARE", "RESOURCE", "JOB", "SERVICE_REQUEST", "DOCUMENT", "ATTRIBUTE"],
        returnAttributes: ["name"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/3DtoGraph.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    PERSON: {
        parent: "Facility_Management",
        returnAttributes: ["email", "first_name", "last_name","created_on"],
        constraintAttribute: "email",
        URLlinkAttribute: "email",
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/email.png"
        },
        displayResults: function(t) {
            var e = t.append("div").attr("style", "display: flex;");
            e.append("img").attr("style", "width:60px; height:60px; border-radius: 50% !important; margin:5px 5px 5px 0px;").attr("src", function(t) {
                return "vendor/plugins/2d_model/img/" + t.attributes.last_name + ".jpg"
            });
            var n = e.append("div").attr("style", "font-size:12px;text-align:left;width:100%;");
            n.append("p").append("i").attr("class","icon-user").attr("style","font-family:FontAwesome !important;").append("a").attr("href", function(t) {
                var e = "mailto:%s",
                    n = t.attributes.email,
                    a = e.replace("%s", n);
                return a
            }).text(function(t) {
                return " " + t.attributes.first_name + " " + t.attributes.last_name
            });
            n.append("p").append("i").attr("class","icon-envelope").attr("style","font-family:FontAwesome !important;").append("span").attr("style","display: inline-block;width: 135px;margin-left:3px;vertical-align: middle;cursor:default;overflow: hidden;text-overflow: ellipsis;")
                .text(function(t) {
                    return " " + t.attributes.email
                });
            /* created on */
            n.append("p").append("i").attr("class","icon-calendar").attr("style","font-family:FontAwesome !important;").append("span").attr("style","display: inline-block;width: 135px;margin-left:3px;vertical-align: middle;cursor:default;overflow: hidden;text-overflow: ellipsis;")
                .text(function(t) {
                    return " " + t.attributes.created_on.replace("T"," ");
                });
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.email =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    COMPANY: {
        parent: "Facility_Management",
        returnAttributes: ["name", "department", "organization_code"],
        constraintAttribute: "name",
        URLlinkAttribute: "name",
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/company.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }


    },
    FACILITY: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/facility.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    FLOOR: {
      parent: "Facility_Management",
      returnAttributes: ["name", "link"],
      constraintAttribute: "name",
      URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/floor.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    ZONE: {
      parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/zone.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    SPACE: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            n.append("td").attr("height", "10px").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/space.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },

    ASSET: {
        parent: "Facility_Management",
        returnAttributes: ["name"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            n.append("td").append("h4").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/asset.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    COMPONENT: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/component.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    SYSTEM: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/system.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    ASSEMBLY: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/assembly.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    CONNECTION: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/connection.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    SPARE: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/spare.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    RESOURCE: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/resource.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    JOB: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/job.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    SERVICE_REQUEST: {
        parent: "Facility_Management",
        returnAttributes: ["message", "id", "link"],
        constraintAttribute: "message",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("message", "row1");
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                return t.attributes.message
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/stage.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.message =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    DOCUMENT: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/document.png"
        },
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                return t.attributes.name
            })
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    ATTRIBUTE: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/attribute.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
}, visualynk.graph.LINK_DISTANCE = 80, visualynk.graph.node.BACK_CIRCLE_R = 30, visualynk.graph.node.TEXT_Y = -30, visualynk.graph.node.NODE_MAX_CHARS = 60, visualynk.result.onTotalResultCount(function(t) {
    d3.select("#rescount").text(function() {
        return "(" + t + ")"
    })
}), visualynk.query.RESULTS_PAGE_SIZE = 1e3, visualynk.logger.LEVEL = visualynk.logger.LogLevels.INFO, visualynk.start("Facility_Management");
