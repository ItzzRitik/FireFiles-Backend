require('dotenv').config();
const aws = require('aws-sdk'),
	awsSecrets = {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		region: process.env.AWS_REGION
	};

aws.config.update(awsSecrets);
	
const getSignedS3 = (file, user, cb) => {
	const params = {
		Bucket: process.env.AWS_S3_BUCKET,
		Key: user.id + '/' + file.name,
		Expires: 60,
		ContentType: file.type,
		ACL: 'private'
	};

	new aws.S3().getSignedUrl('putObject', params, (err, signedUrl) => {
		if (err) return cb(err);

		// const signedUrl = {
		// 	signedRequest: data,
		// 	url: `https://${params.Bucket}.s3.amazonaws.com/${file.name}`
		// };
		return cb(null, signedUrl);
	});
};

module.exports = { getSignedS3 };