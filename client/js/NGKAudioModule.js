var onReady = function() {
	// Get utils or define
	var audio = NGK.namespace('NGK.audio');
	audio.AudioController = function() {
		 console.log("HelloWorld");
	};


};

if (typeof window === 'undefined') {
	require('js/NGK');
	onReady();
} else {
	define(['NGK'], onReady);
}