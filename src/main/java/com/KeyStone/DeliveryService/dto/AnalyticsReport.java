package com.KeyStone.DeliveryService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsReport {
    private List<TechnicianMetric> technicianLeaderboard;
    private List<SlaPriorityMetric> slaPriorityBreakdown;
    private List<PartConsumptionMetric> topInventoryConsumption;
    private SummaryStats summary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TechnicianMetric {
        private Long id;
        private String fullName;
        private String email;
        private long completedTickets;
        private long activeTickets;
        private int totalLabourMinutes;
        private double avgResolutionHours;
        private BigDecimal partsValuationUsed;
        private int efficiencyRating; // percentage 0-100
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlaPriorityMetric {
        private String priority;
        private long totalTickets;
        private long metCount;
        private long breachedCount;
        private double complianceRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PartConsumptionMetric {
        private Long partId;
        private String partName;
        private String sku;
        private long totalQtyUsed;
        private BigDecimal totalCost;
        private int currentStock;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryStats {
        private long totalWorkOrders;
        private long completedWorkOrders;
        private long openWorkOrders;
        private double overallSlaCompliance;
        private BigDecimal totalPartsValuation;
        private int totalLabourHours;
    }
}
