const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const rootFolder = path.join(__dirname, 'public');

app.get('/home', function(req, res){
    res.sendFile(path.join(rootFolder, 'index.html'))
})

app.get('/products', function(req, res){
    res.sendFile(path.join(rootFolder, 'products.html'))
})

app.get('/login', function(req, res){
    res.sendFile(path.join(rootFolder, 'login.html'))
})

app.get('/create_account', function(req, res){
    res.sendFile(path.join(rootFolder, 'create_account.html'))
})

app.get('/about', function(req, res){
    res.sendFile(path.join(rootFolder, 'about.html'))
})
app.listen(3000, function(){
    console.log('Server Running at localhost:3000')
})