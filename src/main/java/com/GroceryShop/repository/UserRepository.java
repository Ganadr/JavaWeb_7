package com.GroceryShop.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.GroceryShop.Model.User;

import java.util.Optional;
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUname(String uname);
    Optional<User> findByUnameAndPwd(String uname, String pwd);
    long count();


}
