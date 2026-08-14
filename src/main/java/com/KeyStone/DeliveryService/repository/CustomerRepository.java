package com.KeyStone.DeliveryService.repository;

import com.KeyStone.DeliveryService.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCode(String code);
    List<Customer> findByContactEmail(String contactEmail);
    boolean existsByCode(String code);
}
