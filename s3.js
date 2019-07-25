const aws = require('aws-sdk');
const uuid = require('uuid').v4;
const randomBytes = require('crypto').randomBytes;
const sts = require('./sts');

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-northeast-1',
  signatureVersion: 'v4'
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


const createClient = async (options) => {
  const credentials = await sts.credentialsForTemporary(options);

  return new aws.S3({
    credentials: credentials,
    region: process.env.AWS_REGION || 'ap-northeast-1',
    signatureVersion: 'v4'
  });
};



const presignedPost = (suffixPath) => () => {
  const prefixPath = `${randomPrefix(4)}${suffixPath}`;
  const postKey = `${prefixPath}/${uuid()}`;
  const params = {
    Bucket: uploadBucket,
    Fields: {
      key: postKey
    },
    Expires: parseInt(process.env.AWS_PRESIGNED_URL_EXPIRES || 60, 10)
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

const samePresignedPost = (suffixPath) => () => {
  const postKey = `same_key${suffixPath}/same.jpeg`;
  const params = {
    Bucket: uploadBucket,
    Fields: {
      key: postKey
    },
    Expires: parseInt(process.env.AWS_PRESIGNED_URL_EXPIRES || 60, 10)
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



const samePresigned = (suffixPath) => async () => {
  const postKey = `same_key${suffixPath}/same.jpeg`;
  const params = {
    Bucket: uploadBucket,
    Key: postKey,
    ContentType: 'image/jpeg',
    Expires: parseInt(process.env.AWS_PRESIGNED_URL_EXPIRES || 60, 10)
  };

  const client = await createClient({ durationSeconds: 3600 });

  return new Promise((resolve, reject) => {
    client.getSignedUrl('putObject', params, (err, url) => {
      if (err) {
        reject(err);
      } else {
        resolve({ url: url });
      }
    });
  });
};


exports.image = {
  presignedPost: presignedPost('_images'),
  samePresignedPost: samePresignedPost('_images'),
  samePresigned: samePresigned('_images'),
};

exports.createClient = createClient;
