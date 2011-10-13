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
// Author: Ted Mielczarek	http://ted.mielczarek.org/
// Copyright: 2006
//

/**
 * SVGGraphView
 * 
 * @author Kyle Scholz
 * @author Ted Mielczarek
 * 
 * @version 0.3.1
 * 
 * Represents a view on a GraphModel. This implementation supports SVG
 * elements as well as HTML elements.
 * 
 * Since SVG isn't universally supported, I suggest you offer HTMLGraphView
 * to less-evolved browsers. Try this to assign the appropriate view:
 * 
 * var view;
 * if ( document.implementation.hasFeature("org.w3c.dom.svg", '1.1') ) {
 *     view=new SVGGraphView();
 * } else {
 *     view=new HTMLGraphView();
 * }
 * 
 * @param {Number} frameLeft
 * @param {Number} frameTop
 * @param {Number} frameWidth
 * @param {Number} frameHeight
 */
var SVGGraphView = function( frameLeft, frameTop, frameWidth, frameHeight, skewView ) {
	this.initialize( frameLeft, frameTop, frameWidth, frameHeight, skewView );
};
SVGGraphView.prototype = {

	/*
	 * Initialize the view.
	 * 
	 * @param {Number} frameLeft
	 * @param {Number} frameTop
	 * @param {Number} frameWidth
	 * @param {Number} frameHeight
	 * @param {Boolean} skewView (optional) Indicates whether we should draw on a 'skewed' canvas.
	 */
	initialize: function( frameLeft, frameTop, frameWidth, frameHeight, skewView ) {

		this.frameLeft = frameLeft;
		this.frameTop = frameTop;

		this.skewView = skewView;

		this['nodes'] = {};

		this.skew = 1;
		if ( skewView ) {
			this.skew = frameWidth/frameHeight;
		}

		this['edges'] = {};
		
   		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
   		this.svg.setAttribute("version", "1.1");
   		this.svg.setAttribute("width", frameWidth);
   		this.svg.setAttribute("height", frameHeight);
		var dimString = parseInt(-1*frameWidth/2) + " " + parseInt(-1*frameHeight/2) + " " + frameWidth + " " + frameHeight;
		this.svg.setAttribute("viewBox", dimString);
		document.body.appendChild( this.svg );

		this.eg = document.createElementNS("http://www.w3.org/2000/svg", "g");
  		this.svg.appendChild(this.eg);
	   	this.ng = document.createElementNS("http://www.w3.org/2000/svg", "g");
	   	this.svg.appendChild(this.ng);

		this.setSize( frameWidth, frameHeight );

		this.defaultEdgeProperties = {
			'stroke': '#c4c4c4',
			'stroke-width': '2px',
			'stroke-dasharray': '2,8'			
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

   		this.svg.setAttribute("width", frameWidth);
   		this.svg.setAttribute("height", frameHeight);

		var dimString = parseInt(-1*frameWidth/2) + " " + parseInt(-1*frameHeight/2) + " " + frameWidth + " " + frameHeight;
		this.svg.setAttribute("viewBox", dimString);

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
	 * @param {Number} centerOffsetX, Position of center of domNode relative to 
	 * 		left. If not provided, SVG elements are assumed centered. The center of
	 * 		HTML elements is set to offsetWidth/2.
	 * @param {Number} centerOffsetY, Position of center of domNode relative to 
	 * 		top. If not provided, SVG elements are assumed centered. The center of
	 * 		HTML elements is determined by offsetHeight/2.
	 */
	addNode: function( particle, domElement, centerOffsetX, centerOffsetY ) {
		// With an SVG View Element
		if ( domElement.localName=="circle" || domElement.localName == "text" ) {
			this.ng.appendChild(domElement);
			centerOffsetX = 0;
			centerOffsetY = 0;

		// With an HTML View Element
		} else {
			document.body.appendChild(domElement);
			domElement.style.zIndex=10;
			if ( centerOffsetX == null ) {
				centerOffsetX = parseInt( domElement.offsetWidth/2 );
			}
			if ( centerOffsetY == null ) {
				centerOffsetY = parseInt( domElement.offsetHeight/2 );
			}
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
	 * Add an Edge to the view.
	 * 
	 * @param {Particle} particleA
	 * @param {Particle} particleB
	 */
	addEdge: function( particleA, particleB, edgeProperties ) {
		if ( !this['edges'][particleA.id] ) {
			this['edges'][particleA.id]={};
		}

		if ( !this['edges'][particleA.id][particleB.id] ) {
			var edge = document.createElementNS("http://www.w3.org/2000/svg", "line");
			if ( !edgeProperties ) {
				edgeProperties = this.defaultEdgeProperties;
			}
			for ( p in edgeProperties ) {
				edge.setAttribute( p, edgeProperties[p] );
			}

			this.edges[particleA.id][particleB.id] = edge;
			edge.id = 'edge'+particleA.id+':'+particleB.id;
			this.eg.appendChild(edge);

			this['edges'][particleA.id][particleB.id] = {
				source: particleA,
				target: particleB,
				domEdge: edge
			}
			return edge;
		} else {
			return this['edges'][particleA.id][particleB.id].domEdge;
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
			if( domNode.localName == 'circle' ) {
				domNode.setAttribute('cx', (particle.positionX*this.skew) + 'px');
				domNode.setAttribute('cy', particle.positionY + 'px');
			} else if ( domNode.localName == 'text' ) {
				domNode.setAttribute('x', (particle.positionX*this.skew - domNode.getAttribute("width")) + 'px');
				domNode.setAttribute('y', (particle.positionY - domNode.getAttribute("height")) + 'px');
			} else {
				domNode.style.left = (particle.positionX*this.skew) + this.centerX - domNodeProps.centerX + this.frameLeft + 'px';
				domNode.style.top = particle.positionY + this.centerY - domNodeProps.centerY + this.frameTop + 'px';
			}
	
			var e = this.edges[particle.id];
			for ( var t in e ) {
				this.drawEdge( particle, e[t]['target'] );
			}
		}
	},

	/*
	 * Draw an edge at it's current position.
	 * 
	 * @param {Particle} particleA
	 * @param {Particle} particleB
	 */
	drawEdge: function ( particleA, particleB ) {
		var edge = this.edges[particleA.id][particleB.id]['domEdge'];
		edge.setAttribute('x1', particleA.positionX*this.skew + 'px');
		edge.setAttribute('y1', particleA.positionY + 'px');
		edge.setAttribute('x2', particleB.positionX*this.skew + 'px');
		edge.setAttribute('y2', particleB.positionY + 'px');
	},
	
	/*
	 * Remove everything from the view.
	 */
	clear: function() {
		// first, remove all the edges
		for ( var e in this.edges ) {
			for ( var eb in this.edges[e] ) {
				this.eg.removeChild( this.edges[e][eb].domEdge );
			}
		}

		this.edges = {};

		// now remove the nodes
		for ( var n in this.nodes ) {
			var domElement = this.nodes[n].domElement;
			if ( domElement.localName=="circle" || domElement.localName == "text" ) {
				this.ng.removeChild( domElement );
			} else {
				document.body.removeChild( domElement );
			}
		}		

		this.nodes = {};
	}
}