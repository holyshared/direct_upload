const express = require('express');

const app = express();

app.use(express.static('public'));

app.post('/upload', (req, res) => {

  setTimeout(() => {
    res.json({
      url: 'https://example.com'
    });
  }, 5000);

});

app.listen(process.env.PORT || 3000);
