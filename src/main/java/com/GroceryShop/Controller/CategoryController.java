
package com.GroceryShop.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.GroceryShop.Model.Category;
import com.GroceryShop.repository.CategoryRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Controller
public class CategoryController {

	@Value("${upload.folder}")
	private String uploadPath;

	@Autowired
	private CategoryRepository categoryRepository;

	@GetMapping("/admin/addCategory")
	public String addCategory() {
		return "admin/addCategory";
	}

	@PostMapping("/admin/addCategory")
	public ResponseEntity<Map<String, Object>> addCategories(@RequestParam("name[]") List<String> names,
			@RequestParam("image[]") List<MultipartFile> images,
			@RequestParam("description[]") List<String> descriptions,
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

				// Tạo đối tượng Category và lưu vào cơ sở dữ liệu
				Category category = new Category();
				category.setName(names.get(i));
				category.setImage(uniqueImageName);
				category.setDescription(descriptions.get(i));
				category.setStatus(statuses.get(i));
				categoryRepository.save(category);
			}

			response.put("success", true);
			response.put("message", "Thêm danh mục thành công!");
			return ResponseEntity.ok(response);
		} catch (IOException e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "Thêm danh mục thất bại! Lỗi: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	@GetMapping("/admin/watchCategory")
    public String watchCategory(Model model, @RequestParam(defaultValue = "0") int page) {
        Pageable pageable = PageRequest.of(page, 5);
        Page<Category> categoryPage = categoryRepository.findAll(pageable);
        model.addAttribute("categoryPage", categoryPage);
        return "admin/watchCategory";
	}

	@GetMapping("/admin/detailCategory/{id}")
	public ResponseEntity<Category> getCategoryDetails(@PathVariable Long id) {
		Category category = categoryRepository.findById(id).orElse(null);
		System.out.println(category.getName()+" "+category.getDescription()+" "+category.getStatus());
		if (category == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
		}
		return ResponseEntity.ok(category);
	}
	 @PostMapping("/admin/updateCategory/{id}")
	    @ResponseBody
	    public String updateCategory(@PathVariable("id") Long id,
	                                 @RequestParam(value = "image", required = false) MultipartFile image,
	                                 @RequestParam("name") String name,
	                                 @RequestParam("description") String description,
	                                 @RequestParam("status") int status) {
	        try {
	            Category category = categoryRepository.findById(id).orElse(null);
	            if (category != null) {
	                if (image != null && !image.isEmpty()) {
	                    String originalImageName = image.getOriginalFilename();
	                    String uniqueImageName = UUID.randomUUID().toString() + "_" + originalImageName;
	                    Path imagePath = Paths.get(uploadPath + File.separator + uniqueImageName);

	                    if (!Files.exists(imagePath.getParent())) {
	                        Files.createDirectories(imagePath.getParent());
	                    }
	                    Files.write(imagePath, image.getBytes());
	                    category.setImage(uniqueImageName);
	                }
	                category.setName(name);
	                category.setDescription(description);
	                category.setStatus(status);
	                categoryRepository.save(category);
	                return "success";
	            } else {
	                return "Category not found";
	            }
	        } catch (IOException e) {
	            e.printStackTrace();
	            return "Error updating category";
	        }
	    }
	 @DeleteMapping("/admin/deleteCategory/{id}")
	    @ResponseBody
	    public String deleteCategory(@PathVariable("id") Long id) {
	        try {
	            categoryRepository.deleteById(id);
	            return "success";
	        } catch (Exception e) {
	            e.printStackTrace();
	            return "error";
	        }
	    }
}
