//
// This work is licensed under the Creative Commons Attribution 2.5 License.
//
// To view a copy of this license, visit:
//   http://creativecommons.org/licenses/by/2.5/
//
// or send a letter to:
//   Creative Commons
//   543 Howard Street, 5th Floor
//   San Francisco, California, 94105, USA.
//
// All copies and derivatives of this source must contain the license statement 
// above and the following attribution:
//
// Author: Kyle Scholz      http://kylescholz.com/
// Copyright: 2006
//

/**
 * HTMLGraphView
 * 
 * @author Kyle Scholz 
 * 
 * @version 0.3.1
 * 
 * Represents a view on a GraphModel. This implementation supports HTML-DOM
 * elements only.
 * 
 * @param {Number} frameLeft
 * @param {Number} frameTop
 * @param {Number} frameWidth
 * @param {Number} frameHeight
 */
var HTMLGraphView = function( frameLeft, frameTop, frameWidth, frameHeight, skewView ) {
	this.initialize( frameLeft, frameTop, frameWidth, frameHeight, skewView );
};
HTMLGraphView.prototype = {

	/*
	 * Initialize the view.
	 * 
	 * @param {Number} frameLeft
	 * @param {Number} frameTop
	 * @param {Number} frameWidth
	 * @param {Number} frameHeight
	 */
	initialize: function( frameLeft, frameTop, frameWidth, frameHeight, skewView ) {

		this.frameLeft = frameLeft;
		this.frameTop = frameTop;

		this.skewView = skewView;

		this['nodes'] = {};

		if ( skewView ) {
			this.skew = frameWidth/frameHeight;
		} else {
			this.skew = 1;
		}

		// Store properties of edges (ie: visibility)
		this['edges'] = {};

		this.setSize( frameWidth, frameHeight );

		this.defaultEdgeProperties = {
			'pixelColor': '#c4c4c4',
			'pixelWidth': '2px',
			'pixelHeight': '2px',
			'pixels': 4
		}
	},

	/*
	 * 
	 * @param {Number} frameWidth
	 * @param {Number} frameHeight
	 */
	setSize: function( frameWidth, frameHeight ) {
		this.frameWidth = frameWidth;
		this.frameHeight = frameHeight;

		this.centerX = parseInt(frameWidth/2);
		this.centerY = parseInt(frameHeight/2);		

		if ( this.skewView ) {
			this.skew = frameWidth/frameHeight;
		} else {
			this.skew = 1;
		}
	},

	/*
	 * Add a node to the view. 
	 *
	 * @param {Particle} particle
	 * @param {DOMNode} domElement
	 * @param {Number} centerOffsetX
	 * @param {Number} centerOffsetY
	 */
	addNode: function( particle, domElement, centerOffsetX, centerOffsetY ) {
		document.body.appendChild(domElement);
		domElement.style.zIndex=10;
		if ( centerOffsetX == null ) {
			centerOffsetX = parseInt( domElement.offsetWidth/2 );
		}
		if ( centerOffsetY == null ) {
			centerOffsetY = parseInt( domElement.offsetHeight/2 );
		}

		this.nodes[particle.id] = {
			domElement: domElement,
			centerX: centerOffsetX,
			centerY: centerOffsetY
		}

		this.drawNode(particle);
		
		return domElement;
	},

	/*
	 * Add an edge to the view.
	 * 
	 * @param {Particle} particleA
	 * @param {Particle} particleB
	 */
	addEdge: function( particleA, particleB, edgeProperties ) {

		if ( !this['edges'][particleA.id] ) {
			this['edges'][particleA.id]={};
		}

		if ( !this['edges'][particleA.id][particleB.id] ) {		
			// create the "pixels" used to draw the edge
			var edgePixels = new Array();

			if ( !edgeProperties ) {
				edgeProperties = this.defaultEdgeProperties;
			}
		
			var pixelCount = edgeProperties.pixels;

			for ( var k=0, l=pixelCount; k<l; k++ ) {
				var pixel = document.createElement('div');
				pixel.style.width = edgeProperties.pixelWidth;
				pixel.style.height = edgeProperties.pixelHeight;
				pixel.style.backgroundColor = edgeProperties.pixelColor;
				pixel.style.position = 'absolute';
				pixel.innerHTML="<img height=1 width=1/>";
				edgePixels.push( pixel );
				document.body.appendChild(pixel);
			}

			this['edges'][particleA.id][particleB.id] = {
				source: particleA,
				target: particleB,
				edge: edgePixels
			}
			return edgePixels;
		} else {
			return this['edges'][particleA.id][particleB.id].edge;
		}
	},
	
	/*
	 * Draw a node at it's current position.
	 *
	 * @param {Particle} particle
	 */
	drawNode: function( particle ) {
		var domNodeProps = this['nodes'][particle.id];
		if ( domNodeProps ) {
			var domNode = domNodeProps.domElement;
	
			domNode.style.left = (particle.positionX*this.skew) + this.centerX - domNodeProps.centerX + this.frameLeft + 'px';
			domNode.style.top = particle.positionY + this.centerY - domNodeProps.centerY + this.frameTop + 'px';
	
			var e = this.edges[particle.id];
			for ( var t in e ) {
				this.drawEdge( particle, e[t]['target'] );
			}
		}
	},

	/*
	 * Draw an edge at it's current position.
	 * 
	 * @param {Particle} nodeI
	 * @param {Particle} nodeJ
	 */
	drawEdge: function ( nodeI, nodeJ ) {
		// get a distance vector between nodes
		var dx = nodeI.positionX - nodeJ.positionX;
		var dy = nodeI.positionY - nodeJ.positionY;
if (dx == 0 && dy == 0) return;
		var distance = Math.sqrt( dx*dx	+ dy*dy );
		
		var pixels = this['edges'][nodeI.id][nodeJ.id]['edge'];

		// draw a line between particles using the "pixels"
		for ( var k=0, l=pixels.length; k<l; k++ ) {
			var p = (distance / l) * k;
			pixels[k].style.left=parseInt(nodeI.positionX +(-1)*p*(dx/distance))*this.skew  + this.centerX + this.frameLeft + 'px';
			pixels[k].style.top=parseInt(nodeI.positionY +(-1)*p*(dy/distance) + this.centerY) + this.frameTop + 'px';
		}
	},
	
	/*
	 * Remove everything from the view.
	 */
	clear: function() {
		// first, remove all the edges
		for ( var e in this.edges ) {
			for ( var eb in this.edges[e] ) {
			// get the pixels that make up the edge
				for( var i=0, l=this.edges[e][eb].edge.length; i<l; i++ ) {
					document.body.removeChild( this.edges[e][eb].edge[i] );
				}
			}
		}
		
		this.edges = {};

		// now remove the nodes
		for ( var n in this.nodes ) {
			document.body.removeChild( this.nodes[n].domElement );
		}
		
		this.nodes = {};
	}
}