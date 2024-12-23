
package com.GroceryShop.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "products")
public class Product {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String image;
	private String name;
	private String description;
	private double price;
	private double discount;
	private Integer quantity;
	private Integer status;

	@ManyToOne
	@JoinColumn(name = "category_id", nullable = false)
	private Category category;

	@Transient
	private String categoryName;

	// Constructors, getters, and setters

	public Product() {
	}

	public Product(Long id, Category category, String image, String name, String description, double price,
			double discount, Integer quantity, Integer status) {
		this.id = id;
		this.category = category;
		this.image = image;
		this.name = name;
		this.description = description;
		this.price = price;
		this.discount = discount;
		this.quantity = quantity;
		this.status = status;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Category getCategory() {
		return category;
	}

	public void setCategory(Category category) {
		this.category = category;
	}

	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public double getPrice() {
		return price;
	}

	public void setPrice(double price) {
		this.price = price;
	}

	public double getDiscount() {
		return discount;
	}

	public void setDiscount(double discount) {
		this.discount = discount;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}

	public Integer getStatus() {
		return status;
	}

	public void setStatus(Integer status) {
		this.status = status;
	}

	public String getCategoryName() {
		return categoryName;
	}

	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}


public Long getCategory_id() {
    return category != null ? category.getId() : null;
}
	public void setCategory_id(Long id) {
		if (this.category == null) {
			this.category = new Category();
		}
		this.category.setId(id);
	}
}
