package com.KeyStone.DeliveryService.service;

import com.KeyStone.DeliveryService.domain.WorkOrder;
import com.KeyStone.DeliveryService.repository.WorkOrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SlaNotificationService {

    private static final Logger log = LoggerFactory.getLogger(SlaNotificationService.class);

    private final WorkOrderRepository workOrderRepository;

    public SlaNotificationService(WorkOrderRepository workOrderRepository) {
        this.workOrderRepository = workOrderRepository;
    }

    @Scheduled(fixedRateString = "900000")
    public void checkSlaAlerts() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime warningThreshold = now.plusHours(2);

        List<WorkOrder> breached = workOrderRepository.findBreachedWorkOrders(now);
        List<WorkOrder> nearBreach = workOrderRepository.findNearBreachWorkOrders(now, warningThreshold);

        if (!breached.isEmpty()) {
            log.warn("⚠️ SLA BREACH ALERT: {} work order(s) have exceeded SLA deadline:", breached.size());
            breached.forEach(wo ->
                log.warn("  → [{}] {} | Priority: {} | Due: {}",
                        wo.getCode(), wo.getTitle(), wo.getPriority(), wo.getSlaDueAt()));
        }

        if (!nearBreach.isEmpty()) {
            log.info("🔔 SLA WARNING: {} work order(s) approaching SLA deadline (< 2h):", nearBreach.size());
            nearBreach.forEach(wo ->
                log.info("  → [{}] {} | Priority: {} | Due: {}",
                        wo.getCode(), wo.getTitle(), wo.getPriority(), wo.getSlaDueAt()));
        }

        if (breached.isEmpty() && nearBreach.isEmpty()) {
            log.debug("✅ SLA Check: All work orders within SLA compliance.");
        }
    }
}
