package com.KeyStone.DeliveryService.dto;

import java.time.LocalDateTime;

public class SiteResponse {
    private Long id;
    private String name;
    private String address;
    private Long customerId;
    private String customerName;
    private String contactPerson;
    private boolean active;
    private LocalDateTime createdAt;

    public SiteResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final SiteResponse r = new SiteResponse();
        public Builder id(Long v) { r.id = v; return this; }
        public Builder name(String v) { r.name = v; return this; }
        public Builder address(String v) { r.address = v; return this; }
        public Builder customerId(Long v) { r.customerId = v; return this; }
        public Builder customerName(String v) { r.customerName = v; return this; }
        public Builder contactPerson(String v) { r.contactPerson = v; return this; }
        public Builder active(boolean v) { r.active = v; return this; }
        public Builder createdAt(LocalDateTime v) { r.createdAt = v; return this; }
        public SiteResponse build() { return r; }
    }
}
