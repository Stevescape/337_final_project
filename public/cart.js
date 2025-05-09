function loadCart() {
    fetch('/get_cart')
    .then(response => response.json())
    .then(cartItems => {
        displayCartItems(cartItems)
    })
    .catch(err => {
        console.log('Error fetching cart:', err)
    })
}

// Display cart items in the cart sidebar
function displayCartItems(items) {
    var container = document.querySelector('.cart-items')
    container.innerHTML = ''

    if (items.length === 0) {
        container.innerHTML = '<p>Your cart is empty</p>'
        return
    }

    for (var i = 0; i < items.length; i++) {
        var item = items[i]

        var div = document.createElement('p')
        div.className = 'cart-item'

        div.innerHTML = item.name + ' x ' + item.quantity
        container.appendChild(div)
    }
}

function addToCart(name, quantity) {
    fetch('/add_to_cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name, quantity: quantity })
    })
    .then(response => response.text())
    .then(message => {
        console.log(message)
        return fetch('/get_cart')
    })
    .then(response => response.json())
    .then(items => displayCartItems(items))
    .catch(err => {
        console.error('Error adding to cart:', err)
    })
}

// confirm stock, create order, update inventory, clear cart
function checkoutCart() {
    fetch('/checkout', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Order placed successfully!')
            displayCartItems([])
        } else {
            alert('Order failed: ' + result.message)
            loadCart()
        }
    })
    .then(() => {
        load_products("Add to Cart")
    })
    .catch(err => {
        console.error('Checkout error:', err)
    })
}

function clearCart() {
    fetch('/clear_cart', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Cart cleared.')
            displayCartItems([])
        } else {
            alert('Clear cart failed: ' + result.message)
        }
    })
    .catch(err => {
        console.error('Clear cart error:', err)
    })
}

window.addEventListener("DOMContentLoaded", function() {
    var checkoutBtn = document.querySelector('#checkout_btn')
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault()
            checkoutCart()
        })
    }

    var clearBtn = document.querySelector('#clear_btn')
    if (clearBtn) {
        clearBtn.addEventListener('click', function(e) {
            e.preventDefault()
            clearCart()
        })
    }
})

window.onload = loadCart()
