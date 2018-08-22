var debug = false;
var express = require('express');
var session = require('express-session');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var settings = require('./settings');
var routes = require('./routes/index');
var moment = require('moment');
var http = require('http');
//Jason add for node-red on 2017.01.03
var RED = require("node-red");
var JsonFileTools =  require('./models/jsonFileTools.js');
var schedule = require('node-schedule');
//app setting-------------------------------------------------------
var app = express();
var port = process.env.PORT || 3000;
app.set('port', port);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  resave: false,
  saveUninitialized: true
}));
//Jason add on 2016.09.26
app.use(express.static(path.join(__dirname, 'bower_components/jquery-validation/dist/')));
app.use(express.static(path.join(__dirname, 'bower_components/jquery-validation/src/')));

routes(app);
var server = http.createServer(app);

var redSettings = {
    httpAdminRoot:"/red",
    httpNodeRoot: "/",
    userDir:"./.nodered/",
    functionGlobalContext: {
    	momentModule:require("moment"),
		msgTools:require("./models/msgTools.js"),
    	// work: require("./models/work.js")
    }   // enables global context
};

// Initialise the runtime with a server and settings
RED.init(server,redSettings);

// Serve the editor UI from /red
app.use(redSettings.httpAdminRoot,RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(redSettings.httpNodeRoot,RED.httpNode);
//Jason modify on 2016.05.23
//app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.render("404");
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var sock = require('socket.io').listen(server.listen(port));

//Jason add for node-red on 2017.01.03
// Start the runtime
RED.start();


/*app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});*/

console.log('settings.cookieSecret : '+settings.cookieSecret);
console.log('settings.db : '+settings.db);

var date = moment();
var myUnits;

sock.on('connection',function(client){

	client.on('disconnect',function(){
         console.log('Server has disconnected!');
	});

	client.on('serialport_socket',function(data){
		console.log('serialport_socket ------------------------------------------------------------start' );
		console.log('Debug serialport_socket :'+data );
  });

  client.on('serialport_receive',function(data){
		console.log('serialport_receive ------------------------------------------------------------start' );
		console.log('Debug serialport_receive :'+data );
	});

	client.on('disconnect', function () {
        console.log('???? socket disconnect id : ' +client.id);
    });
});