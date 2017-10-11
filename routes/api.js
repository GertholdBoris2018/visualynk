    /*
     * Serve JSON to our AngularJS client
     */

var neo4j = require('neo4j-js');
var async = require('async');
var neo4JUrl = 'http://localhost:7474/db/data/';
var passport = require('passport');
var jwt = require('jsonwebtoken');
    var util = require('util');

exports.signin = function(req, res, next) {
    //check user exist on the neo4j db
	passport.authenticate('login', function(err, user, info) {
        /*console.log(util.inspect(user, {showHidden: false, depth: null}))*/
		if (err || !user) {
			res.status(400).send(info);
		} else {
			// Remove sensitive data before login
			//user.password = undefined;
			//user.salt = undefined;
			req.login(user, function(err) {
				if (err) {
					res.status(400).send(err);
				} else {
                  // We are sending the profile inside the token
                  var token = jwt.sign(user, 'secret-anne', { expiresInMinutes: 20 });

                  res.json({ token: token });
				}
			});
		}
	})(req, res, next);
};
exports.login = function(req, res, next) {
    //check user exist on the neo4j db
    var username = req.body.username;
    var password = req.body.password;
    var user_nodes = null;
    var error = '';
    var result = {'msg':'You are invalid user!','token':''};
    console.log("message : user login checking... ");
     neo4j.connect(neo4JUrl, function(err, graph) {
         if (err) throw err;
         var query;
         query = ["match (n) where n.username = '"+username+"' or n.emailaddress = '"+username+"' return n"].join('\n');
         graph.query(query, null, function(err, results) {
             console.log("message : get all nods status : " + err);
             console.log("message : all nods results as below ");
             console.log("counts : " + results.length);
             /*console.log(util.inspect(results, {showHidden: false, depth: null}));*/

             if(results.length > 0){
                 if (err) {
                     error = err;
                 }
                 else {
                     error = null;
                     user_nodes = results;
                     for (var i = 0, len = user_nodes.length; i < len; i++) {
                         var user = user_nodes[i].n.data.username;
                         var emailaddress = user_nodes[i].n.data.emailaddress;
                         if(user != undefined){
                             if (user == username || emailaddress == username ) {/* user exist */
                                 var pass = user_nodes[i].n.data.password;
                                 if(password == pass){
                                     var token = jwt.sign(user, 'secret-anne', { expiresInMinutes: 20 });
                                     result.msg = "success";
                                     result.token = token;
                                 }
                                 else{
                                     result.msg = "Your password is wrong!";
                                     result.token = '';
                                 }
                             }
                         }
                     }
                 }
             }
             res.json({
                 responseData: result,
                 error: error
             });
         });
     });
};

exports.createNode = function (req, res) {
    //JSON. stringify is only available in mordern browers.....
    var node = req.body;
    //var retValue = '', error = '';
    neo4j.connect(neo4JUrl, function (errors, graph) {

        graph.createNode(node, function (err, n) {
            //if (err) {
            //    //error = (err);
            //} else {
            //    //retValue = (JSON.stringify(n));
            //}
            res.json({
                responseData: n,
                error: err
            });
        });
    });
};
exports.register = function (req, res) {
    //JSON. stringify is only available in mordern browers.....
    console.log("CreateNode Called");
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var username = req.body.username;
    var password = req.body.password;
    var userEmail = req.body.userEmail;

    var error = '';
    var result = {};
    var user_nodes = null;

    console.log("message : user duplication checking... ");
    /* check username duplication check */
    neo4j.connect(neo4JUrl, function(err, graph) {
        if (err) throw err;
        var query;
        query = ["match (n) where n.username = '"+username+"' or n.emailaddress='"+userEmail+"' return n"].join('\n');
        graph.query(query, null, function(err, results) {
            var pass = 0;
            console.log("message : get all nods status : " + err);
            console.log("message : all nods results as below ");
            console.log("counts : " + results.length);
            /*console.log(util.inspect(results, {showHidden: false, depth: null}));*/
            if(results.length > 0){
                if (err) {
                    error = err;
                }
                else {
                    error = null;
                    user_nodes = results;
                    for (var i = 0, len = user_nodes.length; i < len; i++) {
                        var user = user_nodes[i].n.data.username;
                        var emailaddress = user_nodes[i].n.data.emailaddress;

                        if(user != undefined){
                            if (user == username || emailaddress == userEmail) {/* user exist */
                                result.msg = "The User is already taken!";
                                result.responseData = null;
                            }
                            else{
                                result.msg = "PassUser";
                                result.responseData = null;
                                pass = 1;
                            }
                        }
                    }
                }
            }
            else{
                pass = 1;
            }
            if(pass == 1){
                var node = {firstName:firstName,lastName:lastName,username:username,password:password,emailaddress:userEmail};
                //var retValue = '', error = '';
                neo4j.connect(neo4JUrl, function (errors, graph) {
                    graph.createNode(node, function (err, n) {
                        result.msg = "success";
                        result.responseData = n;
                        console.log("RESULT : " + result.msg);
                        res.json(result);
                    });
                });
            }
            else{
                console.log("RESULT : " + result.msg);
                res.json(result);
            }
        });
    });

};
exports.getNode = function(req, res) {
    var retValue = '';
    var nodeId = req.body.nodeId;
    neo4j.connect(neo4JUrl, function(errors, graph) {
        if (err) {
            retValue = err;
            return;
        }

        graph.getNode(nodeId, function(err, result) {
            retValue = result;
        });
        res.json({
            responseDate: retValue
        });
    });


};

exports.updateNode = function (req, res) {
    var nodeId = req.body.nodeId;
    var newNodeValues = req.body.node;
    var retValue = '';
   
    neo4j.connect(neo4JUrl, function (errors, graph) {

         async.series({
            one: function (callback) {
                graph.getNode(nodeId, function (err, result) {
                    if (err) {
                        callback(err, result);
                    }
                    else {
                        node = result;
                        callback(null, result);
                    }
                });
            },
            two: function (callback) {
                node.replaceAllProperties(newNodeValues, function(err, n) {
                    if (err) {
                        retValue = (err);
                        callback(err, n);
                    } else {
                        retValue = (JSON.stringify(n));
                        callback(null, n);
                    }

                });
            }
        },
        function (err, results) {
            // results is now equal to: {one: 1, two: 2}
            res.json({
                responseData:  {
                    level: results.level,
                    price: results.price,
                    name: results.name,
                    description: results.description,
                    id:nodeId
                }
            });
        });

        
    });

};

exports.deleteNode = function (req, res) {

    var nodeId = req.body.nodeId;
    var retValue = '';

    neo4j.connect(neo4JUrl, function (errors, graph) {
        // find out if the node has any active relationships.
        // if it does, delete relationship first and then delete node.
        var query = [
            'START n=node(' + nodeId + ' ) ',
            'MATCH n-[r]-()  ',
            'DELETE r'
        ].join('\n');


        async.series({
            one: function (callback) {
                graph.query(query, null, function (err, results) {
                    if (err) {
                        callback(err, results);
                    }
                    else {
                        callback(null, results);
                    }
                });
            },
            two: function (callback) {
                graph.deleteNode(nodeId, function (err, n) {
                    if (err) {
                        retValue = (err);
                        callback(err, n);
                    } else {
                        retValue = n;
                        callback(null, n);
                    }
                });
            }
        },
        function (err, results) {
            // results is now equal to: {one: 1, two: 2}
            res.json({
                responseData: null
        });
        });



    });


};


exports.runAdhocQuery = function (req, res) {
    var retValue = '', error = undefined;
    neo4j.connect(neo4JUrl, function (err, graph) {
        if (err)
            throw err;
        var query = req.body.query;

        graph.query(query, null, function (error, results) {
            if (error) {
                error = error;
            }
            else {
                retValue = results;
            }
            res.json({
                responseData: retValue,
                error: error
            });
        });

    });

};

exports.runQuery = function(query, callback) {

    neo4j.connect(neo4JUrl, function (err, graph) {
        if (err)
            callback(err, null);

        graph.query(query, null, function (error, results) {
            if (error) {
                callback(error, null);
            }
            else {
                callback(null, results);
            }
            
        });

    });

};

exports.runParallelQueries = function(req, res) {

    var queries = req.body.queries;

    async.map(queries, exports.runQuery, function(err, result) {

        res.json({
            responseData: result,
            error: err
        });
    });

};


exports.createRelationship = function (req, res) {
    var startNodeId = req.body.startNodeId;
    var endNodeId = req.body.endNodeId;
    var relationshipName = req.body.relationshipName;
    var retValue = '';

    neo4j.connect(neo4JUrl, function (err, graph) {
        if (err)
            throw err;
        var query = [
            'START n=node(' + startNodeId + '), m=node(' + endNodeId + ')',
            'CREATE UNIQUE (n)-[:' + relationshipName + ']->(m)'
        ].join('\n');

        graph.query(query, null, function (error, results) {
            if (error) {
                retValue = err;
            }
            else {
                retValue = results;
            }
            res.json({
                responseData: retValue
            });
        });

    });


};


exports.deleteRelationship = function (req, res) {
    var realtionshipId = req.body.realtionshipId;
    var retValue = '';
    neo4j.connect(neo4JUrl, function (err, graph) {
        if (err)
            throw err;

        graph.deleteRelationship(realtionshipId, function (error, results) {
            if (error) {
                retValue = error;
            } else {
                retValue = results;
            }
            res.json({
                responseData: retValue
            });
        });
    });


};

exports.getAllNodes = function(req, res) {

     var retValue;

    neo4j.connect(neo4JUrl, function(err, graph) {
        if (err)
            throw err;
        var query;
       
            query = [
                     'MATCH (n)  ',
                     'WHERE n.tag=\'drugs\'',
                     'RETURN n'
                        ].join('\n');
        graph.query(query, null, function(err, results) {
            if (err) {
                retValue = err;
            } else {
                retValue = results;
            }

            res.json({
                responseData: retValue
            });
        });
    });

};
