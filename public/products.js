function clear_grid() {
    console.log("Clearing grid")
    var grid = document.getElementsByClassName("product-grid")[0]
    while (grid.firstChild != null) {
        grid.removeChild(grid.lastChild)
    }
}

async function load_products(btn_text) {
    var products = await fetch("http://localhost:3000/get_products")
    products = await products.json()
    clear_grid()
    var grid = document.getElementsByClassName("product-grid")[0]
    console.log("Loading products")
    for (let i = 0; i < products.length; i++) {
        var div = document.createElement("div")
        div.classList.add("product-type")

        var title = document.createElement("h3")
        title.appendChild(document.createTextNode(products[i]["name"] + " (" + products[i]["stock"] + ")"))
        div.appendChild(title)

        var price = document.createElement("h4")
        price.appendChild(document.createTextNode("$" + products[i]["price"]))
        div.appendChild(price)
        div.appendChild(document.createElement("br"))

        var button = document.createElement("button")
        button.classList.add("btn")
        if (btn_text == "Add to Cart") {
            button.onclick = () => {addToCart(products[i]["name"], 1)}
        } else if (btn_text == "Remove Item") {
            button.onclick = () => {delete_product({"name":products[i]["name"]})}
        }
        button.appendChild(document.createTextNode(btn_text))
        div.appendChild(button)

        grid.appendChild(div)
    }
}

function add_product() {
    var name = document.getElementsByName("name")[0].value
    var price = document.getElementsByName("price")[0].value
    var stock = parseInt(document.getElementsByName("stock")[0].value)
    var product = {"name":name, "price":price, "stock":stock}
    fetch("http://localhost:3000/add_product", {
        headers:{"Content-Type":"application/json"},
        method:"POST",
        body:JSON.stringify(product)
    })
    .then(() => {
        console.log("Added product successfully")
        console.log("Reloading products grid")
        load_products("Remove Item")
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
        load_products("Remove Item")
    })
    .catch((err) => {
        console.log(err)
    })
}