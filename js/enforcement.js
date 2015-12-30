var PasswordPolicy = require('password-sheriff').PasswordPolicy;
var charsets = require('password-sheriff').charsets;

/**
 * Custom Rules
 *
 */
function SpecialsRule() {}

SpecialsRule.prototype.validate = function (options) {
	if( !options ) { throw new Error('options should be an object'); }
	if( typeof options.allow !== 'boolean') { throw new Error('options should be boolean'); }
};

SpecialsRule.prototype.assert = function (options, password) {
	if(!password){ return false; }
	if(typeof password !== 'string') {throw new Error('password should be a string');}

	if( options.allow === false &&  charsets.specialCharacters.test(password)) {
		return false;
	}

	return true;
};

SpecialsRule.prototype.explain = function (options) {
	var decision;
	if( options.allow === false ) {
		decision = 'not';
	} else {
		decision = '';
	}
	return {
		code: 'special',
		message: 'Password should ' + decision + ' contain special characters'
	}
};

/**
 * Mock customozations
 *
 */
var passwordPreferences = {
	length: 6,
	uppers: true,
	numbers: true,
	specials: false
};

var enforcer = {};

enforcer.length = new PasswordPolicy({length: {
	minLength: passwordPreferences.length || 8}
});

if( passwordPreferences.uppers ) {
	enforcer.uppers = new PasswordPolicy({contains: {
		expressions: [charsets.upperCase]
	}});
}

if( passwordPreferences.numbers ) {
	enforcer.numbers = new PasswordPolicy({contains: {
		expressions: [charsets.numbers]
	}});
}

var password1 = $('#password1');
var password2 = $('#password2');

if( !passwordPreferences.specials ) {
	enforcer.specials = new PasswordPolicy({noSpecials: {allow: false}}, {noSpecials: new SpecialsRule()});
}

password1.on('keyup', function () {
	if( enforcer.length.check(password1.val()) ) {
		requirementMet('length');
	} else {
		requirementUnmet('length')
	}
	if( passwordPreferences.uppers ) {
		if( enforcer.uppers.check(password1.val()) ) {
			requirementMet('uppers');
		} else {
			requirementUnmet('uppers')
		}
	}
	if( passwordPreferences.numbers ) {
		if( enforcer.numbers.check(password1.val()) ) {
			requirementMet('numbers');
		} else {
			requirementUnmet('numbers')
		}
	}
	if( !passwordPreferences.specials ) {
		if( enforcer.specials.check(password1.val()) ) {
			requirementMet('specials');
		} else {
			requirementUnmet('specials');
		}
	}
	
});

password2.on('keyup', function () {
	var passes = password1.val() === password2.val();
	//if( passes ) {
	//	console.log('enabling the button!');
	//}
});

$(function() {
	addUnMetRequirement('length');
	if( passwordPreferences.uppers ) {
		addUnMetRequirement('uppers');
	}
	if( passwordPreferences.numbers ) {
		addUnMetRequirement('numbers');
	}
	if( !passwordPreferences.specials ) {
		addUnMetRequirement('specials');
	}
});

function addUnMetRequirement(rule) {
	var displayString = enforcer[rule].toString().replace(/([\*][\s])/gi, '').replace(/:/, '');
	$('#requirements-list').append('<li class="rule unmet" id="' + rule + '">' + displayString + '</li>');
}

function requirementMet(rule) {
	$('#' + rule + '').removeClass('unmet').addClass('met');
}

function requirementUnmet(rule) {
	$('#' + rule + '').removeClass('met').addClass('unmet');
}
