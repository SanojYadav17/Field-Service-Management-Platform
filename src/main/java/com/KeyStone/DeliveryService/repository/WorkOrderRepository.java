package com.KeyStone.DeliveryService.repository;

import com.KeyStone.DeliveryService.domain.WorkOrder;
import com.KeyStone.DeliveryService.domain.WorkOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    List<WorkOrder> findByStatus(WorkOrderStatus status);
    List<WorkOrder> findByAssignedToId(Long technicianId);
    List<WorkOrder> findByCustomerId(Long customerId);
    List<WorkOrder> findByCustomerIdAndSiteId(Long customerId, Long siteId);
    boolean existsByCode(String code);
    long countByStatus(WorkOrderStatus status);

    @Query("SELECT wo FROM WorkOrder wo WHERE wo.slaDueAt < :now AND wo.status NOT IN ('COMPLETED', 'CLOSED', 'CANCELLED')")
    List<WorkOrder> findBreachedWorkOrders(@Param("now") LocalDateTime now);

    @Query("SELECT wo FROM WorkOrder wo WHERE wo.slaDueAt BETWEEN :now AND :soon AND wo.status NOT IN ('COMPLETED', 'CLOSED', 'CANCELLED')")
    List<WorkOrder> findNearBreachWorkOrders(@Param("now") LocalDateTime now, @Param("soon") LocalDateTime soon);

    @Query("SELECT COUNT(wo) FROM WorkOrder wo WHERE wo.slaDueAt < :now AND wo.status NOT IN ('COMPLETED', 'CLOSED', 'CANCELLED')")
    long countSlaBreached(@Param("now") LocalDateTime now);
}
