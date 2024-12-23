
package com.GroceryShop.Controller;

import com.GroceryShop.Model.Category;
import com.GroceryShop.repository.CategoryRepository;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.GroceryShop.DTO.OrderRequest;
import com.GroceryShop.Model.Customer;
import com.GroceryShop.Model.Order;
import com.GroceryShop.Model.OrderDetail;
import com.GroceryShop.Model.Product;
import com.GroceryShop.repository.CustomerRepository;
import com.GroceryShop.repository.OrderDetailRepository;
import com.GroceryShop.repository.OrderRepository;
import com.GroceryShop.repository.ProductRepository;
import com.GroceryShop.repository.UserRepository;
import com.GroceryShop.DTO.CartItem;

@Controller
public class OrderController {

	@Autowired
	private CategoryRepository categoryRepository;

	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private OrderRepository orderRepository;

	@Autowired
	private OrderDetailRepository orderDetailRepository;

	@Autowired
	private CustomerRepository customerRepository;

	@Autowired
	private UserRepository userRepository;

	@GetMapping("/user/viewCart")
	public String viewCart(Model model) {
		List<Category> categories = categoryRepository.findAll();
		Map<Long, List<Product>> categoryProducts = new HashMap<>();

		for (Category category : categories) {
			List<Product> products = productRepository.findByCategoryId(category.getId());
			categoryProducts.put(category.getId(), products);
		}

		model.addAttribute("categories", categories);
		model.addAttribute("categoryProducts", categoryProducts);
		model.addAttribute("sliders", categories.subList(0, Math.min(categories.size(), 5)));

		model.addAttribute("mainContentFragment", "home :: content");
		return "customer/cart";
	}

	@GetMapping("/user/checkOut")
	public String checkout(Model model) {
		List<Category> categories = categoryRepository.findAll();
		Map<Long, List<Product>> categoryProducts = new HashMap<>();

		for (Category category : categories) {
			List<Product> products = productRepository.findByCategoryId(category.getId());
			categoryProducts.put(category.getId(), products);
		}

		model.addAttribute("categories", categories);
		model.addAttribute("categoryProducts", categoryProducts);
		model.addAttribute("sliders", categories.subList(0, Math.min(categories.size(), 5)));

		model.addAttribute("mainContentFragment", "home :: content");
		return "customer/checkout";
	}

	@PostMapping("/user/checkOut")
	public ResponseEntity<?> orderCheckout(@RequestBody OrderRequest orderRequest) {
		try {
			// Kiểm tra và validate dữ liệu đầu vào
			if (orderRequest.getCartItems() == null || orderRequest.getCartItems().isEmpty()) {
				return ResponseEntity.status(400).body(Collections.singletonMap("error", "Giỏ hàng trống"));
			}

			// Tìm customer đã tồn tại hoặc tạo mới

			Customer customer = new Customer();
			customer.setFullName(orderRequest.getCustomerName());
			customer.setAddress(orderRequest.getCustomerAddress());
			customer.setEmail(orderRequest.getCustomerEmail());
			customer.setPhone(orderRequest.getCustomerPhone());
			customerRepository.save(customer);

			// Tạo đơn hàng mới
			Order order = new Order();
			order.setOrderDate(LocalDateTime.now());
			order.setPaymentMethod(orderRequest.getPaymentMethod());
			order.setStatus("Chờ xác nhận");
			order.setTotalPrice(orderRequest.getTotalAmount());
			order.setCustomer(customer);
			order.setUser(userRepository.findByUname(orderRequest.getUsername())
					.orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng")));

			// Lưu đơn hàng
			order = orderRepository.save(order);

			// Lưu chi tiết đơn hàng từ cartItems
			for (CartItem cartItem : orderRequest.getCartItems()) {
				// In thông tin của từng CartItem
				// System.out.println("CartItem: " + new
				// ObjectMapper().writeValueAsString(cartItem));

				Product product = productRepository.findById(cartItem.getId())
						.orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + cartItem.getId()));

				OrderDetail orderDetail = new OrderDetail();
				orderDetail.setOrder(order);
				orderDetail.setProduct(product);
				orderDetail.setQuantity(cartItem.getProductQuantity());
				orderDetailRepository.save(orderDetail);
			}

			// Trả về thành công
			return ResponseEntity.ok().body(Collections.singletonMap("success", true));
		} catch (Exception e) {
			// Xử lý lỗi
			return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
		}
	}
	@GetMapping("/admin/orders")
    public String listOrders(Model model) {
        List<Order> orders = orderRepository.findAll();
        model.addAttribute("orders", orders);
        return "admin/watchCart";
    }

  
}
