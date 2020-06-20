window.onload = function () {
	window.user = null;
	$.post('/getUser', function(user, status) {
		if (status === 'success' && user) {
			window.user = user;
			$('a').text(window.user.name);
		}

	}, 'json');
};