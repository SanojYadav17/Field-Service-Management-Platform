package com.KeyStone.DeliveryService.dto;

import com.KeyStone.DeliveryService.domain.WorkOrderStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateWorkOrderStatusRequest {
    @NotNull
    private WorkOrderStatus newStatus;
    private String note;

    public WorkOrderStatus getNewStatus() { return newStatus; }
    public void setNewStatus(WorkOrderStatus newStatus) { this.newStatus = newStatus; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
