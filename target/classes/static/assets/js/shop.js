
document.addEventListener("DOMContentLoaded", function() {
	// Cart elements
	const cartIcon = document.querySelector('.icon-shopping-cart');
	const cartCount = document.querySelector('.cart-count');
	const cartTotalPrice = document.querySelector('.cart-total-price');
	const cartProductsContainer = document.querySelector('.dropdown-cart-products');
	const cartTableBody = document.querySelector('.table-cart tbody');
	const summaryTotal = document.querySelector('.summary-total td:last-child');
	const updateCartButton = document.querySelector('.btn-update-cart');

	// Fetch categories and populate the filter
	fetch('/user/api/categories')
		.then(response => response.json())
		.then(categories => {
			const categoryFilter = document.getElementById('category-filter');
			categories.forEach(category => {
				const categoryHtml = `
                    <div class="filter-item">
                        <div class="custom-control custom-checkbox">
                            <input type="checkbox" class="custom-control-input" id="cat-${category.id}" data-id="${category.id}">
                            <label class="custom-control-label" for="cat-${category.id}">${category.name}</label>
                        </div>
                    </div>
                `;
				categoryFilter.insertAdjacentHTML('beforeend', categoryHtml);
			});

			// Add event listeners to category checkboxes
			document.querySelectorAll('#category-filter input[type="checkbox"]').forEach(checkbox => {
				checkbox.addEventListener('change', filterProducts);
			});
		})
		.catch(error => console.error('Error fetching categories:', error));

	// Fetch and display products

	function fetchProducts(categoryIds = []) {
			let url = `/user/api/products`;
			if (categoryIds.length > 0) {
				url += `?categories=${categoryIds.join(',')}`;
			}

			fetch(url)
				.then(response => response.json())
				.then(products => {
					const productList = document.getElementById('product-list');
					productList.innerHTML = ''; // Clear old content before adding new

					products.forEach(product => {
						const productHtml = `
						<div class="col-6 col-md-4 col-lg-4">
						    <div class="product product-7 text-center" data-product-id="${product.id}">
						        <figure class="product-media">
						            <div class="product-image">
						                <img src="/uploads/images/${product.image}" alt="Product image" class="product-image">
						            </div>
						            <div class="product-action-vertical">
						                <a href="#" class="btn-product-icon btn-wishlist btn-expandable" data-product-id="${product.id}">
						                    <span>add to wishlist</span>
						                </a>
						                <a href="popup/quickView.html" class="btn-product-icon btn-quickview" title="Quick view" data-product-id="${product.id}">
						                    <span>Quick view</span>
						                </a>
						            </div>
						            <div class="product-action">
						                <button class="btn-product btn-cart" data-product-id="${product.id}">
						                    <span>Thêm vào giỏ hàng</span>
						                </a>
						            </div>
						        </figure>

						        <div class="product-body">
						            <h3 class="product-title">
						                <a href="/product/${product.id}">${product.name}</a>
						            </h3>
						            <div class="product-price">$${product.price}</div>
						            <div class="product-discount">${product.discount}%</div>
						          
						        </div>
						    </div>
						</div>

	                    `;
						productList.insertAdjacentHTML('beforeend', productHtml);
					});

					// Add event listeners to "Add to Cart" buttons
					addCartEventListeners();
				})
				.catch(error => console.error('Error fetching products:', error));
		}

	// Filter products based on selected categories
	function filterProducts() {
		const selectedCategories = Array.from(document.querySelectorAll('#category-filter input[type="checkbox"]:checked'))
			.map(checkbox => checkbox.getAttribute('data-id'));
		fetchProducts(selectedCategories);
	}

	// Clear filters
	document.getElementById('clear-filters').addEventListener('click', function() {
		document.querySelectorAll('#category-filter input[type="checkbox"]').forEach(checkbox => {
			checkbox.checked = false;
		});
		fetchProducts();
	});

	// Show cart dropdown when cart icon is clicked
	cartIcon.addEventListener('click', function(event) {
		event.preventDefault();
		const cartDropdown = document.querySelector('.cart-dropdown .dropdown-menu');
		cartDropdown.style.display = cartDropdown.style.display === 'none' ? 'block' : 'none';
	});

	// Load cart from localStorage on page load
	loadCartFromLocalStorage();

	// Add event listeners to "Add to Cart" buttons
	function addCartEventListeners() {
		document.querySelectorAll('.btn-cart').forEach(function(button) {
			button.addEventListener('click', function(event) {
				event.preventDefault();
				const productElement = this.closest('.product');
				const productId = this.getAttribute('data-product-id');
				const productName = productElement.querySelector('.product-title a').textContent;
				const productPrice = parseFloat(productElement.querySelector('.product-price').textContent.replace('$', ''));
				const productImage = productElement.querySelector('.product-image img').src;
				const productQuantity = 1; // Assuming quantity is 1 for simplicity
				const productDiscountElement = productElement.querySelector('.product-discount');
				const productDiscount = productDiscountElement ? parseFloat(productDiscountElement.textContent.replace('%', '')) : 0;

				console.log("productId: " + productId + ", productName: " + productName + ", productPrice: " + productPrice + ", productImage: " + productImage + ", productQuantity: " + productQuantity + ", productDiscount: " + productDiscount);

				updateCart(productId, productName, productPrice, productImage, productQuantity, productDiscount);
			});
		});
	}

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

	// Load cart items into the cart table
	const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
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
