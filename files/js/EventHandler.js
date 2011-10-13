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
 * EventHandler
 * 
 * @author Kyle Scholz
 * 
 * @version 0.3.1
 * 
 * A factory for producing event handlers w/ contextual scope.
 * 
 * @param {Object} _caller: an object with scope needed by handler
 * @param {Object} _handler: an event handler function
 * 
 * Any additional arguments will be passed to _handler. The source event will be
 * the last argument in the list if it's available.
 */
var EventHandler = function( _caller, _handler ) {
	var args=new Array();
	for( var i=2; i<arguments.length; i++ ) {
		args.push( arguments[i] );
	}
	return( function( e ) {
			if( e ) { args.push(e); }
			_handler.apply( _caller, args );
	} );
};