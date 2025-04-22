const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const rootFolder = path.join(__dirname, 'public');

app.get('/home', function(req, res){
    res.sendFile(path.join(rootFolder, 'index.html'))
})

app.listen(3000, function(){
    console.log('Server Running at localhost:3000')
})