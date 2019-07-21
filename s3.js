const aws = require('aws-sdk');

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-northeast-1',
});

const uploadBucket = process.env.AWS_BUCKET;

export const presignedPost = (key) => {
  const params = {
    Bucket: uploadBucket,
    Fields: {
      key: key
    }
  };

  return new Promise((resolve, reject) => {
    s3.createPresignedPost(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
