const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Backend is live'));

app.listen(3000, () => console.log('Backend running on port 3000'));
