require('dotenv').config();
const aws = require('aws-sdk'),
	awsSecrets = {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		region: process.env.AWS_REGION
	};
aws.config.update(awsSecrets);
const S3 = new aws.S3();
	
const getSignedS3 = (file, user, cb) => {
		const params = {
			Bucket: process.env.AWS_S3_BUCKET,
			Expires: 60,
			ACL: 'private',
			Conditions: [['content-length-range', 100, 10000000]],
			Fields: {
				'Content-Type': file.type,
				'key': user.id + '/' + file.name
			}
		};

		S3.createPresignedPost(params, (err, preSignedPost) => {
			if (err) return cb(err);

			return cb(null, preSignedPost);
		});
	},

	listFiles = (id, cb) => {
		var params = { 
			Bucket: process.env.AWS_S3_BUCKET,
			Delimiter: '/',
			Prefix: id + '/'
		};
		S3.listObjectsV2(params, function (err, files) {
			if (err) return cb(err);
			cb(null, files);
		});
	},

	streamFile = (fileKey, cb) => {
		console.log('Trying to download file', fileKey);
		var options = {
			Bucket: process.env.AWS_S3_BUCKET,
			Key: fileKey,
		};

		S3.getObject(options).on('httpHeaders', function (statusCode, headers) {
			let readStream = this.response.httpResponse.createUnbufferedStream();
			cb(headers, readStream);
		}).send();
	};

module.exports = { getSignedS3, streamFile, listFiles };