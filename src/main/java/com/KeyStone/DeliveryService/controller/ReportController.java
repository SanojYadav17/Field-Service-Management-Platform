package com.KeyStone.DeliveryService.controller;

import com.KeyStone.DeliveryService.dto.AnalyticsReport;
import com.KeyStone.DeliveryService.dto.DashboardMetrics;
import com.KeyStone.DeliveryService.dto.UserResponse;
import com.KeyStone.DeliveryService.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<DashboardMetrics> getDashboard() {
        return ResponseEntity.ok(reportService.getDashboardMetrics());
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<AnalyticsReport> getAnalytics() {
        return ResponseEntity.ok(reportService.getAnalyticsReport());
    }

    @GetMapping("/export/csv")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<String> exportCsv() {
        String csvData = reportService.generateWorkOrdersCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=keystone_work_orders_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER', 'CUSTOMER')")
    public ResponseEntity<List<UserResponse>> getTechnicians() {
        return ResponseEntity.ok(reportService.getAllTechnicians());
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(reportService.getAllUsers());
    }
}
