require('dotenv').config();
const _ = require('lodash'),
	aws = require('aws-sdk'),
	awsSecrets = {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		region: process.env.AWS_REGION
	};
aws.config.update(awsSecrets);
const S3 = new aws.S3();
	
const getSignedS3 = async (file, userID, cb) => {
		const params = {
			Bucket: process.env.AWS_S3_BUCKET,
			Expires: 60,
			ACL: 'private',
			Conditions: [['content-length-range', 100, 10000000]], // max- 10mb
			Fields: {
				'Content-Type': file.type,
				'key': userID + '/' + file.name
			}
		};

		return new Promise((resolve, reject) => {
			S3.createPresignedPost(params, (err, preSignedPost) => {
				if (err) reject(err);
	
				return resolve(preSignedPost);
			});
		});
	},
	
	listFiles = (id, path, callback) => {
		let prefix = _.trimStart(_.trimEnd(`${id}/${path}`, '/') + '/', '/'),
			result = { files: [], folders: [] },

			// Recursively get all files in current directory
			fetchS3 = (error, data) => {
				if (error) return callback(error);
		
				result.files = result.files.concat(_.map(data.Contents, 'Key'));
				result.folders = result.folders.concat(_.map(data.CommonPrefixes, 'Prefix'));
		
				if (data.IsTruncated) {
						S3.listObjectsV2({
						Bucket: process.env.AWS_S3_BUCKET,
						Delimiter: '/',
						Prefix: prefix,
						ContinuationToken: data.NextContinuationToken
					}, fetchS3)
				} else {
					callback(null, result);
				}
			};

		S3.listObjectsV2({
			Bucket: process.env.AWS_S3_BUCKET,
			Delimiter: '/',
			Prefix: prefix,
			StartAfter: prefix // removes the folder name from the file listing
		}, fetchS3)
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