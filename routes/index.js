var express = require('express');
var router = express.Router();
var Post = require('../models/post.js');
var cache = require('../cache/mini.js');
var ipManage = require('../utils/ip_manage.js');
var cookie = require('../utils/cookie.js');
var pv = require('../utils/pv_manage.js');
var uv = require('../utils/uv_manage.js');
var pvData = require('../models/pv.js');
var uvData = require('../models/uv.js');
var ua = require('../utils/user_agent.js');
var Admin = require('../models/admin.js');

cache.new();
/* GET home page. */
router.get('/', [pv.pvManage, uv.uvManage, ua.mobile], function(req, res) {
  res.render('index');
});

router.get('/master', [cookie.get], function(req, res) {
  res.render('index_master');
});

router.get('/data', [cookie.get], function(req, res, next) {
  res.sendfile('public/data.html')
});

// router.get('/post', function(req, res, next) {
//
//   Post.create({title: "23333333333333333333333"});
//   res.render('index', { title: 'post' });
// });

router.get('/test-redirect', function(req, res, next) {
  res.set('Access-Control-Allow-Origin', 'https://www.baidu.com')
  res.redirect(301, 'https://www.baidu.com');
});

router.post('/master/login', function(req, res, next) {
  var password = req.body.password;

  Admin.findByPassword(password).then(function(admin) {
    if (admin == null) {
      req._admin = {
        password: Symbol(),
      }
      next();
    } else {
      req._admin = admin;
      next();
    }
  })
}, function(req, res) {
  var admin = req._admin;
  var password = req.body.password;
  console.log(password, admin.password);
  if (admin.password == password) {
    var options = {
      maxAge: 1000 * 60 * 60, // would expire after 24 hours
      httpOnly: true, // The cookie only accessible by the web server
      signed: true // Indicates if the cookie should be signed
    }
    res.cookie('user', 'master-sen-1219', options)
    res.json({data: 'success'})
  } else {
    res.json({data: 'error'})
  }
});

router.get('/master/login', function(req, res) {
  res.render('login');
});

router.get('/subscribe', function(req, res) {
  res.render('subscribe');
});

router.get('/master/reset', [cookie.get], function(req, res, next) {
  var password = req.query._password;
  Admin.findByPassword(password).then(function(admin) {
    req._admin = admin;
    next();
  })
}, function(req, res) {
  var admin = req._admin;
  var password = req.query.password;
  if (admin.password == null) {
    res.json({data: 'no'})
  } else {
    admin.resetPassworld(password);
    res.json({data: 'yes'})
  }
});

router.get('/pv/current', function(req, res) {
  res.json({data: pv.pvCurrent()});
});

router.get('/pv/lastday', function(req, res) {
  pvData.lastDay().then(function(data) {
    // console.log(data);
    var r = 'Day,Visits\n'
    for (var i = 0; i < data.length; i++) {
      var d = data[i]
      var s = `${d.createdAt},${d.count}\n`
      r += s
    }
    res.send(r);
  });
});

router.get('/uv/current', function(req, res) {
  res.json({data: uv.uvCurrent()});
});

router.get('/uv/lastday', function(req, res) {
  uvData.lastDay().then(function(data) {
    var r = 'Day,Unique Visits\n'
    for (var i = 0; i < data.length; i++) {
      var d = data[i]
      var s = `${d.createdAt},${d.count}\n`
      r += s
    }
    res.send(r);
  });
});




module.exports = router;
