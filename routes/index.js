var express = require('express');
var router = express.Router();
var request = require('request');
var util = require('util');
var fs = require('fs');
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

var hdfs = function (options, callback) {
	console.log('options: \n' + util.inspect(options));
	return request(extend(baseOptions, options), function (e, r, b) {
		if (e) {
			console.log(e);
		}
		callback(r, b, e);
	});
}

// list distant directory through webhdfs query
router.get(/^\/list\/*(.*)?$/, function (req, res, next) {
	console.log('req.params:');
	console.log(util.inspect(req.params));
	//	console.log('req._parsedUrl:');
	//	console.log(util.inspect(req._parsedUrl));

	var data = "";
	hdfs({
		method : 'GET',
		uri : baseHDFS + req.params["0"] + '?op=LISTSTATUS'
	}, function (res2, body) {
		if (body) {
			console.log(('received: ' + body).substr(0, 50));
			res.send(body);
		}
		res.end();
	});
});

// list local directory
router.get(/^\/loc-list\/*(.*)?$/, function (req, res, next) {
	console.log('loc-list req.params:');
	console.log(util.inspect(req.params));
	var path = req.params['0']; //.replace('/', '\\');
	console.log('final path: ' + path);
	fs.readdir(path, function (err, files) {
		if (err) {
			// try with file mask
			if (err.errno == -4058) {
				// not a directory entry
				var paths = path.split('/');
				var pattern = paths.pop();
				path = paths.join('/');
				var escPattern = "";
				for (var i = 0, len = pattern.length; i < len; i++) {
					var c = pattern[i];
					if (c == '.' || c == ')' || c == '(' || c == '[' || c == ']' || c == '-' || c == '{' || c == '}' || c == '\\' || c == '?')
						escPattern += '\\' + c;
					else if (c == '*')
						escPattern += '.*?';
					else
							escPattern += c;
				}
				console.log('path:' + path + " pattern: " + pattern + " escaped: " + escPattern);
				fs.readdir(path, function (err, files) {
					if (err) {
						console.log(err);
						next();
					} else {
						//console.log(util.inspect(files));
						var matcher = new RegExp(escPattern, 'i');
						console.log('matcher:' + matcher);
						var filtFiles = [];
						for (i in files) {
							var file = files[i];
							console.log('file: ' + file);
							if (file.match(matcher))
								filtFiles.push(file);
						}
						res.send(filtFiles);
						res.end();
					}
				});
			} else {
				console.log(err);
				next();
			}
		} else {
			console.log(util.inspect(files));
			res.send(files);
			res.end();
		}
	});

});

// upload files
router.get(/^\/upload\/*(.*)?$/, function (req, res, next) {});

router.get('/', function (req, res, next) {
	res.render('index', {
		title : 'opérations',
		path : basePath

	});
});

module.exports = router;
