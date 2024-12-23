
package com.GroceryShop.Controller;

import org.springframework.stereotype.Controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.GroceryShop.Model.Product;
import com.GroceryShop.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.GroceryShop.Model.Category;
import com.GroceryShop.repository.CategoryRepository;

@Controller
public class ProductController {
	@Value("${upload.folder}")
	private String uploadPath;

	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private CategoryRepository categoryRepository;

	@GetMapping("/admin/addProduct")
	public String showAddProductForm(Model model) {
		List<Category> categories = categoryRepository.findAll();
		model.addAttribute("categories", categories);
		return "admin/addProduct";
	}



	@PostMapping("/admin/addProduct")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> addProducts(@RequestParam("category_id[]") List<Long> categoryIds,
			@RequestParam("image[]") List<MultipartFile> images, @RequestParam("name[]") List<String> names,
			@RequestParam("description[]") List<String> descriptions, @RequestParam("price[]") List<Double> prices,
			@RequestParam("discount[]") List<Double> discounts, @RequestParam("quantity[]") List<Integer> quantities,
			@RequestParam("status[]") List<Integer> statuses) {
		Map<String, Object> response = new HashMap<>();
		try {
			for (int i = 0; i < names.size(); i++) {
				// Lưu ảnh vào thư mục upload
				MultipartFile image = images.get(i);
				String originalImageName = image.getOriginalFilename();
				String uniqueImageName = UUID.randomUUID().toString() + "_" + originalImageName;
				Path imagePath = Paths.get(uploadPath + File.separator + uniqueImageName);

				// Tạo thư mục nếu chưa tồn tại
				if (!Files.exists(imagePath.getParent())) {
					Files.createDirectories(imagePath.getParent());
				}
				System.out.println("Đường dẫn thực của file được tạo: " + imagePath.toAbsolutePath());
				Files.write(imagePath, image.getBytes());

				// Tạo đối tượng Product và lưu vào cơ sở dữ liệu
				Product product = new Product();
				product.setCategory_id(categoryIds.get(i));
				product.setImage(uniqueImageName);
				product.setName(names.get(i));
				product.setDescription(descriptions.get(i));
				product.setPrice(prices.get(i));
				product.setDiscount(discounts.get(i));
				product.setQuantity(quantities.get(i));
				product.setStatus(statuses.get(i));
				productRepository.save(product);
			}

			response.put("success", true);
			response.put("message", "Thêm sản phẩm thành công!");
			return ResponseEntity.ok(response);
		} catch (IOException e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "Thêm sản phẩm thất bại! Lỗi: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	   @GetMapping("/admin/watchProduct")
	    public String watchProduct(Model model, @RequestParam(defaultValue = "0") int page) {
	        Pageable pageable = PageRequest.of(page, 5);
	        Page<Product> productPage = productRepository.findAll(pageable);

	        for (Product product : productPage) {
	            Category category = categoryRepository.findById(product.getCategory_id()).orElse(null);
	            if (category != null) {
	                product.setCategoryName(category.getName());
	            }
	        }

	        model.addAttribute("productPage", productPage);
	        return "admin/watchProduct";
	    }

		@GetMapping("/admin/detailProduct/{id}")
		public ResponseEntity<Map<String, Object>> getProductDetails(@PathVariable Long id) {
			Product product = productRepository.findById(id).orElse(null);
			if (product == null) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
			}

			Category category = categoryRepository.findById(product.getCategory_id()).orElse(null);
			String categoryName = (category != null) ? category.getName() : "Unknown";

			Map<String, Object> response = new HashMap<>();
			response.put("id", product.getId());
			response.put("categoryName", categoryName);
			response.put("description", product.getDescription());
			response.put("price", product.getPrice());
			response.put("discount", product.getDiscount());
			response.put("quantity", product.getQuantity());
			response.put("image", product.getImage());
			response.put("name", product.getName());
			response.put("status", product.getStatus());

			return ResponseEntity.ok(response);
		}

		@GetMapping("/admin/getCategories")
		public ResponseEntity<List<Category>> getCategories() {
			List<Category> categories = categoryRepository.findAll();
			return ResponseEntity.ok(categories);
		}

		@PostMapping("/admin/updateProduct/{id}")
		@ResponseBody
		public ResponseEntity<Map<String, Object>> updateProduct(@PathVariable Long id,
				@RequestParam(value = "image", required = false) MultipartFile imageFile,
				@RequestParam("category_id") long category_id, @RequestParam("name") String name,
				@RequestParam("price") double price, @RequestParam("discount") double discount,
				@RequestParam("quantity") int quantity, @RequestParam("status") int status) {
			Map<String, Object> response = new HashMap<>();
			try {
				Product product = productRepository.findById(id).orElse(null);

				if (product != null) {
					if (imageFile != null && !imageFile.isEmpty()) {
						String originalImageName = imageFile.getOriginalFilename();
						String uniqueImageName = UUID.randomUUID().toString() + "_" + originalImageName;
						Path imagePath = Paths.get(uploadPath + File.separator + uniqueImageName);

						if (!Files.exists(imagePath.getParent())) {
							Files.createDirectories(imagePath.getParent());
						}
						Files.write(imagePath, imageFile.getBytes());
						product.setImage(uniqueImageName);
					}

					Category category = categoryRepository.findById(category_id).orElse(null);
					if (category != null) {
						product.setCategory(category);
					}

					product.setPrice(price);
					product.setDiscount(discount);
					product.setQuantity(quantity);
					product.setName(name);
					product.setStatus(status);

					productRepository.save(product);

					response.put("success", true);
					response.put("message", "Product updated successfully!");
					return ResponseEntity.ok(response);
				} else {
					response.put("success", false);
					response.put("message", "Product not found");
					return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
				}
			} catch (IOException e) {
				e.printStackTrace();
				response.put("success", false);
				response.put("message", "Error updating product: " + e.getMessage());
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
			}
		}

		 @DeleteMapping("/admin/deleteProduct/{id}")
		    @ResponseBody
		    public String deleteCategory(@PathVariable("id") Long id) {
		        try {
		            productRepository.deleteById(id);
		            return "success";
		        } catch (Exception e) {
		            e.printStackTrace();
		            return "error";
		        }
		    }

			@GetMapping("/user/product")
			public String getAllProducts(@RequestParam(required = false) List<Long> categories,
					@RequestParam(required = false) Double minPrice, @RequestParam(required = false) Double maxPrice,
					@RequestParam(defaultValue = "1") int page, Model model) {
				int productsPerPage = 3;
				Pageable pageable = PageRequest.of(page - 1, productsPerPage);

				List<Category> allCategories = categoryRepository.findAll();
				model.addAttribute("categories", allCategories);

				Page<Product> productPage;
				if ((categories == null || categories.isEmpty()) && minPrice == null && maxPrice == null) {
					productPage = productRepository.findAll(pageable);
				} else {
					productPage = productRepository.findByCategoryIdInAndPriceBetween(categories, minPrice, maxPrice,
							pageable);
				}

				model.addAttribute("products", productPage.getContent());
				model.addAttribute("currentPage", page);
				model.addAttribute("totalPages", productPage.getTotalPages());

				return "customer/shop";
			}

			private Map<Long, List<Product>> loadCategoryProducts(List<Category> categories) {
				Map<Long, List<Product>> categoryProducts = new HashMap<>();
				for (Category category : categories) {
					List<Product> products = productRepository.findByCategoryId(category.getId());
					categoryProducts.put(category.getId(), products);
				}
				return categoryProducts;
			}
			@GetMapping("/user/api/categories")
			@ResponseBody
			public List<Category> getCategoryUser() {
				return categoryRepository.findAll();
			}

			@GetMapping("/user/api/products")
			@ResponseBody
			public List<Product> getFilteredProducts(@RequestParam(required = false) List<Long> categories) {
				if (categories == null || categories.isEmpty()) {
					return productRepository.findAll();
				} else {
					return productRepository.findByCategoryIdIn(categories);
				}
			}

			@GetMapping("/user/category/{id}")
			public String getCategoryById(@PathVariable Long id, @RequestParam(defaultValue = "0") int page,
					Model model) {
				int productsPerPage = 5;
				Pageable pageable = PageRequest.of(page, productsPerPage);

				Category category = categoryRepository.findById(id).orElse(null);
				if (category == null) {
					return "error/404"; // Return a 404 error page if the category is not found
				}

				Page<Product> productPage = productRepository.findByCategoryId(id, pageable);
				List<Category> categories = categoryRepository.findAll(); // Fetch all categories

				model.addAttribute("category_detail", category);
				model.addAttribute("products", productPage.getContent());
				model.addAttribute("currentPage", page);
				model.addAttribute("totalPages", productPage.getTotalPages());
				model.addAttribute("categories", categories); // Add categories to the model

				return "customer/detailcategory"; // Return the category detail view
			}

		

}
