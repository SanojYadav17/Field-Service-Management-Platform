package com.KeyStone.DeliveryService.dto;

import com.KeyStone.DeliveryService.domain.Role;
import java.time.LocalDateTime;

public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private String phone;
    private boolean active;
    private LocalDateTime createdAt;

    public UserResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final UserResponse r = new UserResponse();
        public Builder id(Long v) { r.id = v; return this; }
        public Builder email(String v) { r.email = v; return this; }
        public Builder fullName(String v) { r.fullName = v; return this; }
        public Builder role(Role v) { r.role = v; return this; }
        public Builder phone(String v) { r.phone = v; return this; }
        public Builder active(boolean v) { r.active = v; return this; }
        public Builder createdAt(LocalDateTime v) { r.createdAt = v; return this; }
        public UserResponse build() { return r; }
    }
}
