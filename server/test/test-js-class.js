/**
File:
	test-js-class.js
Created By:
	Mario Gonzalez
Project:
	Ogilvy Holiday Card 2010
Abstract:
	Test JSClass's Class system is working correctly

Basic Usage:
	var gameController = new ServerGameController({
	    'port': Math.abs(ArgHelper.getArgumentByNameOrSetDefault('port', 28785)),
	    'status': false,
	    'recordFile': './../record[date].js',
	    'record': false,
	    'server': null
	});
	gameController.run();

Version:
	1.0
*/

// Testing JS.Class
//var animal = new Animal('Rex');
//console.log('Animal', animal.speak("YELLING!!!") ); // Should output: Animal My name is Max and I like BARKING!!!
	common = require("../common");
	assert = common.assert
	var events = require('events');

	var e = new events.EventEmitter();

	var events_new_listener_emited = [];
	var times_hello_emited = 0;

	e.addListener("newListener", function (event, listener) {
	  console.log("newListener: " + event);
	  events_new_listener_emited.push(event);
	});

	e.on("hello", function (a, b) {
	  console.log("hello");
	  times_hello_emited += 1
	  assert.equal("a", a);
	  assert.equal("b", b);
	});

	console.log("start");

	e.emit("hello", "a", "b");test

	process.addListener("exit", function () {
	  assert.deepEqual(["hello"], events_new_listener_emited);
	  assert.equal(1, times_hello_emited);
	});
//
//
//
//
//// Testing JS.Class
//var animal = new Animal('Rex');
//console.log('Animal', animal.speak("YELLING!!!") ); // Should output: Animal My name is Max and I like BARKING!!!
