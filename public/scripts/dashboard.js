window.onload = function () {
	window.user = null;
	$.post('/getUser', function(user, status) {
		if (status === 'success' && user) {
			window.user = user;
		}

	}, 'json');
};

function uploadFile (file, signedRequest) {
	const xhr = new XMLHttpRequest();
	xhr.open('PUT', signedRequest);
	xhr.setRequestHeader('Content-type', file.type);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				alert('Picture uploaded to S3', xhr.responseText);
			}
			else {
				alert('Could not upload file.');
			}
		}
	};
	xhr.send(file);
}


$('.upload input').change(function () {
	const file = this.files[0],
		xhr = new XMLHttpRequest();
	xhr.open('POST', '/getSignedS3');
	xhr.setRequestHeader('Content-type', 'application/json');
	xhr.onreadystatechange = () => {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				console.log(xhr.responseText);
				uploadFile(file, xhr.responseText);
			}
			else {
				alert('Could not get signed URL.');
			}
		}
	};
	xhr.send(JSON.stringify({
		fileName: file.name,
		fileType: file.type
	}));
});