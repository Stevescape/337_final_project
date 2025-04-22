function clear_grid() {
    console.log("Clearing grid")
    var grid = document.getElementsByClassName("product-grid")[0]
    while (grid.firstChild != null) {
        grid.removeChild(grid.lastChild)
    }
}

async function load_products() {
    var products = await fetch("http://localhost:3000/get_products")
    products = await products.json()
    clear_grid()
    var grid = document.getElementsByClassName("product-grid")[0]
    console.log("Loading products")
    for (let i = 0; i < products.length; i++) {
        var div = document.createElement("div")
        div.classList.add("product-type")

        var title = document.createElement("h3")
        title.appendChild(document.createTextNode(products[i]["name"]))
        div.appendChild(title)

        var price = document.createElement("h4")
        price.appendChild(document.createTextNode(products[i]["price"]))
        div.appendChild(price)
        div.appendChild(document.createElement("br"))

        var button = document.createElement("button")
        button.classList.add("btn")
        button.appendChild(document.createTextNode("Add to Cart"))
        div.appendChild(button)

        grid.appendChild(div)
    }
}

function reload_products(products) {
    clear_grid()
    var grid = document.getElementsByClassName("product-grid")[0]
    console.log("Loading products")
    for (let i = 0; i < products.length; i++) {
        var div = document.createElement("div")
        div.classList.add("product-type")

        var title = document.createElement("h3")
        title.appendChild(document.createTextNode(products[i]["name"]))
        div.appendChild(title)

        var price = document.createElement("h4")
        price.appendChild(document.createTextNode(products[i]["price"]))
        div.appendChild(price)
        div.appendChild(document.createElement("br"))

        var button = document.createElement("button")
        button.classList.add("btn")
        button.appendChild(document.createTextNode("Add to Cart"))
        div.appendChild(button)

        grid.appendChild(div)
    }
}

function add_product(product) {
    fetch("http://localhost:3000/add_product", {
        headers:{"Content-Type":"application/json"},
        method:"POST",
        body:JSON.stringify(product)
    })
    .then(() => {
        console.log("Added product successfully")
        console.log("Reloading products grid")
        load_products()
    })
    .catch((err) => {
        console.log(err)
    })
}

function delete_product(product) {
    fetch("http://localhost:3000/delete_product", {
        headers:{"Content-Type":"application/json"},
        method:"POST",
        body:JSON.stringify(product)
    })
    .then(() => {
        console.log("Deleted product successfully")
        console.log("Reloading products grid")
        load_products()
    })
    .catch((err) => {
        console.log(err)
    })
}