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
 * Timer
 * 
 * @author Kyle Scholz
 * 
 * @version 0.3.1
 * 
 * Timer with very rough throttle.
 * 
 * @author Kyle Scholz
 */
var Timer = function( timeout ) {
	this.init( timeout );
};
Timer.prototype = {

	/*
	 * Initialize the Timer with the indicated timeout.
	 * 
	 * @param {Object} timeout
	 */
	init: function( timeout ) {
		this['timer'];
		this['TIMEOUT'] = timeout;
		this['BASE_TIMEOUT'] = timeout;
		this['interupt'] = true;
		this['subscribers'] = new Array();
		this['ontimeout'] = new EventHandler( this,
			// notify subscribers and restart timer
			function() {
				this.notify();
				if ( !this.interupt ) { this.start(); }
			}
		);
	},

	/*
	 * Start the Timer.
	 */
	start: function() {
		this['interupt']=false;
		this['timer'] = window.setTimeout(this.ontimeout,this['TIMEOUT']);
	},

	/*
	 * Stop the Timer.
	 */
	stop: function() {
		this['interupt']=true;
	},

	/*
	 * Subscribe an observer.
	 */
	subscribe: function( observer ) {
		this.subscribers.push( observer );
	},

	/*
	 * Notify observers when a tick event has occured.
	 */
	notify: function() {
		for( var i=0; i<this.subscribers.length; i++ ) {
			var entropy = this.subscribers[i].update();

			if ( entropy != null ) {
				this['TIMEOUT']=entropy;
			}
		}
	}
}