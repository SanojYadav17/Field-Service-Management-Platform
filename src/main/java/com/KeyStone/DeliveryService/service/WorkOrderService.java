package com.KeyStone.DeliveryService.service;

import com.KeyStone.DeliveryService.domain.*;
import com.KeyStone.DeliveryService.dto.*;
import com.KeyStone.DeliveryService.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class WorkOrderService {

    private static final Logger log = LoggerFactory.getLogger(WorkOrderService.class);

    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderStatusHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final PartRepository partRepository;
    private final PartUsageRepository partUsageRepository;
    private final TimeLogRepository timeLogRepository;

    private static final AtomicLong WO_COUNTER = new AtomicLong(1000);

    public WorkOrderService(WorkOrderRepository workOrderRepository,
                            WorkOrderStatusHistoryRepository historyRepository,
                            UserRepository userRepository,
                            CustomerRepository customerRepository,
                            SiteRepository siteRepository,
                            PartRepository partRepository,
                            PartUsageRepository partUsageRepository,
                            TimeLogRepository timeLogRepository) {
        this.workOrderRepository = workOrderRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.siteRepository = siteRepository;
        this.partRepository = partRepository;
        this.partUsageRepository = partUsageRepository;
        this.timeLogRepository = timeLogRepository;
    }

    @Transactional
    public WorkOrderResponse createWorkOrder(CreateWorkOrderRequest request, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found: " + request.getCustomerId()));

        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new RuntimeException("Site not found: " + request.getSiteId()));

        User assignedTo = null;
        if (request.getAssignedToId() != null) {
            assignedTo = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("Technician not found: " + request.getAssignedToId()));
        }

        String code = "WO-" + (10000 + (long)(Math.random() * 90000));
        while (workOrderRepository.existsByCode(code)) {
            code = "WO-" + (10000 + (long)(Math.random() * 90000));
        }
        LocalDateTime slaDue = LocalDateTime.now().plusHours(request.getPriority().getSlaHours());
        WorkOrderStatus initialStatus = assignedTo != null ? WorkOrderStatus.ASSIGNED : WorkOrderStatus.NEW;

        WorkOrder wo = WorkOrder.builder()
                .code(code)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(initialStatus)
                .customer(customer)
                .site(site)
                .assignedTo(assignedTo)
                .createdBy(creator)
                .slaDueAt(slaDue)
                .totalPartsCost(BigDecimal.ZERO)
                .totalLabourMinutes(0)
                .build();

        wo = workOrderRepository.save(wo);

        WorkOrderStatusHistory history = WorkOrderStatusHistory.builder()
                .workOrder(wo)
                .fromStatus(null)
                .toStatus(initialStatus)
                .changedBy(creator)
                .note("Work order created")
                .build();
        historyRepository.save(history);

        return mapToResponse(wo);
    }

    @Transactional(readOnly = true)
    public List<WorkOrderResponse> getAllWorkOrders() {
        return workOrderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkOrderResponse> getWorkOrdersForTechnician(String email) {
        User tech = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Technician not found"));
        return workOrderRepository.findByAssignedToId(tech.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkOrderResponse> getWorkOrdersForCustomer(String email) {
        List<Customer> customers = customerRepository.findByContactEmail(email);
        if (customers.isEmpty()) {
            return List.of();
        }
        List<Long> customerIds = customers.stream().map(Customer::getId).collect(Collectors.toList());
        return workOrderRepository.findAll().stream()
                .filter(wo -> wo.getCustomer() != null && customerIds.contains(wo.getCustomer().getId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkOrderResponse getWorkOrderById(Long id) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work order not found: " + id));
        return mapToResponse(wo);
    }

    @Transactional
    public WorkOrderResponse updateStatus(Long id, UpdateWorkOrderStatusRequest request, String actorEmail) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work order not found: " + id));

        User actor = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!wo.getStatus().canTransitionTo(request.getNewStatus())) {
            throw new IllegalStateException(
                    "Cannot transition from " + wo.getStatus() + " to " + request.getNewStatus());
        }

        WorkOrderStatus oldStatus = wo.getStatus();
        wo.setStatus(request.getNewStatus());
        wo = workOrderRepository.save(wo);

        WorkOrderStatusHistory history = WorkOrderStatusHistory.builder()
                .workOrder(wo)
                .fromStatus(oldStatus)
                .toStatus(request.getNewStatus())
                .changedBy(actor)
                .note(request.getNote())
                .build();
        historyRepository.save(history);

        return mapToResponse(wo);
    }

    @Transactional
    public WorkOrderResponse assignWorkOrder(Long id, Long technicianId, String actorEmail) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work order not found: " + id));

        User tech = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found: " + technicianId));

        User actor = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new RuntimeException("Actor not found"));

        WorkOrderStatus oldStatus = wo.getStatus();
        wo.setAssignedTo(tech);

        if (wo.getStatus() == WorkOrderStatus.NEW) {
            wo.setStatus(WorkOrderStatus.ASSIGNED);
            WorkOrderStatusHistory history = WorkOrderStatusHistory.builder()
                    .workOrder(wo)
                    .fromStatus(oldStatus)
                    .toStatus(WorkOrderStatus.ASSIGNED)
                    .changedBy(actor)
                    .note("Assigned to " + tech.getFullName())
                    .build();
            historyRepository.save(history);
        }

        wo = workOrderRepository.save(wo);
        return mapToResponse(wo);
    }

    @Transactional
    public void logPartUsage(Long workOrderId, LogPartUsageRequest request, String actorEmail) {
        WorkOrder wo = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work order not found"));

        Part part = partRepository.findById(request.getPartId())
                .orElseThrow(() -> new RuntimeException("Part not found: " + request.getPartId()));

        if (part.getStockQty() < request.getQty()) {
            throw new IllegalStateException("Insufficient stock. Available: " + part.getStockQty() + ", Requested: " + request.getQty());
        }

        part.setStockQty(part.getStockQty() - request.getQty());
        partRepository.save(part);

        BigDecimal lineTotal = part.getUnitCost().multiply(BigDecimal.valueOf(request.getQty()));

        PartUsage usage = PartUsage.builder()
                .workOrder(wo)
                .part(part)
                .qtyUsed(request.getQty())
                .unitCostAtTime(part.getUnitCost())
                .lineTotal(lineTotal)
                .build();
        partUsageRepository.save(usage);

        wo.setTotalPartsCost(wo.getTotalPartsCost().add(lineTotal));
        workOrderRepository.save(wo);
    }

    @Transactional
    public void logTime(Long workOrderId, LogTimeRequest request, String actorEmail) {
        WorkOrder wo = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work order not found"));

        User tech = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TimeLog logEntry = TimeLog.builder()
                .workOrder(wo)
                .technician(tech)
                .minutes(request.getMinutes())
                .note(request.getNote())
                .build();
        timeLogRepository.save(logEntry);

        wo.setTotalLabourMinutes(wo.getTotalLabourMinutes() + request.getMinutes());
        workOrderRepository.save(wo);
    }

    @Transactional(readOnly = true)
    public List<WorkOrderStatusHistory> getAuditHistory(Long workOrderId) {
        return historyRepository.findByWorkOrderIdOrderByChangedAtAsc(workOrderId);
    }

    @Transactional(readOnly = true)
    public List<PartUsage> getPartUsages(Long workOrderId) {
        return partUsageRepository.findByWorkOrderId(workOrderId);
    }

    @Transactional(readOnly = true)
    public List<TimeLog> getTimeLogs(Long workOrderId) {
        return timeLogRepository.findByWorkOrderId(workOrderId);
    }

    @Transactional
    public WorkOrderResponse checkInWorkOrder(Long id, CheckInRequest request, String actorEmail) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work order not found: " + id));

        User actor = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new RuntimeException("Actor not found"));

        wo.setCheckInLatitude(request.getLatitude());
        wo.setCheckInLongitude(request.getLongitude());
        wo.setCheckInAddress(request.getAddress());
        wo.setCheckInTime(LocalDateTime.now());

        if (wo.getStatus() == WorkOrderStatus.ASSIGNED || wo.getStatus() == WorkOrderStatus.NEW) {
            WorkOrderStatus oldStatus = wo.getStatus();
            wo.setStatus(WorkOrderStatus.IN_PROGRESS);
            historyRepository.save(WorkOrderStatusHistory.builder()
                    .workOrder(wo)
                    .fromStatus(oldStatus)
                    .toStatus(WorkOrderStatus.IN_PROGRESS)
                    .changedBy(actor)
                    .note("Technician GPS Check-in at " + (request.getAddress() != null ? request.getAddress() : "Location"))
                    .build());
        }

        return mapToResponse(workOrderRepository.save(wo));
    }

    @Transactional
    public WorkOrderResponse signOffWorkOrder(Long id, SignOffRequest request, String actorEmail) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work order not found: " + id));

        User actor = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new RuntimeException("Actor not found"));

        wo.setCustomerSignature(request.getCustomerSignature());
        wo.setSignedByPerson(request.getSignedByPerson());
        wo.setSignedAt(LocalDateTime.now());

        WorkOrderStatus oldStatus = wo.getStatus();
        wo.setStatus(WorkOrderStatus.COMPLETED);
        historyRepository.save(WorkOrderStatusHistory.builder()
                .workOrder(wo)
                .fromStatus(oldStatus)
                .toStatus(WorkOrderStatus.COMPLETED)
                .changedBy(actor)
                .note("Customer Digital Sign-off completed by " + (request.getSignedByPerson() != null ? request.getSignedByPerson() : "Customer"))
                .build());

        return mapToResponse(workOrderRepository.save(wo));
    }

    public WorkOrderResponse mapToResponse(WorkOrder wo) {
        boolean slaBreached = wo.getSlaDueAt() != null &&
                LocalDateTime.now().isAfter(wo.getSlaDueAt()) &&
                wo.getStatus() != WorkOrderStatus.COMPLETED &&
                wo.getStatus() != WorkOrderStatus.CLOSED;

        return WorkOrderResponse.builder()
                .id(wo.getId())
                .code(wo.getCode())
                .title(wo.getTitle())
                .description(wo.getDescription())
                .priority(wo.getPriority())
                .status(wo.getStatus())
                .customerId(wo.getCustomer() != null ? wo.getCustomer().getId() : null)
                .customerName(wo.getCustomer() != null ? wo.getCustomer().getName() : null)
                .siteId(wo.getSite() != null ? wo.getSite().getId() : null)
                .siteName(wo.getSite() != null ? wo.getSite().getName() : null)
                .assignedToId(wo.getAssignedTo() != null ? wo.getAssignedTo().getId() : null)
                .assignedToName(wo.getAssignedTo() != null ? wo.getAssignedTo().getFullName() : null)
                .createdById(wo.getCreatedBy() != null ? wo.getCreatedBy().getId() : null)
                .createdByName(wo.getCreatedBy() != null ? wo.getCreatedBy().getFullName() : null)
                .slaDueAt(wo.getSlaDueAt())
                .slaBreached(slaBreached)
                .totalPartsCost(wo.getTotalPartsCost())
                .totalLabourMinutes(wo.getTotalLabourMinutes())
                .checkInLatitude(wo.getCheckInLatitude())
                .checkInLongitude(wo.getCheckInLongitude())
                .checkInAddress(wo.getCheckInAddress())
                .checkInTime(wo.getCheckInTime())
                .customerSignature(wo.getCustomerSignature())
                .signedByPerson(wo.getSignedByPerson())
                .signedAt(wo.getSignedAt())
                .createdAt(wo.getCreatedAt())
                .updatedAt(wo.getUpdatedAt())
                .build();
    }
}
