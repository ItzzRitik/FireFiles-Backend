window.onload = function () {
	window.user = null;
	$.post('/getUser', function(user, status) {
		if (status === 'success' && user) {
			window.user = user;
		}

	}, 'json');
};


$('.upload input').change(function () {
	const file = this.files[0];
	console.log(file.name);

	function uploadFile (url, formData) {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		xhr.upload.onprogress = function(evt) {
			if (evt.lengthComputable) {
				var percentComplete = parseInt((evt.loaded / evt.total) * 100);
				console.log('Upload: ' + percentComplete + '% complete');
			}
		};
		xhr.onreadystatechange = function () {  
			if (xhr.readyState == XMLHttpRequest.DONE) {
				console.log('Done');
			}
		}; 
		xhr.send(formData);
	}

	$.post('/getSignedS3', { 
		fileName: file.name,
		fileType: file.type
	}, function(presignedPost, status) {
		if (status === 'success' && presignedPost) {
			var formData = new FormData();
			Object.keys(presignedPost.fields).forEach(function (key) {
				formData.append(key, presignedPost.fields[key]);
			});
			formData.append('file', file);

			uploadFile(presignedPost.url, formData);
		}
		else alert('Could not get signed URL.');
	}, 'json');
});