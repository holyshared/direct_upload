const aws = require('aws-sdk');

const sts = new aws.STS({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-northeast-1',
  signatureVersion: 'v4'
});



function credentialsForTemporary(options) {
  return new Promise((resolve, reject) => {
    sts.getSessionToken({ DurationSeconds: options.durationSeconds || 300 }, (err, data) => {
      if (err) {
        return reject(err);
      } else {
      	const Credentials = data.Credentials;
        const creds = new aws.Credentials(
          Credentials.AccessKeyId,
          Credentials.SecretAccessKey,
          Credentials.SessionToken
        );
        return resolve(creds);
      }
    });
  });
}

exports.credentialsForTemporary = credentialsForTemporary;
