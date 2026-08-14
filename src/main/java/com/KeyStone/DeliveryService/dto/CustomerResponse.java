package com.KeyStone.DeliveryService.dto;

import java.time.LocalDateTime;

public class CustomerResponse {
    private Long id;
    private String name;
    private String code;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private boolean active;
    private LocalDateTime createdAt;

    public CustomerResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final CustomerResponse r = new CustomerResponse();
        public Builder id(Long v) { r.id = v; return this; }
        public Builder name(String v) { r.name = v; return this; }
        public Builder code(String v) { r.code = v; return this; }
        public Builder contactEmail(String v) { r.contactEmail = v; return this; }
        public Builder contactPhone(String v) { r.contactPhone = v; return this; }
        public Builder address(String v) { r.address = v; return this; }
        public Builder active(boolean v) { r.active = v; return this; }
        public Builder createdAt(LocalDateTime v) { r.createdAt = v; return this; }
        public CustomerResponse build() { return r; }
    }
}
