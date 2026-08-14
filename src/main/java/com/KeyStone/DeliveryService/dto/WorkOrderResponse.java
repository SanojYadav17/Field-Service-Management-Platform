package com.KeyStone.DeliveryService.dto;

import com.KeyStone.DeliveryService.domain.Priority;
import com.KeyStone.DeliveryService.domain.WorkOrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WorkOrderResponse {
    private Long id;
    private String code;
    private String title;
    private String description;
    private Priority priority;
    private WorkOrderStatus status;
    private Long customerId;
    private String customerName;
    private Long siteId;
    private String siteName;
    private Long assignedToId;
    private String assignedToName;
    private Long createdById;
    private String createdByName;
    private LocalDateTime slaDueAt;
    private boolean slaBreached;
    private BigDecimal totalPartsCost;
    private Integer totalLabourMinutes;

    // GPS Check-In
    private Double checkInLatitude;
    private Double checkInLongitude;
    private String checkInAddress;
    private LocalDateTime checkInTime;

    // Digital Sign-Off
    private String customerSignature;
    private String signedByPerson;
    private LocalDateTime signedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WorkOrderResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public WorkOrderStatus getStatus() { return status; }
    public void setStatus(WorkOrderStatus status) { this.status = status; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public Long getSiteId() { return siteId; }
    public void setSiteId(Long siteId) { this.siteId = siteId; }
    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }
    public Long getAssignedToId() { return assignedToId; }
    public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }
    public String getAssignedToName() { return assignedToName; }
    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }
    public Long getCreatedById() { return createdById; }
    public void setCreatedById(Long createdById) { this.createdById = createdById; }
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
    public LocalDateTime getSlaDueAt() { return slaDueAt; }
    public void setSlaDueAt(LocalDateTime slaDueAt) { this.slaDueAt = slaDueAt; }
    public boolean isSlaBreached() { return slaBreached; }
    public void setSlaBreached(boolean slaBreached) { this.slaBreached = slaBreached; }
    public BigDecimal getTotalPartsCost() { return totalPartsCost; }
    public void setTotalPartsCost(BigDecimal totalPartsCost) { this.totalPartsCost = totalPartsCost; }
    public Integer getTotalLabourMinutes() { return totalLabourMinutes; }
    public void setTotalLabourMinutes(Integer totalLabourMinutes) { this.totalLabourMinutes = totalLabourMinutes; }

    public Double getCheckInLatitude() { return checkInLatitude; }
    public void setCheckInLatitude(Double checkInLatitude) { this.checkInLatitude = checkInLatitude; }
    public Double getCheckInLongitude() { return checkInLongitude; }
    public void setCheckInLongitude(Double checkInLongitude) { this.checkInLongitude = checkInLongitude; }
    public String getCheckInAddress() { return checkInAddress; }
    public void setCheckInAddress(String checkInAddress) { this.checkInAddress = checkInAddress; }
    public LocalDateTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; }

    public String getCustomerSignature() { return customerSignature; }
    public void setCustomerSignature(String customerSignature) { this.customerSignature = customerSignature; }
    public String getSignedByPerson() { return signedByPerson; }
    public void setSignedByPerson(String signedByPerson) { this.signedByPerson = signedByPerson; }
    public LocalDateTime getSignedAt() { return signedAt; }
    public void setSignedAt(LocalDateTime signedAt) { this.signedAt = signedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final WorkOrderResponse r = new WorkOrderResponse();
        public Builder id(Long v) { r.id = v; return this; }
        public Builder code(String v) { r.code = v; return this; }
        public Builder title(String v) { r.title = v; return this; }
        public Builder description(String v) { r.description = v; return this; }
        public Builder priority(Priority v) { r.priority = v; return this; }
        public Builder status(WorkOrderStatus v) { r.status = v; return this; }
        public Builder customerId(Long v) { r.customerId = v; return this; }
        public Builder customerName(String v) { r.customerName = v; return this; }
        public Builder siteId(Long v) { r.siteId = v; return this; }
        public Builder siteName(String v) { r.siteName = v; return this; }
        public Builder assignedToId(Long v) { r.assignedToId = v; return this; }
        public Builder assignedToName(String v) { r.assignedToName = v; return this; }
        public Builder createdById(Long v) { r.createdById = v; return this; }
        public Builder createdByName(String v) { r.createdByName = v; return this; }
        public Builder slaDueAt(LocalDateTime v) { r.slaDueAt = v; return this; }
        public Builder slaBreached(boolean v) { r.slaBreached = v; return this; }
        public Builder totalPartsCost(BigDecimal v) { r.totalPartsCost = v; return this; }
        public Builder totalLabourMinutes(Integer v) { r.totalLabourMinutes = v; return this; }

        public Builder checkInLatitude(Double v) { r.checkInLatitude = v; return this; }
        public Builder checkInLongitude(Double v) { r.checkInLongitude = v; return this; }
        public Builder checkInAddress(String v) { r.checkInAddress = v; return this; }
        public Builder checkInTime(LocalDateTime v) { r.checkInTime = v; return this; }

        public Builder customerSignature(String v) { r.customerSignature = v; return this; }
        public Builder signedByPerson(String v) { r.signedByPerson = v; return this; }
        public Builder signedAt(LocalDateTime v) { r.signedAt = v; return this; }

        public Builder createdAt(LocalDateTime v) { r.createdAt = v; return this; }
        public Builder updatedAt(LocalDateTime v) { r.updatedAt = v; return this; }
        public WorkOrderResponse build() { return r; }
    }
}
