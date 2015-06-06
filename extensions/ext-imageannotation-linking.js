/*
 * ext-imageannotation-linking.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2012 Moritz Wissenbach
 *
 * ext-imageannotation extends svg-edit to act as an annotation
 * tool for images.
 *
 * This file contains model and UI for linking any SVG element
 * with a line of text.
 */


/**
 * This global variable holds an instance of Y.LineList and should be the 
 * the interface for other plugins
 **/

var imageannotationLines;
var imageannotationView;
var imageannotationNS = 'http://www.w3.org/1999/xlink';
var imageannotationAttr = 'href';


YUI().use('model', 'model-list', 'view', 'node', 'event', 'io', 'json', function(Y) {

	// MODEL

	Y.LineModel = Y.Base.create ('lineModel', Y.Model, [], {}, {
		ATTRS:  {
			
			id: {value: null},

			info:{value: null},

			linkedWith: {value: null},
			
			text: {value: ' --- line ---'}
		}
	});
	
    Y.LineList = function(config) {

        Y.LineList.superclass.constructor.apply(this, arguments);

		this._linkedWith = {};

		this.linkedWith = function(shapeId) {
			return this._linkedWith[shapeId]
		};

		this.on ('add', function (e) {
			this._linkedWith [e.model.get('linkedWith')] = e.model;
		});
		
		this.on ('*:change', function (e) {
			if (e.changed.linkedWith) {
				delete this._linkedWith[e.changed.linkedWith.prevVal];
				this._linkedWith[e.changed.linkedWith.newVal] 
					= e.target;
			}			
		});
	}
	
	Y.extend (Y.LineList, Y.ModelList, {
		
		name: 'lineList',
		
		model: Y.LineModel,

	});

	// VIEW


	Y.LinesView = Y.Base.create('linesView', Y.View, [], {

		events: {
			'#toggleLink': {click: 'toggleLink'},
			'#linesView' : {change: 'selectLine'}
		},
		
		selectLine: function (e){
			// save the selection for redrawing
			this.lastSelected = this.container.one('#linesView').get('value'); 
			this.getSelectedLineModel()

			var linkedShape = this.getSelectedLineLinkedShape();
			if (linkedShape !== null) {
				svgCanvas.clearSelection();
				svgCanvas.addToSelection([linkedShape]);
			}
			this.adjustUI();
		},
		lastSelected : '',

		getSelectedLineLinkedShape: function() {
			
			var line = this.getSelectedLineModel();
			if (line !== null) {
				var id = line.get('linkedWith');
				if (id) {
					var linkedShape = svgCanvas.getElem(id);
					if (linkedShape) 
						return linkedShape;
					// else 
					// 	// the shape doesn't exist (anymore), remove the link from the model
					// 	line.set('linkedWith', null);
				}
			}
			return null;
		},
		
		adjustUI: function() {
			if (this.getSelectedLineLinkedShape())
				var buttonCaption = 'Unlink';
			else
				var buttonCaption = 'Link';

			var toggleLink = this.container.one('#toggleLink');
			toggleLink.set('text', buttonCaption);
			toggleLink.set('title', buttonCaption + ' the selected element with the selected shape.');


		},

		getSelectedLineModel : function() {
			try {
				var id = this.container.one('#linesView').get('value');
			} catch (e) {
				return null;
			}
			var line = this.modelList.getById(id);
			return line;
		},

		toggleLink: function () {
			var line = this.getSelectedLineModel();
			if (line === null)
				return;

			var newLink = null;
			if (!line.get('linkedWith')) {
				var selection = svgCanvas.getSelectedElems();
				if (selection && selection.length > 0 && selection[0] && selection[0].id) {	
					newLink = selection[0].id;
				}

			}
			line.set('linkedWith', newLink);
		},

		initializer: function (config) {

			if (config && config.modelList) {
				this.modelList = config.modelList;
				this.modelList.after(['add', 'remove', 'reset', '*:change'], this.render, this);
			}

			// Build UI
			var container = this.container;
			container.empty();
			container.append('<h3>Text</h3>');
			container.append('<button id="toggleLink">Link</button>');
			container.append('<select id="autoLink">' + 
							 '<option title="Do not link new shapes on creation">Automatic linking off</option>' + 
							 '<option title="Link new shapes on creation" style="background-color: yellow"'+
							 '>Automatic linking on</option>' +
							 '</select><br/>');

			
			var size = Math.max(this.modelList.size(), 10);
			var list = Y.Node.create('<div style="height: 100%"><select id="linesView" size="'
									 + parseInt(size) + '"></select></div>');
			container.append(list);
		},



		// (YUI/jQuery can't process SVG elements)
		// pass jQuery elements
		modifyClasses: function (elements, remove, add) {
			$(elements).each(function(i, e) {

				var result = '';
				var classes = $(e).attr('class');
				//var classes = e.attributes['class'];
				if (classes !== null) {
					var split = classes.split(' ');
					for (i=0; i < split.length; i++)
						if (! (split[i] === remove || split[i] === add))
							result += ' ' + split[i];
					result += ' ' + add;
				$(e).attr('class', result);
				}
			});
		},

		render: function () {

			$('#svgcontent').find('rect').each(function(i, e) {
				if (e.hasAttributeNS(imageannotationNS, imageannotationAttr))
					e.removeAttributeNS(imageannotationNS, imageannotationAttr);
			});

			this.modifyClasses('.imageannotationLinked', 'imageannotationLinked', '');
			
			var that = this;
			var list = this.container.one('#linesView');
			list.empty();
			this.modelList.each(function(lineModel) {
				var value = lineModel.get('id');
				var linkedWith = lineModel.get('linkedWith');
				if (linkedWith) {
					var linkedWithShape = svgCanvas.getElem(linkedWith);
					if (!linkedWithShape) {
						lineModel.set('linkedWith', null);
						return;						
					} else {
						that.modifyClasses(linkedWithShape, '', 'imageannotationLinked');
						linkedWithShape.setAttributeNS(imageannotationNS, imageannotationAttr, value);
					}

				}
				var cssClass = linkedWith ? 'class="linked"' : '';
				var prefix = linkedWith ? '\u2713 ' : '. ';
				list.append('<option value="' + value + '" ' + cssClass + ' >' + prefix 
							+ lineModel.get('text') + '</option>');
			});
			this.container.one('#linesView').set('value', this.lastSelected);
			this.adjustUI();
		}
	});

	imageannotationLines = new Y.LineList();

 	svgEditor.addExtension("imageannotation-linking", function() {
		return {
			elementChanged: function(opts) {
				
				// has a new SVG been loaded?
				if (opts.elems && opts.elems.length > 0 
					&& opts.elems[0].getAttribute('id') == 'svgcontent') {					

					// transfer the link information from the SVG into the model first!
					$('#svgcontent').find('rect').each(function(index, elem){
						var link = elem.getAttributeNS(imageannotationNS, imageannotationAttr);
						if (link !== null && link.charAt(0) === "#") {
							var id = link.substr(1);
							if (imageannotationLines.getById(id))
								imageannotationLines.getById(id).set('linkedWith', elem.getAttribute('id'));
						}
					});

					// this will dispose of the links in the SVG
					imageannotationView = new Y.LinesView({
						container: Y.one('#textpanel'),
						modelList: imageannotationLines
					});
					imageannotationView.render();

						
				}
				// has an element been deleted?
				else if (! opts.elems
						 .map(function(e){return Boolean(e && svgCanvas.getElem(e.id))})
						 .reduce(function(e,f){e && f}))
					imageannotationView.render();
			},
			// if autolink mode is on, find the first unlinked line,
			// counting from the selected one, and link it
			imageannotation_shape_created: function(shape) {
				if (imageannotationView.container.one('#autoLink').get('value') === 'Automatic linking on') {
					var selected = imageannotationView.getSelectedLineModel();
					var index = selected ? imageannotationLines.indexOf(selected) : 0;
					var unlinkedLine;
					for (var i=index; i < imageannotationLines.size() && !unlinkedLine; i++) {
						if (!imageannotationLines.item(i).get('linkedWith'))
							unlinkedLine = imageannotationLines.item(i);
					}
					if (unlinkedLine)
						unlinkedLine.set('linkedWith', shape.getAttribute('id'));

				}
				
			}
		}
	});

});
