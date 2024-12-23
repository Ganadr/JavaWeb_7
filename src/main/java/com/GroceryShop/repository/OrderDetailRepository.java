
// OrderDetailRepository.java
package com.GroceryShop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.GroceryShop.Model.OrderDetail;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

	List<OrderDetail> findByOrderId(Long orderId);
}
