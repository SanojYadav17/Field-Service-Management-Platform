package com.KeyStone.DeliveryService.dto;

public class DashboardMetrics {
    private long totalWorkOrders;
    private long newWorkOrders;
    private long assignedWorkOrders;
    private long inProgressWorkOrders;
    private long onHoldWorkOrders;
    private long completedWorkOrders;
    private long closedWorkOrders;
    private long cancelledWorkOrders;
    private long slaBreachedCount;
    private long lowStockPartsCount;
    private double slaComplianceRate;

    public DashboardMetrics() {}

    public long getTotalWorkOrders() { return totalWorkOrders; }
    public void setTotalWorkOrders(long v) { this.totalWorkOrders = v; }
    public long getNewWorkOrders() { return newWorkOrders; }
    public void setNewWorkOrders(long v) { this.newWorkOrders = v; }
    public long getAssignedWorkOrders() { return assignedWorkOrders; }
    public void setAssignedWorkOrders(long v) { this.assignedWorkOrders = v; }
    public long getInProgressWorkOrders() { return inProgressWorkOrders; }
    public void setInProgressWorkOrders(long v) { this.inProgressWorkOrders = v; }
    public long getOnHoldWorkOrders() { return onHoldWorkOrders; }
    public void setOnHoldWorkOrders(long v) { this.onHoldWorkOrders = v; }
    public long getCompletedWorkOrders() { return completedWorkOrders; }
    public void setCompletedWorkOrders(long v) { this.completedWorkOrders = v; }
    public long getClosedWorkOrders() { return closedWorkOrders; }
    public void setClosedWorkOrders(long v) { this.closedWorkOrders = v; }
    public long getCancelledWorkOrders() { return cancelledWorkOrders; }
    public void setCancelledWorkOrders(long v) { this.cancelledWorkOrders = v; }
    public long getSlaBreachedCount() { return slaBreachedCount; }
    public void setSlaBreachedCount(long v) { this.slaBreachedCount = v; }
    public long getLowStockPartsCount() { return lowStockPartsCount; }
    public void setLowStockPartsCount(long v) { this.lowStockPartsCount = v; }
    public double getSlaComplianceRate() { return slaComplianceRate; }
    public void setSlaComplianceRate(double v) { this.slaComplianceRate = v; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final DashboardMetrics m = new DashboardMetrics();
        public Builder totalWorkOrders(long v) { m.totalWorkOrders = v; return this; }
        public Builder newWorkOrders(long v) { m.newWorkOrders = v; return this; }
        public Builder assignedWorkOrders(long v) { m.assignedWorkOrders = v; return this; }
        public Builder inProgressWorkOrders(long v) { m.inProgressWorkOrders = v; return this; }
        public Builder onHoldWorkOrders(long v) { m.onHoldWorkOrders = v; return this; }
        public Builder completedWorkOrders(long v) { m.completedWorkOrders = v; return this; }
        public Builder closedWorkOrders(long v) { m.closedWorkOrders = v; return this; }
        public Builder cancelledWorkOrders(long v) { m.cancelledWorkOrders = v; return this; }
        public Builder slaBreachedCount(long v) { m.slaBreachedCount = v; return this; }
        public Builder lowStockPartsCount(long v) { m.lowStockPartsCount = v; return this; }
        public Builder slaComplianceRate(double v) { m.slaComplianceRate = v; return this; }
        public DashboardMetrics build() { return m; }
    }
}
