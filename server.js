const express = require('express');
const session = require('express-session')
const path = require('path');
const fs = require('fs');
const crypto = require('crypto')
const app = express();
const {MongoClient} = require("mongodb")

// Set Environment Key
// var db_url = process.env.API_KEY
// if (db_url.startsWith('"') && db_url.endsWith('"')) {
//     db_url = db_url.slice(1, -1); 
// }

var db_url = "mongodb://localhost:27017/"

// Set up MongoDB using Environment Key
var client = new MongoClient(db_url)
client.connect()

// async function deleteClient(search){
//     var col = client.db('store').collection('users')
//     await col.deleteOne(search)
//     var result = col.find({})
//     result = await result.toArray()
//     console.log(result)
//     return result
// }

// deleteClient({email : 'admin@place'})

// Add default admin if it doesn't exist, password: pass123
async function addDefaultAdmin() {
    var col = client.db('store').collection('users')
    var res = await col.findOne({"email": "admin@gmail.com"})
    if (!res) {
        console.log("Creating default admin, email is admin@gmail.com and password is pass123")
        let pass = crypto.createHash('sha256').update("pass123").digest('hex')
        await col.insertOne({"email": "admin@gmail.com", "password": pass, "acc_type": "admin"})
    }
}
addDefaultAdmin()

// Set up session to pass account information through
app.use(express.json())

app.use(session({
    secret: 'something key lol',
    resave: 'false',
    saveUninitialized: true,
    cookie: {secure: false}
}))

// Setting File Path
const rootFolder = path.join(__dirname, 'public/');
app.use(express.static('public'));

// Product Management Module
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

// Login & Account Creation Module
app.use(function(req, res, next) {
    // Set session userInfo to guest initally
    if (!req.session.userInfo) {
        req.session.userInfo = {acc_type: 'guest', email: 'guest', fullname: 'Guest User'}
    }
    next()
})

async function insertUserCreate(user) {
    var col = client.db('store').collection('users')
    await col.insertOne(user)
    var result = col.find({})
    result = await result.toArray()
    console.log(result)
    return result
} 

async function getUser(email, password) {
    // Gets a user using a given email and password. Returns false if not found
    var col = client.db('store').collection('users')
    var result = col.find({'email' : email})
    result = await result.toArray()
    for (let i = 0; i < result.length; i++) {
        var user = result[i]
        var hashedPass = crypto.createHash('sha256').update(password).digest('hex')
        if((user.email == email) && (user.password == hashedPass)) {
            return result[i]
        }
    }
    return false
}

async function getAllUsers() {
    // Prints all users
    var col = client.db('store').collection('users')
    var result = col.find()
    result = await result.toArray();
    console.log(result)
}

function checkAdmin(req, res, next) {
    // checks if the session user is an admin or customer, redirects users to 404 page if they try to access admin pages through URL
    if (req.session.userInfo.acc_type == 'admin'){
        next();
    }
    else {
        res.status(404).sendFile(path.join(rootFolder, '404.html'));
    }
}

// Loads Navigation Bar
app.get('/user-type', function(req, res){
    let userType = req.session.userInfo.acc_type
    res.json({ userType });
})

// Loads All Pages
app.get(['/home', '/'], function(req, res){
    res.sendFile(path.join(rootFolder, 'index.html'))
})

app.get('/products', function(req, res){
    res.sendFile(path.join(rootFolder, 'products.html'))
})

app.get('/products.js', function(req, res) {
    res.sendFile(path.join(rootFolder, 'products.js'))
})

// Requests for Product Management
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
    //const success = await checkLogin(req.body.email, req.body.password)
    let user = await getUser(req.body.email, req.body.password)
    if(user){
        req.session.userInfo = user
        res.sendFile(path.join(rootFolder, 'login_action.html'))
    }
    else {
        res.sendFile(path.join(rootFolder, 'login_fail.html'))
    }
})

app.get('/create_account', function(req, res){
    res.sendFile(path.join(rootFolder, 'create_account.html'))
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
app.get("/cart.js", function(req, res) {
    res.sendFile(path.join(rootFolder, "cart.js"))
})

app.post('/add_to_cart', express.json(), async function(req, res) {
    var cartItem = {
        name: req.body.name,
        quantity: req.body.quantity
    }

    var col = client.db("store").collection("cart")
    var userEmail = req.session.userInfo.email
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
    var result = await col.findOne({ email: req.session.userInfo.email })

    if (result) {
        res.send(result.items)
    } else {
        res.send([])
    }
})

// Checkout: confirm stock, create order, update inventory
app.post('/checkout', async function(req, res) {
    var cartCol = client.db("store").collection("cart")
    var productCol = client.db("store").collection("products")
    var orderCol = client.db("store").collection("orders")

    var userEmail = req.session.userInfo.email
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

// Clear user's cart
app.post('/clear_cart', async function(req, res) {
    var cartCol = client.db("store").collection("cart")
    var userEmail = req.session.userInfo.email
    if (userEmail == 'guest') {
        console.log(userEmail)
        return;
    }
    
    await cartCol.deleteOne({ email: userEmail })
    res.send({ success: true, message: "Cart cleared" })
})

app.get('/about', function(req, res){
    res.sendFile(path.join(rootFolder, 'about.html'))
})

app.get('/manage_products', checkAdmin, function(req, res){
    res.sendFile(path.join(rootFolder, 'product_manage.html'))
})

// Requests for Admin Pages
app.get('/create_admin', checkAdmin, function(req, res){
    res.sendFile(path.join(rootFolder, 'create_account_admin.html'))
})

app.post('/create_action_admin', checkAdmin, express.urlencoded({'extended':true}), function(req, res){
    var hashedPass = crypto.createHash('sha256').update(req.body.password).digest('hex')
    var newUser = {'email' : req.body.email, 
                    'password' : hashedPass, 
                    'fullname' : req.body.fullname, 
                    'address' : req.body.address,
                    'acc_type' : 'admin'}
    insertUserCreate(newUser)

    res.sendFile(path.join(rootFolder, 'create_customer_action.html'))
})

app.use(function(req, res) {
    res.status(404).sendFile(path.join(rootFolder, '404.html'));
});

app.listen(3000, function(){
    console.log('Server Running at localhost:3000')
})

process.on("SIGINT", async () => {
    await client.close()
    process.exit()
})
