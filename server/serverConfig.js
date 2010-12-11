var init = function()
{ 
	return {
	    showStatus: false,
	    recordFile: './../record[date].js',
	    record: false,
	    server: null,
		port: 43587
	};
};

if (typeof window === 'undefined') {
	exports.Config = init();
} else if( typeof define === 'function' ) {
	define( init );
}