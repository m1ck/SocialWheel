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
 * Particle
 * 
 * @author Kyle Scholz
 * 
 * @version 0.3.1
 * 
 * A Particle in our model.
 * 
 * @param {Number} mass
 * @param {Number} positionX
 * @param {Number} positionY
 */
var Particle = function( mass, positionX, positionY ){
	this.init( mass, positionX, positionY );
}
Particle.prototype = {
	
	/*
	 * Initialize
	 * 
	 * @param {Object} mass
	 * @param {Object} position
	 */
	init: function( mass, positionX, positionY ) {

		this['positionX'] = positionX;
		this['positionY'] = positionY;

		this['originalPositionX'] = positionX;
		this['originalPositionY'] = positionY;

		this['lastDrawPositionX'] = 0;
		this['lastDrawPositionY'] = 0;

		this['mass'] = mass;
	
		this['forceX'] = 0;
		this['forceY'] = 0;

		this['velocityX'] = 0;
		this['velocityY'] = 0;

		this['originalVelocityX'] = 0;
		this['originalVelocityY'] = 0;

		this['fixed'] = false;

		this['selected'] = false;
		
		this['age'] = 0;
		
		// we use width and height for bounds checking	
		this['width'] = 0;	

		this['height'] = 0;	
	}
}