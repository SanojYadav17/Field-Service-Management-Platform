package com.KeyStone.DeliveryService.domain;

import java.util.EnumSet;
import java.util.Set;

public enum WorkOrderStatus {
    NEW,
    ASSIGNED,
    IN_PROGRESS,
    ON_HOLD,
    COMPLETED,
    CLOSED,
    CANCELLED;

    public boolean isTerminal() {
        return this == CLOSED || this == CANCELLED;
    }

    public boolean canTransitionTo(WorkOrderStatus target) {
        if (this == target) return false;
        if (this.isTerminal()) return false;

        switch (this) {
            case NEW:
                return target == ASSIGNED || target == IN_PROGRESS || target == CANCELLED;
            case ASSIGNED:
                return target == IN_PROGRESS || target == CANCELLED;
            case IN_PROGRESS:
                return target == ON_HOLD || target == COMPLETED || target == CANCELLED;
            case ON_HOLD:
                return target == IN_PROGRESS || target == CANCELLED;
            case COMPLETED:
                return target == CLOSED || target == CANCELLED;
            default:
                return false;
        }
    }
}
