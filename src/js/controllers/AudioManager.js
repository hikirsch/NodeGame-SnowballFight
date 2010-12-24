define(['lib/jsclass-core', 'lib/SortedLookupTable'], function()
{
	return new JS.Class(
	{
		initialize: function(soundMap)
		{
			GAMECONFIG.CAAT.AUDIO_MANAGER = this;

			this.isMuted = false;

			this.sounds = new SortedLookupTable();
			this.preloadSounds(soundMap);

			window.addEventListener(GAMECONFIG.EVENTS.ON_SOUND_WANTS_TO_BE_PLAYED, this.onSoundWantsToBePlayed);
		},

		preloadSounds: function(soundMap)
		{
			// Preload all sounds
			for(var soundInfo in soundMap) {
				var audio = new Audio(soundMap[soundInfo]);
				this.sounds.setObjectForKey(audio, soundMap[soundInfo]);
			}

			if( CookieManager.getCookie("soundEnabled") === "false" )
			{
				GAMECONFIG.CAAT.AUDIO_MANAGER.toggleMute(true);
				$('#sound-toggle').removeClass('playing');
			}
		},

		toggleMute: function(enable)
		{
			this.isMuted = enable;

			// Stop all sounds
			if(this.isMuted)
			{
				this.sounds.forEach(function(key, sound)
				{
					// Make sure its loaded
					if(isNaN(sound.duration))
						return;

					sound.currentTime = 0;
				 	sound.pause();
				}, this);
			}
			else // Play a sound to let them know audio is enabled
			{
				this.playSound(GAMECONFIG.SOUNDS_MAP.acquiredPowerup);
			}
		},

		/**
		 * Used by event-dispatch, has bugs had to not use
		 * @param event
		 */
		onSoundWantsToBePlayed: function(event)
		{
//			debugger;
//			return;
//
//			var id = event.data.soundID;
//
//			if(!id) return;
//
//			playSound(id);
		},

		/**
		 * Plays a sound. The sound is assumed to exist.
		 * @param id ID of the sound
		 */
		playSound: function(id)
		{
			if(!id || this.isMuted) return;

			var audio = this.sounds.objectForKey(id);
			if(!audio) return;

			audio.play();
		},

		/**
		 * Deallocate
		 */
		dealloc: function(force)
		{
			this.sounds.dealloc();
//			window.removeEventListener(GAMECONFIG.EVENTS.ON_SOUND_WANTS_TO_BE_PLAYED, this.onSoundWantsToBePlayed);
		}
	});
});
