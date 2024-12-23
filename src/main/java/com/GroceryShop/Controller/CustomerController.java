
// CustomerController.java
package com.GroceryShop.Controller;

import com.GroceryShop.Model.Customer;
import com.GroceryShop.repository.CustomerRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/customers")
public class CustomerController {

	@Autowired
	private CustomerRepository customerRepository;

	@PostMapping("/create")
	public Customer createCustomer(@RequestBody Customer customer) {
		return customerRepository.save(customer);
	}

	@GetMapping("/{id}")
	public Optional<Customer> getCustomerById(@PathVariable Long id) {
		return customerRepository.findById(id);
	}

	@GetMapping("/all")
	public List<Customer> getAllCustomers() {
		return customerRepository.findAll();
	}

	@PutMapping("/update/{id}")
	public Customer updateCustomer(@PathVariable Long id, @RequestBody Customer customerDetails) {
		Customer customer = customerRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Customer not found"));
		customer.setFullName(customerDetails.getFullName());
		customer.setAddress(customerDetails.getAddress());
		customer.setEmail(customerDetails.getEmail());
		customer.setPhone(customerDetails.getPhone());
		return customerRepository.save(customer);
	}

	@DeleteMapping("/delete/{id}")
	public void deleteCustomer(@PathVariable Long id) {
		customerRepository.deleteById(id);
	}
}
