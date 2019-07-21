const express = require('express');

const s3 = require('./s3');

const app = express();

app.use(express.static('public'));

app.post('/upload', async (req, res) => {
  const result = await s3.presignedPost('xxx');

  res.json(result);
});

app.listen(process.env.PORT || 3000);
