let notyTheme = 'relax';

$('.overlayContainer').click(function () {
	$('#mainContainer').toggleClass('signUp');
});

$('#signIn').click(function () {
	const http = new XMLHttpRequest();
	http.open('POST', '/login');
	http.setRequestHeader('Content-type', 'application/json');
	http.onreadystatechange = function() {
		if (http.readyState == XMLHttpRequest.DONE) {
			new Noty({
				text: (http.status == 200) ? 'Yayy! Successfully logged in!' : http.responseText,
				type: (http.status == 200) ? 'success' : 'error',
				theme: notyTheme,
				layout: (screen.width <= 480) ? 'bottomCenter' : 'topRight',
				timeout: 5000
			}).show();

			if (http.status == 200) {
				setTimeout(function() {
					window.location = '/dashboard';
				}, 2000);
			}
			else if (http.status == 400) {
				// Incorrect password
			}
			else if (http.status == 404) {
				// User not found
			}
			else {
				// Error occurred
			}
		}
	};
	http.send(JSON.stringify({
		email: $('#emailLogin').val(),
		password: $('#passwordLogin').val()
	}));
});

$('#signUp').click(function () {
	const http = new XMLHttpRequest();
	http.open('POST', '/signup');
	http.setRequestHeader('Content-type', 'application/json');
	http.onreadystatechange = function() {
		if (http.readyState == XMLHttpRequest.DONE) {
			new Noty({
				text: http.responseText,
				type: (http.status == 201) ? 'success' : 'error',
				theme: notyTheme,
				layout: (screen.width <= 480) ? 'bottomCenter' : 'topRight',
				timeout: 5000
			}).show();

			if (http.status == 201 || http.status == 400) {
				$('#emailLogin').val($('#emailSignUp').val());
				$('#emailSignUp').val('');

				$('#passwordLogin').focus();
				$('#passwordSignUp').val('');
				$('.overlayContainer').click();
			}
			else {
				console.log('Error');
			}
		}
	};
	http.send(JSON.stringify({
		name: $('#nameSignUp').val(),
		email: $('#emailSignUp').val(),
		password: $('#passwordSignUp').val()
	}));
});