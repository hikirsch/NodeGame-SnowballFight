define(['view/managers/QueryStringManager'], function(QueryStringManager) {
	var validations = {
		// http://docs.jquery.com/Plugins/Validation/Methods/email
		'email': function( str ) { // contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
			return str.length == 0 || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(str);
		},
		'email-list': function( str ) {
			var emailList = str.split(','), i, emailCount;
			for( i = 0, emailCount = emailList.length; i < emailCount; i += 1 )
			{
				var nextEmail = emailList[ i ];
				if( ! validations['email']( nextEmail.trim() ) ) {
					return false;
				}
			}

			return true;
		},

		'required': function( str ) {
			return $.type( str ) === "string" && str.length > 0
		}
	};

	function validateForm( form ) {
		var invalidFields = [], nextEle, i, validateTypeLength;

		$(form).find("*[data-validation-type]").each(function() {
			nextEle = $(this)
				.removeClass('error');

			validationTypes = nextEle.data('validation-type').split(' ');

			for( i = 0, validateTypeLength = validationTypes.length; i < validateTypeLength; i += 1 ) {
				var validationType = validationTypes[i];

				if( ! validationType in validations )
				{
					console.warn( 'Trying to validate "' + validationType + '" validation-type but not defined!' );
				}
				else if( ! validations[ validationType ]( nextEle.val() ) )
				{
					nextEle.addClass('error');
					invalidFields.push( nextEle );
				}
			}
		});

		return invalidFields;
	}

	function validateFormAndSendEmail( form, callback )
	{
	 	var invalidFields = validateForm( form ),
			$errorMessageEle = $(form).find('p.error'),
			isValid = invalidFields.length == 0,
			formData, url, postData;

		if( isValid ) {
			$errorMessageEle.addClass('hide');
			formData = $(form).find("form").serialize().replace("&", "|");
			url = "php/utils.php";
			postData = "enc=" + encodeURI( "|action=sendEmail|game=" + QueryStringManager.getQueryString('game') + '|' + formData );

			$.ajax({
				url: url,
				type: 'post',
				data: postData,
				success: function(response) {
					callback( response.trim() );
				}
			});
		} else {
			$errorMessageEle.removeClass('hide');
		}

		return false;
	}

	return {
		validateForm: validateForm,
		validateFormAndSendEmail: validateFormAndSendEmail
	};

});