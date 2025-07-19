const express = require('express');
const app = express();
const PORT = 5000;

app.get('/test', (req, res) => {
  res.send('Test route works!');
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});