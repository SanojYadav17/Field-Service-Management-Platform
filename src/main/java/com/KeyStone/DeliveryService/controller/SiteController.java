package com.KeyStone.DeliveryService.controller;

import com.KeyStone.DeliveryService.dto.*;
import com.KeyStone.DeliveryService.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
public class SiteController {

    private final CustomerService customerService;

    public SiteController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER', 'CUSTOMER')")
    public ResponseEntity<SiteResponse> create(@Valid @RequestBody CreateSiteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createSite(request));
    }

    @GetMapping
    public ResponseEntity<List<SiteResponse>> getAll() {
        return ResponseEntity.ok(customerService.getAllSites());
    }
}
