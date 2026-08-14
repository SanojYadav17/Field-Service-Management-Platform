package com.KeyStone.DeliveryService.service;

import com.KeyStone.DeliveryService.domain.Part;
import com.KeyStone.DeliveryService.dto.CreatePartRequest;
import com.KeyStone.DeliveryService.dto.PartResponse;
import com.KeyStone.DeliveryService.repository.PartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final PartRepository partRepository;

    public InventoryService(PartRepository partRepository) {
        this.partRepository = partRepository;
    }

    @Transactional
    public PartResponse createPart(CreatePartRequest request) {
        if (partRepository.existsBySku(request.getSku())) {
            throw new IllegalArgumentException("SKU already exists: " + request.getSku());
        }
        Part part = Part.builder()
                .name(request.getName())
                .sku(request.getSku())
                .unitCost(request.getUnitCost())
                .stockQty(request.getStockQty())
                .minStockLevel(request.getMinStockLevel() != null ? request.getMinStockLevel() : 5)
                .build();
        return mapToResponse(partRepository.save(part));
    }

    @Transactional(readOnly = true)
    public List<PartResponse> getAllParts() {
        return partRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PartResponse getPartById(Long id) {
        return mapToResponse(partRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Part not found: " + id)));
    }

    @Transactional
    public PartResponse restockPart(Long id, int qty) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Part not found: " + id));
        part.setStockQty(part.getStockQty() + qty);
        return mapToResponse(partRepository.save(part));
    }

    private PartResponse mapToResponse(Part p) {
        return PartResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .sku(p.getSku())
                .unitCost(p.getUnitCost())
                .stockQty(p.getStockQty())
                .minStockLevel(p.getMinStockLevel())
                .lowStock(p.getStockQty() <= p.getMinStockLevel())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
