package com.KeyStone.DeliveryService.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PartResponse {
    private Long id;
    private String name;
    private String sku;
    private BigDecimal unitCost;
    private Integer stockQty;
    private Integer minStockLevel;
    private boolean lowStock;
    private LocalDateTime createdAt;

    public PartResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
    public Integer getStockQty() { return stockQty; }
    public void setStockQty(Integer stockQty) { this.stockQty = stockQty; }
    public Integer getMinStockLevel() { return minStockLevel; }
    public void setMinStockLevel(Integer minStockLevel) { this.minStockLevel = minStockLevel; }
    public boolean isLowStock() { return lowStock; }
    public void setLowStock(boolean lowStock) { this.lowStock = lowStock; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final PartResponse r = new PartResponse();
        public Builder id(Long v) { r.id = v; return this; }
        public Builder name(String v) { r.name = v; return this; }
        public Builder sku(String v) { r.sku = v; return this; }
        public Builder unitCost(BigDecimal v) { r.unitCost = v; return this; }
        public Builder stockQty(Integer v) { r.stockQty = v; return this; }
        public Builder minStockLevel(Integer v) { r.minStockLevel = v; return this; }
        public Builder lowStock(boolean v) { r.lowStock = v; return this; }
        public Builder createdAt(LocalDateTime v) { r.createdAt = v; return this; }
        public PartResponse build() { return r; }
    }
}
