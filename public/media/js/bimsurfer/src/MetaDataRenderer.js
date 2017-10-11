define(["./EventHandler"], function(EventHandler) {
    
    function Row(args) {
        var self = this;
        var num_names = 0;
        var num_values = 0;
        
        this.setName = function(name) {
            if (num_names++ > 0) {
                args.name.appendChild(document.createTextNode(" "));
            }
            args.name.appendChild(document.createTextNode(name));
        }
        
        this.setValue = function(value) {
            if (num_values++ > 0) {
                args.value.appendChild(document.createTextNode(", "));
            }
            args.value.appendChild(document.createTextNode(value));
        }
    }
    
    function Section(args) {
        var self = this;
        
        var div = document.createElement("div");
        var nameh = document.createElement("h3");
        var table = document.createElement("table");
        
        var tr = document.createElement("tr");
        table.appendChild(tr);
        var nameth = document.createElement("th");
        var valueth = document.createElement("th");
        nameth.appendChild(document.createTextNode("Name"));
        valueth.appendChild(document.createTextNode("Value"));
        tr.appendChild(nameth);
        tr.appendChild(valueth);
        
        div.appendChild(nameh);
        div.appendChild(table);
        
        args.domNode.appendChild(div);
        
        this.setName = function(name) {
            nameh.appendChild(document.createTextNode(name));
        }
        
        this.addRow = function() {
            var tr = document.createElement("tr");
            table.appendChild(tr);
            var nametd = document.createElement("td");
            var valuetd = document.createElement("td");
            tr.appendChild(nametd);
            tr.appendChild(valuetd);
            return new Row({name:nametd, value:valuetd});
        }
    };
    
    function MetaDataRenderer(args) {
        
        var self = this;        
        EventHandler.call(this);
        
        var models = {};
        var domNode = document.getElementById(args['domNode']);
        
        this.addModel = function(args) {
            models[args.id] = args.model;
        };
        
        var renderAttributes = function(elem) {
            var s = new Section({domNode:domNode});
            s.setName(elem.getType());
            ["GlobalId", "Name", "OverallWidth", "OverallHeight", "Tag"].forEach(function(k) {
                var fn = elem["get"+k];
                if (fn) {
                    r = s.addRow();
                    r.setName(k);
                    r.setValue(fn.apply(elem));
                }
            });
        };
        
        var renderPSet = function(pset) {
            var s = new Section({domNode:domNode});
            pset.getName(function(name) {
                s.setName(name);
            });
            var render = function(prop, row) {
                var r = row || s.addRow();
                prop.getName(function(name) {
                    r.setName(name);
                });
                if (prop.getNominalValue) {
                    prop.getNominalValue(function(value) {
                        r.setValue(value._v);
                    });
                }
                if (prop.getHasProperties) {
                    prop.getHasProperties(function(prop) {
                        render(prop, r);
                    });
                }
            };
            pset.getHasProperties(render);
        };
        
        this.setSelected = function(oid) {
            if (oid.length !== 1) {
                domNode.innerHTML = "&nbsp;<br>Select a single element in order to see object properties."
                return;
            };
            
            domNode.innerHTML = "";
            
            oid = oid[0].split(':');
            var o = models[oid[0]].model.objects[oid[1]];
            
            renderAttributes(o);
            
            o.getIsDefinedBy(function(isDefinedBy){
                if (isDefinedBy.getType() == "IfcRelDefinesByProperties") {
                    isDefinedBy.getRelatingPropertyDefinition(function(pset){
                        if (pset.getType() == "IfcPropertySet") {
                            renderPSet(pset);
                        }
                    });
                }
            });
        };

        this.getModels = function() {
            return models;
        }
        
        self.setSelected([]);
    };
    
    MetaDataRenderer.prototype = Object.create(EventHandler.prototype);

    return MetaDataRenderer;
    
});