const express = require('express');
const basicAuth = require('express-basic-auth');
const image = require('./s3').image;

const app = express();

const user = process.env.USERNAME;
const pass = process.env.PASSWORD;

if (user && pass) {
  app.use(
    basicAuth({
      users: { [user]: pass },
      challenge: true,
    }),
  );
}

app.use(express.static('public'));
app.post('/upload', async (req, res) => {
  const result = await image.presignedPost();
  res.json(result);
});

app.post('/upload_same_key', async (req, res) => {
  const result = await image.samePresignedPost();
  res.json(result);
});

app.listen(process.env.PORT || 3000);
