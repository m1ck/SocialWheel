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
var AudioScrobbler = function( dataGraph, particleModel ) {
	this.init( dataGraph, particleModel );
}
AudioScrobbler.prototype = {
	
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
		this.MAX_PRODUCTS_ORIGIN = 8;
		this.MAX_PRODUCTS_PER_SIMILARITY = 5;
		this.MAX_NODES = 18;
		
		this.nodesByName = {};
		this.nodesCount = 0;
	},

	/*
	 * Search for a product.
	 * 
	 * @param {String} artist
	 */
	search: function( artist, image ) {

		this.particleModel.clear();
		this.nodesByName = {};
		this.nodesCount = 0;
		if ( this.particleModel.timer.interupt ) {
			this.particleModel.timer.start();
		}

		document.location.href = "#" + escape( artist );
		
		var node = new DataGraphNode( true, 2 );
		node.artist = artist;
		node.artisttitle = artist;
		node.image = image;
		this.dataGraph.addNode( node );
					
		this.nodesByName[artist] = node;

		this.getSimilar( artist, 0 );
	},

	/*
	 * Get products by an Artist on Amazon.com
	 * 
	 * @param {String} artistName
	 * @param {String} graphNode
	 */	
	getArtist: function( artistName, graphNode ) {
		var artistURL = "../../getpic/facebook/?id=" + artistName;
		this.http.get( artistURL, this, this.handleArtist, artistName, graphNode );
	},

	/*
	 * Handle a Artist response.
	 * 
	 * @param {XMLHTTPRequest} request
	 * @param {String} artistName
	 * @param {String} graphNode
	 */	
	handleArtist: function( request, artistName, graphNode ) {
		var xmlDoc = request.responseXML;
				var smallImage = xmlDoc.documentElement.getElementsByTagName("album")[0].getElementsByTagName("small")[0];
	
				var smallImageURL = null;
				if ( smallImage ) {
					smallImageURL = getTextFromNode( smallImage );
					smallImageURL = smallImageURL;
					graphNode.image = smallImageURL;
				}

	},

	/*
	 * Get similar Music products from Amazon.
	 * 
	 * @param {Number} productId
	 * @param {Number} ordinal
	 */	
	getSimilar: function( artist, ordinal ) {
		var similarityURL = "../../getcontacts/facebook/?id=" + artist;
		this.http.get( similarityURL, this, this.handleSimilar, artist, ordinal );
	},

	/*
	 * Handle a Similarity response.
	 * 
	 * @param {XMLHTTPRequest} request
	 * @param {Number} parentArtist
	 * @param {Number} ordinal
	 */	
	handleSimilar: function( request, parentArtist, ordinal ) {
		var xmlDoc = request.responseXML;
		if( xmlDoc && xmlDoc.documentElement ) {
			// products details are stored in "Item" elements
			// get the "Item" elements into an iterable collection
			var simArtists = xmlDoc.documentElement.getElementsByTagName("artist");
			
	
			// iterate over the artist matches
			var max = this.MAX_PRODUCTS_PER_SIMILARITY;
			if ( ordinal == 0 ) {
				max = this.MAX_PRODUCTS_ORIGIN;
			}
			for( var i=0, l=simArtists.length; i<l && i<max && this.nodesCount < this.MAX_NODES; i++ ) {
				var artist = getTextFromNode( simArtists[i].getElementsByTagName("name")[0] );
				var artisttitle = getTextFromNode( simArtists[i].getElementsByTagName("title")[0] );
	            var smallImageURL = getTextFromNode( simArtists[i].getElementsByTagName("image")[0] );
	            
	            
				// if we haven't seen this node, add it to our DataGraph
				if ( !this.nodesByName[artist] ) {
					var node = new DataGraphNode( false, 1);
					node.artist = artist;										
					node.image = smallImageURL;
					node.artisttitle = artisttitle;
					
					this.dataGraph.addNode( node );
	
					this.nodesByName[artist] = node;
	
					node.addEdge( this.nodesByName[parentArtist], 1 );
					this.getArtist( artist, node );
	
					this.nodesCount++;
	
					if ( ordinal < this.TRAVERSE_DEPTH ) {
						this.getSimilar( artist, ordinal+1 );
					}
				// if we have seen it, make sure we capture this relationship
				} else {
					var node = this.nodesByName[artist];
					if ( !node.id && node!=0 ) {
						node.addEdge( this.nodesByName[parentArtist], 1 );
					} else {
						this.dataGraph.addEdge( node, this.nodesByName[parentArtist] );					
					}
				}
			}
		}
	}
}