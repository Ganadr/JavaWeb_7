package com.GroceryShop.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.GroceryShop.Model.Order;
public interface OrderRepository extends JpaRepository<Order, Long> {
}