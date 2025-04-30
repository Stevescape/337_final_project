const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto')
const app = express();
const {MongoClient} = require("mongodb")

// Set Environment Key
var db_url = process.env.API_KEY
if (db_url.startsWith('"') && db_url.endsWith('"')) {
    db_url = db_url.slice(1, -1); 
}
// console.log('API_Key from env: ', process.env.API_KEY)

var client = new MongoClient(db_url)
client.connect()

// Temp code to add admin acc, Password: pass123
// var hashedPass = crypto.createHash('sha256').update('pass123').digest('hex')
// var newUser = {'email' : 'admin@place', 
//     'password' : hashedPass, 
//     'fullname' : 'Admin One', 
//     'address' : 'placeholder',
//     'acc_type' : 'admin'}
// insertUserCreate(newUser)

// async function deleteClient(search){
//     var col = client.db('store').collection('users')
//     await col.deleteOne(search)
//     var result = col.find({})
//     result = await result.toArray()
//     console.log(result)
//     return result
// }

// deleteClient({email : 'admin@place'})

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

// JS Code for Create Acc & Login
async function insertUserCreate(user) {
    var col = client.db('store').collection('users')
    await col.insertOne(user)
    var result = col.find({})
    result = await result.toArray()
    console.log(result)
    return result
} 

async function checkLogin(email, password) {
    console.log('Check Login')
    
    var col = client.db('store').collection('users')
    var result = col.find({'email' : email})
    result = await result.toArray()
    console.log(result)

    for (let i = 0; i < result.length; i++) {
        var user = result[i]
        console.log(user)
        var hashedPass = crypto.createHash('sha256').update(password).digest('hex')
        console.log(user.email == email + ' | ' + user.password == hashedPass)
        if((user.email == email) && (user.password == hashedPass)) {
            currentUser = result[i]
            return true
        }
    }
    return false
}

async function getAllUsers() {
    var col = client.db('store').collection('users')
    var result = col.find()
    result = await result.toArray();
    console.log(result)
}

getAllUsers();

function checkAdmin(user) {
    console.log(user)
    if(user.acc_type == 'admin') {
        return true
    }
    return false;
}

// Saving current session user 
var currentUser = {'email' : 'guest', 'acc_type' : 'customer'};


app.get(['/home', '/'], function(req, res){
    console.log('Used checkAdmin get')
    if (checkAdmin(currentUser)) {
        res.sendFile(path.join(rootFolder, 'index_admin.html'))
    }
    else {
        res.sendFile(path.join(rootFolder, 'index.html'))
    }
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
    var product = {name:req.body.name, price:req.body.price, stock:req.body.stock}
    res.send(insertOneProduct(product)) 
})

app.post('/delete_product', express.json(),function(req, res) {
    var product = {name:req.body.name}
    res.send(deleteOneProduct(product))
})

app.get('/login', function(req, res){
    res.sendFile(path.join(rootFolder, 'login.html'))
})

app.post('/login_action', express.urlencoded({'extended' : true}), async function (req, res){
    const success = await checkLogin(req.body.email, req.body.password)
    if(success){
        res.sendFile(path.join(rootFolder, 'login_action.html'))
    }
    else {
        res.sendFile(path.join(rootFolder, 'login_fail.html'))
    }
})

app.get('/create_account', function(req, res){
    res.sendFile(path.join(rootFolder, 'create_account.html'))
})

app.get("/cart.js", function(req, res) {
    res.sendFile(path.join(rootFolder, "cart.js"))
})

app.post('/create_action', express.urlencoded({'extended':true}), function(req, res){
    var hashedPass = crypto.createHash('sha256').update(req.body.password).digest('hex')
    var newUser = {'email' : req.body.email, 
                    'password' : hashedPass, 
                    'fullname' : req.body.fullname, 
                    'address' : req.body.address,
                    'acc_type' : 'customer'}
    insertUserCreate(newUser)

    res.sendFile(path.join(rootFolder, 'create_customer_action.html'))
})

//Shopping Cart Module
app.post('/add_to_cart', express.json(), async function(req, res) {
    var cartItem = {
        name: req.body.name,
        quantity: req.body.quantity
    }

    var col = client.db("store").collection("cart")
    var userEmail = currentUser.email
    if (userEmail == 'guest') {
        console.log(userEmail)
        return;
    }

    var result = await col.findOne({ email: userEmail })

    if (result) {
        var existingItems = result.items || []
        var itemFound = false

        for (let i = 0; i < existingItems.length; i++) {
            if (existingItems[i].name === cartItem.name) {
                existingItems[i].quantity += cartItem.quantity
                itemFound = true
                break
            }
        }

        if (!itemFound) {
            existingItems.push(cartItem)
        }

        await col.updateOne(
            { email: userEmail },
            { $set: { items: existingItems } }
        )
    } else {
        var newCart = {
            email: userEmail,
            items: [cartItem]
        }
        await col.insertOne(newCart)
    }

    res.send("Item added")
})

app.get('/get_cart', async function(req, res) {
    var col = client.db("store").collection("cart")
    var result = await col.findOne({ email: currentUser.email })

    if (result) {
        res.send(result.items)
    } else {
        res.send([])
    }
})

// Checkout: confirm stock, create order, update inventory, clear cart
app.post('/checkout', async function(req, res) {
    var cartCol = client.db("store").collection("cart")
    var productCol = client.db("store").collection("products")
    var orderCol = client.db("store").collection("orders")

    var userEmail = currentUser.email
    var cart = await cartCol.findOne({ email: userEmail })

    if (!cart || cart.items.length === 0) {
        res.send({ success: false, message: "Cart is empty" })
        return
    }

    for (let i = 0; i < cart.items.length; i++) {
        let item = cart.items[i]
        let product = await productCol.findOne({ name: item.name })

        if (!product || product.stock < item.quantity) {
            await cartCol.deleteOne({ email: userEmail})
            res.send({ success: false, message: `Not enough stock for ${item.name}, clearing cart.`})
            return
        }
    }

    for (let i = 0; i < cart.items.length; i++) {
        let item = cart.items[i]
        await productCol.updateOne(
            { name: item.name },
            { $inc: { stock: -item.quantity } }
        )
        // Check if stock is 0, if so delete it
        let result = await productCol.findOne({name: item.name})
        if (result.stock <= 0) {
            await deleteOneProduct(result)
        }
    }

    var newOrder = {
        email: userEmail,
        items: cart.items,
        timestamp: new Date()
    }
    await orderCol.insertOne(newOrder)
    await cartCol.deleteOne({ email: userEmail })

    res.send({ success: true })
})

app.get('/about', function(req, res){
    res.sendFile(path.join(rootFolder, 'about.html'))
})

app.get('/manage_products', function(req, res){
    res.sendFile(path.join(rootFolder, 'product_manage.html'))
})

app.listen(3000, function(){
    console.log('Server Running at localhost:3000')
})

process.on("SIGINT", async () => {
    await client.close()
    process.exit()
})
