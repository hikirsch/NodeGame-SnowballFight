/**
 * This is an example I created for us JS.Class
 */

var init = function()
{
	return new JS.Class(
	{
		initialize: function(name) {
			this.name = name;
			console.log( 'Animal::initialize - ', name);
		},

		/**
		 * Cause the Animal to tell you what it likes (Testing JavaDoc)
		 * @param things What the animal likes
		 */
		speak: function(things) {
			return 'My name is ' + this.name + ' and I like ' + things;
		}
	});
};

// Handle Node.JS and browser
if (typeof window === 'undefined') {
//	'../lib/jsclass/core.js'
	require('../lib/jsclass/core.js');
	Animal = init();
} else {
//	lib/jsclass/core
	define(['lib/jsclass/core'], init);
}