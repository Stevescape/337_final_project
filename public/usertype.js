window.addEventListener('DOMContentLoaded', () => {
    fetch('/user-type')
      .then(res => res.json())
      .then(data => {
        const navbar = document.getElementById('navbar');
        if (data.userType === 'admin') {
          navbar.innerHTML = `
            <a href = "home">Home</a>
            <a href = "products">Products</a>
            <a href = "login">Login</a>
            <a href = "create_account">Create Account</a>
            <a href = "create_admin">Create Manager Account</a>
            <a href = "manage_products">Manage Products</a>
            <a href = "about">About Us</a>`
        }
        else {
          navbar.innerHTML = `
            <a href = "home">Home</a>
            <a href = "products">Products</a>
            <a href = "login">Login</a>
            <a href = "create_account">Create Account</a>
            <a href = "about">About Us</a>`
        }
      })
      .catch(err => {
        console.error('Failed to load user type:', err);
      });
  });
  