const aws = require('aws-sdk');
const uuid = require('uuid').v4;
const randomBytes = require('crypto').randomBytes;

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-northeast-1',
});

const uploadBucket = process.env.AWS_BUCKET;

const randomPrefix = (len = 4) => {
  if (!Number.isFinite(len)) {
    throw new TypeError("Expected a finite number");
  }
  return randomBytes(Math.ceil(len / 2))
    .toString("hex")
    .slice(0, len);
};

const presignedPost = (suffixPath) => () => {
  const prefixPath = `${randomPrefix(4)}${suffixPath}`;
  const postKey = `${prefixPath}/${uuid()}`;
  const params = {
    Bucket: uploadBucket,
    Fields: {
      key: postKey
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

exports.image = {
  presignedPost: presignedPost('_images')
};
