const express = require('express');

const image = require('./s3').image;

const app = express();

app.use(express.static('public'));

app.post('/upload', async (req, res) => {
  const result = await image.presignedPost();

  res.json(result);
});

app.listen(process.env.PORT || 3000);
