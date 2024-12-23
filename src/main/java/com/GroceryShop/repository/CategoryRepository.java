package com.GroceryShop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.GroceryShop.Model.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
	
}
