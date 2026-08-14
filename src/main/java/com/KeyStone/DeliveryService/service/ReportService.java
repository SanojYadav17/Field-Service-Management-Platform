package com.KeyStone.DeliveryService.service;

import com.KeyStone.DeliveryService.domain.*;
import com.KeyStone.DeliveryService.dto.AnalyticsReport;
import com.KeyStone.DeliveryService.dto.DashboardMetrics;
import com.KeyStone.DeliveryService.dto.UserResponse;
import com.KeyStone.DeliveryService.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final WorkOrderRepository workOrderRepository;
    private final PartRepository partRepository;
    private final UserRepository userRepository;
    private final PartUsageRepository partUsageRepository;
    private final TimeLogRepository timeLogRepository;

    public ReportService(WorkOrderRepository workOrderRepository,
                          PartRepository partRepository,
                          UserRepository userRepository,
                          PartUsageRepository partUsageRepository,
                          TimeLogRepository timeLogRepository) {
        this.workOrderRepository = workOrderRepository;
        this.partRepository = partRepository;
        this.userRepository = userRepository;
        this.partUsageRepository = partUsageRepository;
        this.timeLogRepository = timeLogRepository;
    }

    @Transactional(readOnly = true)
    public DashboardMetrics getDashboardMetrics() {
        long total = workOrderRepository.count();
        long newCount = workOrderRepository.countByStatus(WorkOrderStatus.NEW);
        long assigned = workOrderRepository.countByStatus(WorkOrderStatus.ASSIGNED);
        long inProgress = workOrderRepository.countByStatus(WorkOrderStatus.IN_PROGRESS);
        long onHold = workOrderRepository.countByStatus(WorkOrderStatus.ON_HOLD);
        long completed = workOrderRepository.countByStatus(WorkOrderStatus.COMPLETED);
        long closed = workOrderRepository.countByStatus(WorkOrderStatus.CLOSED);
        long cancelled = workOrderRepository.countByStatus(WorkOrderStatus.CANCELLED);
        long slaBreached = workOrderRepository.countSlaBreached(LocalDateTime.now());
        long lowStock = partRepository.findAll().stream()
                .filter(p -> p.getStockQty() <= p.getMinStockLevel())
                .count();

        long activeTotal = newCount + assigned + inProgress + onHold + completed + closed;
        double slaCompliance = activeTotal > 0 ? Math.max(0, ((double)(activeTotal - slaBreached) / activeTotal) * 100) : 100.0;

        return DashboardMetrics.builder()
                .totalWorkOrders(total)
                .newWorkOrders(newCount)
                .assignedWorkOrders(assigned)
                .inProgressWorkOrders(inProgress)
                .onHoldWorkOrders(onHold)
                .completedWorkOrders(completed)
                .closedWorkOrders(closed)
                .cancelledWorkOrders(cancelled)
                .slaBreachedCount(slaBreached)
                .lowStockPartsCount(lowStock)
                .slaComplianceRate(Math.round(slaCompliance * 10.0) / 10.0)
                .build();
    }

    @Transactional(readOnly = true)
    public AnalyticsReport getAnalyticsReport() {
        List<WorkOrder> allWorkOrders = workOrderRepository.findAll();
        List<User> technicians = userRepository.findByRole(Role.TECHNICIAN);
        List<Part> allParts = partRepository.findAll();

        // 1. Technician Leaderboard
        List<AnalyticsReport.TechnicianMetric> techMetrics = new ArrayList<>();
        for (User tech : technicians) {
            List<WorkOrder> techWos = allWorkOrders.stream()
                    .filter(w -> w.getAssignedTo() != null && w.getAssignedTo().getId().equals(tech.getId()))
                    .collect(Collectors.toList());

            long completedCount = techWos.stream()
                    .filter(w -> w.getStatus() == WorkOrderStatus.COMPLETED || w.getStatus() == WorkOrderStatus.CLOSED)
                    .count();

            long activeCount = techWos.size() - completedCount;

            int totalLabourMins = techWos.stream()
                    .mapToInt(w -> w.getTotalLabourMinutes() != null ? w.getTotalLabourMinutes() : 0)
                    .sum();

            BigDecimal totalPartsCost = techWos.stream()
                    .map(w -> w.getTotalPartsCost() != null ? w.getTotalPartsCost() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double avgResHours = completedCount > 0 ? Math.round((totalLabourMins / 60.0 / completedCount) * 10.0) / 10.0 : 0.0;

            long breachedCount = techWos.stream()
                    .filter(w -> w.getSlaDueAt() != null && LocalDateTime.now().isAfter(w.getSlaDueAt()) &&
                            w.getStatus() != WorkOrderStatus.COMPLETED && w.getStatus() != WorkOrderStatus.CLOSED)
                    .count();

            int efficiency = techWos.isEmpty() ? 100 : (int) Math.max(50, Math.min(100, 100 - (breachedCount * 15)));

            techMetrics.add(AnalyticsReport.TechnicianMetric.builder()
                    .id(tech.getId())
                    .fullName(tech.getFullName())
                    .email(tech.getEmail())
                    .completedTickets(completedCount)
                    .activeTickets(activeCount)
                    .totalLabourMinutes(totalLabourMins)
                    .avgResolutionHours(avgResHours)
                    .partsValuationUsed(totalPartsCost)
                    .efficiencyRating(efficiency)
                    .build());
        }

        // Sort tech leaderboard by completed tickets desc
        techMetrics.sort((a, b) -> Long.compare(b.getCompletedTickets(), a.getCompletedTickets()));

        // 2. SLA Priority Breakdown
        List<AnalyticsReport.SlaPriorityMetric> slaMetrics = new ArrayList<>();
        for (Priority p : Priority.values()) {
            List<WorkOrder> priorityWos = allWorkOrders.stream()
                    .filter(w -> w.getPriority() == p)
                    .collect(Collectors.toList());

            long totalPriority = priorityWos.size();
            long breachedPriority = priorityWos.stream()
                    .filter(w -> w.getSlaDueAt() != null && LocalDateTime.now().isAfter(w.getSlaDueAt()) &&
                            w.getStatus() != WorkOrderStatus.COMPLETED && w.getStatus() != WorkOrderStatus.CLOSED)
                    .count();

            long metPriority = totalPriority - breachedPriority;
            double compliance = totalPriority > 0 ? Math.round(((double) metPriority / totalPriority * 100.0) * 10.0) / 10.0 : 100.0;

            slaMetrics.add(AnalyticsReport.SlaPriorityMetric.builder()
                    .priority(p.name())
                    .totalTickets(totalPriority)
                    .metCount(metPriority)
                    .breachedCount(breachedPriority)
                    .complianceRate(compliance)
                    .build());
        }

        // 3. Top Inventory Consumption
        List<PartUsage> allUsages = partUsageRepository.findAll();
        Map<Long, Long> partQtyMap = new HashMap<>();
        Map<Long, BigDecimal> partCostMap = new HashMap<>();

        for (PartUsage pu : allUsages) {
            if (pu.getPart() != null) {
                Long pid = pu.getPart().getId();
                partQtyMap.put(pid, partQtyMap.getOrDefault(pid, 0L) + pu.getQtyUsed());
                partCostMap.put(pid, partCostMap.getOrDefault(pid, BigDecimal.ZERO).add(pu.getLineTotal() != null ? pu.getLineTotal() : BigDecimal.ZERO));
            }
        }

        List<AnalyticsReport.PartConsumptionMetric> partMetrics = new ArrayList<>();
        for (Part part : allParts) {
            long qtyUsed = partQtyMap.getOrDefault(part.getId(), 0L);
            BigDecimal costUsed = partCostMap.getOrDefault(part.getId(), BigDecimal.ZERO);

            partMetrics.add(AnalyticsReport.PartConsumptionMetric.builder()
                    .partId(part.getId())
                    .partName(part.getName())
                    .sku(part.getSku())
                    .totalQtyUsed(qtyUsed)
                    .totalCost(costUsed)
                    .currentStock(part.getStockQty())
                    .build());
        }
        partMetrics.sort((a, b) -> b.getTotalCost().compareTo(a.getTotalCost()));

        // 4. Summary Stats
        long completedTotal = allWorkOrders.stream()
                .filter(w -> w.getStatus() == WorkOrderStatus.COMPLETED || w.getStatus() == WorkOrderStatus.CLOSED)
                .count();

        long openTotal = allWorkOrders.size() - completedTotal;

        long totalBreached = allWorkOrders.stream()
                .filter(w -> w.getSlaDueAt() != null && LocalDateTime.now().isAfter(w.getSlaDueAt()) &&
                        w.getStatus() != WorkOrderStatus.COMPLETED && w.getStatus() != WorkOrderStatus.CLOSED)
                .count();

        double overallSla = allWorkOrders.isEmpty() ? 100.0 : Math.round(((double)(allWorkOrders.size() - totalBreached) / allWorkOrders.size() * 100.0) * 10.0) / 10.0;

        BigDecimal totalPartsValuation = allParts.stream()
                .map(p -> p.getUnitCost().multiply(BigDecimal.valueOf(p.getStockQty())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalLabourMinutesAll = allWorkOrders.stream()
                .mapToInt(w -> w.getTotalLabourMinutes() != null ? w.getTotalLabourMinutes() : 0)
                .sum();

        AnalyticsReport.SummaryStats summary = AnalyticsReport.SummaryStats.builder()
                .totalWorkOrders(allWorkOrders.size())
                .completedWorkOrders(completedTotal)
                .openWorkOrders(openTotal)
                .overallSlaCompliance(overallSla)
                .totalPartsValuation(totalPartsValuation)
                .totalLabourHours(totalLabourMinutesAll / 60)
                .build();

        return AnalyticsReport.builder()
                .technicianLeaderboard(techMetrics)
                .slaPriorityBreakdown(slaMetrics)
                .topInventoryConsumption(partMetrics)
                .summary(summary)
                .build();
    }

    @Transactional(readOnly = true)
    public String generateWorkOrdersCsv() {
        List<WorkOrder> list = workOrderRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("Ticket Code,Title,Priority,Status,Customer,Site,Technician,SLA Due At,SLA Status,Parts Cost (INR),Labour (Mins),GPS Check-In Address,Signed By,Created At\n");

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        for (WorkOrder w : list) {
            boolean breached = w.getSlaDueAt() != null && LocalDateTime.now().isAfter(w.getSlaDueAt()) &&
                    w.getStatus() != WorkOrderStatus.COMPLETED && w.getStatus() != WorkOrderStatus.CLOSED;

            sb.append(escapeCsv(w.getCode())).append(",")
              .append(escapeCsv(w.getTitle())).append(",")
              .append(w.getPriority() != null ? w.getPriority().name() : "").append(",")
              .append(w.getStatus() != null ? w.getStatus().name() : "").append(",")
              .append(escapeCsv(w.getCustomer() != null ? w.getCustomer().getName() : "")).append(",")
              .append(escapeCsv(w.getSite() != null ? w.getSite().getName() : "")).append(",")
              .append(escapeCsv(w.getAssignedTo() != null ? w.getAssignedTo().getFullName() : "Unassigned")).append(",")
              .append(w.getSlaDueAt() != null ? w.getSlaDueAt().format(dtf) : "").append(",")
              .append(breached ? "BREACHED" : "MET").append(",")
              .append(w.getTotalPartsCost() != null ? w.getTotalPartsCost().toString() : "0.00").append(",")
              .append(w.getTotalLabourMinutes() != null ? w.getTotalLabourMinutes() : 0).append(",")
              .append(escapeCsv(w.getCheckInAddress() != null ? w.getCheckInAddress() : "N/A")).append(",")
              .append(escapeCsv(w.getSignedByPerson() != null ? w.getSignedByPerson() : "N/A")).append(",")
              .append(w.getCreatedAt() != null ? w.getCreatedAt().format(dtf) : "").append("\n");
        }

        return sb.toString();
    }

    private String escapeCsv(String str) {
        if (str == null) return "";
        if (str.contains(",") || str.contains("\"") || str.contains("\n")) {
            return "\"" + str.replace("\"", "\"\"") + "\"";
        }
        return str;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllTechnicians() {
        return userRepository.findByRole(Role.TECHNICIAN).stream()
                .map(this::mapUser)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapUser)
                .collect(Collectors.toList());
    }

    private UserResponse mapUser(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .role(u.getRole())
                .phone(u.getPhone())
                .active(u.isActive())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
