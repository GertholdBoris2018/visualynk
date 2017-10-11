
/**
 * Module dependencies.
 */

// Setup
// =================
var express = require('express');
var http = require('http');
var path = require('path');
var routes = require('./routes');
var api = require('./routes/api');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var flash = require('connect-flash');
var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

var users = [
    { id: 1, username: 'guest', password: 'guestpass', email: 'guest@anne.com' },
    { id: 2, username: 'visitor', password: 'visitorpass', email: 'visitor@anne.com' }
];


function findById(id, fn) {
    var idx = id - 1;
    if (users[idx]) {
        fn(null, users[idx]);
    } else {
        fn(new Error('User ' + id + ' does not exist'));
    }
}
function findByUsername(username, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.username === username) {
            return fn(null, user);
            console.log(username);
        }
    }
    return fn(null, null);
}

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    findById(id, function (err, user) {
        done(err, user);
    });
});

// Use the LocalStrategy within Passport.
// Strategies in passport require a `verify` function, which accept
// credentials (in this case, a username and password), and invoke a callback
// with a user object. In the real world, this would query a database;
// however, in this example we are using a baked-in set of users.
passport.use('login',new LocalStrategy(
    function(username, password, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
            // Find the user by username. If there is no user with the given
            // username, or the password is not correct, set the user to `false` to
            // indicate failure and set a flash message. Otherwise, return the
            // authenticated `user`.
            findByUsername(username, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {message: 'Unknown user ' + username});
                }
                if (user.password != password) {
                    return done(null, false, {message: 'Invalid password'});
                }
                return done(null, user);
            })
        });
    }
));
// Create our app with express
var app = express();

// Configure all environments
// =================

app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
//app.use('/api', expressJwt({secret: 'secret-anne'}));
app.use(express.json());
app.use(express.urlencoded());
//for use with sessions
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());  // simulate DELETE and PUT
app.use(express.session({ cookie: { maxAge: 60000 }, secret: 'anne#'}));
// use flash messages
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));  // set the static files location /public/img will be /img for users

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// We only need a default route.  Angular will handle the rest.
app.get('/', function(request, response){
  response.sendfile("./public/index.html");
});

// Send to js file for routing
app.get('/json/neo4j.json', function(request, response){
  response.sendfile("json/neo4j.json");
});

//send to js file for bim Configure
app.get('/config/bimconfig.json', function(request, response){
  response.sendfile("config/bimconfig.json");
});

// JSON API
//include npm module
app.use('/scripts', express.static(__dirname + '/node_modules/'));
app.use('/files',express.static(__dirname + '/uploads/'));
app.use('/media/image', express.static(__dirname + '/public/media/image'));

app.use('/api', expressJwt({secret: 'secret-anne'}));
app.post('/api/runAdhocQuery', api.runAdhocQuery);
app.post('/api/runParallelQueries', api.runParallelQueries);
app.post('/api/createNode', api.createNode);
app.post('/register', api.register);
app.post('/registerbimserver' , api.registerbimserver);
app.post('/getUserByUserName' , api.getUserByUserName);
app.post('/deleteUserbyOid', api.deleteUserbyOid);
app.get('/getLoadBimToken', api.getLoadBimToken);
app.post('/getLoadBimProject_Users', api.getLoadBimProject_Users);
app.post('/addUserToProjectBim', api.addUserToProjectBim);
app.post('/removeUserFromProject', api.removeUserFromProject);
app.post('/addProjectBim' , api.addProjectBim);
app.post('/getAllDeserializersForProject',api.getAllDeserializersForProject);
app.post('/getSuggestedDeserializerForExtension',api.getSuggestedDeserializerForExtension);
app.post('/addSubProjectBim',api.addSubProjectBim);
app.post('/deleteProjectBim', api.deleteProjectBim);
// app.post('/ifcinitcheckin',api.uploadifc);
app.post('/getEntityByGUID', api.getEntityByGUID);
app.post('/getAllRelationsByGUIDs',api.getAllRelationsByGUIDs);
app.post('/getProgressOnProject', api.getProgressOnProject);

app.post('/api/deleteNode', api.deleteNode);
app.post('/api/createRelationship', api.createRelationship);
app.post('/api/deleteRelationship', api.deleteRelationship);
app.post('/api/updateNode', api.updateNode);
app.post('/api/getNode', api.getNode);
app.get('/api/getAllNodes', api.getAllNodes);
app.post('/cypherApi',api.getQueryResult);
app.post('/signin', api.login);
app.post('/forgotpassword', api.forgotpassword);
app.post('/checkresetpwdtoken', api.checkresetpwdtoken);
app.post('/resetpassword', api.resetpassword);
//app.post('/login', api.login);

app.get('/getCompanies', checkIfAdmin, api.getCompanies);
app.post('/getCompany', api.getCompany);
app.get('/getCountries', api.getCountries);
app.post('/addCompany', api.addCompany);
app.post('/updateCompany', api.updateCompany);
app.post('/deleteCompany', api.deleteCompany);

app.get('/getUsers', expressJwt({secret: 'secret-anne'}), api.getUsers);
app.get('/getProjects', expressJwt({secret: 'secret-anne'}), api.getProjects);
app.post('/getUser', api.getUser);
app.post('/updateUser', api.updateUser);
app.post('/updateUserPermission', api.updateUserPermission);
app.post('/deleteUser', api.deleteUser);

app.post('/updateUserGroupAssigns',checkIfAdmin, api.updateUserGroupAssigns);
app.get('/getUserGroupAssigns',expressJwt({secret: 'secret-anne'}), api.getUserGroupAssigns);
app.get('/getNeedApprovalAssigns', expressJwt({secret: 'secret-anne'}), api.getNeedApprovalAssigns);
app.post('/updateNeedApprovalAssigns', checkIfAdmin, api.updateNeedApprovalAssigns);

app.post('/getPlanDan', api.getPlanDan);
app.post('/systemfilter', api.systemfilter);
app.post('/attributefilter', api.attributefilter);
app.post('/companyfilter', api.companyfilter);
app.post('/facilityfilter', api.facilityfilter);
app.post('/floorfilter', api.floorfilter);
app.post('/zonefilter', api.zonefilter);
app.post('/spacefilter', api.spacefilter);
app.post('/assetfilter', api.assetfilter);
app.post('/componentfilter', api.componentfilter);
app.post('/assemblyfilter', api.assemblyfilter);
app.post('/connectionfilter', api.connectionfilter);
app.post('/sparefilter', api.sparefilter);
app.post('/resourcefilter', api.resourcefilter);
app.post('/jobfilter', api.jobfilter);
app.post('/sevicereqfilter', api.sevicereqfilter);
app.post('/docfilter', api.docfilter);
app.post('/contactform', api.sendMail);
app.get('/download/:fname', api.download);

app.post('/personfilter', api.personfilter);

/* dropzone file upload */
app.post('/upload', api.fileupload);
app.post('/ngIconUpload', api.ngIconUpload);
app.post('/twoDimentionModelUpload', api.twoDimentionModelUpload);
app.post('/uploadifcToProject',api.ifccheckin);
// app.post('/uploadifcToProject',api.uploadifc);
app.post('/getNodeGroups', api.getNodeGroups);
app.post('/getEntitiesbyGroupNodeId',api.getEntitiesbyGroupNodeId);
app.post('/getAllEntitiesByGroupRootId',api.getAllEntitiesByGroupRootId);
app.get('/getNodeGroup/:nodeId', api.getNodeGroup);
app.post('/createNodeGroup', api.createNodeGroup);
app.post('/updateNodeGroup', api.updateNodeGroup);
app.post('/deleteNodeGroup', api.deleteNodeGroup);
app.post('/createRootGroup', api.createRootGroup);
app.post('/updateRootGroup', api.updateRootGroup);
app.post('/getRootGroups', api.getRootGroups);
app.post('/createNodeEntity', api.createNodeEntity);
app.post('/updateNodeEntity', api.updateNodeEntity);
app.post('/deleteNodeEntity', api.deleteNodeEntity);
app.get('/getNodeEntityRelations/:nodeId', api.getNodeEntityRelations);
app.post('/getNewRelationEnders', api.getNewRelationEnders);
app.post('/createNewNERelationship', api.createNewNERelationship);
app.get('/deleteNodeEntityRelations/:relationId', api.deleteNodeEntityRelations);

app.post('/getWaitingApprovals', api.getWaitingApprovals)
app.post('/updateNGPendingApprovals', api.updateNGPendingApprovals)
app.post('/cancelNGPendingApprovals', api.cancelNGPendingApprovals)
app.post('/saveUserVisibility', api.saveUserVisibility)
app.post('/saveTDModel', api.saveTDModel)
app.post('/getTDModels', api.getTDModels)

// Simple route middleware to ensure user is authenticated.
// Use this route middleware on any resource that needs to be protected. If
// the request is authenticated (typically via a persistent login session),
// the request will proceed. Otherwise, the user will be redirected to the
// login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}

function checkIfAdmin(req,res,next) {
    if(req.cookies.hasOwnProperty('globals')) {
        var cookGlobal = JSON.parse(req.cookies.globals);
        var userType = cookGlobal['currentUser']['usertype'];
        res.cookie('09f63176-3bc6-4653-9771-92bcde2e2cb9', cookGlobal['currentUser']['username'])
        res.cookie('8e01b003-ac65-44b3-9ee6-6ccbd344d837', cookGlobal['currentUser']['password'])
        if (userType == 'admin') {
            return next()
        } else {
            res.redirect('/')
        }
    } else
        return next()
}

http.createServer(app).listen(app.get('port'), function(req,res){
  console.log('Express server listening on port ' + app.get('port'));
});
