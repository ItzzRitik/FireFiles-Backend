let notyTheme = 'relax';

$('.overlayContainer').click(function () {
	$('#mainContainer').toggleClass('signUp');
});

$('#signIn').click(function () {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', '/login');
	xhr.setRequestHeader('Content-type', 'application/json');
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			new Noty({
				text: (xhr.status == 200) ? 'Yayy! Successfully logged in!' : xhr.responseText,
				type: (xhr.status == 200) ? 'success' : 'error',
				theme: notyTheme,
				layout: (screen.width <= 480) ? 'bottomCenter' : 'topRight',
				timeout: 5000
			}).show();

			if (xhr.status == 200) {
				setTimeout(function() {
					window.location = '/dashboard';
				}, 2000);
			}
			else if (xhr.status == 403) {
				// Incorrect password
			}
			else if (xhr.status == 404) {
				// User not found
			}
			else {
				// Error occurred
			}
		}
	};
	xhr.send(JSON.stringify({
		email: $('#emailLogin').val(),
		password: $('#passwordLogin').val()
	}));
});

$('#signUp').click(function () {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', '/signup');
	xhr.setRequestHeader('Content-type', 'application/json');
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			new Noty({
				text: xhr.responseText,
				type: (xhr.status == 201) ? 'success' : 'error',
				theme: notyTheme,
				layout: (screen.width <= 480) ? 'bottomCenter' : 'topRight',
				timeout: 5000
			}).show();

			if (xhr.status == 201 || xhr.status == 400) {
				$('#emailLogin').val($('#emailSignUp').val());
				$('#emailSignUp').val('');

				$('#passwordLogin').focus();
				$('#passwordSignUp').val('');
				$('.overlayContainer').click();
			}
		}
	};
	xhr.send(JSON.stringify({
		name: $('#nameSignUp').val(),
		email: $('#emailSignUp').val(),
		password: $('#passwordSignUp').val()
	}));
});

let hashChanged = function () {
	if (location.hash === '#login') {
		if (window.user) {
			window.location = '/dashboard';
		}
		else $('.loginPage').css('display', 'flex');
	}
	else {
		$('.loginPage').css('display', 'none');
	}
};
window.onhashchange = hashChanged;
window.onload = function () {
	window.user = null;
	$.post('/getUser', function(user, status) {
		if (status === 'success' && user) {
			window.user = user;
		}

		hashChanged();
	}, 'json');
};