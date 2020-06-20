window.onload = function () {
	$.post('/getUser', function(user, status) {
		if (status === 'success' && user) {
			window.user = user;
		}

	}, 'json');
};