$(function () {

	// Simple JavaScript Templating
	// John Resig - http://ejohn.org/ - MIT Licensed
	(function () {
		var cache = {};

		$.tpl = function tpl(str, data) {
			// Figure out if we're getting a template, or if we need to
			// load the template - and be sure to cache the result.
			var fn = !/\W/.test(str) ?
				cache[str] = cache[str] ||
				tpl(document.getElementById(str).innerHTML) :

				// Generate a reusable function that will serve as a template
				// generator (and which will be cached).
				new Function("obj",
					"var p=[],print=function(){p.push.apply(p,arguments);};" +

					// Introduce the data as local variables using with(){}
					"with(obj){p.push('" +

					// Convert the template into pure JavaScript
					str
					.replace(/[\r\t\n]/g, " ")
					.split("<%").join("\t")
					.replace(/((^|%>)[^\t]*)'/g, "$1\r")
					.replace(/\t=(.*?)%>/g, "',$1,'")
					.split("\t").join("');")
					.split("%>").join("p.push('")
					.split("\r").join("\\'")
					 + "');}return p.join('');");
			// Provide some basic currying to the user
			return data ? fn(data) : fn;
		};
	})();

	// load templates in background
	$.get('/templates/menu.tpl', function (data, status, xhr) {
		$('body').append(data);
		refreshList(); // init remote list
	});
	// load modal dialogs in background
	$.get('/javascripts/pgwmodal.js', function (data, status, xhr) {
		var s = document.createElement("script");
		s.setAttribute("type", "text/javascript")
		s.innerHTML = data;
	});

	var response = $('#response');

	var $path = $('#path'),
	path = $path[0];
	// handle remote path change detection and refresh response if needed
	var pathChange = {
		old : path.value,
	}

	var pathChangeHandler = function () {
		//console.log('pathChangeHandler');
		if (!pathChange.interval && pathChange.old != path.value) {
			pathChange.last = path.value
				//console.log('pathChangeHandler 1 last '+pathChange.last + ' value ' + path.value);
				pathChange.interval = setInterval(function () {
					//console.log('intervel start last '+pathChange.last + ' value ' + path.value);
					if (path.value == pathChange.last) { // stop
						//console.log('intervel stop '+pathChange.last + ' value ' + path.value);
						clearInterval(pathChange.interval);
						if (pathChange.old != path.value) { // real change
							refreshList();
						}
						delete pathChange.interval;

					} else {
						pathChange.last = path.value;
					}
				}, 500);
		};
	}

	$path.on('keyup', pathChangeHandler);
	// LIST REMOTE DIRECTORY HANDLER
	var refreshList = function () {
		$.ajax({
			url : 'list/' + path.value,
			success : function (data) {
				var ls = $.parseJSON(data);
				if (ls.RemoteException) {

					var txt=$.tpl('tplFolderNotExists', ls);
					response.html(txt);
					return;
				}
				if (!ls.FileStatuses) {
					response.html("<h1 class='red'>VIDE</h1>");
					return;
				}
				var files = ls.FileStatuses.FileStatus;
				var txt = "";
				$.each(files, function (i, f) {
					if (f.type == 'FILE')
						txt += $.tpl('tplFile', f);
					else
						txt += $.tpl('tplFolder', f);
				})
				response.html(txt);
				pathChange.old = path.value;
			},
			error : function (xhr, type) {
				response.html('<h1>error in request see console</h1>');
			}
		});
	};
	$('#list').click(refreshList);

	// LIST LOCAL DIRECTORY HANDLER
	var $locPath = $('#loc-path'),
	locPath = $locPath[0];
	// handle local path change detection and refresh response if needed
	var locPathChange = {
		old : locPath.value,
	}
	var refreshLocList = function () {
		$.ajax({
			url : 'loc-list/' + locPath.value,
			success : function (files) {
				var txt = "";
				$.each(files, function (i, f) {
					txt += $.tpl('tplLocFile', {
						name : f
					});
				})
				response.html(txt);
				locPathChange.old = locPath.value;
			},
			error : function (xhr, type) {
				response.html('<h1>error in request see console</h1>');
			}
		});
	}
	var locPathChangeHandler = function () {
		if (!locPathChange.interval && locPathChange.old != locPath.value) {
			locPathChange.last = locPath.value
				locPathChange.interval = setInterval(function () {
					if (locPath.value == locPathChange.last) { // stop
						clearInterval(locPathChange.interval);
						if (locPathChange.old != locPath.value) { // real change
							refreshLocList();
						}
						delete locPathChange.interval;

					} else {
						locPathChange.last = locPath.value;
					}
				}, 500);
		};
	}

	$locPath.on('keyup', locPathChangeHandler);
	$('#loc-list').click(refreshLocList);

	// UPLOAD HANDLER

	$('#upload').click(function (e) {
		$.ajax({
			type : 'POST',
			url : 'upload/' + locPath.value,
			success : function (files) {
				var txt = "UPLOADED FILES:<br>";
				$.each(files, function (i, f) {
					txt += "<strong>" + f + "</strong><br>";
				})
				response.html(txt);
				setTimeout(refreshList,1500);
			},
			contentType : 'application/json',
			data : JSON.stringify({
				path : path.value
			}),
			error : function (xhr, type) {
				response.html('<h1>error in request see console</h1>');
			}
		});
	});

	var deleteFiles = function(file, path2) {
		path2 = path2 || path.value;
		$.ajax({
			type : 'DELETE',
			url : 'delete/' + path2,
			success : function (files) {
				var txt = "<h2>DELETED " + (file ? 'FILE' : 'FOLDER') +'</h2>';
				response.html(txt);
				setTimeout(refreshList,1500);
			},
			contentType : 'application/json',
			data : file ? JSON.stringify({
				file : file
			}) : null,
			error : function (xhr, type) {
				response.html('<h1>error in request see console</h1>');
			}
		});		
	};

	response.on('click','span[data-glyph="delete"]', function(e) {
		var fileName = $(e.target).attr('fileName');
		if(fileName) {
			deleteFiles(fileName);	
		}
		var dirName = $(e.target).attr('dirName');
		if(dirName) {
			if (path.value.slice(-1) != '/')
				path.value = path.value + '/';
			deleteFiles(null, path.value + dirName);	
		}
		
	});

	var mkdir = function(evt,path2) {
		path2 = path2 || path.value;
		$.ajax({
			type : 'PUT',
			url : 'mkdir/' + path2,
			success : function (files) {
				var txt = '<h2>FOLDER CREATED</h2>';
				response.html(txt);
			},
			error : function (xhr, type) {
				response.html('<h1>error in request see console</h1>');
			}
		});		
	}
	response.on('click', '.mkdir', mkdir);

})
