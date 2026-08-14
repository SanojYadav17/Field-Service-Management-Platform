package com.KeyStone.DeliveryService.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class LogTimeRequest {
    @NotNull @Min(1)
    private Integer minutes;
    private String note;

    public Integer getMinutes() { return minutes; }
    public void setMinutes(Integer minutes) { this.minutes = minutes; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
