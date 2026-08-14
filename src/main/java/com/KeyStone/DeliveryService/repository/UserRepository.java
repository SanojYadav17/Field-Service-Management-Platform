package com.KeyStone.DeliveryService.repository;

import com.KeyStone.DeliveryService.domain.Role;
import com.KeyStone.DeliveryService.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    List<User> findByRole(Role role);
}
