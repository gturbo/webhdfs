var express = require('express');
var router = express.Router();
var request = require('request');
var util= require('util');
var extend = util._extend;
/* GET home page. */

var baseHDFS = 'https://bi-hadoop-prod-2059.services.dal.bluemix.net:8443/gateway/default/webhdfs/v1/';
var basePath = 'user/biblumix/input';
var baseOptions = {
	auth : {
		user : 'biblumix',
		password : 'i~q052@y6jvP',
		sendImmediately : true
	}
}

router.get(/^\/list\/*(.*)?$/, function (req, res, next) {
	var data = "";
	
	console.log('req.params:');
	console.log(util.inspect(req.params));
	console.log('req._parsedUrl:');
	console.log(util.inspect(req._parsedUrl));
	var options = extend(baseOptions, {
			method : 'GET',
			uri : baseHDFS + req.params["0"] + '?op=LISTSTATUS'
		});
	console.log('options: \n' + util.inspect(options));
	request(options)
	.on('data', function (chunk) {
		if (chunk) {
			console.log(('received: ' + chunk).substr(0, 50));
			data += chunk;
		}
	})
	.on('end', function () {
		res.send(data);
		res.end();
	})
	.on('error', function (err) {
		console.log(err);
		next();
	});

});
router.get('/', function (req, res, next) {
	res.render('index', {
		title : 'opérations',
		path: basePath
		
	});
});


module.exports = router;
