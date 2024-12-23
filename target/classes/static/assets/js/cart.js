

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
		//alert('ok');
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
			const productId = this.getAttribute('data-product-id');
			const productName = productElement.querySelector('.product-title a').textContent;
			const productPrice = parseFloat(productElement.querySelector('.product-price').textContent.replace('$', ''));
			const productImage = productElement.querySelector('.product-image').src;
			const productQuantity = 1; // Assuming quantity is 1 for simplicity
			const productDiscountElement = productElement.querySelector('.product-discount span:nth-child(2)');
			const productDiscount = productDiscountElement ? parseFloat(productDiscountElement.textContent.replace('%', '')) : 0;
			console.log("productId: " + productId + ", productName: " + productName + ", productPrice: " + productPrice + ", productImage: " + productImage + ", productQuantity: " + productQuantity + ", productDiscount: " + productDiscount);
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


document.addEventListener("DOMContentLoaded", function() {
	const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
	const cartTableBody = document.querySelector('.table-cart tbody');
	const summaryTotal = document.querySelector('.summary-total td:last-child');
	const updateCartButton = document.querySelector('.btn-update-cart');
	let totalAmount = 0;

	cartItems.forEach((item, index) => {
		const row = document.createElement('tr');
		const itemTotal = Math.round(item.productPrice * item.productQuantity * (1 - item.productDiscount / 100));
		totalAmount += itemTotal;

		row.innerHTML = `
            <td>${index + 1}</td>
            <td class="product-col">
                <div class="product">
                    <figure class="product-media">
                        <a href="/product/${item.id}">
                            <img src="${item.productImage}" alt="Product image">
                        </a>
                    </figure>
                    <h3 class="product-title">
                        <a href="/product/${item.id}">${item.productName}</a>
                    </h3>
                </div>
            </td>
            <td class="price-col">$${Math.round(item.productPrice)}</td>
            <td class="discount-col">${item.productDiscount}%</td>
            <td class="quantity-col">
                <div class="cart-product-quantity">
                    <input type="number" class="form-control" value="${item.productQuantity}" min="1" max="10" step="1" data-decimals="0" required data-index="${index}">
                </div>
            </td>
            <td class="total-col">$${itemTotal}</td>
            <td class="remove-col"><button id="btn-remove"><i class="icon-close"></i></button></td>
        `;
		cartTableBody.appendChild(row);
	});

	summaryTotal.textContent = `$${Math.round(totalAmount)}`;

	// Add event listener for remove buttons
	document.querySelectorAll('#btn-remove').forEach((button, index) => {
		button.addEventListener('click', () => {
			cartItems.splice(index, 1);
			localStorage.setItem('cart', JSON.stringify(cartItems));
			location.reload();
		}, { passive: true });
	});

	// Add event listener for update cart button
	updateCartButton.addEventListener('click', () => {
		document.querySelectorAll('.cart-product-quantity input').forEach((input) => {
			const index = input.getAttribute('data-index');
			if (cartItems[index]) {
				cartItems[index].productQuantity = parseInt(input.value, 10);
			}
		});
		localStorage.setItem('cart', JSON.stringify(cartItems));
		Swal.fire({
			icon: 'success',
			title: 'Cập nhật giỏ hàng thành công',
			showConfirmButton: false,
			timer: 1500
		}).then(() => {
			location.reload();
		});
	});
});
