YUI().use('node', 'event', 'io', 'json', function(Y) {

	// first request the text content/lines
	// then the svg data
	// (the svg data contains references to the text)

	var svgURL = window.parent.location.href.split('?')[0];

	var textContentURL;

	// parse url parameters for location of lines
	var urldata = $.deparam.querystring(true);
	if(!$.isEmptyObject(urldata)) {
		if(urldata.imageannotation_text) {
			textContentURL = urldata.imageannotation_text;
		} else {
			textContentURL = top.path;
		}
		if(urldata.url) {
			svgURL = urldata.url;
		}
	}

	function textSuccess(transactionid, response) {
		$.unblockUI();
		var content = Y.JSON.parse(response.responseText);
		var ll = imageannotationLines;

		Y.each(content.lines, function(l) {
			ll.add(l)
		});
		
		svgOpts = {
			callback: function() {
				// zoom and center (this should be a function in SvgCanvas ...)
				$('#fit_to_canvas').trigger('mouseup');
				// ready for edition
				$.unblockUI();
			}
		}

		$.blockUI({ message: '<h1>Loading SVG data...</h1>' });
		svgEditor.loadFromURL(svgURL, svgOpts);	
	}

	var textCfg = {
		headers: {
			'Accept': 'application/json',
		},
		on: {
			success: textSuccess
		}
		
	}

	$.blockUI({ message: '<h1>Loading text data...</h1>' });
	Y.io (textContentURL, textCfg);
});