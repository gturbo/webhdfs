$(function () {
	var response = $('#response');
	var path = $('#path')[0];
	$('#list').click(function(e) {
		$.ajax({
			url : 'list/' + path.value,
			success : function (data) {
				var ls = $.parseJSON(data);
				var files = ls.FileStatuses.FileStatus;
				var txt="";
				$.each(files, function(i,f){
					txt+= f.type + " <strong>" + f.pathSuffix
					+ "</strong> length:" + f.length
					+ " owner:" + f.owner
					+ '<br>';
				})
				response.html(txt);
			},
			error : function (xhr, type) {
				response.html('<h1>error in request see console</h1>');
			}
		});
	});


	var locPath = $('#loc-path')[0];
	$('#loc-list').click(function(e) {
	$.ajax({
		url : 'loc-list/' + locPath.value,
		success : function (files) {
			var txt="";
			$.each(files, function(i,f){
				txt+="<strong>" + f	+ "</strong><br>";
			})
			response.html(txt);
		},
		error : function (xhr, type) {
			response.html('<h1>error in request see console</h1>');
		}
	});
});

})
