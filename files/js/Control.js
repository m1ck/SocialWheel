/**
 * @author Kyle Scholz
 */

var Control = function( particleModel, view ) {
	this.initialize( particleModel, view );
}
Control.prototype = {
	
	initialize: function( particleModel, view ) {
		
		this.particleModel = particleModel;
		this.view = view;
		
		this.selectedParticle = null;

		// attach an onresize event
	    window.onresize = new EventHandler( this, this.handleResizeEvent );

		if (window.Event) {
			document.captureEvents(Event.MOUSEMOVE);
		}

		// attach an onmousemove event
	    document.onmousemove = new EventHandler( this, this.handleMouseMoveEvent );

		// attach an onmouseup event
	    document.onmouseup = new EventHandler( this, this.handleMouseUpEvent );
	},
	
	handleResizeEvent: function() {
	    var FRAME_WIDTH;
	    var FRAME_HEIGHT;
				
	    if (document.all) {
	      FRAME_WIDTH = document.body.offsetWidth - 5;
	      FRAME_HEIGHT = document.documentElement.offsetHeight - 5;
	    } else {
	      FRAME_WIDTH = window.innerWidth - 5;
	      FRAME_HEIGHT = window.innerHeight - 5;
	    }

		this.view.setSize( FRAME_WIDTH, FRAME_HEIGHT );
		this.particleModel.integrator.setSize( FRAME_WIDTH, FRAME_HEIGHT, this.view.skew );
//		this.particleModel.draw( true );
		this.particleModel.reset();
	},
	
	handleMouseMoveEvent: function( e ) {

		if ( this.selected && !this.particleModel.particles[this.selected].fixed ) {

			// TODO: This is a very temporary fix. In Firefox 2, our EventHandler
			// factory piles mouse events onto the arguments list.
			e = arguments[arguments.length-1];
			
			var mouseX;
			var mouseY;
			if (window.Event) {
				mouseX = e.pageX;
				mouseY = e.pageY;
			} else {
				mouseX = event.clientX;
				mouseY = event.clientY;				
			}
//			var mouseX = e.pageX ? e.pageX : e.clientX;
//			var mouseY = e.pageY ? e.pageY : e.clientY;

			mouseX -= this.view.centerX;
			mouseY -= this.view.centerY;

			// set the node position
			this.particleModel.particles[this.selected].positionX=mouseX/this.view.skew;
			this.particleModel.particles[this.selected].positionY=mouseY;

			this.particleModel.tick();
	    }		
	},
	
	handleMouseUpEvent: function() {
		if ( this.selected ) {
			this.particleModel.particles[this.selected].selected = false;
			this.particleModel.reset();

			this.selected = null;
		}
	},

	handleMouseDownEvent: function( id ) {
		this.selected = id;

		this.particleModel.particles[id].selected = true;
	}	
}