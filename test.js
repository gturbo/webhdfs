// test file operations
var fs = require('fs');
var inspect = require('util').inspect;
var dump = function(o) {console.log(inspect(o));};


var path ="/tmp/test";

fs.readdir(path, function(err,files){
    files.map(function(f){
        fs.stat(path + '/' + f, function(err,stat){
            console.log('file ' + f);
            dump(stat);
        })
    })
});
