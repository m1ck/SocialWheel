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
 * Magnet
 * 
 * @author Kyle Scholz
 * 
 * @version 0.3.1
 * 
 * A magnetic force (attractive(+) or repulsive(-)) between two particles.
 * 
 * @param {Particle} a  - A Particle.
 * @param {Particle} b  - The other Particle.
 * @param {Number} g - A gravitational constant (that's right)
 * @param {Number} distanceMin
 */
var Magnet = function( a, b, g, distanceMin ) {
	this.init( a, b, g, distanceMin );
}
Magnet.prototype = {

	/*
	 * Initialize the Magnet Force.
	 *  
	 * @param {Particle} a  - A Particle.
	 * @param {Particle} b  - The other Particle.
	 * @param {Number} g - A gravitational constant (that's right)
	 * @param {Number} distanceMin
	 */
	init: function( a, b, g, distanceMin ) {
		this['a'] = a;
		
		this['b'] = b;
		
		this['g'] = g;
		
		this['distanceMin'] = distanceMin;
		
		this['age'] = 0;
		
		this['forceX'] = 0;

		this['forceY'] = 0;
	},
	
	/*
	 * Apply an attractive or repulsive force based on distance between particles
	 */
	apply: function() {

		// Determine the distance between particles
		var dx = this.a.positionX - this.b.positionX;
		var dy = this.a.positionY - this.b.positionY;
		var distance = Math.sqrt( dx*dx	+ dy*dy );

		if ( distance == 0 ) {
			return;
		} else {
			dx *= (1/distance);
			dy *= (1/distance);
		}

		// Determine the magnetic force.
		var force = this.g * this.a.mass * this.b.mass;
		if (distance < this.distanceMin) {
			force *= 1/(this.distanceMin * this.distanceMin );
		} else {
			force *= 1/(distance * distance);
		}

		// Apply force to vectors
		dx *= force;
		dy *= force;

		// Get the difference since last application 
		var dfx = dx - this.forceX;
		var dfy = dy - this.forceY;

		if (!this.a.fixed && !this.a.selected) {
			this.a.forceX -= dfx;
			this.a.forceY -= dfy;
		}
		
		if (!this.b.fixed && !this.b.selected) {
			this.b.forceX += dfx;
			this.b.forceY += dfy;
		}

		// Update the spring force		
		this.forceX = dx;
		this.forceY = dy;
	}
}	