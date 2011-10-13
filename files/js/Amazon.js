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
 * Encapsulates Amazon Similarity Search functionality.
 * 
 * @author Kyle Scholz
 * 
 * @version 0.1
 */
var Amazon = function( dataGraph, particleModel ) {
	this.init( dataGraph, particleModel );
}
Amazon.prototype = {
	
	/*
	 * Initialize instance.
	 * 
	 * @param {HTTP} http
	 */
	init: function( dataGraph, particleModel ) {
		this.http = new HTTP();

		this.dataGraph = dataGraph;
		this.particleModel = particleModel;

		this.TRAVERSE_DEPTH = 1;
		this.MAX_PRODUCTS_ORIGIN = 7;
		this.MAX_PRODUCTS_PER_SIMILARITY = 4;
		this.MAX_NODES = 18;
		
		this.nodesByName = {};
		this.nodesCount = 0;
	},

	getItem: function( productId ) {
		var itemURL = "/cgi-bin/projects/amazon/query.pl?itemId=" + productId;
		this.http.get( itemURL, this, this.handleItem );	
	},

	/*
	 * Handle an Item response.
	 * 
	 * @param {XMLHTTPRequest} request
	 */	
	handleItem: function( request ) {

		var xmlDoc = request.responseXML;
		if( xmlDoc && xmlDoc.documentElement ) {
			// products details are stored in "Item" elements
			// get the "Item" elements into an iterable collection
			if ( xmlDoc ) {
			var amzItem = xmlDoc.documentElement.getElementsByTagName("Items")[0].getElementsByTagName("Item")[0];
	
			if ( amzItem ) {
				var amzArtist = getTextFromNode( amzItem.getElementsByTagName("Artist")[0] );
				var productId = getTextFromNode( amzItem.getElementsByTagName("ASIN")[0] );
				var amzTitle = getTextFromNode( amzItem.getElementsByTagName("Title")[0] );
	
				// extract an image if available
				var smallImage = amzItem.getElementsByTagName("SmallImage")[0];
	
				var smallImageURL = null;
				if ( smallImage ) {
					smallImageURL = getTextFromNode( smallImage.getElementsByTagName("URL")[0] );					
					smallImageURL = 'http://kylescholz.com/cgi-bin/projects/amazon/image.pl?x=0&url=' + smallImageURL;
				}
				
				this.search( productId, amzArtist, amzTitle, smallImageURL );
				}
			}
		}
	},

	/*
	 * Search for a product.
	 * 
	 * @param {Number} productId
	 */
	search: function( productId, artist, title, image ) {
		document.getElementById('artistResults').style.display="none";
		
		this.particleModel.clear();
		this.nodesByName = {};
		this.nodesCount = 0;
		if ( this.particleModel.timer.interupt ) {
			this.particleModel.timer.start();
		}

		document.location.href = "#" + productId;
		
		var node = new DataGraphNode( true, 2 );
		node.label = productId;
		node.artist = artist;
		node.title = title;
		node.image = image;
		this.dataGraph.addNode( node );
		
		this.nodesByName[productId] = node;

		this.getSimilar( productId, 0 );
	},

	/*
	 * Get products by an Artist on Amazon.com
	 * 
	 * @param {String} artistName
	 */	
	getArtist: function( artistName ) {
		document.getElementById('artistResults').innerHTML="";
		document.getElementById('artistResults').style.display="block";

		this.particleModel.clear();
		this.nodesByName = {};
		this.nodesCount = 0;
		if ( this.particleModel.timer.interupt ) {
			this.particleModel.timer.start();
		}

		document.location.href = "#";

		var artistURL = "/cgi-bin/projects/amazon/query.pl?artistName=" + artistName;
		this.http.get( artistURL, this, this.handleArtist, artistName );
	},

	/*
	 * Handle a Artist response.
	 * 
	 * @param {XMLHTTPRequest} request
	 * @param {String} artistName
	 */	
	handleArtist: function( request, artistName ) {
		var xmlDoc = request.responseXML;
		if( xmlDoc && xmlDoc.documentElement ) {
			// products details are stored in "Item" elements
			// get the "Item" elements into an iterable collection
			var amzItem = xmlDoc.documentElement.getElementsByTagName("Items")[0].getElementsByTagName("Item");
	
			// iterate over the product matches
			for( var i=0, l=amzItem.length; i<l && i<10; i++ ) {
				var amzArtist = getTextFromNode( amzItem[i].getElementsByTagName("Artist")[0] );
				var productId = getTextFromNode( amzItem[i].getElementsByTagName("ASIN")[0] );
				var amzTitle = getTextFromNode( amzItem[i].getElementsByTagName("Title")[0] );
				// extract an image if available
				var smallImage = amzItem[i].getElementsByTagName("SmallImage")[0];
	
				var smallImageURL = null;
				if ( smallImage ) {
					smallImageURL = getTextFromNode( smallImage.getElementsByTagName("URL")[0] );					
					smallImageURL = 'http://kylescholz.com/cgi-bin/projects/amazon/image.pl?x=0&url=' + smallImageURL;
				}
	
				var artist = amzTitle;
				if ( !artist ) { artist=""; }
				var title = amzTitle;
				if ( !title ) { title=""; }
				var image = smallImageURL;
	
				var resultHTML = document.createElement('div');
				resultHTML.className = "artist";
				resultHTML.style.marginRight = "2px";
				resultHTML.style.backgroundImage = "url('" + smallImageURL + "')";
				resultHTML.innerHTML = '<div style="padding-left:52px;" class="artist" onclick="' + 
					"amazon.search('" +  productId + "', '" + artist.replace(/"/g,'&quot;') + 
					"', '" + title.replace(/"/g,'&quot;') + "', '" + image + "')" + '">' + 
					'<b>' + artist + '</b><br>' + title +  '</div>';
				document.getElementById('artistResults').appendChild( resultHTML );
			}
		}
	},

	/*
	 * Get similar Music products from Amazon.
	 * 
	 * @param {Number} productId
	 * @param {Number} ordinal
	 */	
	getSimilar: function( productId, ordinal ) {
		var similarityURL = "/cgi-bin/projects/amazon/query.pl?similarItemId=" + productId;
		this.http.get( similarityURL, this, this.handleSimilar, productId, ordinal );
	},

	/*
	 * Handle a Similarity response.
	 * 
	 * @param {XMLHTTPRequest} request
	 * @param {Number} parentProductId
	 * @param {Number} ordinal
	 */	
	handleSimilar: function( request, parentProductId, ordinal ) {
		var xmlDoc = request.responseXML;
		if( xmlDoc && xmlDoc.documentElement ) {
			// products details are stored in "Item" elements
			// get the "Item" elements into an iterable collection
			var amzItem = xmlDoc.documentElement.getElementsByTagName("Items")[0].getElementsByTagName("Item");
	
			// iterate over the product matches
			var max = this.MAX_PRODUCTS_PER_SIMILARITY;
			if ( ordinal == 0 ) {
				max = this.MAX_PRODUCTS_ORIGIN;
			}
			for( var i=0, l=amzItem.length; i<l && i<max && this.nodesCount < this.MAX_NODES; i++ ) {
				var amzArtist = amzItem[i].getElementsByTagName("Artist")[0];
				var productId = getTextFromNode( amzItem[i].getElementsByTagName("ASIN")[0] );
				var amzTitle = getTextFromNode( amzItem[i].getElementsByTagName("Title")[0] );
	
				// extract an image if available
				var smallImage = amzItem[i].getElementsByTagName("SmallImage")[0];
				var smallImageURL = null;
				if ( smallImage ) {
					smallImageURL = getTextFromNode( smallImage.getElementsByTagName("URL")[0] );					
				}
	
				// if we haven't seen this node, add it to our DataGraph
				if ( !this.nodesByName[productId] ) {
					var node = new DataGraphNode( false, 1);
					node.label = productId;
					node.artist = getTextFromNode( amzArtist );
					node.title = amzTitle;
	
					if ( smallImageURL ) {
						smallImageURL = 'http://kylescholz.com/cgi-bin/projects/amazon/image.pl?x=0&url=' + smallImageURL;
					}
	
					node.image = smallImageURL;
					// note: we want to establish this relationship before we add the node to the model ...
					// so we use the addEdge method in DataGraphNode ... if we want to add node later, the
					// addEdge method in DataGraph is appropriate.
					node.addEdge( this.nodesByName[parentProductId], 1 );
					this.dataGraph.addNode( node );
					this.nodesCount++;
	
					this.nodesByName[productId] = node;
					
					if ( ordinal < this.TRAVERSE_DEPTH ) {
						this.getSimilar( productId, ordinal+1 );
					}
				// if we have seen it, make sure we capture this relationship
				} else {
					var node = this.nodesByName[productId];
					this.dataGraph.addEdge( node, this.nodesByName[parentProductId] );
				}
			}
		}
	}
}