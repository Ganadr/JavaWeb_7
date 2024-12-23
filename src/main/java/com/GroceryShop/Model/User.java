package com.GroceryShop.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String uname;  // Tên đăng nhập

    @Column(nullable = false)
    private String pwd;    // Mật khẩu

    private String fname;  // Họ tên
    private String address; // Địa chỉ
    private String phone;   // Số điện thoại
    private String role;    // Quyền

    // Constructor không tham số
    public User() {
    }

    // Constructor có tham số
    public User(Long id, String uname, String pwd, String fname, String address, String phone, String role) {
        this.id = id;
        this.uname = uname;
        this.pwd = pwd;
        this.fname = fname;
        this.address = address;
        this.phone = phone;
        this.role = role;
    }

    // Getter và Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUname() {
        return uname;
    }

    public void setUname(String uname) {
        this.uname = uname;
    }

    public String getPwd() {
        return pwd;
    }

    public void setPwd(String pwd) {
        this.pwd = pwd;
    }

    public String getFname() {
        return fname;
    }

    public void setFname(String fname) {
        this.fname = fname;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}