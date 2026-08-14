package com.KeyStone.DeliveryService.controller;

import com.KeyStone.DeliveryService.dto.CreatePartRequest;
import com.KeyStone.DeliveryService.dto.PartResponse;
import com.KeyStone.DeliveryService.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
public class PartController {

    private final InventoryService inventoryService;

    public PartController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<PartResponse> create(@Valid @RequestBody CreatePartRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.createPart(request));
    }

    @GetMapping
    public ResponseEntity<List<PartResponse>> getAll() {
        return ResponseEntity.ok(inventoryService.getAllParts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getPartById(id));
    }

    @PatchMapping("/{id}/restock")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<PartResponse> restock(@PathVariable Long id, @RequestParam int qty) {
        return ResponseEntity.ok(inventoryService.restockPart(id, qty));
    }
}
