
function showProductDetails(productId, element) {
	const $currentRow = $(element).closest('tr');

	// Kiểm tra xem hàng chi tiết đã được thêm hay chưa
	let $detailsRow = $currentRow.next('.product-details');
	if ($detailsRow.length === 0) {
		// Nếu chưa có, thêm hàng chi tiết ngay sau hàng hiện tại
		$detailsRow = $(`
            <tr class="product-details">
                <td colspan="9">
                    <div>
                        <p><strong>ID:</strong> <span class="detail-id"></span></p>
                        <p><strong>Tên danh mục:</strong> <span class="detail-category-name"></span></p>
                        <p><strong>Tên sản phẩm:</strong> <span class="detail-name"></span></p>
                        <p><strong>Mô tả:</strong> <span class="detail-description"></span></p>
                        <p><strong>Giá bán:</strong> <span class="detail-price"></span></p>
                        <p><strong>Giá giảm:</strong> <span class="detail-discount"></span></p>
                        <p><strong>Số lượng tồn:</strong> <span class="detail-quantity"></span></p>
                        <p><strong>Trạng thái sản phẩm:</strong> <span class="detail-status"></span></p>
                        <p><strong>Hình ảnh:</strong></p>
                        <img class="detail-image" src="#" alt="Hình ảnh sản phẩm" width="200">
                    </div>
                </td>
            </tr>
        `);
		$currentRow.after($detailsRow);
	}

	// Gửi yêu cầu AJAX lấy thông tin chi tiết sản phẩm
	$.ajax({
		url: '/admin/detailProduct/' + productId,
		method: 'GET',
		success: function(data) {
			// Hiển thị thông tin chi tiết vào hàng được tạo
			$detailsRow.find('.detail-id').text(data.id);
			$detailsRow.find('.detail-category-name').text(data.categoryName);
			$detailsRow.find('.detail-name').text(data.name);
			$detailsRow.find('.detail-description').text(data.description);
			$detailsRow.find('.detail-price').text(data.price);
			$detailsRow.find('.detail-discount').text(data.discount);
			$detailsRow.find('.detail-quantity').text(data.quantity);
			$detailsRow.find('.detail-status').text(data.status == 1 ? 'Còn bán' : 'Không bán');
			$detailsRow.find('.detail-image').attr('src', '/uploads/images/' + data.image);

			// Ẩn các hàng chi tiết khác
			$('.product-details').not($detailsRow).remove();
			$detailsRow.toggle(); // Hiển thị hoặc ẩn hàng chi tiết hiện tại
		},
		error: function(error) {
			console.error('Error fetching product details:', error);
		}
	});
}

function editProduct(productId, element) {
	const $row = $(element).closest('tr');
	const $saveBtn = $row.find('.btn-primary');
	const $editBtn = $(element);

	// Gửi yêu cầu AJAX để lấy danh sách danh mục
	$.ajax({
		url: '/admin/getCategories',
		method: 'GET',
		success: function(categories) {
			// Chuyển các ô thành trường nhập liệu
			$row.find('td').each(function(index, td) {
				if (index === 0 || index === 8) return; // Bỏ qua ô STT và ô hành động
				const $td = $(td);
				const text = $td.text().trim();
				if (index === 1) {
					// Tên danh mục (select option)
					let categoryOptions = '<select class="form-control" data-field="category_id">';
					categories.forEach(category => {
						categoryOptions += `<option value="${category.id}" ${text === category.name ? 'selected' : ''}>${category.name}</option>`;
					});
					categoryOptions += '</select>';
					$td.html(categoryOptions);
				} else if (index === 2) {
					// Hình ảnh (upload file)
					const currentImage = $td.find('img').attr('src');
					const imageInput = `<input type="file" class="form-control" data-field="imageFile">`;
					$td.html(`${imageInput}<img src="${currentImage}" alt="Image" width="50" data-original-src="${currentImage}">`);
				} else if (index === 7) {
					// Trạng thái sản phẩm (select option)
					const statusOptions = `
                        <select class="form-control" data-field="status">
                            <option value="1" ${text === 'Còn bán' ? 'selected' : ''}>Còn bán</option>
                            <option value="0" ${text === 'Không bán' ? 'selected' : ''}>Không bán</option>
                        </select>`;
					$td.html(statusOptions);
				} else {
					// Các ô khác (input text)
					const input = `<input type="text" class="form-control" value="${text}" data-field="${$td.attr('data-field')}">`;
					$td.html(input);
				}
			});

			// Hiển thị nút Save và ẩn nút Edit
			$saveBtn.show();
			$editBtn.hide();
		},
		error: function(error) {
			console.error('Error fetching categories:', error);
		}
	});
}

function saveProduct(productId, element) {
	const $currentRow = $(element).closest('tr');
	const $saveBtn = $(element);
	const $editBtn = $currentRow.find('.btn-primary').not($saveBtn);
	const formData = new FormData();
	const imageInput = $currentRow.find('td:eq(2) input[type="file"]')[0];
	const originalImageSrc = $currentRow.find('td:eq(2) img').attr('data-original-src'); // Lấy ảnh cũ

	// Nếu có ảnh mới được chọn thì thêm vào formData
	if (imageInput && imageInput.files.length > 0) {
		formData.append('image', imageInput.files[0]);
	} else {
		formData.append('image', originalImageSrc); // Gửi đường dẫn ảnh cũ nếu không thay đổi
	}

	const categoryId = $currentRow.find('td:eq(1) select').val();
	const price = $currentRow.find('td:eq(4) input').val();

	// Validate category_id
	if (isNaN(categoryId) || categoryId === undefined || categoryId === null) {
		Swal.fire({
			icon: 'error',
			title: 'Thất bại',
			text: 'Danh mục không hợp lệ',
		});
		return;
	}

	// Validate price
	if (isNaN(price) || price === undefined || price === null) {
		Swal.fire({
			icon: 'error',
			title: 'Thất bại',
			text: 'Giá không hợp lệ',
		});
		return;
	}

	// Thêm dữ liệu vào formData
	formData.append('category_id', categoryId);
	formData.append('name', $currentRow.find('td:eq(3) input').val());
	formData.append('price', price);
	formData.append('discount', $currentRow.find('td:eq(5) input').val());
	formData.append('quantity', $currentRow.find('td:eq(6) input').val());
	formData.append('status', $currentRow.find('td:eq(7) select').val());

	$.ajax({
		url: '/admin/updateProduct/' + productId,
		method: 'POST',
		data: formData,
		processData: false,
		contentType: false,
		success: function(response) {
			// Cập nhật lại các ô với dữ liệu mới
			$currentRow.find('td').each(function(index) {
				if (index !== 0 && index !== 8) { // Bỏ qua cột STT và Hành động
					if (index === 1) { // Cột tên danh mục
						const selectedCategory = $currentRow.find('td:eq(1) select option:selected').text();
						$(this).text(selectedCategory);
					} else if (index === 2) { // Cột hình ảnh
						if (imageInput && imageInput.files.length > 0) {
							const file = imageInput.files[0];
							const reader = new FileReader();
							reader.onload = function(e) {
								$(this).html(`<img src="${e.target.result}" alt="Image" width="50" data-original-src="${e.target.result}">`);
							}.bind(this);
							reader.readAsDataURL(file);
						} else {
							// Sử dụng lại ảnh cũ nếu không thay đổi
							$(this).html(`<img src="${originalImageSrc}" alt="Image" width="50" data-original-src="${originalImageSrc}">`);
						}
					} else if (index === 7) { // Cột trạng thái
						const statusText = $currentRow.find('td:eq(7) select').val() == 1 ? 'Còn bán' : 'Không bán';
						$(this).html(`<span class="${statusText === 'Còn bán' ? 'label-success label label-default' : 'label-danger label label-default'}">${statusText}</span>`);
					} else {
						const inputVal = $(this).find('input').val();
						$(this).text(inputVal);
					}
				}
			});

			// Hiển thị nút Edit và ẩn nút Save
			$saveBtn.hide();
			$editBtn.show();

			// Hiển thị thông báo thành công
			Swal.fire({
				icon: 'success',
				title: 'Thành công',
				text: 'Sản phẩm đã được cập nhật thành công!',
			});
		},
		error: function(error) {
			console.error('Error saving product:', error);

			// Hiển thị thông báo thất bại
			Swal.fire({
				icon: 'error',
				title: 'Thất bại',
				text: 'Có lỗi xảy ra khi cập nhật sản phẩm',
			});
		}
	});
}

function deleteProduct(productId, element) {
	if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
		$.ajax({
			url: '/admin/deleteProduct/' + productId,
			method: 'DELETE',
			success: function(response) {
				if (response === 'success') {
					Swal.fire({
						icon: 'success',
						title: 'Xóa thành công',
						showConfirmButton: false,
						timer: 1500
					});
					$(element).closest('tr').remove();
				} else {
					Swal.fire({
						icon: 'error',
						title: 'Lỗi',
						text: 'Xóa danh mục thất bại'
					});
				}
			},
			error: function(error) {
				console.error('Error deleting category:', error);
				Swal.fire({
					icon: 'error',
					title: 'Lỗi',
					text: 'Xóa danh mục thất bại'
				});
			}
		});
	}
}