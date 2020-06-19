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
			console.log(http);
			new Noty({
				text: http.responseText,
				type: (http.status == 200) ? 'success' : 'error',
				theme: 'relax',
				layout: (screen.width <= 480) ? 'bottomCenter' : 'topRight',
				timeout: 5000
			}).show();

			if (http.status == 201) {
				console.log('Success');
			}
			else if (http.status == 400) {
				console.log('Duplicate');
			}
			else {
				console.log('Error');
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
				theme: 'relax',
				layout: (screen.width <= 480) ? 'bottomCenter' : 'topRight',
				timeout: 5000
			}).show();

			if (http.status == 201) {
				console.log('Success');
			}
			else if (http.status == 400) {
				console.log('Duplicate');
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