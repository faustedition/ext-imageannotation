/*
 * ext-server_opensave_faust.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Alexis Deveria
 *
 */

svgEditor.addExtension("server_opensave", {
	callback: function() {

		var urldata = $.deparam.querystring(true);

		var url = urldata.url;
	
		svgEditor.setCustomHandlers({
			save: function(win, data) {

				var svg = "<?xml version=\"1.0\"?>\n" + data;
				console.log('saving');
				$.ajax({
					'url': url,
					// 'dataType': 'svg',
					// 'accepts': {'svg' : 'image/svg'},
					contentType:'image/svg+xml',
					'type': 'PUT',
					'data': svg,
					success: function(str) {
					
					},
					error: function(xhr, stat, err) {
						alert('WARNING! Could NOT save data! ' + err);
					}
				});

			}
		});
	}
});

