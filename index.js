'use strict';

const express = require('express');

const PORT = process.env.PORT || 8080;

const app = express();

app.get('/', function(req, res) {

    res.send('Express Hello World Application!\n');

});

app.listen(PORT);

console.log('Running on http://localhost:' + PORT);
