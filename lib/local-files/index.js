var fs = require('fs');
var request = require('request');
var async = require("async");
var debug = require('debug');

function addStats(files, path, callback) {
    var list = [];
    async.parallel(files.map(function (fileName) {
        return function(cb) {
            fs.stat(path + '/' + fileName, function(err, stats){
                if (err)
                    cb(err);
                else {
                    list.push({
                        name: fileName,
                        isDir:stats.isDirectory(),
                        mode: stats.mode,
                        size: stats.size,
                        creation: stats.ctime.getTime(),
                        lastModify: stats.mtime.getTime(),
                        uid: stats.uid,
                        gid: stats.gid
                    });
                    cb();
                }
            })
        };
    }), function (err) {
        debug('addStats end of all handlers\n%s',list);
        if (err) {
            console.log(err);
        }
        callback(list,err);
    });
}


exports.getFileList = function (path, callback) {
    debug('final path: %s', path);
    fs.readdir(path, function (err, files) {
        if (err) {
            // try with file mask
            if (err.code == 'ENOENT') {
                // not a directory entry try to extract file pattern at the end and truncate path to parent directory
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
                //			console.log('path:' + path + " pattern: " + pattern + " escaped: " + escPattern);
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
                        addStats(filtFiles, path, callback);
                    }
                });
            } else {
                console.log(err);
                callback(null, err);
            }
        } else {
            //	console.log(util.inspect(files));
            addStats(files, path, callback);
        }
    });

}
