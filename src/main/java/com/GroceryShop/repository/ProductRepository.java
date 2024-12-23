package com.GroceryShop.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.GroceryShop.Model.Product;
import com.GroceryShop.Model.Category;

@Repository

public interface ProductRepository extends JpaRepository<Product, Long> {
	@Query("SELECT MIN(p.price) FROM Product p")
	Double findMinPrice();

	@Query("SELECT MAX(p.price) FROM Product p")
	Double findMaxPrice();

	List<Product> findByCategoryIdInAndPriceBetween(List<Long> categoryIds, Double minPrice, Double maxPrice);

	List<Product> findByCategoryId(Long categoryId);

	Page<Product> findByCategoryIdInAndPriceBetween(List<Long> categoryIds, Double minPrice, Double maxPrice,
			Pageable pageable);

	List<Product> findByCategoryIdIn(List<Long> categoryIds);

	Page<Product> findByCategoryId(Long id, Pageable pageable);
}
