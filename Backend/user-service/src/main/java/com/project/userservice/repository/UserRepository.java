package com.project.userservice.repository;

import com.project.userservice.entity.User;
import com.project.userservice.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    List<User> findByRole(UserRole role);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.status = com.project.userservice.enums.UserStatus.ACTIVE")
    List<User> findActiveUsersByRole(@Param("role") UserRole role);
}
