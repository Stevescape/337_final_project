window.onload = function() {
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
    container.innerHTML = '' // Clear cart

    if (items.length === 0) {
        container.innerHTML = '<p>Your cart is empty</p>'
        return
    }

    for (var i = 0; i < items.length; i++) {
        var item = items[i]

        var div = document.createElement('div')
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
        }
    })
    .catch(err => {
        console.error('Checkout error:', err)
    })
}

window.addEventListener("DOMContentLoaded", function() {
    var checkoutBtn = document.querySelector('.btn')
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault()
            checkoutCart()
        })
    }
})