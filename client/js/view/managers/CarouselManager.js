define(function() {

	var _current,
		_currentCharacter = 0,
		_screenWidth = -810,
		_charactersEle;

	function navOff( index ) {
		$("#character-thumbs").children().get( index ).style.backgroundPosition = "top left";
	}

	function navOn( index ) {
		$("#character-thumbs").children().get( index ).style.backgroundPosition = "bottom left";
	}

	return {
		getCurrentIndex: function() {
			return _currentCharacter;
		},
		getCharacterType: function() {
			return 'character-' + $("#character-thumbs :nth-child(" + ( _currentCharacter + 1 ) + ")").data('character-type');
		},
		move: function( direction ) {
			var characterLastIndex =  $("#character-thumbs").children().length - 1;

			navOff( _currentCharacter );

			_currentCharacter += direction;

			if( _currentCharacter > characterLastIndex ) {
				_currentCharacter = 0;
			} else if( _currentCharacter < 0 ) {
				_currentCharacter = characterLastIndex;
			}

			navOn( _currentCharacter );

			var newPosition = _currentCharacter * _screenWidth;

			document.getElementById("carouselContainer").style.webkitTransform = "translate3d(" + newPosition + "px, 0px, 0px)";
		}
	};
});
