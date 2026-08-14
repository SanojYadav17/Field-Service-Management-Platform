package com.KeyStone.DeliveryService.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class LogPartUsageRequest {
    @NotNull
    private Long partId;
    @NotNull @Min(1)
    private Integer qty;

    public Long getPartId() { return partId; }
    public void setPartId(Long partId) { this.partId = partId; }
    public Integer getQty() { return qty; }
    public void setQty(Integer qty) { this.qty = qty; }
}
