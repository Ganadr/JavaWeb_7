package com.GroceryShop.Controller;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.GroceryShop.Model.Product;
import com.GroceryShop.Model.User;
import com.GroceryShop.repository.ProductRepository;
import com.GroceryShop.repository.UserRepository;
import com.GroceryShop.Model.Category;
import com.GroceryShop.repository.CategoryRepository;

@Controller
public class UserController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
	private CategoryRepository categoryRepository;
    @Autowired
    private ProductRepository productRepository;
    @GetMapping("/login")
    public String loginPage(Model model) {
    	model.addAttribute("categories", categoryRepository.findAll());
		model.addAttribute("mainContentFragment", "home :: content");
        return "customer/login";
    }
    @GetMapping("/admin/dashboard")
    public String loginAdminPage(Model model) {
    	long accountCount = userRepository.count();
        model.addAttribute("accountCount", accountCount);
    	return "admin/index";
    }
  
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
        Map<String, Object> response = new HashMap<>();

        String uname = loginData.get("uname");
        String pwd = loginData.get("password");

        // Tìm người dùng theo tên đăng nhập và mật khẩu
        Optional<User> userOpt = userRepository.findByUnameAndPwd(uname, pwd);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String role = user.getRole().toUpperCase();

            // Điều hướng dựa trên role
            if ("ADMIN".equals(role)) {
                response.put("success", true);
                response.put("message", "Đăng nhập thành công!");
                response.put("redirectUrl", "/admin/dashboard");
            } else if ("USER".equals(role)) {
                response.put("success", true);
                response.put("message", "Đăng nhập thành công!");
                response.put("redirectUrl", "/user/home");
            } else {
                response.put("success", false);
                response.put("message", "Vai trò không hợp lệ!");
            }
        } else {
            response.put("success", false);
            response.put("message", "Tên đăng nhập hoặc mật khẩu không đúng!");
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/home")
    public String userHomePage(Model model) {
        List<Category> categories = categoryRepository.findAll();
        Map<Long, List<Product>> categoryProducts = loadCategoryProducts(categories);

        model.addAttribute("categories", categories);
        model.addAttribute("categoryProducts", categoryProducts);
        model.addAttribute("sliders", categories.subList(0, Math.min(categories.size(), 5)));
        model.addAttribute("mainContentFragment", "home :: content");
        return "customer/index";
    }

    private Map<Long, List<Product>> loadCategoryProducts(List<Category> categories) {
        Map<Long, List<Product>> categoryProducts = new HashMap<>();
        for (Category category : categories) {
            List<Product> products = productRepository.findByCategoryId(category.getId());
            categoryProducts.put(category.getId(), products);
        }
        return categoryProducts;
    }


    @GetMapping("/register")
    public String registerPage() {
        return "customer/login";
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody Map<String, String> userData) {
        Map<String, Object> response = new HashMap<>();

        String uname = userData.get("uname");
        String pwd = userData.get("pwd");
        String fname = userData.get("fname");
        String address = userData.get("address");
        String phone = userData.get("phone");

        // Kiểm tra xem tên người dùng có tồn tại không
        if (userRepository.findByUname(uname).isPresent()) {
            response.put("success", false);
            response.put("message", "Tên người dùng đã tồn tại!");
            return ResponseEntity.ok(response);
        }

        User user = new User();
        user.setUname(uname);
        user.setPwd(pwd); // Không mã hóa mật khẩu
        user.setFname(fname);
        user.setAddress(address);
        user.setPhone(phone);
        user.setRole("USER");

        try {
            userRepository.save(user); // Lưu thông tin người dùng vào cơ sở dữ liệu
            response.put("success", true);
            response.put("message", "Đăng ký thành công!");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Đăng ký thất bại! Lỗi: " + e.getMessage());
        }

        return ResponseEntity.ok(response);
    }
}