package com.GroceryShop.Controller;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.GroceryShop.Model.Product;
import com.GroceryShop.repository.ProductRepository;
import com.GroceryShop.Model.Category;
import com.GroceryShop.repository.CategoryRepository;

@Controller
public class HomeController {
	
	@Autowired
	private CategoryRepository categoryRepository;
	   @Autowired
	    private ProductRepository productRepository;
	
    @GetMapping("/")
	public String index(Model model) {
		List<Category> categories = categoryRepository.findAll();
		Map<Long, List<Product>> categoryProducts = new HashMap<>();

		for (Category category : categories) {
			List<Product> products = productRepository.findByCategoryId(category.getId());
			categoryProducts.put(category.getId(), products);
		}

		model.addAttribute("categories", categories);
		model.addAttribute("categoryProducts", categoryProducts);
		model.addAttribute("sliders", categories.subList(0, Math.min(categories.size(), 5)));
		
		return "customer/index";
	}

    @GetMapping("/admin")
    public String homeAdmin(Model model) {
    	model.addAttribute("mainContentFragment", "customer/index :: content");
        return "admin/index";
    }
    
    
   
}