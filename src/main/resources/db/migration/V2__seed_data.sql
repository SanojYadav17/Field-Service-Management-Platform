-- Seed Users (password for all is 'password123')
-- BCrypt hash for 'password123'
INSERT INTO users (id, email, password_hash, full_name, role, phone, active) VALUES
(1, 'admin@meridian.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Marcus Vance (Manager)', 'ADMIN', '+1-555-0101', true),
(2, 'dispatcher@meridian.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Diana Ross (Dispatcher)', 'DISPATCHER', '+1-555-0102', true),
(3, 'tech.john@meridian.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'John Doe (Lead Technician)', 'TECHNICIAN', '+1-555-0103', true),
(4, 'tech.sarah@meridian.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Sarah Connor (Senior HVAC Tech)', 'TECHNICIAN', '+1-555-0104', true),
(5, 'customer.acme@meridian.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Alice Smith (Acme Facilities)', 'CUSTOMER', '+1-555-0105', true);

-- Seed Customers
INSERT INTO customers (id, name, code, contact_email, contact_phone, address, active) VALUES
(1, 'Acme Corporation', 'CUST-ACME', 'customer.acme@meridian.com', '+1-555-1000', '100 Industrial Parkway, Building A', true),
(2, 'Apex Commercial Real Estate', 'CUST-APEX', 'facilities@apexre.com', '+1-555-2000', '500 Skyline Boulevard, Suite 1200', true),
(3, 'Nexus Retail Group', 'CUST-NEXUS', 'ops@nexusretail.com', '+1-555-3000', '750 Galleria Way', true);

-- Seed Sites
INSERT INTO sites (id, name, address, customer_id, contact_person, active) VALUES
(1, 'Acme HQ Building A', '100 Industrial Parkway, Tower A', 1, 'Alice Smith', true),
(2, 'Acme R&D Lab Facility', '102 Industrial Parkway, Building B', 1, 'Robert Johnson', true),
(3, 'Apex Financial Plaza', '500 Skyline Blvd, Main Tower', 2, 'David Miller', true),
(4, 'Metro Galleria Mall - South', '750 Galleria Way, South Wing', 3, 'Karen White', true);

-- Seed Parts
INSERT INTO parts (id, name, sku, unit_cost, stock_qty, min_stock_level) VALUES
(1, 'HVAC Air Filter 20x25x4', 'PRT-FLT-2025', 24.50, 45, 10),
(2, 'Commercial Copper Pipe 3/4" (10ft)', 'PRT-COP-0075', 38.00, 20, 5),
(3, 'Industrial Circuit Breaker 20A', 'PRT-BRK-0020', 85.00, 15, 4),
(4, 'Refrigerant R410A Tank (25lb)', 'PRT-REF-410A', 195.00, 8, 2),
(5, 'Smart Commercial Thermostat Pro', 'PRT-TST-PRO', 150.00, 12, 3),
(6, 'High Efficiency Blower Motor 1HP', 'PRT-MTR-0100', 320.00, 5, 2);

-- Seed Work Orders (using MySQL native DATE_ADD/DATE_SUB)
INSERT INTO work_orders (id, code, title, description, priority, status, customer_id, site_id, assigned_to_id, created_by_id, sla_due_at, total_parts_cost, total_labour_minutes, created_at, updated_at) VALUES
(101, 'WO-1001', 'HVAC Cooling Malfunction - 4th Floor Office', 'Air conditioning unit making loud rattling noise and blowing warm air. High priority due to server room proximity.', 'HIGH', 'IN_PROGRESS', 1, 1, 3, 2, DATE_ADD(NOW(), INTERVAL 20 HOUR), 219.50, 120, DATE_SUB(NOW(), INTERVAL 4 HOUR), NOW()),
(102, 'WO-1002', 'Main Electrical Panel Tripped - South Wing', 'Breaker tripped twice during morning power surge. Needs immediate load inspection.', 'URGENT', 'ASSIGNED', 3, 4, 4, 2, DATE_ADD(NOW(), INTERVAL 2 HOUR), 0.00, 0, DATE_SUB(NOW(), INTERVAL 1 HOUR), NOW()),
(103, 'WO-1003', 'Routine Quarterly Filter Replacement', 'Scheduled maintenance to replace all HVAC primary and secondary filters in Building B.', 'LOW', 'NEW', 1, 2, NULL, 1, DATE_ADD(NOW(), INTERVAL 48 HOUR), 0.00, 0, NOW(), NOW()),
(104, 'WO-1004', 'Water Pipe Leak under Restroom Sink', 'Minor water seepage detected near main supply valve on 2nd floor.', 'MEDIUM', 'ON_HOLD', 2, 3, 3, 2, DATE_SUB(NOW(), INTERVAL 2 HOUR), 38.00, 45, DATE_SUB(NOW(), INTERVAL 6 HOUR), NOW()),
(105, 'WO-1005', 'Thermostat Calibration and Firmware Update', 'Adjust setpoints and calibrate temperature sensors in executive suite.', 'MEDIUM', 'COMPLETED', 1, 1, 4, 2, DATE_SUB(NOW(), INTERVAL 12 HOUR), 150.00, 60, DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- Seed Work Order Status History
INSERT INTO work_order_status_history (work_order_id, from_status, to_status, changed_by_id, note, changed_at) VALUES
(101, 'NEW', 'ASSIGNED', 2, 'Assigned to Lead Technician John Doe', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(101, 'ASSIGNED', 'IN_PROGRESS', 3, 'Arrived on site. Commenced HVAC inspection.', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(102, 'NEW', 'ASSIGNED', 2, 'Assigned to Senior Tech Sarah Connor for urgent response.', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(104, 'NEW', 'ASSIGNED', 2, 'Assigned to John Doe.', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(104, 'ASSIGNED', 'IN_PROGRESS', 3, 'Replaced pipe joint.', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(104, 'IN_PROGRESS', 'ON_HOLD', 3, 'Waiting on specialized valve replacement part delivery.', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(105, 'NEW', 'ASSIGNED', 2, 'Assigned to Sarah Connor.', DATE_SUB(NOW(), INTERVAL 22 HOUR)),
(105, 'ASSIGNED', 'IN_PROGRESS', 4, 'Started thermostat configuration.', DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(105, 'IN_PROGRESS', 'COMPLETED', 4, 'Thermostat replaced and calibrated. Verified proper operation.', DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- Seed Part Usages
INSERT INTO part_usages (work_order_id, part_id, qty_used, unit_cost_at_time, line_total) VALUES
(101, 1, 1, 24.50, 24.50),
(101, 4, 1, 195.00, 195.00),
(104, 2, 1, 38.00, 38.00),
(105, 5, 1, 150.00, 150.00);

-- Seed Time Logs
INSERT INTO time_logs (work_order_id, technician_id, minutes, note, logged_at) VALUES
(101, 3, 60, 'Initial diagnostic and pressure check', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(101, 3, 60, 'Replaced R410A refrigerant and air filter', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(104, 3, 45, 'Sealed leak temporarily and placed hold order', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(105, 4, 60, 'Installed Smart Thermostat Pro and updated firmware', DATE_SUB(NOW(), INTERVAL 12 HOUR));
