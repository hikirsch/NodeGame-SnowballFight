var init = function( $, browserReq, character, characterSelect, credits, entity, field, footer, gameStatus, instructions, intro, invite, navigation, overlay, results, serverUnavailable, statusUpdates ) {
	return {
        browserRequirements: function() {
            return $(browserReq)
                .tmpl();
        },

        character: function( data ) {
            return $(character)
                .tmpl( data )
                .addClass( data.theme );
        },

		characterSelect: function()
		{
			return $(characterSelect)
				.tmpl();
		},

        credits: function(data) {
            return $(credits)
            .tmpl()
        },

        entity: function(data) {
            return $(entity)
                .tmpl(data)
                .addClass( data.theme );
        },

		field: function() {
			return $(field)
				.tmpl();
		},

        footer: function() {
            return $(footer)
                .tmpl();
        },

		gameStatus: function() {
			return $(gameStatus)
				.tmpl();
		},

        instructions: function()
        {
            return $(instructions)
                .tmpl();
        },

		intro: function()
		{
			return $(intro)
				.tmpl();
		},

        invite: function( data ) {
            return $(invite)
            .tmpl();
        },

        navigation: function() {
            return $(navigation)
                .tmpl();
        },

		overlay: function() {
			return $(overlay)
				.tmpl();
		},

        results: function( data ) {
            return $(results)
                .tmpl( data );
        },

        serverUnavailableDialog: function() {
            return $(serverUnavailable)
                .tmpl();
        },

        statusUpdates: function(data) {
            console.log('[Status Data]', data);
            return $(statusUpdates)
                .tmpl(data);
        }
	};
};

define([
		'jquery',
        'text!view/html/browser-req.html',
        'text!view/html/character.html',
        'text!view/html/character-select.html',
        'text!view/html/credits.html',
        'text!view/html/entity.html',
        'text!view/html/field.html',
		'text!view/html/footer.html',
        'text!view/html/game-status.html',
        'text!view/html/instructions.html',
		'text!view/html/intro.html',
        'text!view/html/invite.html',
        'text!view/html/navigation.html',
        'text!view/html/overlay.html',
		'text!view/html/results.html',
        'text!view/html/server-unavailable.html',
        'text!view/html/status-updates.html',
		'plugins/jquery.tmpl.min' /** this should be last **/
], init);

if (typeof window === 'undefined')
	HTMLFactory = init();