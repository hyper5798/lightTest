var debug = false;
var express = require('express');
var router = express.Router();
var JsonFileTools =  require('../models/jsonFileTools.js');
var settings = require('../settings');
var moment = require('moment');
var infosPath  = './public/data/infos.json';
var limitPath  = './public/data/limit_setting.json';

module.exports = function(app){

  app.get('/', function (req, res) {
      return res.redirect('/ui/#/0');
  });

  //app.get('/control', checkLogin);
  app.get('/control', function (req, res) {
    var infos = JsonFileTools.getJsonFromFile(infosPath);
    var limit = JsonFileTools.getJsonFromFile(limitPath);
    var temp_max = '';
    var hum_max = '';
    if (limit.temperature) {
      var temp_max = limit.temperature;
    }
    if (limit.humidity) {
      var hum_max = limit.humidity;
    }

    res.render('control', { title: 'Control',
      user:req.session.user,
      error: null,
      success: null,
      units:null,
      temperature: infos.temperature,
      humidity: infos.humidity,
      temp_max: temp_max,
      hum_max: hum_max
    });
  });
};


