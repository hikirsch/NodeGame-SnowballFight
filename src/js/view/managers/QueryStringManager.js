define(function() {
	var _queryString = {};

	function parseQueryString()
	{
		if( location.search && location.search.length > 0 ) {
			var splitPair = location.search.substring(1).split("&"),
				i = splitPair.length;

			while(i--)
			{
				var splitPiece = splitPair[i].split("="),
					name = splitPiece[0].trim(),
					value = decodeURI( splitPiece.length > 1 ? splitPiece[1].trim() : "" );

				_queryString[ name ] = value;
			}
		}
	}

	function init()
	{
		parseQueryString();
	}

	require.ready( init );

	return window.QueryStringManager = {
		getQueryString: function( name )
		{
			return _queryString[ name ];
		},

		hasQueryString: function( name )
		{
			return name in _queryString;
		}
	};
});