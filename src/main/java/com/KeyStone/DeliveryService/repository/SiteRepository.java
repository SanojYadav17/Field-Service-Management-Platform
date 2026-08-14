package com.KeyStone.DeliveryService.repository;

import com.KeyStone.DeliveryService.domain.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {
    List<Site> findByCustomerId(Long customerId);
}
