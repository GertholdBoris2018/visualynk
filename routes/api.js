/*
 * Serve JSON to our AngularJS client
 */

var neo4j = require('neo4j-js');
var async = require('async');
var neo4JUrl = 'http://localhost:7474/db/data/';
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var jwt = require('jsonwebtoken');
var util = require('util');
var request = require('request');
var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var fs = require('fs');
var mailconfFile = 'config/mailconfig.json';
var countriesconfFile = 'config/countries.json';
var bimconfFile = 'config/bimconfig.json';
var path = require('path');
var url = require('url');
var http = require('http');
var crypto = require('crypto');
var randomstring = require("randomstring");
var FileReader = require('filereader');
var neo4j_driver = require('neo4j-driver').v1;
//var driver = neo4j_driver.driver("bolt://localhost", neo4j_driver.auth.basic("neo4j", "0401010033"));
var driver = neo4j_driver.driver("bolt://localhost", neo4j_driver.auth.basic("neo4j", "Too3uth7"));
var session = driver.session();

function readConfig(file){
    return JSON.parse(fs.readFileSync(file));
}
var mailConf = readConfig(mailconfFile);
var countries = readConfig(countriesconfFile);
var bimConf = readConfig(bimconfFile);
var transporter = nodemailer.createTransport(smtpTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: mailConf.username,
        pass: mailConf.password
    }
}));
var multer  = require('multer');
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
var upload = multer({ //multer settings
    storage: storage
}).single('myimage');

exports.getCountries = function(req, res){
    res.json(countries);
}
exports.ngIconUpload = function(req,res){
    var filepath = req.body.filename;

    var milliseconds = new Date().getTime();
    filepath = milliseconds;

    if (!fs.existsSync("./uploads")){
        fs.mkdirSync("./uploads");
    }

    upload(req,res,function(err){
        if(err){
            res.json({error_code:1,err_desc:err});
            return;
        }

        fs.readFile(req.files.filename.path, function(err, data) {
            var fext = path.extname(req.files.filename.originalFilename);
            newPath = "./uploads/" + filepath + fext;
            var file_name = filepath + fext;

            fs.writeFile(newPath, data, function (err) {
                res.json({filename:file_name});
            });

        });
    })
}
exports.twoDimentionModelUpload = function(req,res){
    var filepath = req.body.filename;

    /*var milliseconds = new Date().getTime();
    filepath = milliseconds;*/

    if (!fs.existsSync("./uploads")){
        fs.mkdirSync("./uploads");
    }

    upload(req,res,function(err){
        if(err){
            res.json({error_code:1,err_desc:err});
            return;
        }

        fs.readFile(req.files.filename.path, function(err, data) {
            var fext = path.extname(req.files.filename.originalFilename);
            //var newPath = "./uploads/" + filepath + fext;
            var file_name = req.files.filename.originalFilename;
            var newPath = "./uploads/" + file_name;
            //var file_name = filepath + fext;

            fs.writeFile(newPath, data, function (err) {
                res.json({filename:file_name});
            });

        });
    })
}
exports.fileupload = function(req,res){
    console.log("upload function called");
    var filepath = req.body.fname;
    var nodename = req.body.nname;
    var itemname = req.body.iname;
    var newPath = '';
    var milliseconds = new Date().getTime();
    filepath = filepath + milliseconds;
    console.log("file path is =>" + filepath);
    console.log("node name is =>" + nodename);
    console.log("item name is =>" + itemname);
    var error = '';

    /* if the uploads directory does not exist create one*/
    /* node name is person check */
    if (!fs.existsSync("./uploads")){
        fs.mkdirSync("./uploads");
    }
    if(nodename == "PERSON"){
        var fname = itemname.split(" ")[0];
        var lname = itemname.split(" ")[1];
        var email = itemname.split(" ")[2];
        upload(req,res,function(err){
            if(err){
                res.json({error_code:1,err_desc:err});
                return;
            }
            fs.readFile(req.files.file.path, function(err, data) {
                var fext = path.extname(req.files.file.name);
                newPath = "./uploads/" + filepath + fext;
                var file_name = filepath + fext;
                fs.writeFile(newPath, data, function (err) {
                    console.log("Finished writing file..." + err);
                });
                /* insert the filepath to graph db */
                var query = ["MATCH (n:"+nodename+"{first_name:'"+fname+"',last_name:'"+lname+"',email:'"+email+"'}) set n.link='"+ file_name +"' RETURN n"].join('\n');
                session
                    .run(query)
                    .then(function(result){
                        var records = result.records;
                        var length = records.length;
                        if(length > 0){
                            error = null;
                            console.log("File is uploaded");
                            res.json({error_code:0,err_desc:error});
                        }
                        else{
                            console.log("nothing updated");
                            res.json({error_code:0,err_desc:error});
                        }
                        session.close();
                    });
            });
        })
    }
    else if(nodename == "Visualynk_Group"){
        upload(req,res,function(err){
            if(err){
                res.json({error_code:1,err_desc:err});
                return;
            }

            fs.readFile(req.files.file.path, function(err, data) {
                var fext = path.extname(req.files.file.name);
                newPath = "./uploads/" + filepath + fext;
                var file_name = filepath + fext;

                fs.writeFile(newPath, data, function (err) {
                    console.log("Finished writing file..." + err);
                    res.json({filename:file_name});
                });

            });
        })
    }
    else{
        upload(req,res,function(err){
            if(err){
                res.json({error_code:1,err_desc:err});
                return;
            }

            fs.readFile(req.files.file.path, function(err, data) {
                var fext = path.extname(req.files.file.name);
                newPath = "./uploads/" + filepath + fext;
                var file_name = filepath + fext;

                fs.writeFile(newPath, data, function (err) {
                    console.log("Finished writing file..." + err);
                });
                /* insert the filepath to graph db */
                var query = ["MATCH (n:"+nodename+"{name:'"+itemname+"'}) set n.link='"+ file_name +"' RETURN n"].join('\n');
                session
                    .run(query)
                    .then(function(result){
                        var records = result.records;
                        var length = records.length;
                        if(length > 0){
                            error = null;
                            console.log("File is uploaded");
                            res.json({error_code:0,err_desc:error});
                        }
                        else{
                            console.log("nothing updated");
                            res.json({error_code:0,err_desc:error});
                        }
                        session.close();
                    });
            });
        })
    }
}

exports.download = function(req,res){
    var filename = req.params.fname;
    console.log(util.inspect(req.params, {showHidden: false, depth: null}))
    console.log("file name => " + filename);
    var filepath = './uploads/'+ filename;
    console.log("downloading the " + filename);
    fs.stat(filepath, function(err,stat){
        if(err == null){
            console.log('File exists');
            res.download(filepath);
        }
        else if(err.code == 'ENOENT') {
            // file does not exist
            fs.writeFile('log.txt', 'Some log\n');
        } else {
            console.log('Some other error: ', err.code);
        }
    })

}

exports.getNodeGroups = function(req,res){
    var companyId = req.body.companyId;
    var userId = req.body.userId;

    var result = {'msg':''};
    var result_array = [];
    var error = '';
    
    if(userId != ""){
        var squery = "START n=node("+userId+") return n";

        session
            .run(squery)
            .then(function(results) {
                var records = results.records;

                if(records[0]._fields[0].properties.hasOwnProperty("restrictGroups"))
                    var userRestricts = JSON.parse(records[0]._fields[0].properties.restrictGroups)
                else
                    var userRestricts = [];

                if(userRestricts.length > 0){
                    if(companyId != "")
                        var query = ["match (n:NODEGROUPS) where NOT ID(n) IN ["+userRestricts.join(",")+"] AND n.companyId = '"+companyId+"' AND n.is_full_show = true AND n.gType= '1' return n"].join('\n');
                    else
                        var query = ["match (n:NODEGROUPS) WHERE NOT ID(n) IN ["+userRestricts.join(",")+"] AND n.is_full_show = true  AND n.gType= '1' return n"].join('\n');
                }
                else {
                    if (companyId != "")
                        var query = ["match (n:NODEGROUPS) where n.companyId = '" + companyId + "' AND n.is_full_show = true  AND n.gType= '1' return n"].join('\n');
                    else
                        var query = ["match (n:NODEGROUPS) WHERE n.is_full_show = true  AND n.gType= '1' return n"].join('\n');
                }

                session
                    .run(query)
                    .then(function(results) {
                        var records = results.records;
                        result.msg = "success";
                        //result.data = records;

                        var len = records.length;
                        var pos = 0;

                        if(len == 0){

                            result.data = [];
                            res.json({
                                responseData: result,
                                error: error
                            });
                        }
                        
                        results.records.forEach(function(record) {
                            var id = record._fields[0].identity.low;
                            
                            var root = record;
                            if (companyId != "")
                                var query = ["match (n:NODEGROUPS) where n.companyId = '" + companyId + "' and n.parentRoot ='"+id+"' AND n.is_full_show = true  return n"].join('\n');
                            else
                                var query = ["match (n:NODEGROUPS) WHERE n.parentRoot ='"+id+"' AND n.is_full_show = true  return n"].join('\n');
                                
                                session
                                    .run(query)
                                    .then(function(results) {
                                        var dts = results.records;
                                        result_array.push(root);

                                        dts.forEach(function(record){
                                            result_array.push(record);
                                        });
                                        /*if(dts.length != 0){
                                            var children = [];
                                            dts.forEach(function(r){
                                                var child = r._fields[0].properties.name;
                                                children.push(child);
                                            });
                                            record._fields[0].properties.children = children;
                                        }*/
                                        pos++;
                                        if(pos == len){

                                            result.data = result_array;
                                            res.json({
                                                responseData: result,
                                                error: error
                                            });
                                        }
                                    });
                                session.close();
                        });
                        
                        session.close()
                    })
                session.close()
            })
    } else {
        if (companyId != "")
            var query = ["match (n:NODEGROUPS) where n.companyId = '" + companyId + "' AND n.is_full_show = true return n"].join('\n');
        else
            var query = ["match (n:NODEGROUPS) WHERE n.is_full_show = true return n"].join('\n');

        session
            .run(query)
            .then(function (results) {
                var records = results.records;
                result.msg = "success";
                result.data = records;
                res.json({
                    responseData: result,
                    error: error
                });
                session.close()
            })
    }
}

exports.getRootGroups = function(req, res){
    var result = {'msg':'', 'data':[]};
    var error = '';
    var query = ['match (n:NODEGROUPS) where n.gType = "1" AND n.is_full_show = true return n'].join('\n');
    session
            .run(query)
            .then(function (results) {
                var records = results.records;
                result.msg = "success";
                result.data = records;
                res.json({
                    responseData: result,
                    error: error
                });
                session.close()
            })
}
exports.getNodeGroups1 = function(req,res){
    var companyId = req.body.companyId;
    var userId = req.body.userId;
    console.log(userId)

    var result = {'msg':''};
    var error = '';

    if(userId != ""){
        var squery = "START n=node("+userId+") return n";

        session
            .run(squery)
            .then(function(results) {
                var records = results.records;

                if(records[0]._fields[0].properties.hasOwnProperty("restrictGroups"))
                    var userRestricts = JSON.parse(records[0]._fields[0].properties.restrictGroups)
                else
                    var userRestricts = [];

                if(userRestricts.length > 0){
                    if(companyId != "")
                        var query = ["match (n:NODEGROUPS) where NOT ID(n) IN ["+userRestricts.join(",")+"] AND n.companyId = '"+companyId+"' AND n.is_full_show = true return n"].join('\n');
                    else
                        var query = ["match (n:NODEGROUPS) WHERE NOT ID(n) IN ["+userRestricts.join(",")+"] AND n.is_full_show = true return n"].join('\n');
                }
                else {
                    if (companyId != "")
                        var query = ["match (n:NODEGROUPS) where n.companyId = '" + companyId + "' AND n.is_full_show = true return n"].join('\n');
                    else
                        var query = ["match (n:NODEGROUPS) WHERE n.is_full_show = true return n"].join('\n');
                }
                session
                    .run(query)
                    .then(function(results) {
                        var records = results.records;
                        result.msg = "success";
                        result.data = records;
                        res.json({
                            responseData: result,
                            error: error
                        });
                        session.close()
                    })
                session.close()
            })
    } else {
        if (companyId != "")
            var query = ["match (n:NODEGROUPS) where n.companyId = '" + companyId + "' AND n.is_full_show = true return n"].join('\n');
        else
            var query = ["match (n:NODEGROUPS) WHERE n.is_full_show = true return n"].join('\n');

        session
            .run(query)
            .then(function (results) {
                var records = results.records;
                result.msg = "success";
                result.data = records;
                res.json({
                    responseData: result,
                    error: error
                });
                session.close()
            })
    }
}

exports.getNodeGroup = function(req,res){
    var nodeId = req.params.nodeId;

    var result = {'msg':''};
    var error = '';

    var query = "START n=node("+nodeId+") return n";
    session
        .run(query)
        .then(function(results) {
            var records = results.records;
            result.msg = "success";
            result.data = records;
            res.json({
                responseData: result,
                error: error
            });
            session.close()
        })
}
exports.getEntitiesbyGroupNodeId = function(req,res){
    var nodeId = req.body.nodeId;
    var nodelabel = req.body.label;
    var result = {'msg':''};
    var error = '';

    var query = ['match (n:'+nodelabel+') return n'].join('\n');
    console.log(query);
    session
        .run(query)
        .then(function(results) {
            var records = results.records;
            result.msg = "success";
            result.data = records;
            res.json({
                responseData: result,
                error: error
            });
            session.close()
        })
}
exports.getAllEntitiesByGroupRootId = function(req , res){
    var id = req.body.rootId;
    var rootlabel = req.body.label;
    var companyId = req.body.companyId;
    var result = {'msg':''};
    var error = '';

    if (companyId != "")
        var query = ["match (n:NODEGROUPS) where n.companyId = '" + companyId + "' and n.parentRoot ='"+id+"' AND n.is_full_show = true  return n"].join('\n');
    else
        var query = ["match (n:NODEGROUPS) WHERE n.parentRoot ='"+id+"' AND n.is_full_show = true  return n"].join('\n');
    console.log(query);
    session
        .run(query)
        .then(function(results) {
            var records = results.records;
            if(records.length > 0){
                nodegroups = results.records;
                var cnt = 0;
                var entities = [];
                nodegroups.forEach(function(node){
                    var nodelabel = node._fields[0].properties.name;
                    var query = ['match (n:'+nodelabel+') return n'].join('\n');
                    console.log(query);
                    session
                        .run(query)
                        .then(function(results) {
                            var records = results.records;
                            records.forEach(function(record){
                                entities.push(record);
                            })
                            
                            cnt++;
                            console.log("cnt => " + cnt);
                            if(cnt == nodegroups.length){
                                session.close();
                                result.msg = "success";
                                result.data = entities;
                                
                                res.json({
                                    responseData: result,
                                    error: error
                                });
                            }
                        })
                        
                });
            }
        })
}
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
    var result = {'msg':'You are invalid user!','token':'','userCompany':'','userType':''};
    console.log("message : user login checking... ");
    var query;
    query = ["match (n:USERS) where n.username = '"+username+"' or n.emailaddress = '"+username+"' return n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                user_nodes = records;
                results.records.forEach(function(record) {

                    var user = record._fields[0].properties.username;
                    var emailaddress = record._fields[0].properties.emailaddress;
                    var profile = {
                        first_name : record._fields[0].properties.firstName,
                        last_name : record._fields[0].properties.lastName,
                        email : record._fields[0].properties.emailaddress,
                        id : record._fields[0].identity.low
                    }
                    if(user != undefined){
                        // Changed for test purposes
                        //if(user == username || emailaddress == username){
                        if(emailaddress == username){
                            try{
                                var pass = decrypt(record._fields[0].properties.password);
                            } catch (e){
                                var pass = record._fields[0].properties.password;
                            }

                            if(password == pass){
                                var token = jwt.sign(profile, 'secret-anne', { expiresInMinutes: 20 });
                                result.msg = "success";
                                result.token = token;
                                result.userCompany = record._fields[0].properties.userCompany;
                                result.userType = record._fields[0].properties.userType;
                                result.userGroup = record._fields[0].properties.userGroup;
                                result.emailaddress = record._fields[0].properties.emailaddress;
                                result.crudPermissions = {
                                    "p_ng_c" : record._fields[0].properties.p_ng_c,
                                    "p_ng_r" : record._fields[0].properties.p_ng_r,
                                    "p_ng_u" : record._fields[0].properties.p_ng_u,
                                    "p_ng_d" : record._fields[0].properties.p_ng_d,
                                    "p_ne_c" : record._fields[0].properties.p_ne_c,
                                    "p_ne_r" : record._fields[0].properties.p_ne_r,
                                    "p_ne_u" : record._fields[0].properties.p_ne_u,
                                    "p_ne_d" : record._fields[0].properties.p_ne_d,
                                    "p_nr_c" : record._fields[0].properties.p_nr_c,
                                    "p_nr_r" : record._fields[0].properties.p_nr_r,
                                    "p_nr_u" : record._fields[0].properties.p_nr_u,
                                    "p_nr_d" : record._fields[0].properties.p_nr_d
                                };
                                result.userId = record._fields[0].identity.low;
                            }
                            else{
                                result.msg = "Your password is wrong!";
                                result.token = '';
                            }
                        }
                    }
                });
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        })
        .catch(function(error) {
            console.log(error);
        });

};

exports.forgotpassword = function(req, res, next) {
    //check user exist on the neo4j db
    var username = req.body.username;
    var error = '';
    var result = {'msg':'It is not our account! Please input the correct email address.','token':'','userCompany':'','userType':''};
    var query;
    query = ["match (n:USERS) where n.emailaddress = '"+username+"' return n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;

            if(length > 0){
                var randStr = randomstring.generate(104);
                var fullUrl = req.protocol + '://' + req.get('host') + "/#/resetpwd?token="+randStr;

                results.records.forEach(function(record) {

                    var user_id = record._fields[0].identity.low;

                    var uquery = ["START n=node(" + user_id + ") SET n.pwdtoken='" + randStr + "' return n"].join('\n');

                    session
                        .run(uquery)
                        .then(function(results){
                            var text =  "Hello!\n\n";
                            text += "Right now, You were request the reset password.\n\n";
                            text += "Please click on the below link and reset your password.\n\n\n\n";
                            text += fullUrl + "\n\n\n";
                            text += "Thanks & Regards, \n";
                            text += "The Visualynk Team";

                            transporter.sendMail({
                                from : "admin@visualynk.com",
                                to : username,
                                subject : "Reset Your Password!",
                                text : text
                            },function(error, response){
                                if(error){
                                    result.msg = "failed";
                                    error = error;

                                    res.json({
                                        responseData: result,
                                        error: error
                                    });
                                }
                                else{
                                    result.msg = "success";

                                    res.json({
                                        responseData: result,
                                        error: error
                                    });
                                }
                            });
                            session.close();
                        })
                        .catch(function(error) {
                            result.msg = "failed";
                            error = error;
                            console.log(error);

                            res.json({
                                responseData: result,
                                error: error
                            });
                        });
                });
            } else {
                res.json({
                    responseData: result,
                    error: error
                });
            }
            session.close();
        })
        .catch(function(error) {
            console.log(error);
        });

};

exports.checkresetpwdtoken = function(req, res, next) {
    //check user exist on the neo4j db
    var token = req.body.token;
    var error = '';
    var result = {'msg':'Invalid token!','token':'','userCompany':'','userType':''};
    var query;
    query = ["match (n:USERS) where n.pwdtoken = '"+token+"' return n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;

            if(length > 0){

                result.msg = "success";

                res.json({
                    responseData: result,
                    error: error
                });
            } else {
                res.json({
                    responseData: result,
                    error: error
                });
            }
            session.close();
        })
        .catch(function(error) {
            console.log(error);
        });

};

exports.resetpassword = function(req, res, next) {
    //check user exist on the neo4j db
    var token = req.body.token;
    var pwd = req.body.new_pwd;
    var error = '';
    var result = {'msg':'Invalid token!','token':'','userCompany':'','userType':''};
    var query;
    query = ["MATCH (n:USERS {pwdtoken:'"+token+"'}) SET n.password='"+encrypt(pwd)+"', n.pwdtoken='' return n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;

            if(length > 0){

                result.msg = "success";

                res.json({
                    responseData: result,
                    error: error
                });
            } else {
                res.json({
                    responseData: result,
                    error: error
                });
            }
            session.close();
        })
        .catch(function(error) {
            console.log(error);
        });

};


var cnt = 0;
exports.getQueryResult = function(req, res){
    var url = "http://localhost:7474/db/data/transaction/commit";
    //console.log(util.inspect(req.body, {showHidden: false, depth: null}));
    //console.log(req.body);
    request({
        url: url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
            authorization: 'Basic bmVvNGo6VG9vM3V0aDc=',
            accept: 'application/json; charset=UTF-8'
        },
        body: req.body
    }, function(err, resp, body) {
        /*console.log(util.inspect(resp, {showHidden: false, depth: null}));*/

        if (!err && resp.statusCode == 200) {
            res.json(body);
        }

    });
};
exports.getPlanDan = function(req,res,next){
    var name = req.body.name;
    console.log("getting the planDan according to " + name + "...");

    var error = '';
    var result = {'msg':'empty'};
        var query = ["MATCH (FM:Facility_Management {name:'" + name + "'})-[INCLUDES_DATESET]->(n) RETURN n, labels(n)"].join('\n');
        session
            .run(query)
            .then(function(results){
                var records = results.records;
                var length = records.length;
                if(length > 0){
                    error = null;
                    result.msg = results;
                }
                res.json({
                    responseData: result,
                    error: error
                });
                session.close();
            });
}
/* FILTERS*/
exports.systemfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:SYSTEM) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.attributefilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:ATTRIBUTE) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.companyfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:COMPANY) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.facilityfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:FACILITY) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.floorfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:FLOOR) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.zonefilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:ZONE) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.spacefilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:SPACE) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.assetfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:ASSET) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.componentfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:COMPONENT) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.assemblyfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:ASSEMBLY) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.connectionfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:CONNECTION) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.sparefilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:SPARE) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.resourcefilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:RESOURCE) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.jobfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:JOB) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.sevicereqfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:SERVICE_REQUEST) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.docfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:DOCUMENT) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.personfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:PERSON) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
    /**/
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

// checkIfAdmin function is assinged in server.js
exports.getCompanies = function(req, res, next) {
    var retValue = '';
    var companies = {};
      var query = ["match (n:COMPANIES) return n,id(n) as id"].join('\n');
      session
          .run(query)
          .then(function(results) {
              res.json({
                  companies: results.records,
                  error: ''
              });
              session.close();
          })
};

exports.getCompany = function(req, res) {
    var company_id = req.body.company_id;

    var query = ["START n=node("+company_id+") return n"].join('\n');

    session
        .run(query)
        .then(function(results) {
            res.json({
                company: results.records,
                error: ''
            });
            session.close();
        })
};
exports.addCompany = function (req, res) {
    //JSON. stringify is only available in mordern browers.....
    console.log("Add Company called");
    var companyname = req.body.companyname;
    var description = req.body.description;
    var departments = req.body.departments;
    var role = req.body.role;
    var email = req.body.email;
    var phone = req.body.phone;
    var street = req.body.street;
    var postalbox = req.body.postalbox;
    var zipcode = req.body.zipcode;
    var citytown = req.body.citytown;
    var state = req.body.state;
    var country = req.body.country;
    var works_for = req.body.works_for;

    var error = '';
    var result = {};

    console.log("message : add company data... ");
    /* check username duplication check */

    var query;
    var query = "CREATE (n:COMPANIES {companyname:'"+companyname+"',description:'"+description+"',departments:'"+departments+"',role:'"+role+"',email:'"+email+"',phone:'"+phone+"', street:'"+street+"', postalbox:'"+postalbox+"', zipcode:'"+zipcode+"', citytown:'"+citytown+"', state:'"+state+"', country:'"+country+"', works_for:'"+works_for+"'}) return n";

    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            console.log("RESULT : " + result.msg);
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
};
exports.updateCompany = function (req, res) {
    //JSON. stringify is only available in mordern browers.....
    console.log("Update Company called");
    var companyname = req.body.companyname;
    var description = req.body.description;
    var departments = req.body.departments;
    var role = req.body.role;
    var email = req.body.email;
    var phone = req.body.phone;
    var street = req.body.street;
    var postalbox = req.body.postalbox;
    var zipcode = req.body.zipcode;
    var citytown = req.body.citytown;
    var state = req.body.state;
    var country = req.body.country;
    var works_for = req.body.works_for;
    var company_id = req.body.company_id;

    var error = '';
    var result = {};

    var query;
    var query = "START n=node("+company_id+") SET n.companyname='"+companyname+"',n.description='"+description+"',n.departments='"+departments+"',n.role='"+role+"',n.email='"+email+"',n.phone='"+phone+"', n.street='"+street+"', n.postalbox='"+postalbox+"', n.zipcode='"+zipcode+"', n.citytown='"+citytown+"', n.state='"+state+"', n.country='"+country+"', n.works_for='"+works_for+"' return n";

    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            console.log("RESULT : " + result.msg);
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
};
exports.deleteCompany = function (req, res) {
    //JSON. stringify is only available in mordern browers.....
    console.log("Delete Company called");
    var company_id = req.body.company_id;

    var error = '';
    var result = {};

    var query;
    var query = "START n=node("+company_id+") DELETE n";

    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            console.log("RESULT : " + result.msg);
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
};

exports.getUsers = function(req, res, next) {
    var retValue = '';
    var companies = {};

    var query = ["match (n:USERS) return n,id(n) as id"].join('\n');

    var users = [];
    session
        .run(query)
        .then(function(results) {
            users.users = results.records;
            res.json({
                users: results.records,
                error: ''
            });
            session.close();
        })

};
exports.getProjects = function (req, res, next){
    var token = req.body.token;
    console.log("getting projects and users..");
    console.log(token);
    var url = "http://" + bimConf.domain + ":" + bimConf.port + "/json";
    var error = '';
    var result = {};
    if(typeof token != "undefined"){
        
    }
    else{
        
    }
}
exports.getUser = function(req, res) {
    var user_id = req.body.user_id;
    var result = {'msg':'You are invalid user!','token':'','userCompany':'','userType':''};

    var query = ["START n=node("+user_id+") return n"].join('\n');

    session
        .run(query)
        .then(function(results) {
            try{
                results.records[0]._fields[0].properties.password = decrypt(results.records[0]._fields[0].properties.password);
            } catch (e){
                results.records[0]._fields[0].properties.password = results.records[0]._fields[0].properties.password;
            }

            res.json({
                user: results.records,
                error: ''
            });
            session.close();
        })
};
exports.register = function (req, res) {
    //JSON. stringify is only available in mordern browers.....
    console.log("CreateNode Called");
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var username = req.body.username;
    var password = encrypt(req.body.password);
    var userEmail = req.body.userEmail;
    var userCompany = req.body.userCompany;
    var userGroup = req.body.userGroup;

    var error = '';
    var result = {};

    console.log("message : user duplication checking... ");
    /* check username duplication check */

    var query;
    query = ["match (n:USERS) where n.username = '"+username+"' or n.emailaddress='"+userEmail+"' return n"].join('\n');

    session
        .run(query)
        .then(function(results){
            var pass = 0;
            console.log("message : get all nods status ");
            console.log("message : all nods results as below ");
            console.log("counts : " + results.records.length);
            /*console.log(util.inspect(results, {showHidden: false, depth: null}));*/
            var records = results.records;
            var length = records.length;
            if(length > 0){
                results.records.forEach(function(record) {
                    var user = record._fields[0].properties.username;
                    var emailaddress = record._fields[0].properties.emailaddress;

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
                })
            }
            else{
                pass = 1;
            }
            if(pass == 1){
                if(username == "admin")
                    var query = "CREATE (n:USERS {firstName:'"+firstName+"',lastName:'"+lastName+"',username:'"+username+"',password:'"+password+"',emailaddress:'"+userEmail+"',userCompany:'"+userCompany+"',userGroup:'"+userGroup+"', userType:'admin'}) return n";
                else
                    var query = "CREATE (n:USERS {firstName:'"+firstName+"',lastName:'"+lastName+"',username:'"+username+"',password:'"+password+"',emailaddress:'"+userEmail+"',userCompany:'"+userCompany+"',userGroup:'"+userGroup+"', userType:'user'}) return n";

                var is_created = false;
                var created_user_id = "";
                session
                    .run(query)
                    .then(function(results){
                        result.msg = "success";
                        result.responseData = results.records;
                        console.log("RESULT : " + result.msg);
                        is_created = true;
                        created_user_id = results.records[0]._fields[0].identity.low;

                        if(userCompany != undefined) {
                            var rquery = "START u=node(" + created_user_id + "), c=node(" + userCompany + ") CREATE (u)-[r:WORKS_AT{username:u.username, companyname:c.companyname}]->(c) return r";
                            session
                                .run(rquery)
                                .then(function (results) {
                                    res.json(result);
                                })
                        } else
                            res.json(result);

                    });
            }
            else{
                console.log("RESULT : " + result.msg);
                res.json(result);
            }
            session.close();
        })
        .catch(function(error) {
            console.log(error);
        });



};

exports.registerbimserver = function (req , res){
    console.log("Create Bim server Account Api Called");
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var username = req.body.username;
    var password = encrypt(req.body.password);
    var userEmail = req.body.userEmail;
    var userCompany = req.body.userCompany;
    var userGroup = req.body.userGroup;
    var userBimType = req.body.userBimType;
    console.log(userBimType);
    var error = '';
    var result = {};
    
    var url = "http://" + bimConf.domain + ":" + bimConf.port + "/json";
    request({
        url: url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
            authorization: 'Basic bmVvNGo6VG9vM3V0aDc=',
            accept: 'application/json, text/javascript, */*; q=0.01',
            "User-Agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:53.0) Gecko/20100101 Firefox/53.0"
        },
        body: {
            //"token" : "8553eeef4e52b7fad2b30b8b3dcb93abecd5b1a59b9e12183d948dbf7e964f5926c75cb9bb9d318b61cb193b842d2dba",
            "request" : {
                "interface" : "ServiceInterface",
                "method" : "addUserWithPassword",
                "parameters":{
                    username : userEmail,
                    password : req.body.password, 
                    name : username,
                    type : 'USER',
                    selfRegistration : true,
                    resetUrl : ""
                }
            }
        }
    }, function(err, resp, body) {
        console.log("response from bim server");
        console.log(err);
        error = err;
        
        if (!err && resp.statusCode == 200) {
            result.response = body;
            result.msg = 'success';
            //console.log(util.inspect(body, {showHidden: false, depth: null}));
        }
        else{
            result.response = error;
            result.msg = 'error';
        }
        res.json(result);
    });
}
exports.getUserByUserName = function (req, res){
    var username = req.body.username;
    var bimToken = req.body.token;

    console.log('bim request username => ' + username);
    console.log('bim request token => ' + bimToken);
    var url = "http://" + bimConf.domain + ":" + bimConf.port + "/json";
    var error = '';
    var result = {};
    request({
        url: url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
            accept: 'application/json, text/javascript, */*; q=0.01'
        },
        body: {
            "token" : bimToken,            
            "request" : {
                "interface" : "ServiceInterface",
                "method" : "getUserByUserName",
                "parameters":{
                    username : username
                }
            }
        }
    }, function(err, resp, body) {
        console.log("getting User by name from BIM Server...");
        console.log(err);
        error = err;
        
        if (!err && resp.statusCode == 200) {
            result.response = body;
            result.msg = 'success';
        }
        else{
            result.response = error;
            result.msg = 'error';
        }
        res.json(result);
    });
}
exports.deleteUserbyOid = function (req , res){
    var oid = req.body.oid;
    var token = req.body.token;
    var url = "http://" + bimConf.domain + ":" + bimConf.port + "/json";
    var error = '';
    var result = {};
    if(typeof token != "undefined"){
        request({
            url: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                accept: 'application/json, text/javascript, */*; q=0.01'
            },
            body: {     
                "token" : token,
                "request" : {
                    "interface" : "ServiceInterface",
                    "method" : "deleteUser",
                    "parameters":{
                        "uoid": oid
                    }
                }
            }
        }, function(err, resp, body) {
            console.log("deleting the User from the Bim Server");
            console.log(err);
            error = err;
            
            if (!err && resp.statusCode == 200) {
                result.token = body;
                result.msg = 'success';
            }
            else{
                result.token = error;
                result.msg = 'error';
            }
            res.json(result);
        });
    }
    else{
        result.msg = 'tokenerror';
        res.json(result);
    }
    
}
exports.getLoadBimToken = function (req , res){
    var bimAdminUser = bimConf.bimadmin;
    var bimAdminPass = bimConf.bimpass;
    var url = "http://" + bimConf.domain + ":" + bimConf.port + "/json";
    var error = '';
    var result = {};
    request({
        url: url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
            accept: 'application/json, text/javascript, */*; q=0.01'
        },
        body: {          
            "request" : {
                "interface" : "AuthInterface",
                "method" : "login",
                "parameters":{
                    "username": bimAdminUser,
                    "password": bimAdminPass
                }
            }
        }
    }, function(err, resp, body) {
        console.log("getting admin token from BIM Server...");
        console.log(err);
        error = err;
        
        if (!err && resp.statusCode == 200) {
            result.token = body;
            result.msg = 'success';
        }
        else{
            result.token = error;
            result.msg = 'error';
        }
        res.json(result);
    });
}
exports.getLoadBimProject_Users = function(req, res){
    var token = req.body.token;
    console.log("getting projects and users..");
    console.log(token);
    var url = "http://" + bimConf.domain + ":" + bimConf.port + "/json";
    var error = '';
    var result = {};
    if(typeof token != "undefined"){
        request({
            url: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                accept: 'application/json, text/javascript, */*; q=0.01'
            },
            body: {     
                "token" : token,
                "request" : {
                    "interface" : "ServiceInterface",
                    "method" : "getAllProjects",
                    "parameters":{
                        "onlyTopLevel": "false",
                        "onlyActive": "false"
                    }
                }
            }
        }, function(err, resp, body) {
            error = err;
            var all_projects = body.response.result;
            var active_projects = [];
            if(typeof all_projects  != "undefined"){
                all_projects.forEach(function (project) {
                    var state = project.state;
                    if(state == "ACTIVE") active_projects.push(project);
                })
                result.projects = active_projects;
            }
            
            if (!err && resp.statusCode == 200) {
                //get all projects small
                request({
                    url: url,
                    method: "POST",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        accept: 'application/json, text/javascript, */*; q=0.01'
                    },
                    body: {     
                        "token" : token,
                        "request" : {
                            "interface" : "ServiceInterface",
                            "method" : "getAllProjectsSmall",
                            "parameters":{
                            }
                        }
                    }
                }, function(err, resp, body) {
                    error = err;
                    var small_projects = body.response.result;
                    var active_small_projects = [];
                    if(typeof small_projects  != "undefined"){
                        small_projects.forEach(function (project) {
                            var state = project.state;
                            if(state == "ACTIVE") active_small_projects.push(project);
                        })
                        result.smallprojects = small_projects;
                    }
                    
                    if (!err && resp.statusCode == 200) {
                        //get all users
                        request({
                            url: url,
                            method: "POST",
                            json: true,
                            headers: {
                                "content-type": "application/json",
                                accept: 'application/json, text/javascript, */*; q=0.01'
                            },
                            body: {     
                                "token" : token,
                                "request" : {
                                    "interface" : "ServiceInterface",
                                    "method" : "getAllUsers",
                                    "parameters":{
                                    }
                                }
                            }
                        }, function(err, resp, body) {
                            console.log("get all users from BIM server");
                            console.log(err);
                            
                            if (!err && resp.statusCode == 200) {
                                var active_users = [];
                                var users = body.response.result;
                                if(typeof users  != "undefined"){
                                    users.forEach(function (user) {
                                        var state = user.state;
                                        if(state == "ACTIVE") active_users.push(user);
                                    })
                                    result.users = active_users;
                                    result.msg = 'success';
                                }
                            }
                            else{
                                result.users = error;
                                result.msg = 'error';
                            }
                            res.json(result);
                        });
                        
                    }
                    else{
                        result.projects = error;
                        result.msg = 'error';
                        res.json(result);
                    }
                    
                });
                
            }
            else{
                result.projects = error;
                result.msg = 'error';
                res.json(result);
            }
            
        });
    }
    else{
        result.msg = 'tokenerror';
        res.json(result);
    }
}

exports.addUserToProjectBim = function(req, res){
    var poid = req.body.poid;
    var uoid = req.body.uoid;
    var token = req.body.token;
    var url = "http://" + bimConf.domain + ":" + bimConf.port + "/json";
    var error = '';
    var result = {};
    if(typeof token != "undefined"){
        request({
            url: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                accept: 'application/json, text/javascript, */*; q=0.01'
            },
            body: {     
                "token" : token,
                "request" : {
                    "interface" : "ServiceInterface",
                    "method" : "addUserToProject",
                    "parameters":{
                        "uoid": uoid,
                        "poid": poid
                    }
                }
            }
        }, function(err, resp, body) {
            console.log("add user " +uoid+ " to project :" + poid);
            console.log(err);
            error = err;
            
            if (!err && resp.statusCode == 200) {
                result.result = body;
                result.msg = 'success';
            }
            else{
                result.result = error;
                result.msg = 'error';
            }
            res.json(result);
        });
    }
    else{
        result.msg = 'tokenerror';
        res.json(result);
    }
    
}
exports.removeUserFromProject = function ( req , res ){
    var poid = req.body.poid;
    var uoid = req.body.uoid;
    var token = req.body.token;
    var url = "http://" + bimConf.domain + ":" + bimConf.port + "/json";
    var error = '';
    var result = {};
    if(typeof token != "undefined"){
        request({
            url: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                accept: 'application/json, text/javascript, */*; q=0.01'
            },
            body: {     
                "token" : token,
                "request" : {
                    "interface" : "ServiceInterface",
                    "method" : "removeUserFromProject",
                    "parameters":{
                        "uoid": uoid,
                        "poid": poid
                    }
                }
            }
        }, function(err, resp, body) {
            console.log("remove user " +uoid+ " from project :" + poid);
            console.log(err);
            error = err;
            
            if (!err && resp.statusCode == 200) {
                result.result = body;
                result.msg = 'success';
            }
            else{
                result.result = error;
                result.msg = 'error';
            }
            res.json(result);
        });
    }
    else{
        result.msg = 'tokenerror';
        res.json(result);
    }
    
}
exports.addProjectBim = function(req , res){
    var token = req.body.token;
    var project_name = req.body.name;
    var url = "http://" + bimConf.domain + ":" + bimConf.port + "/json";
    var error = '';
    var result = {};
    if(typeof token != "undefined"){
        request({
            url: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                accept: 'application/json, text/javascript, */*; q=0.01'
            },
            body: {     
                "token" : token,
                "request" : {
                    "interface" : "ServiceInterface",
                    "method" : "addProject",
                    "parameters":{
                        "projectName": project_name,
                        "schema": 'ifc2x3tc1'
                    }
                }
            }
        }, function(err, resp, body) {
            console.log("adding project ");
            console.log(err);
            error = err;
            
            if (!err && resp.statusCode == 200) {
                result.result = body;
                result.msg = 'success';
            }
            else{
                result.result = error;
                result.msg = 'error';
            }
            res.json(result);
        });
    }
    else{
        result.msg = 'tokenerror';
        res.json(result);
    }
}
exports.getSuggestedDeserializerForExtension = function ( req , res ){
    var token = req.body.token;
    var extension = req.body.extension;
    var poid = req.body.poid;
    var url = "http://" + bimConf.domain + ":" + bimConf.port + "/json";
    var error = '';
    var result = {};
    if(typeof token != "undefined"){
        request({
            url: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                accept: 'application/json, text/javascript, */*; q=0.01'
            },
            body: {     
                "token" : token,
                "request" : {
                    "interface" : "ServiceInterface",
                    "method" : "getSuggestedDeserializerForExtension",
                    "parameters":{
                        "extension": extension,
                        "poid" : poid
                    }
                }
            }
        }, function(err, resp, body) {
            console.log("adding project ");
            console.log(err);
            error = err;
            
            if (!err && resp.statusCode == 200) {
                result.result = body;
                result.msg = 'success';
            }
            else{
                result.result = error;
                result.msg = 'error';
            }
            res.json(result);
        });
    }
    else{
        result.msg = 'tokenerror';
        res.json(result);
    }
}
exports.addSubProjectBim = function(req, res){
    var token = req.body.token;
    var project_name = req.body.name;
    var project_ppoid = req.body.ppoid;
    var url = "http://" + bimConf.domain + ":" + bimConf.port + "/json";
    var error = '';
    var result = {};
    if(typeof token != "undefined"){
        request({
            url: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                accept: 'application/json, text/javascript, */*; q=0.01'
            },
            body: {     
                "token" : token,
                "request" : {
                    "interface" : "ServiceInterface",
                    "method" : "addProjectAsSubProject",
                    "parameters":{
                        "projectName": project_name,
                        "parentPoid" : project_ppoid,
                        "schema": 'ifc2x3tc1'
                    }
                }
            }
        }, function(err, resp, body) {
            console.log("adding project ");
            console.log(err);
            error = err;
            
            if (!err && resp.statusCode == 200) {
                result.result = body;
                result.msg = 'success';
            }
            else{
                result.result = error;
                result.msg = 'error';
            }
            res.json(result);
        });
    }
    else{
        result.msg = 'tokenerror';
        res.json(result);
    }
}
exports.getAllDeserializersForProject = function (req,res){
    var token = req.body.token;
    var poid = req.body.poid;
    var url = "http://" + bimConf.domain + ":" + bimConf.port + "/json";
    var error = '';
    var result = {};
    if(typeof token != "undefined"){
        request({
            url: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                accept: 'application/json, text/javascript, */*; q=0.01'
            },
            body: {     
                "token" : token,
                "request" : {
                    "interface" : "PluginInterface",
                    "method" : "getAllDeserializersForProject",
                    "parameters":{
                        "onlyEnabled": true,
                        "poid" : poid
                    }
                }
            }
        }, function(err, resp, body) {
            console.log("adding project ");
            console.log(err);
            error = err;
            
            if (!err && resp.statusCode == 200) {
                result.result = body;
                result.msg = 'success';
            }
            else{
                result.result = error;
                result.msg = 'error';
            }
            res.json(result);
        });
    }
    else{
        result.msg = 'tokenerror';
        res.json(result);
    }
}
exports.uploadifc = function(req, res){
    var token = req.body.token;
    var ext = req.body.ext;
    var poid = req.body.poid;
    var doid = req.body.oid;
    var comment = req.body.comment;
    var file = req.files.file;
    console.log(util.inspect(file, {showHidden: false, depth: null}))
    console.log("token => " + token);
    console.log("ext => " + ext);
    console.log("poid => " + poid);
    console.log("doid => " + doid);
    var url = "http://" + bimConf.domain + ":" + bimConf.port + "/json";
    var uploadApiUrl = "http://" + bimConf.domain + ":" + bimConf.port + "/upload";
    var error = '';
    var result = {};
    //initiate check in api calling
    if(typeof token != "undefined"){
        request({
            url: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                accept: 'application/json, text/javascript, */*; q=0.01'
            },
            body: {     
                "token" : token,
                "request" : {
                    "interface" : "ServiceInterface",
                    "method" : "initiateCheckin",
                    "parameters":{
                        "deserializerOid": doid,
                        "poid" : poid
                    }
                }
            }
        }, function(err, resp, body) {
            console.log("initial check in");
            console.log(err);
            error = err;
            
            if (!err && resp.statusCode == 200) {
                // result.result = body;
                // result.msg = 'success';
                var topid = body.response.result;
                var endpoint = parseInt(topid, 10) - 9;
                console.log("top id => " + topid);
                //register Progress Handler
                request({
                    url: url,
                    method: "POST",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        accept: 'application/json, text/javascript, */*; q=0.01'
                    },
                    body: {     
                        "token" : token,
                        "request" : {
                            "interface" : "NotificationRegistryInterface",
                            "method" : "registerProgressHandler",
                            "parameters":{
                                "endPointId": endpoint,
                                "topicId" : topid
                            }
                        }
                    }
                }, function(err, resp, body) {
                    console.log("Register Handler ");
                    console.log(err);
                    error = err;
                    
                    if (!err && resp.statusCode == 200) {
                        result.result = body;
                        result.msg = 'success';
                        
                        var formData = {
                            token : token,
                            deserializerOid : doid,
                            comment : comment,
                            poid : poid,
                            topicId : topid,
                            file: file.name
                        }
                        //call upload api 
                        request({
                            url: uploadApiUrl,
                            method: "POST",
                            formData : formData,
                            json: true,
                            headers: {
                                "content-type": "application/json",
                                accept: 'application/json, text/javascript, */*; q=0.01'
                            }
                        }, function(err, resp, body) {
                            console.log("Uploading IFC file");
                            console.log(err);
                            error = err;
                            
                            if (!err && resp.statusCode == 200) {
                                result.result = body;
                                result.msg = 'success';
                                
                                //get Progress
                                request({
                                    url: url,
                                    method: "POST",
                                    json: true,
                                    headers: {
                                        "content-type": "application/json",
                                        accept: 'application/json, text/javascript, */*; q=0.01'
                                    },
                                    body: {     
                                        "token" : token,
                                        "request" : {
                                            "interface" : "NotificationRegistryInterface",
                                            "method" : "getProgress",
                                            "parameters":{
                                                "topicId" : topid
                                            }
                                        }
                                    }
                                }, function(err, resp, body) {
                                    console.log("Uploading IFC file");
                                    console.log(err);
                                    error = err;
                                    if (!err && resp.statusCode == 200) {
                                        result.result = body;
                                        result.msg = 'success';
                                    }
                                    else{
                                        result.result = error;
                                        result.msg = 'error';
                                    }
                                    res.json(result);
                                });
                                
                                /////////////////////
                                
                            }
                            else{
                                result.result = error;
                                result.msg = 'error';
                            }
                            //res.json(result);
                        });
                        /////////////////////
                        
                    }
                    else{
                        result.result = error;
                        result.msg = 'error';
                    }
                    
                });
                ///////////////////////////
            }
            else{
                result.result = error;
                result.msg = 'error';
            }
            //res.json(result);
        });
    }
    else{
        result.msg = 'tokenerror';
        res.json(result);
    }
}
exports.ifccheckin = function(req, res){
    var token = req.body.token;
    var poid = req.body.poid;
    var ext = req.body.ext;
    var deserializerOid = req.body.oid;
    var comment = req.body.comment;
    var file = req.files.file;

    var filename = file.name;
    var filesize = 50000000;
    //upload ifc file to server
    var filepath = filename;
    var milliseconds = new Date().getTime();
    var encoded_file_data = '';
    filepath = milliseconds;
    if (!fs.existsSync("./uploads")){
        fs.mkdirSync("./uploads");
    }
    upload(req,res,function(err){
        if(err){
            res.json({error_code:1,err_desc:err});
            return;
        }

        fs.readFile(file.path, function(err, data) {
            var fext = path.extname(file.originalFilename);
            var newPath = "./uploads/" + filepath + fext;
            var newfilename = filepath + fext;
            var file_name = filepath + fext;

            var fileReader = new FileReader();
                fileReader.readAsDataURL(file);
                fileReader.on('load', function (event) {
                    console.log("dataUrlSize:", event.target.result.length);
                    var data = event.target.result;
					var encoded = data.substr(data.indexOf(",") + 1);
                    encoded_file_data = encoded;
                    console.log(encoded_file_data.substr(0,10));
                    var url = "http://" + bimConf.domain + ":" + bimConf.port + "/json";
                    var error = '';
                    var result = {};
                    if(typeof token != "undefined"){
                        console.log('poid => '+ poid);
                        console.log('comment => '+ comment);
                        console.log('deserializerOid => '+ deserializerOid);
                        console.log('fileSize => '+ filesize);
                        console.log('fileName => '+ filename);
                        var log_file = fs.createWriteStream('./uploads/debug.log',{flags:'w'});
                        log_file.write(encoded_file_data);
                        request({
                            url: url,
                            method: "POST",
                            json: true,
                            headers: {
                                "content-type": "application/json",
                                accept: 'application/json, text/javascript, */*; q=0.01'
                            },
                            body: {     
                                "token" : token,
                                "request" : {
                                    "interface" : "ServiceInterface",
                                    "method" : "checkin",
                                    "parameters":{
                                        'poid': poid,
                                        'comment':comment,
                                        'deserializerOid': deserializerOid,
                                        'fileSize' : filesize,
                                        'fileName': filename,
                                        'data':encoded_file_data,
                                        'merge': false,
                                        'sync': false
                                    }
                                }
                            }
                        }, function(err, resp, body) {
                            console.log("uploading ifc file");
                            console.log(err);
                            error = err;
                            
                            if (!err && resp.statusCode == 200) {
                                result.result = body;
                                result.msg = 'success';
                            }
                            else{
                                result.result = error;
                                result.msg = 'error';
                            }
                            res.json(result);
                        });
                    }
                    else{
                        result.msg = 'tokenerror';
                        res.json(result);
                    }
                });

        });
    })
    
    
}

exports.getProgressOnProject = function(req , res){
    var token = req.body.token;
    var poid = req.body.poid;
    var url = "http://" + bimConf.domain + ":" + bimConf.port + "/json";
    var error = '';
    var result = {};
    if(typeof token != "undefined"){
        request({
            url: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                accept: 'application/json, text/javascript, */*; q=0.01'
            },
            body: {     
                "token" : token,
                "request" : {
                    "interface" : "NotificationRegistryInterface",
                    "method" : "getProgressTopicsOnProject",
                    "parameters":{
                        "poid": poid
                    }
                }
            }
        }, function(err, resp, body) {
            console.log(err);
            error = err;
            
            if (!err && resp.statusCode == 200) {
                // result.result = body;
                // result.msg = 'success';
                //

                var topids = body.response.result;
                var len = topids.length;
                var cnt = 0;
                var progress = [];
                console.log('len => ' + len);
                console.log('cnt => ' + cnt);
                topids.forEach(function(topid){
                    var id = topid;
                    request({
                        url: url,
                        method: "POST",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                            accept: 'application/json, text/javascript, */*; q=0.01'
                        },
                        body: {     
                            "token" : token,
                            "request" : {
                                "interface" : "NotificationRegistryInterface",
                                "method" : "getProgress",
                                "parameters":{
                                    "topicId": id
                                }
                            }
                        }
                    }, function(err, resp, body) {
                        console.log("getting progress...");
                        console.log(err);
                        error = err;
                        
                        if (!err && resp.statusCode == 200) {
                            //result.result = body;
                            progress.push(body);
                            console.log("result cnt => " + cnt);
                            if(cnt == len - 1){
                                result.result = progress;
                                result.msg = "success";
                                res.json(result);
                            }
                            cnt++;
                            //result.msg = 'success';
                        }
                        else{
                            result.result = error;
                            result.msg = 'error';
                            res.json(result);
                        }
                        
                        //res.json(result);
                    });
                    
                });
            }
            else{
                result.result = error;
                result.msg = 'error';
                res.json(result);
            }
            //res.json(result);
        });
    }
    else{
        result.msg = 'tokenerror';
        res.json(result);
    }
}
exports.deleteProjectBim = function ( req , res){
    var token = req.body.token;
    var poid = req.body.poid;
    var url = "http://" + bimConf.domain + ":" + bimConf.port + "/json";
    var error = '';
    var result = {};
    if(typeof token != "undefined"){
        request({
            url: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                accept: 'application/json, text/javascript, */*; q=0.01'
            },
            body: {     
                "token" : token,
                "request" : {
                    "interface" : "ServiceInterface",
                    "method" : "deleteProject",
                    "parameters":{
                        "poid": poid
                    }
                }
            }
        }, function(err, resp, body) {
            console.log("adding project ");
            console.log(err);
            error = err;
            
            if (!err && resp.statusCode == 200) {
                result.result = body;
                result.msg = 'success';
            }
            else{
                result.result = error;
                result.msg = 'error';
            }
            res.json(result);
        });
    }
    else{
        result.msg = 'tokenerror';
        res.json(result);
    }
}
exports.getEntityByGUID = function(req,res){
    var guid = req.body.guid;
    
    var query;
    query = ["match (n) where n.guid = '"+guid+"' return n"].join('\n');
    console.log(query);
      session
          .run(query)
          .then(function(results) {
              res.json({
                  node: results.records,
                  error: ''
              });
              session.close();
          })
}
exports.getAllRelationsByGUIDs = function(req, res){

    var result = {'msg':'', 'data':[]};
    var error = '';
    // var query = ['match (n:NODEGROUPS) where n.gType = "1" AND n.is_full_show = true return n'].join('\n');
    // session
    //         .run(query)
    //         .then(function (results) {
    //             var records = results.records;
    //             result.msg = "success";
    //             result.data = records;
    //             res.json({
    //                 responseData: result,
    //                 error: error
    //             });
    //             session.close()
    //         })
            
    var guids = req.body.guids;
    var arr_guids = guids.split(",");
    var token = req.body.token;
    var where = "";
    arr_guids.forEach(function(guid){
        where += 'n.guid = "'+ guid +'" OR ';
    });
    where = where.slice(0, -4);
    var query;
    
    query = ["match (n) where "+where+" return n"].join('\n');
    
      session
          .run(query)
          .then(function(results) {
              var datas = results.records;
              var rltdatas = [];
              var kflag = 0;
              //console.log(datas.length);
              var data_length = datas.length;
              var relation_query = [];
              if(data_length > 1){
                    for( var i = 0; i < data_length ; i++){

                        for (var k = i + 1; k < data_length; k++){
                            //   console.log('first item => ' + datas[i]._fields[0].identity.low);
                            //   console.log('second item => ' + datas[k]._fields[0].identity.low);
                            relation_query.push("START n=node("+datas[i]._fields[0].identity.low+"),m=node("+datas[k]._fields[0].identity.low+") MATCH (n)-[r]-(m) return startnode(r) as starter, endnode(r) as ender, type(r) as relationName, id(r) as relationID");
                        }
                    }
                    var retPos = 0;
                    for(var i=0; i<relation_query.length; i++) {
                        console.log(i);
                        session
                            .run(relation_query[i])
                            .then(function (results) {
                                result.msg = "success";
                                if(results.records.length > 0)
                                result.data.push(results.records);
                                retPos++;
                                console.log(results.records);
                                console.log("i : " + i);
                                console.log("length : " + relation_query.length);
                                console.log('return Pos : ' + retPos);
                                if(retPos == relation_query.length){
                                    res.json(result);
                                }
                            })
                            .catch(function (error) {
                                console.log(error);
                                result.msg = "error";
                                result.data = error;
                                res.json(result);
                            });
                    }
              }
              else{
                    result.msg = "empty";
                    result.data = "";
                    res.json(result);
              }
              
          })
}
exports.updateUser = function (req, res) {
    //JSON. stringify is only available in mordern browers.....
    console.log("Update User called");
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var username = req.body.username;
    var password = encrypt(req.body.password);
    var userEmail = req.body.userEmail;
    var userCompany = req.body.userCompany;
    var userGroup = req.body.userGroup;

    if(userCompany == undefined)
        userCompany = 0;

    var user_id = req.body.user_id;

    var error = '';
    var result = {};

    var query;
    query = ["match (n:USERS) where (n.username = '"+username+"' or n.emailaddress='"+userEmail+"') and ID(n)<>"+user_id+"  return n"].join('\n');

    session
        .run(query)
        .then(function(results) {
            var pass = 0;

            var records = results.records;
            var length = records.length;
            if (length > 0) {
                results.records.forEach(function (record) {
                    var user = record._fields[0].properties.username;
                    var emailaddress = record._fields[0].properties.emailaddress;

                    if (user != undefined) {
                        if (user == username || emailaddress == userEmail) {/* user exist */
                            result.msg = "The User is already taken!";
                            result.responseData = null;
                        }
                        else {
                            result.msg = "PassUser";
                            result.responseData = null;
                            pass = 1;
                        }
                    }
                })

                res.json(result);
            }
            else {
                pass = 1;
            }

            if (pass == 1) {

                var query;
                var query = [
                    "START n=node(" + user_id + ") MATCH (n)-[r:WORKS_AT]->(x) DELETE r",
                    "START n=node(" + user_id + ") SET n.firstName='" + firstName + "',n.lastName='" + lastName + "',n.username='" + username + "',n.password='" + password + "',n.emailaddress='" + userEmail + "',n.userCompany='" + userCompany + "',n.userGroup='"+userGroup+"'",
                    "START u=node(" + user_id + "), c=node(" + userCompany + ") CREATE (u)-[r:WORKS_AT{username:u.username, companyname:c.companyname}]->(c) return r"
                ];

                for(var i=0; i<query.length; i++) {
                    console.log(i);
                    session
                        .run(query[i])
                        .then(function (results) {
                            result.msg = "success";
                            result.responseData = results.records;

                            if( results.records.length > 0) {
                                res.json(result);
                            }
                        })
                        .catch(function (error) {
                            console.log(error);
                            result.msg = "error";
                            result.responseData = error;
                            res.json(result);
                        });
                }

            }

            session.close();
        })
    };
exports.updateUserPermission = function (req, res) {
    //JSON. stringify is only available in mordern browers.....
    console.log("Update User Permission called");
    var permission_type = req.body.permission_type;
    var permission_value = req.body.permission_value;

    var user_id = req.body.user_id;

    var error = '';
    var result = {};

    var query;

        var query = "START n=node(" + user_id + ") SET n."+permission_type+"=" + permission_value;

    session
        .run(query)
        .then(function (results) {
            result.msg = "success";
            result.responseData = results.records;
            res.json(result);

            session.close();
        })
        .catch(function (error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
};
exports.deleteUser = function (req, res) {
    //JSON. stringify is only available in mordern browers.....
    console.log("Delete User called");
    var user_id = req.body.user_id;

    var error = '';
    var result = {};

    var query;
    var query = "START n=node("+user_id+") MATCH (n)-[r:WORKS_AT]->(x) DELETE r,n";

    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            console.log("RESULT : " + result.msg);
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
};

exports.updateUserGroupAssigns = function(req, res){
    var assigns = req.body.assigns;

    var error = '';
    var result = {};

    var query;
    var query = "MATCH (n:USERGROUPASSIGNS) DELETE n";

    session
        .run(query)
        .then(function(results){

            var squery = "CREATE (n:USERGROUPASSIGNS {assigns: '"+assigns+"'}) return n";
            session
                .run(squery)
                .then(function(results){

                    result.msg = "success";
                    result.responseData = results.records;
                    console.log("RESULT : " + result.msg);
                    res.json(result);

                    session.close();
                })
                .catch(function(error) {
                    console.log(error);
                    result.msg = "error";
                    result.responseData = error;
                    res.json(result);
                });

            session.close();
        })
        .catch(function(error) {
            console.log('delete error')
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
}
exports.getUserGroupAssigns = function(req, res){
    var assigns = req.body.assigns;

    var error = '';
    var result = {};

    var query;
    var query = "MATCH (n:USERGROUPASSIGNS) return n";

    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            console.log("RESULT : " + result.msg);
            res.json(result);

            session.close();

        })
        .catch(function(error) {
            console.log('delete error')
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
}
exports.getNeedApprovalAssigns = function(req, res){
    var assigns = req.body.assigns;

    var error = '';
    var result = {};

    var query;
    var query = "MATCH (n:NEEDAPPROVALASSIGNS) return n";

    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            res.json(result);

            session.close();

        })
        .catch(function(error) {
            console.log('delete error')
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
}
exports.updateNeedApprovalAssigns = function (req, res) {
    var assigns = req.body.assigns;

    var error = '';
    var result = {};

    var query = "MATCH (n:NEEDAPPROVALASSIGNS) DELETE n";

    session
        .run(query)
        .then(function(results){

            var squery = "CREATE (n:NEEDAPPROVALASSIGNS {assigns: '"+assigns+"'}) return n";
            session
                .run(squery)
                .then(function(results){
                    result.msg = "success";
                    result.responseData = results.records;

                    res.json(result);

                    session.close();
                })
                .catch(function(error) {
                    console.log(error);
                    result.msg = "error";
                    result.responseData = error;
                    res.json(result);
                });

            session.close();
        })
        .catch(function(error) {
            console.log('delete error')
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
}

exports.createNodeGroup = function(req, res){
    var companyId = req.body.companyId;
    var ngLabel = req.body.label;
    var ngIcon = req.body.link;
    var ngProperties = req.body.properties;
    var creatorGroup = req.body.creatorGroup;
    var parentGroup = req.body.parentGroup;
    var parentRoot = req.body.parentRoot;

    var error = '';
    var result = {};

    if(parentGroup != "")
        var query = "MERGE (ng:NODEGROUPS {name:'"+ngLabel+"', companyId:'"+companyId+"', icon:'"+ngIcon+"', properties:'"+ngProperties+"', creatorGroup:'"+creatorGroup+"', parentGroup:'"+parentGroup+"', parentRoot:'"+parentRoot+"', is_full_show:false, need_create_approval:true}) return ng";
    else
        var query = "MERGE (ng:NODEGROUPS {name:'"+ngLabel+"', companyId:'"+companyId+"', icon:'"+ngIcon+"', properties:'"+ngProperties+"', creatorGroup:'"+creatorGroup+"', parentRoot:'"+parentRoot+"', is_full_show:true}) return ng";

        var queries = [];
        queries.push(query);
    query = queries.join('\n');
    console.log(query);
    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });

    session.close();
}

exports.createRootGroup = function(req, res){
    var companyId = req.body.companyId;
    var ngLabel = req.body.label;
    var ngIcon = req.body.link;
    var creatorGroup = req.body.creatorGroup;
    var parentGroup = req.body.parentGroup;
    var gType = req.body.gType;
    var error = '';
    var result = {};

    if(parentGroup != "")
        var query = "MERGE (ng:NODEGROUPS {name:'"+ngLabel+"', companyId:'"+companyId+"', gType:'"+gType+"', icon:'"+ngIcon+"', creatorGroup:'"+creatorGroup+"', parentGroup:'"+parentGroup+"', is_full_show:false, need_create_approval:true}) return ng";
    else
        var query = "MERGE (ng:NODEGROUPS {name:'"+ngLabel+"', companyId:'"+companyId+"', gType:'"+gType+"', icon:'"+ngIcon+"', creatorGroup:'"+creatorGroup+"', is_full_show:true, need_create_approval:false}) return ng";

    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });

    session.close();
}
// 
exports.updateRootGroup = function(req, res){
    var companyId = req.body.companyId;
    var ngLabel = req.body.label;
    var ngOrgLabel = req.body.orgLabel;
    var ngIcon = req.body.link;
    var nodeId = req.body.nodeId;
    var parentGroup = req.body.parentGroup;
    var error = '';
    var result = {};

    console.log(ngLabel);
    if(parentGroup != "") {
        var aquery = ["START n=node(" + nodeId + ") SET n.name='" + ngLabel + "', n.icon='" + ngIcon + "', n.parentGroup = '" + parentGroup + "', n.is_full_show=false, n.need_update_approval=true", "WITH n MATCH (ng:" + ngOrgLabel + ") REMOVE ng:" + ngOrgLabel + " SET ng:" + ngLabel];
        aquery.push("WITH n MATCH (ng:"+ngLabel+")-[r]-(m:Visualynk) SET m.is_full_show=false RETURN n");
        var query = aquery.join('\n');
    }
    else {
        var aquery = ["START n=node(" + nodeId + ") SET n.name='" + ngLabel + "', n.icon='" + ngIcon + "', n.is_full_show=true, n.need_update_approval=false", "WITH n MATCH (ng:" + ngOrgLabel + ") REMOVE ng:" + ngOrgLabel + " SET ng:" + ngLabel];
        aquery.push("WITH n MATCH (ng:"+ngLabel+")-[r]-(m:Visualynk) SET m.is_full_show=false RETURN n");
        var query = aquery.join('\n');
    }
    
    console.log(query);
    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            res.json(result);
            console.log(aquery);
            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });

    session.close();
}
// Does not update the properties of all corresponding entties of the nodegroup
exports.updateNodeGroup = function(req, res){
    var companyId = req.body.companyId;
    var ngLabel = req.body.label;
    var ngOrgLabel = req.body.orgLabel;
    var ngIcon = req.body.link;
    var nodeId = req.body.nodeId;
    var ngProperties = req.body.properties;
    var parentGroup = req.body.parentGroup;
    var parentRoot = req.body.parentRoot;
    var error = '';
    var result = {};

    if(parentGroup != "") {
        var aquery = ["START n=node(" + nodeId + ") SET n.name='" + ngLabel + "', n.icon='" + ngIcon + "', n.properties='" + ngProperties + "', n.parentGroup = '" + parentGroup + "', n.parentRoot = '" + parentRoot + "', n.is_full_show=false, n.need_update_approval=true", "WITH n MATCH (ng:" + ngOrgLabel + ") REMOVE ng:" + ngOrgLabel + " SET ng:" + ngLabel];
        aquery.push("WITH n MATCH (ng:"+ngLabel+")-[r]-(m:Visualynk) SET m.is_full_show=false RETURN n");
        var query = aquery.join('\n');
    }
    else {
        var aquery = ["START n=node(" + nodeId + ") SET n.name='" + ngLabel + "', n.icon='" + ngIcon + "', n.properties='" + ngProperties + "', n.parentRoot = '" + parentRoot + "', n.is_full_show=true, n.need_update_approval=false", "WITH n MATCH (ng:" + ngOrgLabel + ") REMOVE ng:" + ngOrgLabel + " SET ng:" + ngLabel];
        aquery.push("WITH n MATCH (ng:"+ngLabel+")-[r]-(m:Visualynk) SET m.is_full_show=false RETURN n");
        var query = aquery.join('\n');
    }

    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            res.json(result);
            console.log(aquery);
            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });

    session.close();
}
exports.deleteNodeGroup = function (req, res) {
    var nodeId = req.body.nodeId;
    var label = req.body.ngLabel;
    var parentGroup = req.body.parentGroup;

    var error = '';
    var result = {};

    //var query = "MATCH (n:"+label+")-[r]-(m:Visualynk) delete r,n,m";
    var aquery = [];
    aquery.push("START ng=node(" + nodeId + ") SET ng.need_delete_approval = true, ng.is_full_show = false, ng.parentGroup='" + parentGroup + "' return ng");
    //aquery.push("WITH ng MATCH (n:"+label+")-[r]-(m:Visualynk) SET m.is_full_show=false return ng");
    var query = aquery.join('\n');
console.log(query)
    session
        .run(query)
        .then(function(results){

            /*var squery = "START n=node("+nodeId+") DELETE n";
            session
                .run(squery)
                .then(function(results){*/
                    result.msg = "success";
                    result.responseData = results.records;
                    res.json(result);
                    console.log(aquery);
                /*})
                .catch(function(error) {
                    console.log(error);
                    result.msg = "error";
                    result.responseData = error;
                    res.json(result);
                });*/

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });

}
exports.updateNGPendingApprovals = function (req, res) {
    var reqType = req.body.reqType;
    var parentGroup = req.body.parentGroup;
    var nodeId = req.body.nodeId;
    var ngLabel = req.body.ngLabel;

    var result = {'msg':''};
    var error = '';

    var query = "";

    if(reqType == "ng_create") {
        if(parentGroup == "")
            var query = "START n=node(" + nodeId + ") SET n.need_create_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' return n";
        else
            var query = "START n=node(" + nodeId + ") SET n.need_create_approval = true, n.is_full_show = false, n.parentGroup='" + parentGroup + "' return n";
    }
    else if(reqType == "ng_update") {
        if(parentGroup == "")
            var query = "START n=node(" + nodeId + ") SET n.need_update_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' return n";
        else
            var query = "START n=node(" + nodeId + ") SET n.need_update_approval = true, n.is_full_show = false, n.parentGroup='" + parentGroup + "' return n";
    }
    else if(reqType == "ng_delete"){
        if(parentGroup == "") {

            var dquery = "MATCH (n:" + ngLabel + ")-[r]-(m:Visualynk) delete r,n,m";

            session
                .run(dquery)
                .then(function (results) {

                    var squery = "START n=node(" + nodeId + ") DELETE n";
                    session
                        .run(squery)
                        .then(function (results) {
                            result.msg = "success";
                            result.responseData = results.records;
                            res.json(result);
                        })
                        .catch(function (error) {
                            console.log(error);
                            result.msg = "error";
                            result.responseData = error;
                            res.json(result);
                        });

                    session.close();
                })
                .catch(function (error) {
                    console.log(error);
                    result.msg = "error";
                    result.responseData = error;
                    res.json(result);
                });
        } else {
            var query = "START n=node(" + nodeId + ") SET n.need_delete_approval = true, n.is_full_show = false, n.parentGroup='" + parentGroup + "' return n";
        }
    }
    else if(reqType == "ne_create"){
        if(parentGroup == "") {
            var queries = [];
            queries.push("START n=node(" + nodeId + ") SET n.need_ne_create_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' ");
            queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=true return n");
            var query = queries.join('\n');
        }
        else {
            var queries = [];
            queries.push("START n=node(" + nodeId + ") SET n.need_ne_create_approval = true, n.is_full_show = false, n.parentGroup='" + parentGroup + "' ");
            queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=false return n")
            var query = queries.join('\n');
        }
    }
    else if(reqType == "ne_update"){
        if(parentGroup == "") {
            var queries = [];
            queries.push("START n=node(" + nodeId + ") SET n.need_ne_update_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' ");
            queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=true return n");
            var query = queries.join('\n');
        }
        else {
            var queries = [];
            queries.push("START n=node(" + nodeId + ") SET n.need_ne_update_approval = true, n.is_full_show = false, n.parentGroup='" + parentGroup + "' ");
            queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=false return n")
            var query = queries.join('\n');
        }
    } else if(reqType == "ne_delete"){
        if(parentGroup == ""){
            var query = "MATCH (n)-[r]-(m:Visualynk) where id(n)="+nodeId+" delete r,n,m";
            session
                .run(query)
                .then(function(results){
                    result.msg = "success";
                    result.responseData = results.records;
                    res.json(result);

                    session.close();
                })
                .catch(function(error) {
                    console.log(error);
                    result.msg = "error";
                    result.responseData = error;
                    res.json(result);
                });
        } else {
            var queries = [];
            queries.push("START n=node(" + nodeId + ") SET n.need_ne_delete_approval = true, n.is_full_show = false, n.parentGroup='" + parentGroup + "' ");
            queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=false return n")
            var query = queries.join('\n');
        }
    }


    if(query != "") {
        session
            .run(query)
            .then(function (results) {
                var records = results.records;
                result.msg = "success";
                result.responseData = records;
                res.json(result);
                session.close()
            })
            .catch(function (error) {
                console.log(error);
                result.msg = "error";
                result.responseData = error;
                res.json(result);
            });
    } else {
        result.msg = "error";
        result.responseData = "No approval types";
        res.json(result);
    }
}
exports.cancelNGPendingApprovals = function (req, res) {
    var reqType = req.body.reqType;
    var parentGroup = req.body.parentGroup;
    var nodeId = req.body.nodeId;
    var ngLabel = req.body.ngLabel;

    var result = {'msg':''};
    var error = '';

    var query = "";

    if(reqType == "ng_create") {
        var query = "START n=node(" + nodeId + ") DELETE n";
    }
    else if(reqType == "ng_update") {
        var query = "START n=node(" + nodeId + ") SET n.need_update_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' return n";
    }
    else if(reqType == "ng_delete"){
        var query = "START n=node(" + nodeId + ") SET n.need_delete_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' return n";
    }
    else if(reqType == "ne_create"){
/*
        var queries = [];
        queries.push("START n=node(" + nodeId + ") SET n.need_ne_create_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' ");
        queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=true return n");
        var query = queries.join('\n');
*/

        var query = "MATCH (n)-[r]-(m:Visualynk) where id(n)="+nodeId+" delete r,n,m"
    }
    else if(reqType == "ne_update"){
        var queries = [];
        queries.push("START n=node(" + nodeId + ") SET n.need_ne_update_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' ");
        queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=true return n");
        var query = queries.join('\n');
    } else if(reqType == "ne_delete"){
        var queries = [];
        queries.push("START n=node(" + nodeId + ") SET n.need_ne_delete_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' ");
        queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=true return n")
        var query = queries.join('\n');

        //var query = "MATCH (n)-[r]-(m:Visualynk) where id(n)="+nodeId+" delete r,n,m"
    }


    if(query != "") {
        session
            .run(query)
            .then(function (results) {
                var records = results.records;
                result.msg = "success";
                result.responseData = records;
                res.json(result);
                session.close()
            })
            .catch(function (error) {
                console.log(error);
                result.msg = "error";
                result.responseData = error;
                res.json(result);
            });
    } else {
        result.msg = "error";
        result.responseData = "No approval types";
        res.json(result);
    }
}

exports.createNodeEntity = function(req, res){
    var neProperties = JSON.parse(req.body.ne_properties);
    var nePropertiesVal = JSON.parse(req.body.ne_properties_val);
    var ngLabel = req.body.ng_name;
    var neLabel = req.body.ne_name;
    var ngGUID = req.body.ne_guid;
    var companyId = req.body.companyId;
    var creatorGroup = req.body.creatorGroup;
    var parentGroup = req.body.parentGroup;

    //var vi_label = ngLabel + ":" + neLabel;
    var vi_label = neLabel;

    var error = '';
    var result = {};

    if(parentGroup != "") {
        var query = "MERGE (ng:`" + ngLabel + "` {`name`:'" + neLabel + "', `parentNode`:'" + ngLabel + "', `guid`:'" + ngGUID + "', `companyId`:'" + companyId + "', `is_full_show`:false, `need_ne_create_approval`:true, `creatorGroup`:'" + creatorGroup + "', `parentGroup`:'" + parentGroup + "', isEntity: true";
        if(neProperties.length > 0)
            query += ",";
        neProperties.forEach(function (ele, ind) {
            query += "`" + ele + "`:'" + nePropertiesVal[ind] + "',";
        })

        if(neProperties.length > 0)
            query = query.substring(0, query.length - 1);
        query += "}) ";
    } else {
        var query = "MERGE (ng:`" + ngLabel + "` {`name`:'" + neLabel + "', `parentNode`:'" + ngLabel + "', `guid`:'" + ngGUID + "', `companyId`:'" + companyId + "', `is_full_show`:true, `need_ne_create_approval`:false, `creatorGroup`:'" + creatorGroup + "', `parentGroup`:'" + parentGroup + "', isEntity: true";
        if(neProperties.length > 0)
            query += ",";
        neProperties.forEach(function (ele, ind) {
            query += "`" + ele + "`:'" + nePropertiesVal[ind] + "',";
        })

        if(neProperties.length > 0)
            query = query.substring(0, query.length - 1);
        query += "}) ";
    }

    var queries = [];
    queries.push(query);

    if(parentGroup != "")
        queries.push("MERGE (vi:Visualynk {name:'"+vi_label+"', companyId:'"+companyId+"', `is_full_show`:false}) return ng");
    else
        queries.push("MERGE (vi:Visualynk {name:'"+vi_label+"', companyId:'"+companyId+"', `is_full_show`:true}) return ng");

    //queries.push("MERGE (ng)-[:CATEGORIZED_IN]->(vi) ");
    //queries.push("MERGE (vi)-[:INCLUDES_DATASET]->(ng) return ng");

    query = queries.join('\n');

    session
        .run(query)
        .then(function(results){
            console.log(JSON.stringify(results.records))
            var created_ne_id = results.records[0]._fields[0].identity.low;
            created_ne_id += "_"+ngLabel;
            var squery = "MERGE (vi:Visualynk {name:'"+created_ne_id+"'}) return n";

            /*session
                .run(squery)
                .then(function(results){*/
                    result.msg = "success";
                    result.responseData = results.records;
                    res.json(result);

                    session.close();
                /*})
                .catch(function(error) {
                    console.log(error);
                    result.msg = "error";
                    result.responseData = error;
                    res.json(result);
                });

            session.close();*/
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });

    session.close();
}
exports.updateNodeEntity = function(req, res){
    var nodeId = req.body.ne_id;
    var neProperties = JSON.parse(req.body.ne_properties);
    var nePropertiesVal = JSON.parse(req.body.ne_properties_val);
    var neLabel = req.body.ne_name;
    var parentGroup = req.body.parentGroup;
    var neGuid = req.body.guid;
    var error = '';
    var result = {};

    if(parentGroup != "") {
        var queries = [];
        // WEIRD PROBLEM !!! : With "START" statement SET n.is_full_show=false and n.need_ne_update_approval=true return false and true values as "false" and "true" (as string)
        // and updated node does not appear in the app anymore. To fix the problem, I add the SET statement again in lines 1835 and 1846
        var query = "START n=node(" + nodeId + ") SET n.name='" + neLabel + "', n.is_full_show=false, n.guid='" + neGuid + "', n.need_ne_update_approval=true, n.parentGroup='"+parentGroup+"', ";
        neProperties.forEach(function (ele, ind) {
            if(ele != "guid" && ele != "is_full_show" && ele != "need_ne_update_approval" && ele != "parentGroup" && ele != "need_ne_create_approval" && ele != "need_ne_delete_approval" && ele != "companyId" && ele != "creatorGroup")
                query += "n." + ele + "='" + nePropertiesVal[ind] + "',";
        })
        query = query.substring(0, query.length - 1);
        //query += "return n";
        queries.push(query);
        queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=false SET n.is_full_show=false, n.need_ne_update_approval=true return n")
        query = queries.join('\n');
    } else {
        var queries = [];
        var query = "START n=node(" + nodeId + ") SET n.name='" + neLabel + "', n.is_full_show=true, n.guid='" + neGuid + "', n.need_ne_update_approval=false, n.parentGroup='"+parentGroup+"', ";
        neProperties.forEach(function (ele, ind) {
            if(ele != "guid" && ele != "is_full_show" && ele != "need_ne_update_approval" && ele != "parentGroup" && ele != "need_ne_create_approval" && ele != "need_ne_delete_approval" && ele != "companyId" && ele != "creatorGroup")
            query += "n." + ele + "='" + nePropertiesVal[ind] + "',";
        })
        query = query.substring(0, query.length - 1);
        //query += "return n";
        queries.push(query);
        queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=true SET n.is_full_show=true, n.need_ne_update_approval=false return n")
        query = queries.join('\n');

    }
    console.log("query => " + query);

    session
        .run(query)
        .then(function(results){
            result.msg = "success";
            result.responseData = results.records;
            res.json(result);
            console.log(queries);
            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });

}
exports.deleteNodeEntity = function (req, res) {
    var nodeId = req.body.nodeId;
    var ngLabel = req.body.ngLabel;
    var parentGroup = req.body.parentGroup;

    var error = '';
    var result = {};

    //var query = "MATCH (n:"+ngLabel+")-[r]-(m:Visualynk) where id(n)="+nodeId+" delete r,n,m";
    var queries = [];
    queries.push("START n=node(" + nodeId + ") SET n.need_ne_delete_approval = true, n.is_full_show = false, n.parentGroup='" + parentGroup + "' ");
    queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=false return n")
    var query = queries.join('\n');

    session
        .run(query)
        .then(function(results){
            result.msg = "success";
            result.responseData = results.records;
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });

}
exports.getNodeEntityRelations = function (req, res) {
    var nodeId = req.params.nodeId;

    var result = {'msg':''};
    var error = '';

    var query = "START n=node("+nodeId+") MATCH (n)-[r]-(x) return startnode(r) as starter, endnode(r) as ender, type(r) as relationName, id(r) as relationID";
    console.log("get Node Entity Relations ");
    console.log(query);
    console.log("end get relationship");
    session
        .run(query)
        .then(function(results) {
            var records = results.records;
            result.msg = "success";
            result.data = records;
            res.json({
                responseData: result,
                error: error
            });
            session.close()
        })
}
function intersect_arrays(a, b) {
    var sorted_a = a.concat().sort();
    var sorted_b = b.concat().sort();
    var common = [];
    var a_i = 0;
    var b_i = 0;

    while (a_i < a.length
           && b_i < b.length)
    {
        if (sorted_a[a_i] === sorted_b[b_i]) {
            common.push(sorted_a[a_i]);
            a_i++;
            b_i++;
        }
        else if(sorted_a[a_i] < sorted_b[b_i]) {
            a_i++;
        }
        else {
            b_i++;
        }
    }
    return common;
}
exports.getNewRelationEnders = function (req, res) {
    var nodeId = req.body.nodeId;
    var companyId = req.body.companyId;

    var error = '';
    var result = {};

    var selfNodes = [];
    //if(companyId != "")
        //var query = "MATCH (n {companyId:'"+companyId+"'})-[r]-(x) WHERE n.isEntity = true AND n.is_full_show=true AND ID(x)<>"+nodeId+" RETURN DISTINCT(ID(x)) as id,x";
        //var query = "MATCH (n {companyId:'"+companyId+"', isEntity:true, is_full_show:true}) WHERE not (n)-[r]-() RETURN DISTINCT(ID(n)) as id,n"
        //var query = "MATCH (n {companyId:'"+companyId+"', isEntity:true, is_full_show:true}) OPTIONAL MATCH (m)-[r]-(n) WITH m,n WHERE ID(m)<>"+nodeId+" AND ID(n)<>"+nodeId+" RETURN DISTINCT(id(n)) as id,n"
        //var query = "start n=node("+nodeId+") MATCH (n) OPTIONAL MATCH (m {companyId:'"+companyId+"', isEntity:true, is_full_show:true}) OPTIONAL MATCH (n)-[r]-(rn) WITH n,m,rn,collect(distinct m) as entities WHERE ID(rn) IS NULL OR (NOT rn IN entities) return DISTINCT(ID(m)) as id,m";
    //else
        //var query = "MATCH (n)-[r]-(x) WHERE n.companyId IS NULL AND ID(x)<>"+nodeId+" RETURN DISTINCT(ID(x)) as id,x";
        //var query = "MATCH (n WHERE not ((n)--()) n.companyId IS NULL and n.isEntity=true RETURN DISTINCT(ID(n)) as id,n"
        //var query = "MATCH (n {isEntity:true, is_full_show:true}) WHERE n.companyId is null OPTIONAL MATCH (m)-[r]-(n) WITH m,n WHERE ID(m)<>"+nodeId+" AND ID(n)<>"+nodeId+" RETURN DISTINCT(id(n)) as id,n"
        //var query = "start n=node("+nodeId+") MATCH (n) OPTIONAL MATCH (m {isEntity:true, is_full_show:true}) OPTIONAL MATCH (n)-[r]-(rn) WITH n,m,rn,collect(distinct m) as entities WHERE m.companyId IS NULL AND ID(rn) IS NULL OR (NOT rn IN entities) return DISTINCT(ID(m)) as id,m";
    
    //get parent from nodeId
    var getNodeQuery = "START n=node("+nodeId+") return n";
    session
        .run(getNodeQuery)
        .then(function(results){
            var data = results.records[0];
            var parentNode  = data._fields[0].properties.parentNode;
            console.log("parent Node Name => " + parentNode);

            //get all child Node Id from the parentNode
            var getChildNodes = "MATCH (n:"+parentNode+") RETURN n";
            session
                .run(getChildNodes)
                .then(function(results){
                    selfNodes = results.records;

                    var query = "START n=node("+nodeId+") MATCH (n)-[r]->(x) return x";
                    console.log('left query => ' + query);
                    session
                        .run(query)
                        .then(function(results) {
                            var records = results.records;
                            var relation_left_ids = [];
                            var relation_right_ids = [];
                            results.records.forEach(function(record) {
                                relation_left_ids.push(record._fields[0].identity.low)
                            })

                            var query1 = "START n=node("+nodeId+") MATCH (x)-[r]->(n) return x";
                            console.log('right query => ' + query1);
                            session
                            .run(query1)
                            .then(function(results1) {
                                var records1 = results1.records;
                                results1.records.forEach(function(record) {
                                    relation_right_ids.push(record._fields[0].identity.low)
                                });

                                //select left and right directioned node from relation_left_ids and relation_right_ids
                                console.log("left ids => " + relation_left_ids);
                                console.log("right ids => " + relation_right_ids);
                                var exceptNodes = intersect_arrays(relation_left_ids, relation_right_ids);

                                //add self nodes to exceptNodes result_array
                                selfNodes.forEach(function(self){
                                    var selfId = self._fields[0].identity.low;
                                    exceptNodes.push(selfId);
                                });
                                //get parent from nodeId
                                console.log("doulbled ids => " + exceptNodes);

                                if(companyId != "")
                                    var squery = "MATCH (m {companyId:'"+companyId+"', isEntity:'true', is_full_show:true}) WHERE ID(m)<>"+nodeId+" AND (NOT ID(m) IN ["+exceptNodes.join(",")+"]) RETURN DISTINCT(ID(m)) as id,m";
                                else
                                    var squery = "MATCH (m {isEntity:'true', is_full_show:true}) WHERE m.companyId =\"\" AND ID(m)<>"+nodeId+" AND (NOT ID(m) IN ["+exceptNodes.join(",")+"]) RETURN DISTINCT(ID(m)) as id,m";
                                console.log(squery);
                                session
                                    .run(squery)
                                    .then(function(results){
                                        result.msg = "success";
                                        result.responseData = results.records;
                                        res.json(result);

                                        session.close();
                                    })
                                    .catch(function(error) {
                                        console.log(error);
                                        result.msg = "error";
                                        result.responseData = error;
                                        res.json(result);
                                    });
                                session.close()
                            });
                        })

                    session.close();
                })
                .catch(function(error) {
                    console.log(error);
                });
                    session.close();
                })
                .catch(function(error) {
                    console.log(error);
                    session.close();
                });


}
exports.createNewNERelationship = function (req, res) {
    var startNodeId = req.body.startId;
    var endNodeId = req.body.enderId;
    var relationshipName = req.body.relationName;
    var direction = req.body.direction;

    var result = {'msg':''};
    var error = '';

    var query = ['START n=node(' + startNodeId + '), m=node(' + endNodeId + ')'];

    if(direction == "->")
        query.push('CREATE UNIQUE (n)-[:' + relationshipName + ']->(m) return n');
    else
        query.push('CREATE UNIQUE (n)<-[:' + relationshipName + ']-(m) return n');

    query = query.join('\n');
    console.log(query)
    session
        .run(query)
        .then(function(results) {
            var records = results.records;
            result.msg = "success";
            result.data = records;
            console.log(query);
            res.json({
                responseData: result,
                error: error
            });
            session.close()
        })
}
exports.deleteNodeEntityRelations = function (req, res) {
    var relationId = req.params.relationId;

    var result = {'msg':''};
    var error = '';

    var query = "start r=rel("+relationId+") delete r";

    session
        .run(query)
        .then(function(results) {
            var records = results.records;
            result.msg = "success";
            result.data = records;
            res.json({
                responseData: result,
                error: error
            });
            session.close()
        })
}

exports.getWaitingApprovals = function (req, res) {
    var reqType = req.body.reqType;
    var parentGroup = req.body.userGroup;

    var result = {'msg':''};
    var error = '';

    var query = "";

    if(reqType == "ng_create")
        var query = "MATCH (n:NODEGROUPS) WHERE n.need_create_approval = true AND n.is_full_show = false AND n.parentGroup='"+parentGroup+"' return n";
    else if(reqType == "ng_update")
        var query = "MATCH (n:NODEGROUPS) WHERE n.need_update_approval = true AND n.is_full_show = false AND n.parentGroup='"+parentGroup+"' return n";
    else if(reqType == "ng_delete")
        var query = "MATCH (n:NODEGROUPS) WHERE n.need_delete_approval = true AND n.is_full_show = false AND n.parentGroup='"+parentGroup+"' return n";
    else if(reqType == "ne_create")
        var query = "MATCH (n) WHERE n.need_ne_create_approval = true AND n.is_full_show = false AND n.parentGroup='"+parentGroup+"' return n";
    else if(reqType == "ne_update")
        var query = "MATCH (n) WHERE n.need_ne_update_approval = true AND n.is_full_show = false AND n.parentGroup='"+parentGroup+"' return n";
    else if(reqType == "ne_delete")
        var query = "MATCH (n) WHERE n.need_ne_delete_approval = true AND n.is_full_show = false AND n.parentGroup='"+parentGroup+"' return n";

    if(query != "") {
        session
            .run(query)
            .then(function (results) {
                var records = results.records;
                result.msg = "success";
                result.responseData = records;
                res.json(result);
                session.close()
            })
            .catch(function (error) {
                console.log(error);
                result.msg = "error";
                result.responseData = error;
                res.json(result);
            });
    } else {
        result.msg = "error";
        result.responseData = "No approval types";
        res.json(result);
    }
}
exports.saveUserVisibility = function (req, res) {
    var userId = req.body.userId;
    var restrictGroups = req.body.restrictGroups;

    var error = '';
    var result = {};

    var query = ["START n=node("+userId+") SET n.restrictGroups = '"+restrictGroups+"' return n"].join('\n');

    var users = [];
    session
        .run(query)
        .then(function(results) {
            users.users = results.records;
            res.json({
                users: results.records,
                error: ''
            });
            session.close();
        })
}
exports.saveTDModel = function (req, res){
    var companyId = req.body.companyId;
    var filename = req.body.filename;

    var error = '';
    var result = {};

    var query = "MERGE (n:TDMODELS {`companyId`:'"+companyId+"', `filename`:'"+filename+"'}) return n";

    session
        .run(query)
        .then(function(results) {
            result.msg = "success";
            result.responseData = results.records;
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
}
exports.getTDModels = function (req, res) {
    var companyId = req.body.companyId;
    var filename = req.body.filename;

    var error = '';
    var result = {};

    if(companyId != "")
        //var query = "MERGE (n:TDMODELS) WHERE n.companyId='"+companyId+"' return n";
        // Above code gave an REST error "Invalid input 'H': expected 'i/I'" Modified like the following by removing the WHERE clause
        var query = "MERGE (n:TDMODELS {companyId:'"+companyId+"'}) RETURN n"
    else
        var query = "MERGE (n:TDMODELS) return n";

    session
        .run(query)
        .then(function(results) {
            result.msg = "success";
            result.responseData = results.records;
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
}

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
exports.sendMail = function(req, res){
    var data = req.body;

    var text =  data.contactName + " has sent you message...\n\n";
    text += "the message is follow as below.\n\n";
    text += data.contactMsg + "\n";
    text += "please contact to us"  + "\n";
    text += "Phone Number : " +  data.contactPhone + "\n";
    text += "E-mail : " + data.contactEmail + "\n";
    text += "Company Name : " + data.contactCompany + "\n";
    transporter.sendMail({
        from : data.contactEmail,
        to : "admin@visualynk.com",
        subject : "Message from " + data.contactName,
        text : text
    },function(error, response){
        if(error){
            console.log(error);
            res.json({result:"fail",msg:error});
        }
        else{
            console.log('Message sent');
            res.json({result:"success",msg:''});
        }
    });


}
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
    var query = req.body.query;
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            retValue = results;
            res.json({
                responseData: retValue,
                error: error
            });
            session.close();
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

/*exports.getAllNodes = function(req, res) {

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

};*/
    exports.getAllNodes = function(req, res) {

        var retValue;
        var query;

        query = [
            'MATCH (n)  ',
            'WHERE n.tag=\'drugs\'',
            'RETURN n'
        ].join('\n');
        session
            .run(query)
            .then(function(results){
                var records = results.records;
                var length = records.length;
                if(length > 0){
                    retValue = results;
                }
                res.json({
                    responseData: retValue
                });
                session.close();
            });
    };

function encrypt(text){
    var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq')
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text){
    var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq')
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}