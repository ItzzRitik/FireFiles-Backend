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
			if (http.responseText == 1) {
				new Noty({
					text: 'Yayy! Successfully created your account!',
					type: 'success',
					theme: 'relax',
					layout: (screen.width <= 480) ? 'bottomCenter' : 'topRight',
					timeout: 4000
				}).show();
			}
			else if (http.responseText == 2) {

			}
			else {
				new Noty({
					text: 'Apologies! Error occured while creating this account!',
					type: 'error',
					theme: 'relax',
					layout: (screen.width <= 480) ? 'bottomCenter' : 'topRight',
					timeout: 3000
				}).show();
			}
		}
	};
	http.send(JSON.stringify({
		email: $('#emailLogin').val(),
		pass: $('#passwordLogin').val()
	}));
});

$('#signUp').click(function () {
	const http = new XMLHttpRequest();
	http.open('POST', '/signup');
	http.setRequestHeader('Content-type', 'application/json');
	http.onreadystatechange = function() {
		if (http.readyState == XMLHttpRequest.DONE) {
			if (http.responseText == 1) {
				new Noty({
					text: 'Yayy! Successfully created your account!',
					type: 'success',
					theme: 'relax',
					layout: (screen.width <= 480) ? 'bottomCenter' : 'topRight',
					timeout: 4000
				}).show();
			}
			else if (http.responseText == 2) {

			}
			else {
				new Noty({
					text: 'Apologies! Error occured while creating this account!',
					type: 'error',
					theme: 'relax',
					layout: (screen.width <= 480) ? 'bottomCenter' : 'topRight',
					timeout: 3000
				}).show();
			}
		}
	};
	http.send(JSON.stringify({
		name: $('#nameSignUp').val(),
		email: $('#emailSignUp').val(),
		pass: $('#passwordSignUp').val()
	}));
});