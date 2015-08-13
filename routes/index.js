var express = require('express');
var router = express.Router();
var request = require('request');
var util = require('util');
var fs = require('fs');
var extend = util._extend;
var async = require("async");
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
	options = extend(baseOptions, options);
	console.log('options: \n' + util.inspect(options));
	if (callback)
		request(options, function (e, r, b) {
			if (e) {
				console.log(e);
			}
			callback(r, b, e);
		});
	else
		return request(options);
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

var getLocalFileList = function (path, callback) {
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
						callback(null, err);
					} else {
						//console.log(util.inspect(files));
						var matcher = new RegExp(escPattern, 'i');
						// console.log('matcher:' + matcher);
						var filtFiles = [];
						for (i in files) {
							var file = files[i];
							//console.log('file: ' + file);
							if (file.match(matcher))
								filtFiles.push(file);
						}
						callback(filtFiles);
					}
				});
			} else {
				console.log(err);
				callback(null, err);
			}
		} else {
			//	console.log(util.inspect(files));
			callback(files);
		}
	});

}

// list local directory
router.get(/^\/loc-list\/*(.*)?$/, function (req, res, next) {
	//	console.log('loc-list req.params:');
	//	console.log(util.inspect(req.params));
	getLocalFileList(req.params['0'], function (files, err) {
		if (files) {
			res.send(files);
			res.end();
		} else
			res.next();
	});
});

hdfsUpload = function (localPath, localFileName, distPath, distFileName, callback) {
	if (!distFileName || distFileName.length == 0)
		distFileName = localFileName;

	if (distPath.slice(-1) != '/')
		distPath += '/';

	// first request returning a redirection to definitive upload url
	hdfs({
		method : 'PUT',
		uri : baseHDFS + distPath + distFileName + '?op=CREATE'
	}, function (res1, body) {
		//console.log(util.inspect(res1));
		if (res1.statusCode == 307) {
			console.log('definitive url:' + res1.headers.location);
			// real file upload
			fName = localPath + localFileName
				fs.createReadStream(fName).on('error', function (err) {
					console.log('error opening file ' + fName);
					callback(err);
				}).pipe(
					hdfs({
						method : 'PUT',
						uri : res1.headers.location + '?op=CREATE',
					}).on('end', function () {
						callback();
					}).on('error', function (err) {
						console.log('error while uploading file\n', util.inspect(err));
						callback(err);
					}));
		} else {
			console.log('error in upload for url: ' + '\n' + res1.body);
			callback(err);
		}
	});
}
// upload files
router.post(/^\/upload\/*(.*)?$/, function (req, res, next) {
	console.log('upload body:           ***************************\n' + util.inspect(req.body));
/*
	hdfsUpload('e:/tmp/', 'coucou3.txt', basePath, 'hello.txt', function () {
		res.send(['coucou3.txt']);
		res.end();
	});
	return;
	*/
	getLocalFileList(req.params['0'], function (files, err) {
		if (files && files.length) {
			var i = files.length,
			distPath = req.body.path,
			distFileName = null;
			var locPath = req.params['0'].split('/');
			locPath.pop();
			locPath = locPath.join('/') + '/';
			var uploadedFiles = [];
			async.parallel(files.map(function(file) {
				hdfsUpload(locPath, file, distPath, file, function(err) {
					if (!err)
						uploadedFiles.push(file);
					})
			}), function (err){
				if (err)
					console.log(err);
				res.send(uploadedFiles);
				res.end();
			});
		} else
			res.send('PAS DE FICHIER SELECTIONNE<br><br><br>VERIFIEZ LE CHEMIN LOCAL');
	});
});

router.get('/', function (req, res, next) {
	res.render('index', {
		title : 'opérations',
		path : basePath

	});
});

module.exports = router;
