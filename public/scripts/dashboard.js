window.onload = function () {
	window.user = null;
	$.post('/getUser', function(user, status) {
		if (status === 'success' && user) {
			window.user = user;
		}

	}, 'json');
};

$('.upload input').change(function () {
	console.log($(this).val());
});