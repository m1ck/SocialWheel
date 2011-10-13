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
 * DataGraph
 * 
 * @author Kyle Scholz
 * 
 * @version 0.3.1
 * 
 * A DataGraph defines nodes and edges (relationships between nodes). It's a data model from 
 * which all nodes or a subset of nodes may be included in a particle model / view.
 * 
 * A DataGraph will notify subscribers when new nodes and edges have been added. A
 * subscriber must implement "newDataGraphNode" and "newDataGraphEdge".
 * 
 */
var DataGraph = function() {
	this.init();
}
DataGraph.prototype = {

	init: function() {
		this.nodes = new Array();	
		this.subscribers = new Array();	
	},

	/*
	 * Subscribe an observer
	 * 
	 * @param {DataGraphObserver} observer
	 */
	subscribe: function( observer ) {
		this.subscribers.push( observer );
	},
	
	/*
	 * Notify subscribers of our new node
	 * 
	 * @param {DataGraphNode} node
	 */
	notifyNode: function( node ) {
		for( var i=0, l=this.subscribers.length; i<l; i++ ) {
			this.subscribers[i].newDataGraphNode( node );
		}
	},

	/*
	 * Notify subscribers of our new edge
	 * 
	 * @param {DataGraphNode} nodeA
	 * @param {DataGraphNode} nodeB
	 */
	notifyEdge: function( nodeA, nodeB ) {
		for( var i=0, l=this.subscribers.length; i<l; i++ ) {
			this.subscribers[i].newDataGraphEdge( nodeA, nodeB );
		}
	},

	/*
	 * Add node to the DataGraph.
	 * 
	 * @param {DataGraphNode} dataGraphNode
	 */
	addNode: function( dataGraphNode ) {
		dataGraphNode.id = this.nodes.length;
		dataGraphNode.rendered = false;
		this.nodes.push( dataGraphNode );		
		this.notifyNode( dataGraphNode );
	},
	
	/*
	 * Add an edge between two nodes.
	 * 
	 * @param {DataGraphNode} nodeA
	 * @param {DataGraphNode} nodeB
	 */
	addEdge: function( nodeA, nodeB ) {
		var success = nodeA.addEdge( nodeB, 1 );
		if ( success ) {
			this.notifyEdge( nodeA, nodeB );			
		}
	}
}

/**
 * A DataGraphNode is a node in a DataGraph (...duh)
 * 
 * @param fixed indicates whether the node has a fixed position
 */
var DataGraphNode = function( fixed, mass ) {

	this.fixed = fixed;
	this.mass = mass;
	this.edges = {};
	this.edgeCount = 0;

	/*
	 * Add an edge between two Particles.
	 * 
	 * @param {DataGraphNode} node
	 */
	this.addEdge = function( node ) {
		if ( !(node.id in this.edges) && !(this.id in node.edges) && (this.id != node.id) ) {
			this.edgeCount++;
			this.edges[node.id] = node;
			return true;
		}
		return false;
	}	
}