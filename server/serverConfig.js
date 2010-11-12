var init = function()
{ 
	return {
	    showStatus: true,
	    recordFile: './../record[date].js',
	    record: false,
	    server: null
	};
};

if (typeof window === 'undefined') {
	exports.Config = init();
} else if( typeof define === 'function' ) {
	define( init );
}