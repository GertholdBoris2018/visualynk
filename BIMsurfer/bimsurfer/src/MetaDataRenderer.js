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
        //console.log(div);
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
            var GUID = bimSurfer.toGuid([elem.oid]);
            console.log(GUID);
            $.ajax({
                type: "POST",
                async: false,
                url: "http://localhost:7474/db/data/transaction/commit",
                accepts: {
                    json: "application/json"
                },
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify({
                    "statements": [{
                        "statement": "MATCH (n {GUID:'"+GUID+"'}) RETURN n, labels(n)"
                    }]
                }),
                success: function(result) {
                  var name = JSON.stringify(result.results[0].data[0].row[0].name).replace(/['"]+/g, '');
                  console.log(name);
                  var etiket = (JSON.stringify(result.results[0].data[0].row[1])).replace(/[[\]]/g,'').replace(/['"]+/g, '');
                  console.log(etiket);
                  xdLocalStorage.setItem('noktaIsim', name, function (data) { });
          				xdLocalStorage.setItem('buyukHarfler', etiket, function (data) { });
                 }
                });

            // Detailed info about the item can be adjusted below. Populate the params as much as needed
            ["GlobalId", "Name", "OverallWidth", "OverallHeight", "Tag", "ObjectType", "Layer", "Model", "System", "Description"].forEach(function(k) {
                var fn = elem["get"+k];
                if (fn) {
                    r = s.addRow();
                    r.setName(k);
                    r.setValue(fn.apply(elem));
                }
            });
        };
        var mainTitle
        var renderPSet = function(pset) {
          //console.log(pset);
            var s = new Section({domNode:domNode});
            pset.getName(function(name) {
                s.setName(name);

                // Get the titles of the returned Psets
                //console.log(name);
                mainTitle = name;

            });
            var render = function(prop, row) {
                var r = row || s.addRow();
                prop.getName(function(name) {
                    r.setName(name);

                    // Get the titles of each attributes of Psets
                    //console.log(prop);
                });
                if (prop.getNominalValue) {
                    prop.getNominalValue(function(value) {
                        r.setValue(value._v);
                        prop.getName(function(name) {

                          // Props and values are together
                          var propTitle = name;
                          var propValue = value._v
                           var JSONout = {
                             //"mainTitle": mainTitle,
                             "propTitle": propTitle,
                             "propValue": propValue,
                           };
                          // name.forEach(function(jsonOBJ) {
                          //   JSONout[propName] = jsonOBJ.name
                          // })
                        //console.log(JSONout);
                        })
                        var a = document.getElementById('dataContainer').innerHTML;
                        //console.log(a);

                        // See the returned IFC entities for Psets
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
                domNode.innerHTML = "&nbsp;<br>Select Element from 3D Model"
                return;
            };

            domNode.innerHTML = "";

            oid = oid[0].split(':');
            var o = models[oid[0]].model.objects[oid[1]];
            renderAttributes(o);
            //console.log(o);

            o.getIsDefinedBy(function(isDefinedBy){
                if (isDefinedBy.getType() == "IfcRelDefinesByProperties") {
                    isDefinedBy.getRelatingPropertyDefinition(function(pset){
                        if (pset.getType() == "IfcPropertySet") {
                            renderPSet(pset);

                            // Get the objects of returned Psets
                          }
                    });
                }
            });
        };

        self.setSelected([]);
    };

    MetaDataRenderer.prototype = Object.create(EventHandler.prototype);

    return MetaDataRenderer;


});
