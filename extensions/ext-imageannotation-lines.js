/*
 * ext-imageannotation-lines.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2012 Moritz Wissenbach
 *
 * Extends svg-edit to act as an annotation tool for images.
 * 
 * This file contains a plugin for rapidly creating line-shaped
 * rectangles.
 */

_IA_CSS_DIR = './';

imageannotation = {
	
	/* the initial height of a new line */
	lineHeight : 120,

	text : [
		{ 'id' : 'line1',
		  'content' : 'Ich heisse der Mangel'},
		{ 'id' : 'line2',
		  'content' : 'Ich heisse die Sorge'}
	],

	links :{
		text_image : {},
		image_text: {}
	},

	selectedLine : null,

	makeLink : function (lineid, elementid) {
		imageannotation.links.text_image[lineid] = elementid;
		imageannotation.links.image_text[elementid] = lineid;
	},
	
	breakLink : function (lineid, elementid) {
		imageannotation.links.text_image[lineid] = null;
		imageannotation.links.image_text[elementid] = null;	
	}
};


// apply additional CSS styles
$(document).ready(function () {
    $('head').append('<link rel="stylesheet" href="' + _IA_CSS_DIR + 'ext-imageannotation.css" type="text/css" />');

	//override some existing styles
	$('#layerpanel').css({position: 'relative'});
	//	$('#sidepanels').css({width: '300'});
});

svgEditor.addExtension("Image Annotation", function() {

	// extend web page by some UI elements
	var extendUI = function() {
		$('#sidepanels').append(
			'<div id="textpanel">' +
				'</div>');

	};
	
	extendUI();

	var hideUI = function() {
		var hide = '#tool_text, #tool_image, #tool_eyedropper, #tools_bottom_2, #tools_bottom_3';
		$(hide).css({display: 'none'});
	};
	
	hideUI();

	return {
		name: "Image Annotation",
		svgicons: "extensions/ext-imageannotation-icons.svg",
		buttons: [{
			// Must match the icon ID in icon xml
			id: "ext_imageannotation_lines", 
			// This indicates that the button will be added to the "mode"
			// button panel on the left side
			type: "mode", 
			
			// Tooltip text
			title: "Create lines", 
			
			// Events
			events: {
				'click': function() {
					// The action taken when the button is clicked on.
					// For "mode" buttons, any other button will 
					// automatically be de-pressed.
					svgCanvas.setMode("create_line");
				}
			}
		}],

		/* Copied from svgcanvas.js, mouseUp() */
		fadeIn: function(element) {
			var svgns = "http://www.w3.org/2000/svg";

			// var opac_ani = document.createElementNS(svgns, 'animate');
			// $(opac_ani).attr({
			// 	attributeName: 'opacity',
			// 	begin: 'indefinite',
			// 	dur: 1,
			// 	fill: 'freeze'
			// }).appendTo(svgroot);

			// Filter doesn't work in Chrome
			// var opac_ani = $(svgCanvas.getRootElem()).find('animate').filter('*[attributeName=opacity]')[0];

			var animate_elems = $(svgCanvas.getRootElem()).find('animate');
			for (var i = 0; i < animate_elems.length; i++) { 
				var ae = animate_elems[i]; opac_ani = ae.hasAttribute('attributeName') 
					&& ae.attributes.getNamedItem('attributeName').value === 'opacity' 
			
					? ae : null
			}

			var ani_dur = 1, c_ani;
			if(opac_ani && opac_ani.beginElement 
			   && element.getAttribute('opacity') != svgCanvas.getOpacity()) {
				c_ani = $(opac_ani).clone().attr({
					to: svgCanvas.getOpacity(),
					dur: ani_dur
				}).appendTo(element);
				try {
					// Fails in FF4 on foreignObject
					c_ani[0].beginElement();
				} catch(e){}
			} else {
				ani_dur = 0;
			}
			
			// Ideally this would be done on the endEvent of the animation,
			// but that doesn't seem to be supported in Webkit
			setTimeout(function() {
				if(c_ani) c_ani.remove();
				element.setAttribute("opacity", svgCanvas.getOpacity());
				element.setAttribute("style", "pointer-events:inherit");
				svgCanvas.cleanupElement(element);
				// if(svgCanvas.getMode  === "path") {
				// 	pathActions.toEditMode(element);
				// } else {
				// 	if(curConfig.selectNew) {
				// 		selectOnly([element], true);
				// 	}
				// }
				// we create the insert command that is stored on the stack
				// undo means to call cmd.unapply(), redo means to call cmd.apply()
				// addCommandToHistory(new InsertElementCommand(element));
				
				// call("changed",[element]);
			}, ani_dur * 1000);

		},

		
		mouseDown: function(opts) {
			var mode = svgCanvas.getMode();
			if (mode == "create_line") {
				var e = opts.event;
				var target = e.target;
				if ($.inArray(target.nodeName, ['rect']) > -1) {
					
					//svgCanvas.transformPoint(target.x.baseVal.value, )
					
					var lineShape = svgCanvas.addSvgElementFromJson({
						"element": "rect",
						"curStyles": true,
						"attr": {
							"x": 0,//target.x.baseVal.value,
							"y": 0,//target.y.baseVal.value,
							"width": target.width.baseVal.value,
							"height": imageannotation.lineHeight,
							"id": svgCanvas.getNextId(),
							"class": 'imageannotationLine',
							"opacity": 0
						}
					});

					//just a helper something for the alignment
					var littleHelper = svgCanvas.addSvgElementFromJson({
						"element": "rect",
						"curStyles": true,
						"attr": {
							"x": 1,
							"y": 1,
							"width": 1,
							"height": 1,
							"id": svgCanvas.getNextId(),
							"opacity": 0
						}
					});


					var matrix =  svgedit.math.getMatrix(target);
					var rotAngle = svgedit.utilities.getRotationAngle(target);
					var evtPoint = svgedit.math.transformPoint(opts.start_x, opts.start_y, matrix.inverse());


					/* some of this might seem superfluous, but it fixes some strange behavior of the selection box */
					svgCanvas.clearSelection();					
					svgCanvas.addToSelection([target, littleHelper]);
					svgCanvas.alignSelectedElements('m', 'largest');
					svgCanvas.alignSelectedElements('c', 'largest');

					svgCanvas.clearSelection();
					svgCanvas.addToSelection([lineShape, littleHelper]);
					svgCanvas.alignSelectedElements('m', 'smallest');
					svgCanvas.alignSelectedElements('c', 'smallest');

					svgCanvas.clearSelection();
					svgCanvas.addToSelection([lineShape]);

					svgCanvas.setRotationAngle(rotAngle, true);
					
					svgCanvas.assignAttributes(lineShape, 
											   {
												   'y' : evtPoint.y - imageannotation.lineHeight
											   });

					this.fadeIn(lineShape);

					svgCanvas.clearSelection();					
					svgCanvas.addToSelection([littleHelper]);
					svgCanvas.deleteSelectedElements();

					svgCanvas.clearSelection();
					svgCanvas.addToSelection([lineShape], true);

					// tell the world
					svgCanvas.runExtensions('imageannotation_shape_created', lineShape);
				} 				
			}
		},

		elementChanged: function(opts) {
			
			// has a line changed its height
			if (opts.elems && opts.elems.length > 0 
				&& opts.elems[0]) {					
				if (opts.elems[0].className.baseVal.indexOf('imageannotationLine') >= 0) {
					// save its heigth for the next line to be created
					imageannotation.lineHeight = opts.elems[0].height.baseVal.value;
				}
			}
		}
	};
});

