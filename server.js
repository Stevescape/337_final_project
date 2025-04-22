const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const {MongoClient} = require("mongodb")
const db_url = "mongodb+srv://Cluster09012:csc337_final@cluster09012.jcfnzs9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster09012"
var client = new MongoClient(db_url)
client.connect()

const rootFolder = path.join(__dirname, 'public/');

async function insertOneProduct(product) {
    var col = client.db("store").collection("products")
    await col.insertOne(product)
    var result = col.find({})
    result = await result.toArray()
    return result
}

async function DBgetProducts() {
    var col = client.db("store").collection("products")
    var result = col.find({})
    result = await result.toArray()
    return result
}

async function deleteOneProduct(product) { 
    var col = client.db("store").collection("products")
    await col.deleteOne(product)
    var result = col.find({})
    result = await result.toArray()
    return result
}

function shutdownServer() {
    client.close()
    console.log("Closed Successfully")
}

app.get('/home', function(req, res){
    res.sendFile(path.join(rootFolder, 'index.html'))
})

app.get('/products', function(req, res){
    res.sendFile(path.join(rootFolder, 'products.html'))
})

app.get('/products.js', function(req, res) {
    res.sendFile(path.join(rootFolder, 'products.js'))
})

app.get('/get_products', function(req, res){
    DBgetProducts()
    .then((products) => {
        res.send(products)
    })
    .catch((err) => {
        console.log(err)
    })
})

app.post('/add_product', express.json(),function(req, res) {
    var product = {name:req.body.name, price:req.body.price}
    res.send(insertOneProduct(product)) 
})

app.post('/delete_product', express.json(),function(req, res) {
    var product = {name:req.body.name, price:req.body.price}
    res.send(deleteOneProduct(product))
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

process.on("SIGINT", async () => {
    await client.close()
    process.exit()
})
