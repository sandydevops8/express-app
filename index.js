'use strict';

const express = require('express');

const PORT = process.env.PORT || 8080;

const app = express();

app.get('/', function(req, res) {

    res.send('Express Hello World Application! Version 1.0 \n');

});

app.listen(PORT);

console.log('Running on http://localhost:' + PORT);
