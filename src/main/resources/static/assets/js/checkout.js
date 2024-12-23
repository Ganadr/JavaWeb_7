
document.addEventListener("DOMContentLoaded", function() {
	const cartIcon = document.querySelector('.icon-shopping-cart');
	const cartCount = document.querySelector('.cart-count');
	const cartTotalPrice = document.querySelector('.cart-total-price');
	const cartProductsContainer = document.querySelector('.dropdown-cart-products');

	// Function to update the cart
	function updateCart(productId, productName, productPrice, productImage, productQuantity, productDiscount) {
		const cartProducts = JSON.parse(localStorage.getItem('cart')) || [];
		let productExists = false;

		// Check if product already exists in the cart
		cartProducts.forEach(product => {
			if (product.id === productId) {
				product.productQuantity += productQuantity;
				productExists = true;
			}
		});

		// If product does not exist, add it to the cart
		if (!productExists) {
			cartProducts.push({ id: productId, productName, productPrice, productImage, productQuantity, productDiscount });
		}

		// Save updated cart to localStorage
		localStorage.setItem('cart', JSON.stringify(cartProducts));
		loadCartFromLocalStorage();
	}

	// Function to save cart to localStorage
	function saveCartToLocalStorage() {
		const cartProducts = [];
		document.querySelectorAll('.dropdown-cart-products .product').forEach(function(productElement) {
			const productId = productElement.getAttribute('data-id');
			const productName = productElement.querySelector('.product-title a').textContent;
			const productPrice = parseFloat(productElement.querySelector('.cart-product-info').textContent.split(' x $')[1].split(' (Discount: $')[0]);
			const productImage = productElement.querySelector('.product-image img').src;
			const productQuantity = parseInt(productElement.querySelector('.cart-product-qty').textContent);
			const productDiscount = parseFloat(productElement.querySelector('.cart-product-info').textContent.split('Discount: $')[1].replace(')', ''));
			cartProducts.push({ id: productId, productName, productPrice, productImage, productQuantity, productDiscount });
		});
		localStorage.setItem('cart', JSON.stringify(cartProducts));
		localStorage.setItem('cartCount', cartCount.textContent);
		localStorage.setItem('cartTotalPrice', cartTotalPrice.textContent);
	}

	// Function to load cart from localStorage
	function loadCartFromLocalStorage() {
		const cartProducts = JSON.parse(localStorage.getItem('cart')) || [];
		cartProductsContainer.innerHTML = '';
		let totalQuantity = 0;
		let totalPrice = 0;

		cartProducts.forEach(function(product) {
			const productElement = document.createElement('div');
			productElement.classList.add('product');
			productElement.setAttribute('data-id', product.id);
			productElement.innerHTML = `
                <div class="product-cart-details">
                    <h4 class="product-title">
                        <a href="product.html">${product.productName}</a>
                    </h4>
                    <span class="cart-product-info">
                        <span class="cart-product-qty">${product.productQuantity}</span> x $${product.productPrice} (Discount: $${product.productDiscount})
                    </span>
                </div>
                <figure class="product-image-container">
                    <a href="product.html" class="product-image">
                        <img src="${product.productImage}" alt="product">
                    </a>
                </figure>
                <a href="#" class="btn-remove" title="Remove Product"><i class="icon-close"></i></a>
            `;

			cartProductsContainer.appendChild(productElement);

			totalQuantity += product.productQuantity;
			totalPrice += product.productQuantity * (product.productPrice - (product.productPrice * (product.productDiscount / 100)));
		});

		cartCount.textContent = totalQuantity;
		cartTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;
	}

	// Add event listener to "Thêm vào giỏ hàng" buttons
	document.querySelectorAll('.btn-cart').forEach(function(button) {
		button.addEventListener('click', function(event) {
			event.preventDefault();
			const productElement = this.closest('.product');
			const productId = productElement.getAttribute('data-id');
			const productName = productElement.querySelector('.product-title a').textContent;
			const productPrice = parseFloat(productElement.querySelector('.product-price').textContent.replace('$', ''));
			const productImage = productElement.querySelector('.product-image').src;
			const productQuantity = 1; // Assuming quantity is 1 for simplicity
			const productDiscountElement = productElement.querySelector('.product-discount span:nth-child(2)');
			const productDiscount = productDiscountElement ? parseFloat(productDiscountElement.textContent.replace('%', '')) : 0;

			updateCart(productId, productName, productPrice, productImage, productQuantity, productDiscount);
		});
	});

	// Show cart dropdown when cart icon is clicked
	cartIcon.addEventListener('click', function(event) {
		event.preventDefault();
		const cartDropdown = document.querySelector('.cart-dropdown .dropdown-menu');
		cartDropdown.style.display = cartDropdown.style.display === 'none' ? 'block' : 'none';
	});

	// Load cart from localStorage on page load
	loadCartFromLocalStorage();
});


document.addEventListener('DOMContentLoaded', function() {
	fetch('/user/viewCart')
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			const cartItems = document.querySelector('.table tbody');
			data.forEach(item => {
				const row = document.createElement('tr');
				//console.log("row = " + row);
				row.innerHTML = `
                    <td>${item.productName}</td>
                    <td>${item.finalPrice}</td>
                `;
				cartItems.appendChild(row);
			});
		})
		.catch(error => console.error('Error fetching cart data:', error));
});




document.addEventListener("DOMContentLoaded", function() {
	const orderForm = document.getElementById('orderForm');
	const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
	const username = localStorage.getItem("username");

	orderForm.addEventListener('submit', function(event) {
		event.preventDefault();

		const customerName = document.querySelector('input[placeholder="Nhập họ tên"]').value;
		const customerAddress = document.querySelector('input[placeholder="Nhập địa chỉ nhận hàng"]').value;
		const customerEmail = document.querySelector('input[placeholder="Nhập địa chỉ email"]').value;
		const customerPhone = document.querySelector('input[placeholder="Nhập số điện thoại"]').value;
		const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

		const totalAmount = cartItems.reduce((total, item) => {
			const originalPrice = Math.round(item.productPrice * item.productQuantity);
			const discountedPrice = Math.round(originalPrice * (1 - item.productDiscount / 100));
			return total + discountedPrice;
		}, 0);

		const orderData = {
			username,
			customerName,
			customerAddress,
			customerEmail,
			customerPhone,
			paymentMethod,
			totalAmount,
			cartItems: cartItems.length > 0 ? cartItems : null
		};

		// Print cartItems details
		cartItems.forEach(item => {
			console.log(`Product ID: ${item.id}, Product Name: ${item.productName}, Price: ${item.productPrice}, Quantity: ${item.productQuantity}, Discount: ${item.productDiscount}`);
		});
	  console.log("CartItems: " + JSON.stringify(cartItems, null, 2));
		fetch('/user/checkOut', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(orderData)
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					Swal.fire({
						icon: 'success',
						title: 'Đặt hàng thành công',
						showConfirmButton: false,
						timer: 400
					}).then(() => {
						localStorage.removeItem('cart');
					//	window.location.href = '/';
					});
				} else {
					console.log("Order failed: " + data.message);
					Swal.fire({
						icon: 'error',
						title: 'Đặt hàng thất bại',
						text: data.message
					});
				}
			})
			.catch(error => {
				console.error('Error:', error);
				Swal.fire({
					icon: 'error',
					title: 'Đặt hàng thất bại',
					text: 'Đã xảy ra lỗi trong quá trình đặt hàng. Vui lòng thử lại sau.'
				});
			});
	});
});




document.addEventListener('DOMContentLoaded', function() {
	const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
	const cartTableBody = document.querySelector('#cart-table tbody');
	let totalAmount = 0;

	// Populate the cart table with items from localStorage
	cartItems.forEach((item) => {
		const row = document.createElement('tr');
		const itemTotal = Math.round(item.productPrice * item.productQuantity * (1 - item.productDiscount / 100));
		totalAmount += itemTotal;

		row.innerHTML = `
            <td>${item.productName}</td>
            <td>$${itemTotal}</td>
        `;
		cartTableBody.appendChild(row);
	});

	// Display the total amount in the dropdown-cart-total section
	const cartTotalPrice = document.getElementById('total_price');
	if (cartTotalPrice) {
		cartTotalPrice.textContent = `$${Math.round(totalAmount)}`;
	}
});
