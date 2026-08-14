package com.KeyStone.DeliveryService.controller;

import com.KeyStone.DeliveryService.domain.PartUsage;
import com.KeyStone.DeliveryService.domain.TimeLog;
import com.KeyStone.DeliveryService.domain.WorkOrderStatusHistory;
import com.KeyStone.DeliveryService.dto.*;
import com.KeyStone.DeliveryService.service.WorkOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    public WorkOrderController(WorkOrderService workOrderService) {
        this.workOrderService = workOrderService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER', 'CUSTOMER')")
    public ResponseEntity<WorkOrderResponse> create(@Valid @RequestBody CreateWorkOrderRequest request,
                                                     Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workOrderService.createWorkOrder(request, auth.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<List<WorkOrderResponse>> getAll() {
        return ResponseEntity.ok(workOrderService.getAllWorkOrders());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<WorkOrderResponse>> getMyWorkOrders(Authentication auth) {
        return ResponseEntity.ok(workOrderService.getWorkOrdersForTechnician(auth.getName()));
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<WorkOrderResponse>> getCustomerWorkOrders(Authentication auth) {
        return ResponseEntity.ok(workOrderService.getWorkOrdersForCustomer(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkOrderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getWorkOrderById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<WorkOrderResponse> updateStatus(@PathVariable Long id,
                                                           @Valid @RequestBody UpdateWorkOrderStatusRequest request,
                                                           Authentication auth) {
        return ResponseEntity.ok(workOrderService.updateStatus(id, request, auth.getName()));
    }

    @PatchMapping("/{id}/assign/{techId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<WorkOrderResponse> assign(@PathVariable Long id,
                                                    @PathVariable Long techId,
                                                    Authentication auth) {
        return ResponseEntity.ok(workOrderService.assignWorkOrder(id, techId, auth.getName()));
    }

    @PostMapping("/{id}/parts")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'CUSTOMER', 'DISPATCHER')")
    public ResponseEntity<Map<String, String>> logPart(@PathVariable Long id,
                                                        @Valid @RequestBody LogPartUsageRequest request,
                                                        Authentication auth) {
        workOrderService.logPartUsage(id, request, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Part usage recorded and inventory updated."));
    }

    @PostMapping("/{id}/time")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'CUSTOMER', 'DISPATCHER')")
    public ResponseEntity<Map<String, String>> logTime(@PathVariable Long id,
                                                        @Valid @RequestBody LogTimeRequest request,
                                                        Authentication auth) {
        workOrderService.logTime(id, request, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Time log recorded."));
    }

    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'DISPATCHER')")
    public ResponseEntity<WorkOrderResponse> checkIn(@PathVariable Long id,
                                                      @RequestBody CheckInRequest request,
                                                      Authentication auth) {
        return ResponseEntity.ok(workOrderService.checkInWorkOrder(id, request, auth.getName()));
    }

    @PostMapping("/{id}/sign-off")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'DISPATCHER', 'CUSTOMER')")
    public ResponseEntity<WorkOrderResponse> signOff(@PathVariable Long id,
                                                      @RequestBody SignOffRequest request,
                                                      Authentication auth) {
        return ResponseEntity.ok(workOrderService.signOffWorkOrder(id, request, auth.getName()));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<WorkOrderStatusHistory>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getAuditHistory(id));
    }

    @GetMapping("/{id}/parts")
    public ResponseEntity<List<PartUsage>> getPartUsages(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getPartUsages(id));
    }

    @GetMapping("/{id}/timelogs")
    public ResponseEntity<List<TimeLog>> getTimeLogs(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getTimeLogs(id));
    }
}
